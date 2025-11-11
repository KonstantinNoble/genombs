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

    // Count deep and standard analyses separately
    const { data: toolsData, error: toolsError } = await supabase
      .from('business_tools_history')
      .select('created_at, analysis_mode')
      .eq('user_id', user.id)
      .gte('created_at', last24Hours.toISOString())
      .order('created_at', { ascending: true });

    if (toolsError) {
      console.error('Error fetching tools history:', toolsError);
      throw new Error('Failed to sync credits');
    }

    const { data: ideasData, error: ideasError } = await supabase
      .from('business_ideas_history')
      .select('created_at, analysis_mode')
      .eq('user_id', user.id)
      .gte('created_at', last24Hours.toISOString())
      .order('created_at', { ascending: true });

    if (ideasError) {
      console.error('Error fetching ideas history:', ideasError);
      throw new Error('Failed to sync credits');
    }

    // Combine all generations
    const allGenerations = [
      ...(toolsData || []),
      ...(ideasData || [])
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Count deep vs standard
    const deepGenerations = allGenerations.filter(g => g.analysis_mode === 'deep');
    const standardGenerations = allGenerations.filter(g => !g.analysis_mode || g.analysis_mode === 'standard');

    const deepLimit = isPremium ? 2 : 0;
    const standardLimit = isPremium ? 6 : 2;

    const deepCount = Math.min(deepGenerations.length, deepLimit);
    const standardCount = Math.min(standardGenerations.length, standardLimit);

    const deepWindowStart = deepGenerations.length > 0 ? deepGenerations[0].created_at : null;
    const standardWindowStart = standardGenerations.length > 0 ? standardGenerations[0].created_at : null;

    // Keep old combined counts for backwards compatibility
    const toolsCount = Math.min(toolsData?.length ?? 0, isPremium ? 8 : 2);
    const ideasCount = Math.min(ideasData?.length ?? 0, isPremium ? 8 : 2);
    const toolsWindowStart = toolsData && toolsData.length > 0 ? toolsData[0].created_at : null;
    const ideasWindowStart = ideasData && ideasData.length > 0 ? ideasData[0].created_at : null;
    const analysisCount = toolsCount + ideasCount;
    const analysisWindowStart = allGenerations.length > 0 ? allGenerations[0].created_at : null;

    console.log(`📊 Sync Results (Premium: ${isPremium}):`);
    console.log(`  Deep: ${deepGenerations.length} total → ${deepCount}/${deepLimit} counted, window: ${deepWindowStart}`);
    console.log(`  Standard: ${standardGenerations.length} total → ${standardCount}/${standardLimit} counted, window: ${standardWindowStart}`);
    console.log(`  Legacy - Tools: ${toolsData?.length ?? 0} → ${toolsCount}, Ideas: ${ideasData?.length ?? 0} → ${ideasCount}`);

    // Update user_credits with mode-specific and legacy counts
    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: user.id,
        deep_analysis_count: deepCount,
        deep_analysis_window_start: deepWindowStart,
        standard_analysis_count: standardCount,
        standard_analysis_window_start: standardWindowStart,
        // Keep old columns for backwards compatibility
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
        deep_analysis_count: deepCount,
        deep_analysis_window_start: deepWindowStart,
        standard_analysis_count: standardCount,
        standard_analysis_window_start: standardWindowStart,
        // Legacy fields
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
