import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log(`Syncing credits for user: ${user.id}`);

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get user's premium status to determine limits
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('is_premium')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error fetching user credits:', creditsError);
      throw new Error('Failed to fetch user credits');
    }

    const isPremium = creditsData?.is_premium ?? false;
    const perFeatureLimit = isPremium ? 8 : 2;

    // Count successful tool generations in last 24h
    const { data: toolsData, error: toolsError } = await supabase
      .from('business_tools_history')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', last24Hours.toISOString())
      .order('created_at', { ascending: true });

    if (toolsError) {
      console.error('Error fetching tools history:', toolsError);
      throw new Error('Failed to sync credits');
    }

    // Count successful ideas generations in last 24h
    const { data: ideasData, error: ideasError } = await supabase
      .from('business_ideas_history')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', last24Hours.toISOString())
      .order('created_at', { ascending: true });

    if (ideasError) {
      console.error('Error fetching ideas history:', ideasError);
      throw new Error('Failed to sync credits');
    }

    // Calculate separate counts and window starts for each feature
    const toolsCount = Math.min(toolsData?.length ?? 0, perFeatureLimit);
    const ideasCount = Math.min(ideasData?.length ?? 0, perFeatureLimit);
    
    const toolsWindowStart = toolsData && toolsData.length > 0 ? toolsData[0].created_at : null;
    const ideasWindowStart = ideasData && ideasData.length > 0 ? ideasData[0].created_at : null;

    // Combined analysis count and window start
    const allGenerations = [
      ...(toolsData || []),
      ...(ideasData || [])
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const analysisCount = toolsCount + ideasCount;
    const analysisWindowStart = allGenerations.length > 0 ? allGenerations[0].created_at : null;

    console.log(`📊 Sync Results (Premium: ${isPremium}, Limit per feature: ${perFeatureLimit}):`);
    console.log(`  Tools: ${toolsData?.length ?? 0} total → ${toolsCount} counted, window: ${toolsWindowStart}`);
    console.log(`  Ideas: ${ideasData?.length ?? 0} total → ${ideasCount} counted, window: ${ideasWindowStart}`);
    console.log(`  Combined: ${analysisCount}, window: ${analysisWindowStart}`);

    // Update user_credits with separate counts
    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: user.id,
        tools_count: toolsCount,
        tools_window_start: toolsWindowStart,
        ideas_count: ideasCount,
        ideas_window_start: ideasWindowStart,
        analysis_count: analysisCount,
        analysis_window_start: analysisWindowStart,
        updated_at: now.toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Error updating credits:', updateError);
      throw new Error('Failed to update credits');
    }

    console.log('✅ Credits synced successfully');

    return new Response(
      JSON.stringify({
        success: true,
        tools_count: toolsCount,
        tools_window_start: toolsWindowStart,
        ideas_count: ideasCount,
        ideas_window_start: ideasWindowStart,
        analysis_count: analysisCount,
        analysis_window_start: analysisWindowStart
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-credits:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
