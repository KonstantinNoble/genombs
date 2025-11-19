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

  // Query business_tools_history for the last 24 hours
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

  // Query ads_advisor_history for the last 24 hours (SHARED CREDITS)
  const { data: adsData, error: adsError } = await supabase
    .from('ads_advisor_history')
    .select('created_at, analysis_mode')
    .eq('user_id', user.id)
    .gte('created_at', last24Hours.toISOString())
    .order('created_at', { ascending: true });

  if (adsError) {
    console.error('Error fetching ads history:', adsError);
    throw new Error('Failed to sync credits');
  }

  // Combine BOTH data sources for shared credit counting
  const allGenerations = [
    ...(toolsData || []),
    ...(adsData || [])
  ];

  // Sort combined data by created_at
  allGenerations.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Separate deep and standard analyses from ALL sources
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
    const toolsWindowStart = toolsData && toolsData.length > 0 ? toolsData[0].created_at : null;
  const analysisCount = toolsCount;
  const analysisWindowStart = allGenerations.length > 0 ? allGenerations[0].created_at : null;

  const toolsDeep = (toolsData || []).filter(g => g.analysis_mode === 'deep').length;
  const adsDeep = (adsData || []).filter(g => g.analysis_mode === 'deep').length;
  const toolsStandard = (toolsData || []).filter(g => !g.analysis_mode || g.analysis_mode === 'standard').length;
  const adsStandard = (adsData || []).filter(g => !g.analysis_mode || g.analysis_mode === 'standard').length;

  console.log(`📊 Sync Results (Premium: ${isPremium}):`);
  console.log(`  Deep: ${deepGenerations.length} total (${toolsDeep} website + ${adsDeep} ads) → ${deepCount}/${deepLimit} counted (window: ${deepWindowStart})`);
  console.log(`  Standard: ${standardGenerations.length} total (${toolsStandard} website + ${adsStandard} ads) → ${standardCount}/${standardLimit} counted (window: ${standardWindowStart})`);
    console.log(`  Legacy - Tools: ${toolsData?.length ?? 0} → ${toolsCount}`);

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
