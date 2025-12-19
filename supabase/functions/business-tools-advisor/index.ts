import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActionItem {
  text: string;
  resourceUrl?: string;
  resourceTitle?: string;
}

interface CompetitorInfo {
  name: string;
  strengths: string[];
  weaknesses: string[];
}

interface ROIProjection {
  investment: string;
  expectedReturn: string;
  timeframe: string;
  assumptions: string[];
}

interface StrategyPhase {
  phase: number;
  title: string;
  timeframe: string;
  objectives: string[];
  actions: ActionItem[];
  budget?: string;
  channels?: string[];
  milestones?: string[];
  competitorAnalysis?: CompetitorInfo[];
  riskMitigation?: string[];
  roiProjection?: ROIProjection;
}

interface CitationInfo {
  url: string;
  title: string;
}

// Structured market data interface for Deep Mode
interface StructuredMarketData {
  marketSize?: string;
  growthRate?: string;
  topCompetitors?: { name: string; marketShare?: string; keyStrength?: string }[];
  averageCAC?: string;
  conversionRateBenchmark?: string;
  bestChannels?: { channel: string; roi?: string }[];
  keyTrends?: string[];
  rawInsights: string;
}

interface MarketResearchResult {
  insights: string;
  citations: CitationInfo[];
  structuredData?: StructuredMarketData;
}

// Input validation schema
const inputSchema = z.object({
  prompt: z.string().trim().min(1, "Please describe your business goals").max(2000, "Description too long"),
  budget: z.string().optional(),
  industry: z.string().optional(),
  channels: z.string().optional(),
  timeline: z.string().optional(),
  geographic: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  analysisMode: z.enum(["standard", "deep"]).optional(),
  streaming: z.boolean().optional()
});

// Website insights interface
interface WebsiteInsights {
  businessType: string;
  offerings: string[];
  targetAudience: string;
  currentChannels: string[];
  problems: string[];
  improvements: string[];
  rawContent: string;
}

// Helper function to analyze website with Firecrawl
async function analyzeWebsite(
  websiteUrl: string,
  authHeader: string,
  controller?: ReadableStreamDefaultController
): Promise<WebsiteInsights | null> {
  if (!websiteUrl || websiteUrl.length < 5) {
    return null;
  }

  if (controller) {
    sendSSE(controller, 'website_analysis_start', { message: 'Analyzing your website...' });
  }

  console.log('Starting website analysis for:', websiteUrl);
  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/firecrawl-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ url: websiteUrl }),
    });

    if (!response.ok) {
      console.error('Website analysis failed:', response.status);
      if (controller) {
        sendSSE(controller, 'website_analysis_error', { message: 'Could not analyze website' });
      }
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.insights) {
      console.error('No website insights returned');
      return null;
    }

    const duration = Date.now() - startTime;
    console.log(`Website analysis completed in ${duration}ms`);

    if (controller) {
      sendSSE(controller, 'website_analysis_complete', { 
        message: 'Website analyzed successfully',
        businessType: data.insights.businessType
      });
    }

    return data.insights as WebsiteInsights;
  } catch (error) {
    console.error('Website analysis error:', error);
    if (controller) {
      sendSSE(controller, 'website_analysis_error', { message: 'Website analysis failed' });
    }
    return null;
  }
}

// Helper function to send SSE event
function sendSSE(controller: ReadableStreamDefaultController, event: string, data: any) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}

// Extract structured data from Perplexity insights (Deep Mode only)
function extractStructuredData(insights: string): StructuredMarketData {
  const structuredData: StructuredMarketData = {
    rawInsights: insights,
    topCompetitors: [],
    bestChannels: [],
    keyTrends: []
  };

  try {
    // Extract market size (look for patterns like "$X billion", "X billion USD", etc.)
    const marketSizeMatch = insights.match(/(?:market size|market value|valued at|worth)[^.]*?(\$?\d+(?:\.\d+)?(?:\s*(?:billion|million|trillion|B|M|T))?(?:\s*(?:USD|EUR|GBP))?)/i);
    if (marketSizeMatch) {
      structuredData.marketSize = marketSizeMatch[1].trim();
    }

    // Extract growth rate (look for CAGR, growth rate percentages)
    const growthMatch = insights.match(/(?:CAGR|growth rate|growing at|growth of)[^.]*?(\d+(?:\.\d+)?%)/i);
    if (growthMatch) {
      structuredData.growthRate = growthMatch[1];
    }

    // Extract CAC (Customer Acquisition Cost)
    const cacMatch = insights.match(/(?:CAC|customer acquisition cost|acquisition cost)[^.]*?(\$?\d+(?:-\d+)?(?:\s*(?:USD|EUR))?)/i);
    if (cacMatch) {
      structuredData.averageCAC = cacMatch[1].trim();
    }

    // Extract conversion rate
    const conversionMatch = insights.match(/(?:conversion rate|convert at)[^.]*?(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?%)/i);
    if (conversionMatch) {
      structuredData.conversionRateBenchmark = conversionMatch[1];
    }

    // Extract competitor names (common patterns)
    const competitorPatterns = [
      /(?:competitors?|market leaders?|key players?|leading companies)[^.]*?(?:include|are|such as)[^.]*?([A-Z][a-zA-Z]+(?:,?\s*(?:and\s+)?[A-Z][a-zA-Z]+)*)/i,
      /([A-Z][a-zA-Z]+)\s*(?:dominates?|leads?|holds?)\s*(?:\d+%|\d+\s*percent)/gi
    ];
    
    for (const pattern of competitorPatterns) {
      const matches = insights.match(pattern);
      if (matches) {
        const names = matches[0].split(/,|\s+and\s+/).map(n => n.trim()).filter(n => n.length > 2 && /^[A-Z]/.test(n));
        for (const name of names.slice(0, 3)) {
          if (!structuredData.topCompetitors!.find(c => c.name.toLowerCase() === name.toLowerCase())) {
            // Try to extract market share for this competitor
            const shareMatch = insights.match(new RegExp(`${name}[^.]*?(\\d+(?:\\.\\d+)?%)`, 'i'));
            structuredData.topCompetitors!.push({
              name: name,
              marketShare: shareMatch ? shareMatch[1] : undefined
            });
          }
        }
      }
    }

    // Extract marketing channels
    const channelKeywords = ['LinkedIn', 'Google Ads', 'Facebook', 'Instagram', 'TikTok', 'Email Marketing', 'Content Marketing', 'SEO', 'YouTube', 'Twitter', 'Webinars', 'Podcasts', 'Influencer Marketing'];
    for (const channel of channelKeywords) {
      if (insights.toLowerCase().includes(channel.toLowerCase())) {
        // Try to find ROI mention near the channel
        const roiMatch = insights.match(new RegExp(`${channel}[^.]*?(\\d+(?:\\.\\d+)?x|\\d+(?:\\.\\d+)?%\\s*ROI)`, 'i'));
        structuredData.bestChannels!.push({
          channel: channel,
          roi: roiMatch ? roiMatch[1] : undefined
        });
      }
    }

    // Extract key trends (sentences containing "trend", "growing", "emerging")
    const trendSentences = insights.split(/[.!]/).filter(s => 
      /(?:trend|growing|emerging|rising|increasing demand|shift toward)/i.test(s) && s.length > 20
    );
    structuredData.keyTrends = trendSentences.slice(0, 3).map(s => s.trim());

  } catch (error) {
    console.error('Error extracting structured data:', error);
  }

  return structuredData;
}

// Perplexity market research function with differentiated queries
async function performMarketResearch(
  industry: string,
  businessContext: string,
  isDeepMode: boolean,
  controller?: ReadableStreamDefaultController
): Promise<MarketResearchResult> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  
  if (!PERPLEXITY_API_KEY) {
    console.log('Perplexity API key not configured, skipping market research');
    return { insights: '', citations: [] };
  }

  if (controller) {
    sendSSE(controller, 'research_start', { message: 'Researching market data...' });
  }

  console.log(`Starting Perplexity market research (mode: ${isDeepMode ? 'deep' : 'standard'})`);
  const startTime = Date.now();

  try {
    const model = isDeepMode ? 'sonar-pro' : 'sonar';
    
    // DIFFERENTIATED QUERIES: Deep Mode gets specific, structured data queries
    const queries = isDeepMode 
      ? [
          // Query 1: Market size, growth, and competitive landscape
          `What is the current market size and annual growth rate (CAGR) for ${industry}? Who are the top 3-5 competitors with their market share percentages? Include specific numbers and statistics from 2024-2025.`,
          // Query 2: Customer acquisition benchmarks
          `What is the average customer acquisition cost (CAC) and conversion rate benchmarks in ${industry}? What are the typical sales cycle length and customer lifetime value? Include specific dollar amounts and percentages.`,
          // Query 3: Marketing channel performance
          `What are the top performing marketing channels in ${industry} based on ROI data 2024-2025? Which channels have the highest conversion rates and lowest cost per acquisition? Include specific statistics.`,
          // Query 4: Trends and opportunities
          `What are the emerging trends and growth opportunities in ${industry} for 2025? What strategies are working best for fast-growing companies in this space?`
        ]
      : [
          // Standard Mode: Single generic query (less detailed)
          `${industry} current business trends and basic growth strategies 2025`
        ];

    // Execute queries (parallel for deep mode, single for standard)
    const researchPromises = queries.map(async (query) => {
      try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { 
                role: 'system', 
                content: isDeepMode
                  ? 'You are a market research analyst specializing in quantitative data. Provide SPECIFIC numbers: market sizes, percentages, dollar amounts, competitor names with market shares, CAC figures, conversion rates. Be factual and data-driven. Keep responses under 400 words but maximize data density.'
                  : 'You are a market research analyst. Provide concise, general market insights. Focus on broad trends and basic recommendations. Keep responses under 300 words.' 
              },
              { role: 'user', content: query }
            ],
          }),
        });

        if (!response.ok) {
          console.error(`Perplexity API error: ${response.status}`);
          return null;
        }

        const data = await response.json();
        return {
          content: data.choices?.[0]?.message?.content || '',
          citations: (data.citations || []).map((url: string) => {
            let title = url;
            try {
              const urlObj = new URL(url);
              title = urlObj.hostname.replace('www.', '');
            } catch {}
            return { url, title };
          })
        };
      } catch (queryError) {
        console.error('Perplexity query error:', queryError);
        return null;
      }
    });

    const results = await Promise.all(researchPromises);
    const validResults = results.filter(r => r !== null);

    if (validResults.length === 0) {
      console.log('No valid Perplexity results');
      return { insights: '', citations: [] };
    }

    // Combine insights
    const allInsights = validResults.map(r => r!.content).join('\n\n');
    const allCitations: CitationInfo[] = [];
    const seenUrls = new Set<string>();
    validResults.forEach(r => {
      r!.citations.forEach((c: CitationInfo) => {
        if (!seenUrls.has(c.url)) {
          seenUrls.add(c.url);
          allCitations.push(c);
        }
      });
    });

    const duration = Date.now() - startTime;
    console.log(`Perplexity research completed in ${duration}ms with ${allCitations.length} sources`);

    if (controller) {
      sendSSE(controller, 'research_complete', { 
        message: `Found ${allCitations.length} sources`,
        sourceCount: allCitations.length
      });
    }

    // For Deep Mode: Extract structured data from insights
    let structuredData: StructuredMarketData | undefined;
    if (isDeepMode) {
      structuredData = extractStructuredData(allInsights);
      console.log('Structured data extracted:', {
        hasMarketSize: !!structuredData.marketSize,
        hasGrowthRate: !!structuredData.growthRate,
        competitorCount: structuredData.topCompetitors?.length || 0,
        channelCount: structuredData.bestChannels?.length || 0
      });
    }

    return {
      insights: allInsights,
      citations: allCitations.slice(0, isDeepMode ? 10 : 5),
      structuredData
    };
  } catch (error) {
    console.error('Perplexity research error:', error);
    // Graceful degradation: return empty result instead of failing
    return { insights: '', citations: [] };
  }
}

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

    const startTime = Date.now();
    console.log('Business Planner request received');

    const requestBody = await req.json();
    const isDeepMode = requestBody.analysisMode === "deep";
    const useStreaming = requestBody.streaming === true;

    // Get user's premium status
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('is_premium, subscription_end_date, deep_analysis_count, deep_analysis_window_start, standard_analysis_count, standard_analysis_window_start')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error reading credits:', creditsError);
      throw new Error('Failed to check credits');
    }

    let isPremium = creditsData?.is_premium ?? false;
    if (isPremium && creditsData?.subscription_end_date) {
      const subscriptionEndDate = new Date(creditsData.subscription_end_date);
      if (subscriptionEndDate < new Date()) {
        console.log('Premium subscription expired');
        isPremium = false;
        await supabase
          .from('user_credits')
          .update({ is_premium: false, auto_renew: false })
          .eq('user_id', user.id);
      }
    }
    
    const deepLimit = isPremium ? 2 : 0;
    const standardLimit = isPremium ? 6 : 2;

    // Check limits
    if (isDeepMode) {
      const currentDeepCount = creditsData?.deep_analysis_count ?? 0;
      const deepWindowStart = creditsData?.deep_analysis_window_start;
      
      if (deepWindowStart) {
        const windowEndsAt = new Date(new Date(deepWindowStart).getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < windowEndsAt && currentDeepCount >= deepLimit) {
          const hoursRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60 * 60));
          const minutesRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60));
          const timeMessage = hoursRemaining >= 1 
            ? `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`
            : `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`;
          
          return new Response(
            JSON.stringify({ error: `Deep analysis limit reached (${currentDeepCount}/${deepLimit}). Try again in ${timeMessage}.` }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } else {
      const currentStandardCount = creditsData?.standard_analysis_count ?? 0;
      const standardWindowStart = creditsData?.standard_analysis_window_start;
      
      if (standardWindowStart) {
        const windowEndsAt = new Date(new Date(standardWindowStart).getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < windowEndsAt && currentStandardCount >= standardLimit) {
          const hoursRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60 * 60));
          const minutesRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60));
          const timeMessage = hoursRemaining >= 1 
            ? `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`
            : `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`;
          
          return new Response(
            JSON.stringify({ 
              error: isPremium 
                ? `Standard analysis limit reached (${currentStandardCount}/${standardLimit}). Try again in ${timeMessage}.`
                : `Free limit reached (${currentStandardCount}/${standardLimit}). Please wait 24 hours or upgrade to Premium.`
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Validate input
    let validatedInput;
    try {
      validatedInput = inputSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({ error: 'Invalid input', details: error.errors.map(e => e.message).join(', ') }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    const { prompt, budget, industry, channels, timeline, geographic, websiteUrl, analysisMode } = validatedInput;
    
    console.log('Analysis mode:', { isPremium, analysisMode: analysisMode || 'standard', isDeepMode, streaming: useStreaming, hasWebsiteUrl: !!websiteUrl });

    // If streaming is enabled, create a stream response
    if (useStreaming) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Step 0: Analyze website if URL provided
            let websiteInsights: WebsiteInsights | null = null;
            if (websiteUrl) {
              websiteInsights = await analyzeWebsite(websiteUrl, authHeader!, controller);
            }

            // Step 1: Perform Perplexity market research with streaming updates
            const industryContext = industry || 'general business';
            const marketResearch = await performMarketResearch(industryContext, prompt, isDeepMode, controller);
            const hasMarketResearch = marketResearch.insights.length > 0;

            // Step 2: Notify AI generation starting
            sendSSE(controller, 'generation_start', { message: 'Creating strategy...' });

            // Step 3: Call Lovable AI
            const result = await generateStrategy(
              prompt, budget, industry, channels, timeline, geographic,
              isDeepMode, marketResearch, hasMarketResearch, websiteInsights, controller
            );

            // Step 4: Save to history and update credits
            await saveHistoryAndUpdateCredits(
              supabase, user.id, prompt, budget, industry, 
              analysisMode || 'standard', result, creditsData, 
              isDeepMode, deepLimit, standardLimit
            );

            // Step 5: Send final result
            sendSSE(controller, 'complete', result);

            const totalTime = Date.now() - startTime;
            console.log(`Streaming request completed in ${totalTime}ms`);

            controller.close();
          } catch (error: any) {
            console.error('Streaming error:', error);
            sendSSE(controller, 'error', { error: error.message || 'An error occurred' });
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // Non-streaming mode (legacy)
    // Analyze website if URL provided
    let websiteInsights: WebsiteInsights | null = null;
    if (websiteUrl) {
      websiteInsights = await analyzeWebsite(websiteUrl, authHeader!);
    }

    const industryContext = industry || 'general business';
    const marketResearch = await performMarketResearch(industryContext, prompt, isDeepMode);
    const hasMarketResearch = marketResearch.insights.length > 0;

    console.log(`Market research: ${hasMarketResearch ? 'available' : 'skipped'} (${marketResearch.citations.length} sources)`);
    console.log(`Website insights: ${websiteInsights ? 'available' : 'none'}`);

    const result = await generateStrategy(
      prompt, budget, industry, channels, timeline, geographic,
      isDeepMode, marketResearch, hasMarketResearch, websiteInsights
    );

    await saveHistoryAndUpdateCredits(
      supabase, user.id, prompt, budget, industry, 
      analysisMode || 'standard', result, creditsData, 
      isDeepMode, deepLimit, standardLimit
    );

    const totalTime = Date.now() - startTime;
    console.log(`Request completed in ${totalTime}ms`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Business Tools Advisor error:', error);
    
    if (error.message === 'Unauthorized') {
      return new Response(
        JSON.stringify({ error: 'Please log in to continue' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Build structured market data section for Deep Mode user prompt
function buildStructuredMarketDataPrompt(structuredData: StructuredMarketData): string {
  const sections: string[] = [];
  
  sections.push('=== MARKET INTELLIGENCE DATA (You MUST incorporate these into your strategy) ===\n');
  
  // Market Size and Growth
  if (structuredData.marketSize || structuredData.growthRate) {
    sections.push(`MARKET SIZE: ${structuredData.marketSize || 'Data not available'} (Growing ${structuredData.growthRate || 'N/A'})`);
  }
  
  // Competitors
  if (structuredData.topCompetitors && structuredData.topCompetitors.length > 0) {
    sections.push('\nTOP COMPETITORS (Reference in your competitorAnalysis):');
    for (const comp of structuredData.topCompetitors) {
      sections.push(`- ${comp.name}${comp.marketShare ? ` - ${comp.marketShare} market share` : ''}`);
    }
  }
  
  // Benchmarks
  if (structuredData.averageCAC || structuredData.conversionRateBenchmark) {
    sections.push('\nINDUSTRY BENCHMARKS (Use in your ROI projections):');
    if (structuredData.averageCAC) sections.push(`- Average CAC: ${structuredData.averageCAC}`);
    if (structuredData.conversionRateBenchmark) sections.push(`- Conversion Rate: ${structuredData.conversionRateBenchmark}`);
  }
  
  // Marketing Channels
  if (structuredData.bestChannels && structuredData.bestChannels.length > 0) {
    sections.push('\nBEST PERFORMING CHANNELS (Prioritize in your recommendations):');
    for (const channel of structuredData.bestChannels) {
      sections.push(`- ${channel.channel}${channel.roi ? ` - ROI: ${channel.roi}` : ' - High ROI'}`);
    }
  }
  
  // Key Trends
  if (structuredData.keyTrends && structuredData.keyTrends.length > 0) {
    sections.push('\nKEY TRENDS:');
    for (const trend of structuredData.keyTrends) {
      sections.push(`- ${trend}`);
    }
  }
  
  sections.push('\n\nMANDATORY INTEGRATION REQUIREMENTS:');
  sections.push('1. Reference at least one competitor by name in competitorAnalysis for each phase');
  sections.push('2. Include market size or growth rate in at least one objective');
  sections.push('3. Base your ROI projections on the industry benchmarks provided above');
  sections.push('4. Prioritize marketing channels based on the ROI data above');
  sections.push('5. Incorporate key trends into your strategy recommendations');
  
  return sections.join('\n');
}

// Helper function to generate strategy
async function generateStrategy(
  prompt: string,
  budget: string | undefined,
  industry: string | undefined,
  channels: string | undefined,
  timeline: string | undefined,
  geographic: string | undefined,
  isDeepMode: boolean,
  marketResearch: MarketResearchResult,
  hasMarketResearch: boolean,
  websiteInsights: WebsiteInsights | null,
  controller?: ReadableStreamDefaultController
): Promise<{ strategies: StrategyPhase[]; marketInsights?: string; sources?: string[]; websiteAnalysis?: WebsiteInsights }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  const phaseCount = "EXACTLY 4";

  // BASE SYSTEM PROMPT (shared between modes) - IMPROVED FOR CONCRETENESS
  const baseSystemPrompt = `You are a practical business advisor who gives SPECIFIC, ACTIONABLE advice. No fluff, no buzzwords.

CRITICAL OUTPUT RULES - BE EXTREMELY CONCRETE:
- NEVER use vague terms like: "leverage", "optimize", "synergize", "strategic initiatives", "streamline", "enhance", "holistic", "cutting-edge", "innovative", "drive engagement", "build presence"
- NEVER give generic advice like: "increase brand awareness", "drive engagement", "build presence", "maximize potential", "implement a strategy"

=== ACTION TEMPLATE - USE THIS FORMAT FOR EVERY ACTION ===
WHAT: [Exact Tool/Platform] at [URL]
TIME: [X minutes/hours to complete]
COST: [Free / EUR X per month / one-time EUR X]
STEPS:
   1. Go to [exact URL]
   2. Click [exact button/link]
   3. Enter/Select [specific values]
RESULT: Expect [specific metric] within [timeframe]

EXAMPLE ACTION (follow this level of detail):
"Set up email capture with ConvertKit (convertkit.com). TIME: 45 minutes, COST: Free up to 1,000 subscribers. STEPS: 1) Go to convertkit.com/signup 2) Create account 3) Click 'Landing Pages' → 'Create New' 4) Choose 'Charlotte' template 5) Change headline to '[Your Product] - Get 20% Off Your First Order' 6) Add form fields: Email only 7) Set thank-you redirect to your website. RESULT: Expect 2-5% visitor conversion rate, aim for 50 subscribers in first week."

HELPFUL RESOURCES - Include these real URLs in actions where relevant:
- Email Marketing: mailchimp.com, convertkit.com, brevo.com
- Design: canva.com, figma.com, unsplash.com (free images)
- Landing Pages: carrd.co, unbounce.com, leadpages.com
- Analytics: analytics.google.com, hotjar.com, clarity.microsoft.com
- Social Media: later.com, buffer.com, hootsuite.com
- SEO: ubersuggest.com, ahrefs.com/free-tools, answerthepublic.com
- CRM: hubspot.com/free-crm, pipedrive.com, notion.so
- Ads: ads.google.com, business.facebook.com
- Video: loom.com, descript.com, capcut.com
- AI Tools: chatgpt.com, claude.ai, perplexity.ai
- Tutorials: youtube.com (search for specific tutorials)

PHASE STRUCTURE:
- Return ${phaseCount} strategy phases as a structured timeline
- Each phase should build upon the previous one
- Focus on IMMEDIATE actionable steps, not long-term theory

Each phase must include:
1. phase: Phase number (1, 2, 3, etc.)
2. title: Clear, action-oriented title (e.g., "Set Up Email Capture" not "Optimize Email Strategy")
3. timeframe: Duration (e.g., "Week 1-2", "Days 1-3")
4. objectives: 2-4 MEASURABLE objectives with SPECIFIC numbers (e.g., "Get 50 email subscribers" not "Build email list")
5. actions: 3-5 DETAILED action items. Each action MUST be an object with:
   - text: Step-by-step instruction following the ACTION TEMPLATE above
   - resourceUrl: A helpful URL from the list above or from market research
   - resourceTitle: Domain name (e.g., "canva.com", "mailchimp.com")
6. budget: Specific budget for this phase (e.g., "50-100 EUR" or "Free tools only")
7. channels: Exact tools and platforms to use
8. milestones: Measurable checkpoints with numbers`;

  // MODE-SPECIFIC SYSTEM PROMPT ADDITIONS
  let systemPrompt: string;
  
  if (isDeepMode) {
    systemPrompt = baseSystemPrompt + `

DEEP MODE PREMIUM ANALYSIS - MANDATORY ADDITIONAL FIELDS:

You MUST provide these additional fields for EACH phase:

9. competitorAnalysis: Array with 1-2 competitors. Include:
   - name: Actual competitor company/tool name (USE NAMES FROM MARKET DATA IF PROVIDED)
   - strengths: 2 specific strengths with numbers where possible
   - weaknesses: 2 specific weaknesses or gaps you can exploit

10. riskMitigation: Array of 2 backup plans. Format EXACTLY like this:
    "IF [specific metric] is below [specific target number], THEN [specific alternative action with tool name and URL]"
    Example: "IF email signup rate is below 2%, THEN switch to exit-intent popup using OptinMonster (optinmonster.com) with 10% discount offer"

11. roiProjection: ROI calculation object with REAL MATH:
    - investment: Total investment for this phase with breakdown (e.g., "€200 total: €100 ads + €50 tools + €50 content")
    - expectedReturn: Expected return WITH CALCULATION shown (e.g., "€600-900 based on: 200 clicks × 3% conversion = 6 customers × €100-150 avg order")
    - timeframe: When to expect returns
    - assumptions: 2 assumptions with specific numbers (e.g., "Assumes industry-average 3% conversion rate", "Based on €2.50 CPC from market data")

=== ROI CALCULATOR TEMPLATE - USE THIS FORMAT ===
Investment Breakdown:
- Ad Spend: €X
- Tool Costs: €X  
- Content Creation: €X (or X hours × €Y/hour)
- Total: €X

Expected Return Calculation:
- Traffic: X visitors (from €X ad spend ÷ €X CPC)
- Conversion: X% (industry benchmark)
- Customers: X (traffic × conversion)
- Revenue: €X-Y (customers × €X average order value)
- ROI: X% ((revenue - investment) ÷ investment × 100)

=== MANDATORY MARKET DATA INTEGRATION ===

Your strategy MUST demonstrate that you used the market intelligence data:

1. COMPETITOR INTEGRATION: Reference actual competitors from market data BY NAME in competitorAnalysis
2. MARKET METRICS: Include market size or growth rate numbers from research in your objectives
3. BENCHMARK-BASED PROJECTIONS: Your ROI calculations MUST use the CAC/conversion benchmarks provided
4. CHANNEL PRIORITIZATION: Recommend channels based on their actual ROI performance data from research
5. TREND ALIGNMENT: Reference at least one specific industry trend from the research

If specific data is not available, state "Based on industry estimates" with a reasonable estimate.

QUALITY CHECK: A strategy without specific numbers, URLs, and market data integration is NOT a premium deep analysis.

CRITICAL:
- Output must be in English
- No markdown formatting in the output
- Be EXTREMELY specific - every action should be copy-paste executable
- MINIMUM 6-8 resource URLs REQUIRED across all phases
- Each phase MUST have at least 2 actions with resourceUrl
- Include ROI calculations with actual math, not vague projections

Use the create_strategy function to return your response.`;
  } else {
    systemPrompt = baseSystemPrompt + `

STANDARD MODE:
- Focus on quick wins and immediate impact
- Keep recommendations practical and achievable
- Prioritize the most impactful actions with lowest effort
- 4 focused phases
- General recommendations without deep market analysis

CRITICAL:
- Output must be in English
- No markdown formatting in the output
- Be EXTREMELY specific and actionable
- MINIMUM 4 resource URLs REQUIRED across all phases - distribute links to action items
- Each phase should have at least ONE action with a resourceUrl from AVAILABLE RESOURCES
- Only include resourceUrl if it's truly relevant to the action

Use the create_strategy function to return your response.`;
  }

  // BUILD USER PROMPT (differentiated by mode)
  let userPromptText = `User's business goals and context:\n\n${prompt}`;
  
  if (budget) userPromptText += `\n\nBudget: ${budget}`;
  if (industry) userPromptText += `\nIndustry: ${industry}`;
  if (channels) userPromptText += `\nPreferred Tools/Channels: ${channels}`;
  if (timeline) userPromptText += `\nTimeline: ${timeline}`;
  if (geographic) userPromptText += `\nGeographic Focus: ${geographic}`;

  // Add website insights if available (PERSONALIZED STRATEGY)
  if (websiteInsights) {
    userPromptText += `\n\n=== WEBSITE ANALYSIS - PERSONALIZE YOUR STRATEGY TO THIS ===`;
    userPromptText += `\n\nWe analyzed the user's actual website and found:`;
    userPromptText += `\n\nBusiness Type: ${websiteInsights.businessType}`;
    
    if (websiteInsights.offerings && websiteInsights.offerings.length > 0) {
      userPromptText += `\nWhat They Sell: ${websiteInsights.offerings.join(', ')}`;
    }
    
    if (websiteInsights.targetAudience) {
      userPromptText += `\nTarget Audience: ${websiteInsights.targetAudience}`;
    }
    
    if (websiteInsights.currentChannels && websiteInsights.currentChannels.length > 0) {
      userPromptText += `\nCurrent Marketing Channels: ${websiteInsights.currentChannels.join(', ')}`;
    }
    
    if (websiteInsights.problems && websiteInsights.problems.length > 0) {
      userPromptText += `\n\nPROBLEMS WE FOUND ON THEIR WEBSITE (ADDRESS THESE IN YOUR STRATEGY):`;
      websiteInsights.problems.forEach((problem, i) => {
        userPromptText += `\n${i + 1}. ${problem}`;
      });
    }
    
    if (websiteInsights.improvements && websiteInsights.improvements.length > 0) {
      userPromptText += `\n\nIMPROVEMENT SUGGESTIONS (INCORPORATE THESE):`;
      websiteInsights.improvements.forEach((improvement, i) => {
        userPromptText += `\n${i + 1}. ${improvement}`;
      });
    }
    
    userPromptText += `\n\nIMPORTANT: Your strategy MUST address the problems found on their website. Make Phase 1 focus on fixing the most critical website issues. Reference specific problems and improvements in your actions.`;
  }

  // Add market research context (DIFFERENTIATED BY MODE)
  if (hasMarketResearch) {
    if (isDeepMode && marketResearch.structuredData) {
      // DEEP MODE: Structured data prompt with mandatory integration requirements
      userPromptText += '\n\n' + buildStructuredMarketDataPrompt(marketResearch.structuredData);
      
      // Also include raw insights for additional context
      userPromptText += `\n\n=== DETAILED MARKET RESEARCH ===\n${marketResearch.insights}`;
    } else {
      // STANDARD MODE: Basic context (optional, not mandatory)
      userPromptText += `\n\n=== MARKET CONTEXT (optional background) ===\n${marketResearch.insights}`;
    }
    
    // Add available resources for both modes
    const resourcesList = marketResearch.citations.map((c, i) => `${i + 1}. ${c.url} - "${c.title}"`).join('\n');
    userPromptText += `\n\n=== AVAILABLE RESOURCES ===\nUse these URLs for resourceUrl in actions when relevant:\n${resourcesList}`;
    
    if (isDeepMode) {
      userPromptText += `\n\nREMINDER: This is a PREMIUM deep analysis. Your strategy MUST incorporate the market intelligence data above. Generic strategies without market data integration are not acceptable.`;
    }
  }

  const model = isDeepMode ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-flash';
  const maxTokens = isDeepMode ? 12000 : 6000;
  const timeout = isDeepMode ? 90000 : 35000;

  console.log(`Calling AI (model: ${model}, mode: ${isDeepMode ? 'deep' : 'standard'}, hasWebsiteInsights: ${!!websiteInsights})...`);

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeout);

  let result: { strategies: StrategyPhase[]; marketInsights?: string; sources?: string[]; websiteAnalysis?: WebsiteInsights; structuredMarketData?: StructuredMarketData };

  if (isDeepMode) {
    const deepModeJsonInstructions = `

RESPONSE FORMAT - CRITICAL:
You MUST return ONLY a valid JSON object with no markdown, no code fences, no explanation.
The JSON must have this exact structure:

{
  "strategies": [
    {
      "phase": 1,
      "title": "Phase title",
      "timeframe": "Week 1-2",
      "objectives": ["Objective 1 with specific metrics", "Objective 2 referencing market data"],
      "actions": [{"text": "Action description with specific tools and metrics", "resourceUrl": "https://example.com", "resourceTitle": "example.com"}],
      "budget": "Budget for phase based on industry CAC benchmarks",
      "channels": ["Tool 1", "Tool 2"],
      "milestones": ["Milestone 1 with metric target"],
      "competitorAnalysis": [{"name": "Actual Competitor Name from market data", "strengths": ["Strength 1", "Strength 2"], "weaknesses": ["Weakness 1", "Weakness 2"]}],
      "riskMitigation": ["IF conversion rate is below X%, THEN do Y"],
      "roiProjection": {"investment": "Amount based on benchmarks", "expectedReturn": "Return based on industry conversion rates", "timeframe": "Timeframe", "assumptions": ["Assumption based on market data"]}
    }
  ]
}

Return EXACTLY 4 phases. Each phase MUST have competitorAnalysis, riskMitigation, and roiProjection with market data integration.`;

    const deepSystemPrompt = systemPrompt + deepModeJsonInstructions;

    let aiResponse: Response;
    try {
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOVABLE_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: deepSystemPrompt },
            { role: 'user', content: userPromptText }
          ],
          max_completion_tokens: maxTokens
        }),
        signal: abortController.signal
      });
      
      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`AI request timed out after ${timeout}ms`);
      }
      throw error;
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service quota exceeded. Please contact support.');
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received (deep mode)');

    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty AI response');
    }

    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    try {
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', cleanedContent.substring(0, 500));
      throw new Error('AI returned invalid JSON format');
    }

    if (!result.strategies || !Array.isArray(result.strategies)) {
      throw new Error('Invalid response format from AI');
    }

  } else {
    // STANDARD MODE: Use tool calling
    const baseProperties = {
      phase: { type: 'number', description: 'Phase number' },
      title: { type: 'string', description: 'Phase title' },
      timeframe: { type: 'string', description: 'Duration' },
      objectives: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Measurable objectives with KPIs'
      },
      actions: { 
        type: 'array', 
        items: { 
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Detailed action description' },
            resourceUrl: { type: 'string', description: 'Optional: relevant URL from available resources' },
            resourceTitle: { type: 'string', description: 'Optional: domain name of the resource' }
          },
          required: ['text']
        },
        description: 'Specific actions with optional resource URLs from available resources'
      },
      budget: { type: 'string', description: 'Budget allocation' },
      channels: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Tools and platforms needed'
      },
      milestones: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Success indicators'
      }
    };

    let aiResponse: Response;
    try {
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOVABLE_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPromptText }
          ],
          max_completion_tokens: maxTokens,
          tools: [{
            type: 'function',
            function: {
              name: 'create_strategy',
              description: 'Create a phased business strategy with specific, actionable steps',
              parameters: {
                type: 'object',
                properties: {
                  strategies: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: baseProperties,
                      required: ['phase', 'title', 'timeframe', 'objectives', 'actions']
                    },
                    description: 'Array of 4 strategy phases'
                  }
                },
                required: ['strategies']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'create_strategy' } }
        }),
        signal: abortController.signal
      });
      
      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`AI request timed out after ${timeout}ms`);
      }
      throw error;
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service quota exceeded. Please contact support.');
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received (standard mode)');

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== 'create_strategy') {
      throw new Error('Invalid AI response format');
    }

    result = JSON.parse(toolCall.function.arguments);
    
    if (!result.strategies || !Array.isArray(result.strategies)) {
      throw new Error('Invalid response format from AI');
    }
  }

  // Send phase updates for streaming mode
  if (controller && result.strategies) {
    for (let i = 0; i < result.strategies.length; i++) {
      sendSSE(controller, 'phase_complete', { 
        phaseNumber: i + 1,
        totalPhases: result.strategies.length,
        phase: result.strategies[i]
      });
    }
  }

  // Add market insights, structured data, and website analysis to result
  if (hasMarketResearch) {
    result.marketInsights = marketResearch.insights;
    result.sources = marketResearch.citations.map(c => c.url);
    
    // Include structured market data for Deep Mode display
    if (isDeepMode && marketResearch.structuredData) {
      result.structuredMarketData = marketResearch.structuredData;
    }
  }
  
  if (websiteInsights) {
    result.websiteAnalysis = websiteInsights;
  }

  console.log(`Parsed ${result.strategies.length} strategy phases (mode: ${isDeepMode ? 'deep' : 'standard'}, hasWebsiteAnalysis: ${!!websiteInsights})`);

  return result;
}

// Helper function to save history and update credits
async function saveHistoryAndUpdateCredits(
  supabase: any,
  userId: string,
  prompt: string,
  budget: string | undefined,
  industry: string | undefined,
  analysisMode: string,
  result: any,
  creditsData: any,
  isDeepMode: boolean,
  deepLimit: number,
  standardLimit: number
) {
  // Save to history
  const { error: historyError } = await supabase
    .from('business_tools_history')
    .insert({
      user_id: userId,
      business_goals: prompt.substring(0, 500),
      budget_range: budget || 'Not specified',
      industry: industry || 'Not specified',
      team_size: 'Not specified',
      result: result,
      analysis_mode: analysisMode
    });

  if (historyError) {
    console.error('Error saving history:', historyError);
  } else {
    console.log('History saved successfully');
    
    // Auto-cleanup
    const HISTORY_LIMIT = 10;
    const { data: allHistory } = await supabase
      .from('business_tools_history')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (allHistory && allHistory.length > HISTORY_LIMIT) {
      const idsToDelete = allHistory.slice(HISTORY_LIMIT).map((h: any) => h.id);
      await supabase
        .from('business_tools_history')
        .delete()
        .in('id', idsToDelete);
    }
  }

  // Update credits
  const now = new Date();
  
  if (isDeepMode) {
    const deepWindowStart = creditsData?.deep_analysis_window_start;
    const deepCount = creditsData?.deep_analysis_count ?? 0;
    
    let newDeepCount = deepCount + 1;
    let newDeepWindowStart = deepWindowStart;
    
    if (!deepWindowStart || new Date(deepWindowStart).getTime() + 24 * 60 * 60 * 1000 <= now.getTime()) {
      newDeepCount = 1;
      newDeepWindowStart = now.toISOString();
    }
    
    await supabase
      .from('user_credits')
      .update({
        deep_analysis_count: newDeepCount,
        deep_analysis_window_start: newDeepWindowStart,
        updated_at: now.toISOString()
      })
      .eq('user_id', userId);
      
    console.log(`Deep analysis count updated: ${newDeepCount}/${deepLimit}`);
  } else {
    const standardWindowStart = creditsData?.standard_analysis_window_start;
    const standardCount = creditsData?.standard_analysis_count ?? 0;
    
    let newStandardCount = standardCount + 1;
    let newStandardWindowStart = standardWindowStart;
    
    if (!standardWindowStart || new Date(standardWindowStart).getTime() + 24 * 60 * 60 * 1000 <= now.getTime()) {
      newStandardCount = 1;
      newStandardWindowStart = now.toISOString();
    }
    
    await supabase
      .from('user_credits')
      .update({
        standard_analysis_count: newStandardCount,
        standard_analysis_window_start: newStandardWindowStart,
        updated_at: now.toISOString()
      })
      .eq('user_id', userId);
      
    console.log(`Standard analysis count updated: ${newStandardCount}/${standardLimit}`);
  }
}
