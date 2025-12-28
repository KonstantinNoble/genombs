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
    tam: number;
    sam: number;
  };
  growth?: {
    cagr: number;
    yearOverYear: number;
    projection2026: number;
  };
  competitors?: Array<{
    name: string;
    marketShare: number;
    revenue?: number;
  }>;
  trends?: Array<{
    name: string;
    impact: number;
    growthPotential: number;
  }>;
  channels?: Array<{
    name: string;
    effectiveness: number;
    averageROI: number;
  }>;
  demographics?: Array<{
    segment: string;
    percentage: number;
    averageSpend?: number;
  }>;
  citations: Array<{ url: string; title: string }>;
}

function buildPerplexityPrompt(industry: string, options: AnalysisOptions): string {
  const sections: string[] = [];
  
  if (options.marketSize) {
    sections.push(`- Market Size: Total market value in billions USD, Total Addressable Market (TAM), Serviceable Addressable Market (SAM)`);
  }
  if (options.growth) {
    sections.push(`- Growth Metrics: CAGR percentage, Year-over-year growth rate, Projected market size for 2026`);
  }
  if (options.competitors) {
    sections.push(`- Top 5-7 Competitors: Company name, market share percentage, estimated annual revenue if available`);
  }
  if (options.trends) {
    sections.push(`- 4-6 Key Market Trends: Trend name, impact score (1-10), growth potential score (1-10)`);
  }
  if (options.channels) {
    sections.push(`- 5-6 Marketing Channels: Channel name, effectiveness score (0-100), average ROI percentage`);
  }
  if (options.demographics) {
    sections.push(`- 4-6 Customer Demographics: Segment name, percentage of market, average spend if available`);
  }

  return `Provide current market research data for the "${industry}" industry/market. Return ONLY structured data in valid JSON format with no additional text or explanation.

Required data points:
${sections.join('\n')}

Respond with a JSON object matching this exact structure (include only sections that were requested):
{
  ${options.marketSize ? `"marketSize": { "value": <number in billions>, "unit": "billion USD", "tam": <number in billions>, "sam": <number in billions> },` : ''}
  ${options.growth ? `"growth": { "cagr": <percentage number>, "yearOverYear": <percentage number>, "projection2026": <number in billions> },` : ''}
  ${options.competitors ? `"competitors": [{ "name": "<string>", "marketShare": <percentage number>, "revenue": <number in millions or null> }],` : ''}
  ${options.trends ? `"trends": [{ "name": "<string>", "impact": <1-10>, "growthPotential": <1-10> }],` : ''}
  ${options.channels ? `"channels": [{ "name": "<string>", "effectiveness": <0-100>, "averageROI": <percentage number> }],` : ''}
  ${options.demographics ? `"demographics": [{ "segment": "<string>", "percentage": <number>, "averageSpend": <number or null> }],` : ''}
  "citations": [{ "url": "<string>", "title": "<string>" }]
}

Use real, current market data from 2024-2025. All numbers must be realistic and based on actual market research.`;
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
    console.log('Analysis options:', analysisOptions);

    const prompt = buildPerplexityPrompt(industry, analysisOptions);

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
            content: 'You are a market research analyst. Provide accurate, current market data in JSON format only. No explanations or additional text.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
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

    if (!content) {
      console.error('No content in Perplexity response');
      return new Response(
        JSON.stringify({ error: 'No data returned from market research' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the structured response
    const result = parsePerplexityResponse(content, citations);

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
