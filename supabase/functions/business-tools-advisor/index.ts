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

interface MarketResearchResult {
  insights: string;
  citations: string[];
}

// Input validation schema
const inputSchema = z.object({
  prompt: z.string().trim().min(1, "Please describe your business goals").max(2000, "Description too long"),
  budget: z.string().optional(),
  industry: z.string().optional(),
  channels: z.string().optional(),
  timeline: z.string().optional(),
  geographic: z.string().optional(),
  analysisMode: z.enum(["standard", "deep"]).optional()
});

// Perplexity market research function
async function performMarketResearch(
  industry: string,
  businessContext: string,
  isDeepMode: boolean
): Promise<MarketResearchResult> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  
  if (!PERPLEXITY_API_KEY) {
    console.log('Perplexity API key not configured, skipping market research');
    return { insights: '', citations: [] };
  }

  console.log(`Starting Perplexity market research (mode: ${isDeepMode ? 'deep' : 'standard'})`);
  const startTime = Date.now();

  try {
    const model = isDeepMode ? 'sonar-pro' : 'sonar';
    
    // Prepare research queries based on mode
    const queries = isDeepMode 
      ? [
          `${industry} market trends and growth opportunities 2024-2025`,
          `${industry} competitor landscape and market leaders analysis`,
          `${industry} best practices and successful business strategies`
        ]
      : [
          `${industry} business trends best practices growth strategies 2025`
        ];

    // Execute queries (parallel for deep mode, single for standard)
    const researchPromises = queries.map(async (query) => {
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
              content: 'You are a market research analyst. Provide concise, factual market insights. Focus on actionable data: market size, trends, key players, growth rates. Keep responses under 400 words.' 
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
        citations: data.citations || []
      };
    });

    const results = await Promise.all(researchPromises);
    const validResults = results.filter(r => r !== null);

    if (validResults.length === 0) {
      console.log('No valid Perplexity results');
      return { insights: '', citations: [] };
    }

    // Combine insights
    const allInsights = validResults.map(r => r!.content).join('\n\n');
    const allCitations = [...new Set(validResults.flatMap(r => r!.citations))];

    const duration = Date.now() - startTime;
    console.log(`Perplexity research completed in ${duration}ms with ${allCitations.length} sources`);

    return {
      insights: allInsights,
      citations: allCitations.slice(0, isDeepMode ? 10 : 5) // Limit citations
    };
  } catch (error) {
    console.error('Perplexity research error:', error);
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

    const { prompt, budget, industry, channels, timeline, geographic, analysisMode } = validatedInput;
    
    console.log('Analysis mode:', { isPremium, analysisMode: analysisMode || 'standard', isDeepMode });

    // Step 1: Perform Perplexity market research
    const industryContext = industry || 'general business';
    const marketResearch = await performMarketResearch(industryContext, prompt, isDeepMode);
    const hasMarketResearch = marketResearch.insights.length > 0;

    console.log(`Market research: ${hasMarketResearch ? 'available' : 'skipped'} (${marketResearch.citations.length} sources)`);

    // Step 2: Call Lovable AI with enhanced context
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const phaseCount = "EXACTLY 4";

    const systemPrompt = `You are a strategic business planner. Create a phased business strategy based on the user's input.

CRITICAL OUTPUT RULES - NO BUZZWORDS ALLOWED:
- NEVER use vague terms like: "leverage", "optimize", "synergize", "strategic initiatives", "streamline", "enhance", "holistic", "cutting-edge", "innovative", "drive engagement", "build presence"
- NEVER use generic phrases like: "increase brand awareness", "drive engagement", "build presence", "maximize potential"

ALWAYS include:
- SPECIFIC numbers (e.g., "500 visitors", "20 EUR/day budget", "3 hours setup time", "expect 15-25% conversion rate")
- EXACT tool/platform names (e.g., "Google Analytics 4", "HubSpot CRM Free", "Mailchimp", "Notion")
- Concrete timeframes (e.g., "complete in 2 hours", "takes 30 minutes daily")
- Expected outcomes with metrics (e.g., "expect 1000-2000 impressions", "should generate 5-10 leads/week")

OUTPUT REQUIREMENTS:
- Return ${phaseCount} strategy phases as a structured timeline
- Each phase should build upon the previous one
- Focus on actionable, practical business strategies with SPECIFIC details
- Consider the user's context (budget, industry, timeline if provided)
${hasMarketResearch ? '- INTEGRATE the real-time market intelligence data into your recommendations' : ''}

PHASE STRUCTURE:
Each phase must include:
1. phase: Phase number (1, 2, 3, etc.)
2. title: Clear, action-oriented title
3. timeframe: Duration (e.g., "Week 1-2", "Month 1")
4. objectives: 2-4 MEASURABLE objectives with SPECIFIC KPIs and numbers
5. actions: 3-5 SPECIFIC, DETAILED action items. Each action MUST be an object with:
   - text: Detailed action with EXACT tool name, time estimate, and expected outcome
   - searchTerm: Google search term for learning more
6. budget: Budget allocation for this phase (if budget context provided)
7. channels: Tools, platforms, or resources needed
8. milestones: Key success indicators with SPECIFIC metrics

${isDeepMode ? `DEEP MODE PREMIUM ANALYSIS - MANDATORY ADDITIONAL FIELDS:

You MUST provide these additional fields for EACH phase:

9. competitorAnalysis: Array with 1 competitor. Include:
   - name: Actual competitor company/tool name
   - strengths: 2 specific strengths
   - weaknesses: 2 specific weaknesses or gaps you can exploit
   
10. riskMitigation: Array of 2 backup plans. Format: "IF [metric] is below [target], THEN [specific action]"

11. roiProjection: ROI calculation object with:
    - investment: Total investment for this phase
    - expectedReturn: Expected return
    - timeframe: When to expect returns
    - assumptions: 2 assumptions behind the calculation

DEEP MODE REQUIREMENTS:
- 4 focused phases with detailed analysis
- Include competitor analysis, risk mitigation, and ROI for each phase` : `STANDARD MODE:
- Focus on quick wins and immediate impact
- Keep recommendations practical and achievable
- Prioritize the most impactful actions with lowest effort
- 4 focused phases`}

CRITICAL:
- Output must be in English
- No markdown formatting in the output
- Be EXTREMELY specific and actionable
- Every action must include a searchTerm

Use the create_strategy function to return your response.`;

    // Build user prompt with market research context
    let userPromptText = `User's business goals and context:\n\n${prompt}`;
    
    if (budget) userPromptText += `\n\nBudget: ${budget}`;
    if (industry) userPromptText += `\nIndustry: ${industry}`;
    if (channels) userPromptText += `\nPreferred Tools/Channels: ${channels}`;
    if (timeline) userPromptText += `\nTimeline: ${timeline}`;
    if (geographic) userPromptText += `\nGeographic Focus: ${geographic}`;

    // Add market research context if available
    if (hasMarketResearch) {
      userPromptText += `\n\n=== REAL-TIME MARKET INTELLIGENCE (${new Date().toLocaleDateString()}) ===\n${marketResearch.insights}\n\nSources: ${marketResearch.citations.join(', ')}\n===\n\nIMPORTANT: Use this market intelligence to make your recommendations more relevant and data-driven.`;
    }

    const model = isDeepMode ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-flash';
    const maxTokens = isDeepMode ? 12000 : 8000;
    const timeout = isDeepMode ? 90000 : 40000; // Increased timeout for Perplexity

    console.log(`Calling AI (model: ${model}, mode: ${isDeepMode ? 'deep' : 'standard'})...`);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    let result: { strategies: StrategyPhase[]; marketInsights?: string; sources?: string[] };

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
      "objectives": ["Objective 1", "Objective 2"],
      "actions": [{"text": "Action description", "searchTerm": "google search term"}],
      "budget": "Budget for phase",
      "channels": ["Tool 1", "Tool 2"],
      "milestones": ["Milestone 1"],
      "competitorAnalysis": [{"name": "Competitor Name", "strengths": ["Strength 1"], "weaknesses": ["Weakness 1"]}],
      "riskMitigation": ["If X happens, then Y"],
      "roiProjection": {"investment": "Amount", "expectedReturn": "Return", "timeframe": "Timeframe", "assumptions": ["Assumption 1"]}
    }
  ]
}

Return EXACTLY 4 phases. Each phase MUST have competitorAnalysis, riskMitigation, and roiProjection.`;

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
              text: { type: 'string' },
              searchTerm: { type: 'string' }
            },
            required: ['text', 'searchTerm']
          },
          description: 'Specific actions with search terms'
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

    // Add market insights to result
    if (hasMarketResearch) {
      result.marketInsights = marketResearch.insights;
      result.sources = marketResearch.citations;
    }

    console.log(`Parsed ${result.strategies.length} strategy phases (mode: ${isDeepMode ? 'deep' : 'standard'})`);

    // Save to history
    const { error: historyError } = await supabase
      .from('business_tools_history')
      .insert({
        user_id: user.id,
        business_goals: prompt.substring(0, 500),
        budget_range: budget || 'Not specified',
        industry: industry || 'Not specified',
        team_size: 'Not specified',
        result: result,
        analysis_mode: analysisMode || 'standard'
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (allHistory && allHistory.length > HISTORY_LIMIT) {
        const idsToDelete = allHistory.slice(HISTORY_LIMIT).map(h => h.id);
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
        .eq('user_id', user.id);
        
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
