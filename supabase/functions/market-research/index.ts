import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisOptions {
  marketSize: boolean;
  competitors: boolean;
  trends: boolean;
  channels: boolean;
  demographics: boolean;
  growth: boolean;
}

interface MarketResearchResult {
  marketSize?: {
    value: number;
    unit: string;
    projectedValue: number;
    projectionYear: number;
  };
  growth?: {
    cagr: number;
    yearOverYear: number;
    projectionNextYear: number;
  };
  competitors?: Array<{
    name: string;
    marketShare: number;
    revenue?: number;
  }>;
  trends?: Array<{
    name: string;
    description: string;
  }>;
  channels?: Array<{
    name: string;
    description: string;
  }>;
  demographics?: Array<{
    segment: string;
    description: string;
  }>;
  citations: Array<{ url: string; title: string }>;
}

function buildPerplexityPrompt(industry: string, options: AnalysisOptions): string {
  const requestedData: string[] = [];
  
  if (options.marketSize) {
    requestedData.push('"marketSize": { "value": <number current market size in billions USD>, "unit": "billions USD", "projectedValue": <number projected market size in billions USD>, "projectionYear": <number year of projection e.g. 2030> }');
  }
  if (options.growth) {
    requestedData.push('"growth": { "cagr": <number>, "yearOverYear": <number>, "projectionNextYear": <number> }');
  }
  if (options.competitors) {
    requestedData.push('"competitors": [{ "name": "<string>", "marketShare": <number 1-100 estimated percentage>, "revenue": <number in millions or null> }] (provide estimated percentages even if approximate)');
  }
  if (options.trends) {
    requestedData.push('"trends": [{ "name": "<string>", "description": "<string>" }]');
  }
  if (options.channels) {
    requestedData.push('"channels": [{ "name": "<string>", "description": "<string>" }]');
  }
  if (options.demographics) {
    requestedData.push('"demographics": [{ "segment": "<string>", "description": "<string>" }]');
  }

  return `Research the "${industry}" market.

Return JSON only:
{
  ${requestedData.join(',\n  ')},
  "citations": [{ "url": "<string>", "title": "<string>" }]
}`;
}

function parsePerplexityResponse(content: string, citations: any[]): MarketResearchResult {
  // Extract JSON from response
  let jsonStr = content;
  
  // Try to find JSON block in response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }
  
  try {
    const parsed = JSON.parse(jsonStr);
    
    // Add citations from Perplexity response
    const formattedCitations = citations?.map((c: any, i: number) => ({
      url: typeof c === 'string' ? c : c.url || `Source ${i + 1}`,
      title: typeof c === 'string' ? `Source ${i + 1}` : c.title || `Source ${i + 1}`
    })) || [];
    
    return {
      ...parsed,
      citations: formattedCitations.length > 0 ? formattedCitations : parsed.citations || []
    };
  } catch (e) {
    console.error('Failed to parse Perplexity response:', e);
    console.error('Content:', content);
    throw new Error('Failed to parse market research data');
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { industry, analysisOptions } = await req.json();

    if (!industry || !analysisOptions) {
      return new Response(
        JSON.stringify({ error: 'Industry and analysis options are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check at least one option is selected
    const hasSelectedOption = Object.values(analysisOptions).some(v => v === true);
    if (!hasSelectedOption) {
      return new Response(
        JSON.stringify({ error: 'At least one analysis option must be selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user credits
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (creditsError && creditsError.code !== 'PGRST116') {
      console.error('Error fetching credits:', creditsError);
      return new Response(
        JSON.stringify({ error: 'Failed to check usage limits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isPremium = credits?.is_premium || false;
    const dailyLimit = isPremium ? 3 : 1;
    const now = new Date();
    const windowStart = credits?.market_research_window_start 
      ? new Date(credits.market_research_window_start) 
      : null;
    
    // Check if window has expired (24 hours)
    const windowExpired = !windowStart || (now.getTime() - windowStart.getTime()) > 24 * 60 * 60 * 1000;
    const currentCount = windowExpired ? 0 : (credits?.market_research_count || 0);

    if (currentCount >= dailyLimit) {
      return new Response(
        JSON.stringify({ 
          error: 'Daily limit reached',
          limitReached: true,
          isPremium,
          resetTime: windowStart ? new Date(windowStart.getTime() + 24 * 60 * 60 * 1000).toISOString() : null
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Perplexity API (server-side only)
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Market research service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing market research for industry: ${industry}`);
    console.log('Analysis options:', JSON.stringify(analysisOptions, null, 2));

    const prompt = buildPerplexityPrompt(industry, analysisOptions);
    console.log('Generated prompt:', prompt.substring(0, 500) + '...');

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { 
            role: 'system', 
            content: 'You are a market research analyst. Return accurate data as JSON only. No markdown, no explanations.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', perplexityResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch market data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const perplexityData = await perplexityResponse.json();
    const content = perplexityData.choices?.[0]?.message?.content;
    const citations = perplexityData.citations || [];

    console.log('Raw Perplexity response content:', content?.substring(0, 1000) + '...');
    console.log('Citations count:', citations?.length || 0);

    if (!content) {
      console.error('No content in Perplexity response');
      return new Response(
        JSON.stringify({ error: 'No data returned from market research' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the structured response
    const result = parsePerplexityResponse(content, citations);
    console.log('Parsed result keys:', Object.keys(result));
    console.log('Market size values:', result.marketSize ? `value=${result.marketSize.value}, projectedValue=${result.marketSize.projectedValue}, projectionYear=${result.marketSize.projectionYear}` : 'N/A');

    // Update usage count
    const newCount = currentCount + 1;
    const updateData: any = {
      market_research_count: newCount,
      updated_at: now.toISOString()
    };
    
    if (windowExpired) {
      updateData.market_research_window_start = now.toISOString();
    }

    if (credits) {
      await supabase
        .from('user_credits')
        .update(updateData)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          market_research_count: 1,
          market_research_window_start: now.toISOString()
        });
    }

    // Save to history
    await supabase
      .from('market_research_history')
      .insert({
        user_id: user.id,
        query: industry,
        industry: industry,
        analysis_options: analysisOptions,
        result: result
      });

    // Clean up old history entries (keep only 5 newest)
    const { data: allHistory } = await supabase
      .from('market_research_history')
      .select('id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (allHistory && allHistory.length > 5) {
      const idsToDelete = allHistory.slice(5).map(h => h.id);
      await supabase
        .from('market_research_history')
        .delete()
        .in('id', idsToDelete);
      console.log(`Deleted ${idsToDelete.length} old history entries`);
    }

    console.log('Market research completed successfully');

    return new Response(
      JSON.stringify({ 
        result,
        usage: {
          count: newCount,
          limit: dailyLimit,
          isPremium
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Market research error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
