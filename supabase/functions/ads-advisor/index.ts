import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActionItem {
  text: string;
  searchTerm: string;
}

interface CompetitorInfo {
  name: string;
  strengths: string[];
  weaknesses: string[];
}

interface ABTestSuggestion {
  element: string;
  variantA: string;
  variantB: string;
  expectedImpact: string;
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
  // Deep mode exclusive fields
  competitorAnalysis?: CompetitorInfo[];
  riskMitigation?: string[];
  abTestSuggestions?: ABTestSuggestion[];
  roiProjection?: ROIProjection;
  weeklyBreakdown?: string[];
}

// Input validation schema - simplified for free text input
const inputSchema = z.object({
  prompt: z.string().trim().min(1, "Please describe your advertising goals").max(2000, "Description too long"),
  // Optional context parameters
  budget: z.string().optional(),
  industry: z.string().optional(),
  channels: z.string().optional(),
  timeline: z.string().optional(),
  geographic: z.string().optional(),
  analysisMode: z.enum(["standard", "deep"]).optional()
});

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
    console.log('Ads Planner request received');

    // Parse request early to get analysis mode
    const requestBody = await req.json();
    const isDeepMode = requestBody.analysisMode === "deep";

    // Get user's premium status and ADS-SPECIFIC counts
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('is_premium, subscription_end_date, ads_deep_analysis_count, ads_deep_analysis_window_start, ads_standard_analysis_count, ads_standard_analysis_window_start')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error reading credits:', creditsError);
      throw new Error('Failed to check credits');
    }

    // Server-side premium verification: Check if subscription has expired
    let isPremium = creditsData?.is_premium ?? false;
    if (isPremium && creditsData?.subscription_end_date) {
      const subscriptionEndDate = new Date(creditsData.subscription_end_date);
      if (subscriptionEndDate < new Date()) {
        console.log('Premium subscription expired, denying premium access');
        isPremium = false;
        
        // Update database to reflect expired status
        await supabase
          .from('user_credits')
          .update({ is_premium: false, auto_renew: false })
          .eq('user_id', user.id);
      }
    }
    
    // Set limits based on premium status
    const deepLimit = isPremium ? 2 : 0;
    const standardLimit = isPremium ? 6 : 2;

    // Check limit for the selected mode (ADS-SPECIFIC)
    if (isDeepMode) {
      const currentDeepCount = creditsData?.ads_deep_analysis_count ?? 0;
      const deepWindowStart = creditsData?.ads_deep_analysis_window_start;
      
      if (deepWindowStart) {
        const windowEndsAt = new Date(new Date(deepWindowStart).getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < windowEndsAt && currentDeepCount >= deepLimit) {
          console.log(`Deep analysis limit reached: ${currentDeepCount}/${deepLimit}`);
          
          const hoursRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60 * 60));
          const minutesRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60));
          const timeMessage = hoursRemaining >= 1 
            ? `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`
            : `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`;
          
          return new Response(
            JSON.stringify({ 
              error: `Deep analysis limit reached (${currentDeepCount}/${deepLimit}). Try again in ${timeMessage}.`
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      console.log(`Deep analysis allowed. Current count: ${currentDeepCount}/${deepLimit}`);
    } else {
      const currentStandardCount = creditsData?.ads_standard_analysis_count ?? 0;
      const standardWindowStart = creditsData?.ads_standard_analysis_window_start;
      
      if (standardWindowStart) {
        const windowEndsAt = new Date(new Date(standardWindowStart).getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < windowEndsAt && currentStandardCount >= standardLimit) {
          console.log(`Standard analysis limit reached: ${currentStandardCount}/${standardLimit}`);
          
          const hoursRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60 * 60));
          const minutesRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60));
          const timeMessage = hoursRemaining >= 1 
            ? `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`
            : `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`;
          
          return new Response(
            JSON.stringify({ 
              error: `Standard analysis limit reached (${currentStandardCount}/${standardLimit}). Try again in ${timeMessage}.`
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      console.log(`Standard analysis allowed. Current count: ${currentStandardCount}/${standardLimit}`);
    }

    // Validate input
    const validatedInput = inputSchema.parse(requestBody);
    const { prompt, budget, industry, channels, timeline, geographic, analysisMode } = validatedInput;
    
    console.log('Analysis mode:', {
      isPremium,
      analysisMode: analysisMode || 'standard',
      isDeepMode
    });

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Different phase counts for standard vs deep mode
    const phaseCount = isDeepMode ? "EXACTLY 6" : "EXACTLY 4";
    const phaseMinMax = isDeepMode ? { minItems: 6, maxItems: 6 } : { minItems: 4, maxItems: 4 };
    
    const systemPrompt = `You are a strategic advertising planner. Create a phased advertising strategy based on the user's input.

CRITICAL OUTPUT RULES - NO BUZZWORDS ALLOWED:
- NEVER use vague terms like: "leverage", "optimize", "synergize", "strategic initiatives", "streamline", "enhance", "holistic", "cutting-edge", "innovative", "drive engagement", "build presence"
- NEVER use generic phrases like: "increase brand awareness", "maximize ROI", "build presence", "maximize potential"

ALWAYS include:
- SPECIFIC numbers (e.g., "500 EUR/month budget", "expect 10,000-15,000 impressions", "target 2-3 EUR CPC")
- EXACT platform names (e.g., "Google Ads Search", "Meta Ads Manager", "LinkedIn Campaign Manager")
- Concrete timeframes (e.g., "complete setup in 2 hours", "run for 14 days minimum")
- Expected outcomes with metrics (e.g., "expect 2-4% CTR", "should generate 50-100 clicks/day")

OUTPUT REQUIREMENTS:
- Return ${phaseCount} strategy phases as a structured timeline
- Each phase should build upon the previous one
- Focus on actionable, practical advertising strategies with SPECIFIC details
- Consider the user's context (budget, industry, timeline if provided)

PHASE STRUCTURE:
Each phase must include:
1. phase: Phase number (1, 2, 3, etc.)
2. title: Clear, action-oriented title (e.g., "Foundation & Brand Awareness", "Scaling & Optimization")
3. timeframe: Duration (e.g., "Week 1-2", "Month 1", "Weeks 3-4")
4. objectives: 2-4 MEASURABLE objectives with SPECIFIC KPIs and numbers
   Example objectives:
   - "Achieve 50,000 ad impressions within the first 2 weeks"
   - "Generate 200 website clicks at under 1.50 EUR CPC"
   - "Reach 5,000 unique users in the target demographic"
   NEVER write objectives like "Increase visibility" or "Improve engagement"
5. actions: 3-5 SPECIFIC, DETAILED action items. Each action MUST be an object with:
   - text: Detailed action with EXACT platform name, time estimate, and expected outcome
   - searchTerm: Google search term for learning more about this action
   
   FORMAT FOR ACTION TEXT (MANDATORY):
   "[ACTION VERB] [EXACT PLATFORM NAME] - [TIME ESTIMATE] - [EXPECTED OUTCOME]"
   
   Example actions:
   - text: "Create Google Ads Search campaign targeting 10 high-intent keywords like 'buy [product] online' - 3 hours setup - expect 500-1000 daily impressions at 1.50-2.50 EUR CPC"
     searchTerm: "Google Ads Search campaign setup tutorial"
   - text: "Set up Meta Ads Manager conversion campaign with 3 ad creatives (image, video, carousel) - 4 hours to create - expect 15,000-25,000 reach at 5-8 EUR CPM"
     searchTerm: "Facebook Meta Ads conversion campaign setup"
   - text: "Install Google Tag Manager and set up conversion tracking pixels for all ad platforms - 2 hours setup - enables accurate ROI measurement"
     searchTerm: "Google Tag Manager conversion tracking setup"

6. budget: Budget allocation for this phase with SPECIFIC amounts (e.g., "200 EUR/week on Google Ads, 150 EUR/week on Meta Ads")
7. channels: Recommended advertising channels for this phase
8. milestones: Key success indicators with SPECIFIC metrics to achieve before moving to next phase

${isDeepMode ? `DEEP MODE PREMIUM ANALYSIS - MANDATORY ADDITIONAL FIELDS:

You MUST provide these additional fields for EACH phase:

9. competitorAnalysis: Array of 2-3 competitor objects. For each competitor include:
   - name: Actual competitor company name (e.g., "Competitor A: Nike", "Competitor B: Adidas")
   - strengths: 2-3 specific strengths in their ad strategy with numbers where possible
   - weaknesses: 2-3 specific weaknesses or gaps you can exploit in advertising
   
10. riskMitigation: Array of 3-4 backup plans. Format: "IF [ad metric] is below [target], THEN [specific action]"
    Examples:
    - "IF CTR is below 1.5% after 1000 impressions, THEN test new headlines and images"
    - "IF CPC exceeds 3 EUR, THEN add negative keywords and tighten audience targeting"
    - "IF conversion rate drops below 2%, THEN review landing page and A/B test CTA"

11. abTestSuggestions: Array of 2-3 A/B test objects for ads:
    - element: What to test (e.g., "Ad headline", "CTA button text", "Image vs Video")
    - variantA: First variant with specifics
    - variantB: Second variant with specifics
    - expectedImpact: Expected CTR/conversion improvement percentage

12. roiProjection: ROI calculation object with:
    - investment: Total ad spend for this phase (e.g., "800 EUR ad spend + 200 EUR creative costs")
    - expectedReturn: Expected return (e.g., "400-600 clicks at 2% conversion = 8-12 sales worth 1600-2400 EUR")
    - timeframe: When to expect returns (e.g., "Within 4 weeks of campaign launch")
    - assumptions: Array of 2-3 assumptions behind the calculation (e.g., "Assuming 2 EUR CPC and 2% conversion rate")

13. weeklyBreakdown: Array of weekly tasks for the phase timeframe. Be specific:
    - "Week 1: Set up campaigns and tracking, launch with 20 EUR/day test budget"
    - "Week 2: Analyze initial data, pause underperforming ads, scale winners"
    - "Week 3: Implement A/B tests, expand to new audiences"

DEEP MODE QUALITY REQUIREMENTS:
- 6 comprehensive phases instead of 4
- More detailed campaign setup steps
- Specific competitor ad strategies relevant to the user's industry
- Quantified performance thresholds and backup actions
- Data-driven A/B testing recommendations for ad creatives
- ROAS calculations with realistic assumptions` : `STANDARD MODE:
- Focus on quick wins and immediate impact
- Keep recommendations practical and achievable for beginners
- Prioritize the most impactful channels with lowest complexity
- 4 focused phases`}

ADVERTISING PLATFORMS - Always use EXACT names:
- Google Ads Search (for intent-based targeting)
- Google Ads Display (for awareness campaigns)
- Meta Ads Manager / Facebook Ads (for demographic targeting)
- Instagram Ads (for visual products, younger demographics)
- LinkedIn Campaign Manager (for B2B targeting)
- TikTok Ads Manager (for Gen Z, viral content)
- YouTube Ads (for video campaigns)
- Microsoft Advertising / Bing Ads (for additional search traffic)

CRITICAL:
- Output must be in English
- No markdown formatting in the output
- Be EXTREMELY specific and actionable - no generic advice
- Every action must include a searchTerm for users to learn more

Use the create_strategy function to return your response.`;

    let userPromptText = `User's advertising goals and context:\n\n${prompt}`;
    
    if (budget) userPromptText += `\n\nBudget: ${budget}`;
    if (industry) userPromptText += `\nIndustry: ${industry}`;
    if (channels) userPromptText += `\nPreferred Channels: ${channels}`;
    if (timeline) userPromptText += `\nTimeline: ${timeline}`;
    if (geographic) userPromptText += `\nGeographic Target: ${geographic}`;

    // Use different models for standard vs deep mode
    const model = isDeepMode ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-flash';
    const maxTokens = isDeepMode ? 24000 : 8000;
    const timeout = isDeepMode ? 90000 : 25000;

    console.log(`Calling AI (model: ${model}, mode: ${isDeepMode ? 'deep' : 'standard'})...`);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    // Build tool parameters based on mode
    const baseProperties = {
      phase: { type: 'number', description: 'Phase number (1, 2, 3, etc.)' },
      title: { type: 'string', description: 'Clear phase title' },
      timeframe: { type: 'string', description: 'Duration like "Week 1-2" or "Month 1"' },
      objectives: { 
        type: 'array', 
        items: { type: 'string' },
        minItems: 2,
        maxItems: 4,
        description: '2-4 MEASURABLE objectives with SPECIFIC KPIs and numbers'
      },
      actions: { 
        type: 'array', 
        items: { 
          type: 'object',
          properties: {
            text: { 
              type: 'string', 
              description: 'Detailed action with EXACT platform name, time estimate, and expected outcome. Format: "[ACTION] [PLATFORM] - [TIME] - [OUTCOME]"' 
            },
            searchTerm: { 
              type: 'string', 
              description: 'Google search term for learning more, e.g. "Google Ads Search campaign tutorial"' 
            }
          },
          required: ['text', 'searchTerm']
        },
        minItems: 3,
        maxItems: 5,
        description: '3-5 specific actions with platform names, time estimates, and expected outcomes'
      },
      budget: { type: 'string', description: 'Budget allocation for this phase with specific amounts' },
      channels: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Recommended advertising channels'
      },
      milestones: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Key success indicators with SPECIFIC metrics'
      }
    };

    // Add deep mode exclusive properties
    const deepModeProperties = isDeepMode ? {
      competitorAnalysis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Competitor name' },
            strengths: { type: 'array', items: { type: 'string' }, description: '2-3 specific ad strategy strengths' },
            weaknesses: { type: 'array', items: { type: 'string' }, description: '2-3 specific weaknesses to exploit' }
          },
          required: ['name', 'strengths', 'weaknesses']
        },
        minItems: 2,
        maxItems: 3,
        description: '2-3 competitor ad strategy analyses'
      },
      riskMitigation: {
        type: 'array',
        items: { type: 'string' },
        minItems: 3,
        maxItems: 4,
        description: '3-4 backup plans in format: IF [metric] below [target], THEN [action]'
      },
      abTestSuggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            element: { type: 'string', description: 'Ad element to test' },
            variantA: { type: 'string', description: 'First variant' },
            variantB: { type: 'string', description: 'Second variant' },
            expectedImpact: { type: 'string', description: 'Expected CTR/conversion improvement' }
          },
          required: ['element', 'variantA', 'variantB', 'expectedImpact']
        },
        minItems: 2,
        maxItems: 3,
        description: '2-3 A/B test suggestions for ad creatives'
      },
      roiProjection: {
        type: 'object',
        properties: {
          investment: { type: 'string', description: 'Total ad spend for this phase' },
          expectedReturn: { type: 'string', description: 'Expected ROAS and conversions' },
          timeframe: { type: 'string', description: 'When to expect returns' },
          assumptions: { type: 'array', items: { type: 'string' }, description: '2-3 assumptions (CPC, conversion rate, etc.)' }
        },
        required: ['investment', 'expectedReturn', 'timeframe', 'assumptions'],
        description: 'ROAS projection with investment, return, timeframe and assumptions'
      },
      weeklyBreakdown: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 4,
        description: 'Weekly campaign management tasks'
      }
    } : {};

    const phaseProperties = { ...baseProperties, ...deepModeProperties };
    const requiredFields = isDeepMode 
      ? ['phase', 'title', 'timeframe', 'objectives', 'actions', 'competitorAnalysis', 'riskMitigation', 'abTestSuggestions', 'roiProjection', 'weeklyBreakdown']
      : ['phase', 'title', 'timeframe', 'objectives', 'actions'];

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
              description: 'Create a phased advertising strategy with specific, actionable steps',
              parameters: {
                type: 'object',
                properties: {
                  strategies: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: phaseProperties,
                      required: requiredFields
                    },
                    ...phaseMinMax
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
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service quota exceeded. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    if (!aiData.choices?.[0]?.message?.tool_calls?.[0]) {
      console.error('Unexpected AI response structure:', JSON.stringify(aiData));
      throw new Error('Invalid AI response');
    }

    const toolCall = aiData.choices[0].message.tool_calls[0];
    const result = JSON.parse(toolCall.function.arguments);

    console.log(`Parsed ${result.strategies?.length || 0} strategy phases (mode: ${isDeepMode ? 'deep' : 'standard'})`);

    // Save to history - map to existing columns
    const { error: historyError } = await supabase
      .from('ads_advisor_history')
      .insert({
        user_id: user.id,
        website_url: '',
        target_audience: prompt.substring(0, 200),
        advertising_budget: budget || 'Not specified',
        advertising_goals: prompt.substring(0, 500),
        industry: industry || 'Not specified',
        current_channels: channels || null,
        geographic_target: geographic || null,
        result: result,
        analysis_mode: analysisMode || 'standard'
      });

    if (historyError) {
      console.error('Error saving history:', historyError);
      // Don't throw - still return the result
    } else {
      console.log('History saved successfully');
    }

    // Update credits
    const now = new Date();
    
    if (isDeepMode) {
      const deepWindowStart = creditsData?.ads_deep_analysis_window_start;
      const deepCount = creditsData?.ads_deep_analysis_count ?? 0;
      
      let newDeepCount = deepCount + 1;
      let newDeepWindowStart = deepWindowStart;
      
      if (!deepWindowStart || new Date(deepWindowStart).getTime() + 24 * 60 * 60 * 1000 <= now.getTime()) {
        newDeepCount = 1;
        newDeepWindowStart = now.toISOString();
      }
      
      await supabase
        .from('user_credits')
        .update({
          ads_deep_analysis_count: newDeepCount,
          ads_deep_analysis_window_start: newDeepWindowStart,
          updated_at: now.toISOString()
        })
        .eq('user_id', user.id);
        
      console.log(`Deep analysis count updated: ${newDeepCount}/${deepLimit}`);
    } else {
      const standardWindowStart = creditsData?.ads_standard_analysis_window_start;
      const standardCount = creditsData?.ads_standard_analysis_count ?? 0;
      
      let newStandardCount = standardCount + 1;
      let newStandardWindowStart = standardWindowStart;
      
      if (!standardWindowStart || new Date(standardWindowStart).getTime() + 24 * 60 * 60 * 1000 <= now.getTime()) {
        newStandardCount = 1;
        newStandardWindowStart = now.toISOString();
      }
      
      await supabase
        .from('user_credits')
        .update({
          ads_standard_analysis_count: newStandardCount,
          ads_standard_analysis_window_start: newStandardWindowStart,
          updated_at: now.toISOString()
        })
        .eq('user_id', user.id);
        
      console.log(`Standard analysis count updated: ${newStandardCount}/${standardLimit}`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`Request completed in ${totalTime}ms`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Ads Advisor error:', error);
    
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
