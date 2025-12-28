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
  const sections: string[] = [];
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Detect if this is a local/regional market query
  const localKeywords = /\b(local|city|town|regional|london|berlin|paris|new york|munich|hamburg|frankfurt|cologne|düsseldorf|stuttgart|vienna|zurich|amsterdam|brussels|madrid|rome|milan|barcelona|tokyo|singapore|sydney|melbourne|toronto|vancouver|chicago|los angeles|san francisco|seattle|boston|miami|atlanta|dallas|houston|phoenix|denver|portland|austin|nashville|charlotte|philadelphia|detroit|minneapolis|cleveland|pittsburgh|baltimore|washington dc|orlando|tampa|indianapolis|columbus|kansas city|st louis|milwaukee|sacramento|san diego|san jose|oakland|riverside|las vegas|raleigh|jacksonville|memphis|louisville|oklahoma city|richmond|virginia beach|providence|hartford|buffalo|rochester|albany|syracuse|new orleans|salt lake city|tucson|albuquerque|fresno|birmingham|el paso|boise|des moines|omaha|tulsa|wichita|little rock|madison|grand rapids|dayton|akron|spokane|tacoma|modesto|shreveport|montgomery|lubbock|garland|hialeah|irving|glendale|scottsdale|fremont|gilbert|chandler|henderson|north las vegas|reno|irvine|chesapeake|norfolk|greensboro|durham|winston-salem|fayetteville|cary|wilmington|high point|greenville|asheville|concord|gastonia|jacksonville nc|chapel hill|huntersville|apex|wake forest|morrisville|holly springs|fuquay-varina|clayton|sanford|burlington|rocky mount|wilson|kinston|new bern|havelock|morehead city|beaufort|atlantic beach|emerald isle|carolina beach|wrightsville beach|kure beach|southport|oak island|holden beach|sunset beach|ocean isle beach|calabash|shallotte|bolivia|leland|hampstead|surf city|topsail beach|north topsail beach|sneads ferry|richlands|swansboro|hubert|maysville|pollocksville|trenton|pink hill|la grange|snow hill|farmville|greenville|winterville|ayden|grifton|bethel|tarboro|pinetops|macclesfield|princeville|speed|whitakers|battleboro|red oak|nashville|spring hope|bailey|middlesex|zebulon|wendell|knightdale|rolesville|wake forest|youngsville|franklinton|louisburg|henderson|oxford|creedmoor|butner|stem|roxboro|person county|caswell county|alamance county|orange county|chatham county|lee county|harnett county|johnston county|wayne county|lenoir county|craven county|carteret county|onslow county|pender county|new hanover county|brunswick county|columbus county|robeson county|scotland county|richmond county|moore county|montgomery county|stanly county|cabarrus county|rowan county|davidson county|randolph county|guilford county|forsyth county|stokes county|surry county|yadkin county|davie county|iredell county|alexander county|catawba county|burke county|caldwell county|watauga county|ashe county|alleghany county|wilkes county|avery county|mitchell county|yancey county|madison county|buncombe county|henderson county|transylvania county|haywood county|jackson county|swain county|graham county|cherokee county|clay county|macon county|polk county|rutherford county|cleveland county|gaston county|lincoln county|mecklenburg county|union county|anson county|richmond county|scotland county|hoke county|cumberland county|bladen county|sampson county|duplin county|jones county|pamlico county|beaufort county|pitt county|martin county|edgecombe county|nash county|halifax county|warren county|vance county|granville county|franklin county|wake county|durham county)\b/i;
  const isLocalMarket = localKeywords.test(industry);
  const sizeUnit = isLocalMarket ? "millions USD" : "billions USD";
  
  if (options.marketSize) {
    sections.push(`- Market Size: Provide these THREE values in ${sizeUnit}:
    1. "value" = CURRENT total market size for THIS SPECIFIC product/service niche (the actual market today)
    2. "tam" = Total Addressable Market (the MAXIMUM theoretical market if 100% adoption - must be >= value)
    3. "sam" = Serviceable Addressable Market (realistic reachable market - must be <= tam and >= value)
    The relationship MUST be: value <= sam <= tam`);
  }
  if (options.growth) {
    sections.push(`- Growth Metrics: CAGR percentage, Year-over-year growth rate, Projected market size for ${nextYear} in ${sizeUnit}`);
  }
  if (options.competitors) {
    sections.push(`- Top 5-7 DIRECT Competitors: Companies that offer SIMILAR products/services to "${industry}". Include company name, market share percentage within this niche, estimated annual revenue if available. Do NOT include general tech giants unless they have a specific competing product.`);
  }
  if (options.trends) {
    sections.push(`- 4-6 Key Trends: Name each trend and provide a 1-2 sentence description explaining WHY this trend matters for "${industry}" and how it impacts businesses in this space. NO numerical scores.`);
  }
  if (options.channels) {
    sections.push(`- 5-6 Marketing Channels: Name each channel and provide a 1-2 sentence description explaining WHY this channel works well for "${industry}" and what makes it effective. NO numerical scores or percentages.`);
  }
  if (options.demographics) {
    sections.push(`- 4-6 Target Customer Segments: Name each buyer persona and provide a 1-2 sentence description explaining WHO they are, their pain points, and why they would buy "${industry}". NO numerical percentages.`);
  }

  const geographicInstruction = isLocalMarket 
    ? `\n7. This is a LOCAL/REGIONAL market query - all data must be specific to the mentioned geographic area
8. Use MILLIONS (not billions) for market size values - local markets are typically in the millions range
9. If you cannot find specific local data, clearly state this and provide the closest regional data available`
    : '';

  return `You are researching "${industry}" as a SPECIFIC PRODUCT or SERVICE category.

CRITICAL INSTRUCTIONS:
1. Interpret "${industry}" as describing a specific PRODUCT/SERVICE type, NOT a broad industry
2. Find DIRECT COMPETITORS - companies that offer the same or very similar solutions
3. If the query mentions "AI tools for X" or "software for X", research AI TOOLS/SOFTWARE vendors, NOT companies in industry X
4. Example: "AI business planner for ecommerce" = find AI planning tools (like Notion AI, Monday.com AI features, etc.), NOT ecommerce companies (like Amazon, Shopify)
5. Competitors should be companies a customer would evaluate INSTEAD of the product described
6. All data should be specific to this product/service niche, not the broader industry${geographicInstruction}

Required data points:
${sections.join('\n')}

Respond with a JSON object matching this exact structure (include only sections that were requested):
{
  ${options.marketSize ? `"marketSize": { "value": <current market size in ${sizeUnit}>, "unit": "${sizeUnit}", "tam": <total addressable market, must be >= value>, "sam": <serviceable addressable market, must be between value and tam> },` : ''}
  ${options.growth ? `"growth": { "cagr": <percentage number>, "yearOverYear": <percentage number>, "projectionNextYear": <number in ${sizeUnit}> },` : ''}
  ${options.competitors ? `"competitors": [{ "name": "<direct competitor company name>", "marketShare": <percentage within this niche>, "revenue": <number in millions or null> }],` : ''}
  ${options.trends ? `"trends": [{ "name": "<trend name>", "description": "<1-2 sentence explanation of why this trend matters>" }],` : ''}
  ${options.channels ? `"channels": [{ "name": "<channel name>", "description": "<1-2 sentence explanation of why this channel works>" }],` : ''}
  ${options.demographics ? `"demographics": [{ "segment": "<buyer persona name>", "description": "<1-2 sentence description of this customer segment>" }],` : ''}
  "citations": [{ "url": "<string>", "title": "<string>" }]
}

Use real, current market data from ${currentYear - 1}-${currentYear}. All numbers must be realistic and based on actual market research for this specific product/service category.`;
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
            content: `You are a specialized market research analyst focusing on PRODUCT and SERVICE categories.

CRITICAL MARKET SIZE RULES:
- "value" = the CURRENT market size (what the market is worth TODAY)
- "tam" = Total Addressable Market (theoretical MAXIMUM if everyone bought - always LARGEST number)
- "sam" = Serviceable Addressable Market (realistic reachable portion - between value and tam)
- The relationship MUST be: value <= sam <= tam
- Example: value=$5B, sam=$12B, tam=$25B (tam is ALWAYS the largest!)

CRITICAL GEOGRAPHIC RULES:
- If the query mentions a specific CITY, REGION, or "local", provide data for THAT GEOGRAPHIC AREA ONLY
- Use MILLIONS (not billions) for local/regional markets
- Use BILLIONS only for national/global markets

CRITICAL PRODUCT/SERVICE RULES:
- When a user describes "AI tool for X" or "software for Y", research the TOOL market, NOT industry X
- Find DIRECT COMPETITORS that offer similar products/services
- Do NOT return major industry players unless they have a specific competing product

CRITICAL DATA QUALITY RULES:
- Do NOT invent data. If you cannot find reliable data for a specific metric, use realistic estimates based on comparable markets.
- All numbers must be internally consistent (tam >= sam >= value)
- For trends and channels: Describe WHY they matter, do NOT assign numerical scores

Provide accurate, current market data in JSON format only. No explanations or additional text.`
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
    console.log('Market size values:', result.marketSize ? `value=${result.marketSize.value}, sam=${result.marketSize.sam}, tam=${result.marketSize.tam}` : 'N/A');

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
