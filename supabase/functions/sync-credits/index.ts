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

    // Check if user is premium - if so, no need to sync credits
    const { data: userCredit } = await supabase
      .from('user_credits')
      .select('is_premium')
      .eq('user_id', user.id)
      .maybeSingle();

    if (userCredit?.is_premium) {
      console.log('Premium user - unlimited analyses, skipping credit sync');
      return new Response(
        JSON.stringify({
          success: true,
          unlimited: true,
          message: 'Premium user - unlimited analyses'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

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

    // Combine and sort all generations
    const allGenerations = [
      ...(toolsData || []),
      ...(ideasData || [])
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const totalCount = allGenerations.length;
    const actualCount = Math.min(totalCount, 2); // Cap at 2

    let newWindowStart = null;
    if (allGenerations.length > 0) {
      // Set window start to the oldest successful generation
      newWindowStart = allGenerations[0].created_at;
    }

    console.log(`Found ${totalCount} successful generations in last 24h (counted as ${actualCount})`);
    console.log(`New window start: ${newWindowStart}`);

    // Update user_credits with the corrected values
    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: user.id,
        analysis_count: actualCount,
        analysis_window_start: newWindowStart,
        updated_at: now.toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Error updating credits:', updateError);
      throw new Error('Failed to update credits');
    }

    console.log('Credits synced successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysis_count: actualCount,
        analysis_window_start: newWindowStart
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
