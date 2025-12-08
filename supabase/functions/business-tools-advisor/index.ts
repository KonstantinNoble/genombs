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
  // Deep mode exclusive fields
  competitorAnalysis?: CompetitorInfo[];
  riskMitigation?: string[];
  roiProjection?: ROIProjection;
}

// Input validation schema - simplified for free text input
const inputSchema = z.object({
  prompt: z.string().trim().min(1, "Please describe your business goals").max(2000, "Description too long"),
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
    console.log('Business Planner request received');

    // Parse request early to get analysis mode
    const requestBody = await req.json();
    const isDeepMode = requestBody.analysisMode === "deep";

    // Get user's premium status and mode-specific counts
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('is_premium, subscription_end_date, deep_analysis_count, deep_analysis_window_start, standard_analysis_count, standard_analysis_window_start')
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

    // Check limit for the selected mode
    if (isDeepMode) {
      const currentDeepCount = creditsData?.deep_analysis_count ?? 0;
      const deepWindowStart = creditsData?.deep_analysis_window_start;
      
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
      const currentStandardCount = creditsData?.standard_analysis_count ?? 0;
      const standardWindowStart = creditsData?.standard_analysis_window_start;
      
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
              error: isPremium 
                ? `Standard analysis limit reached (${currentStandardCount}/${standardLimit}). Try again in ${timeMessage}.`
                : `Free limit reached (${currentStandardCount}/${standardLimit}). Please wait 24 hours or upgrade to Premium.`
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      console.log(`Standard analysis allowed. Current count: ${currentStandardCount}/${standardLimit}`);
    }

    // Validate input
    let validatedInput;
    try {
      validatedInput = inputSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid input', 
            details: error.errors.map(e => e.message).join(', ')
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

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

    // Different phase counts for standard vs deep mode - constraint in prompt only, not schema
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

PHASE STRUCTURE:
Each phase must include:
1. phase: Phase number (1, 2, 3, etc.)
2. title: Clear, action-oriented title (e.g., "Foundation & Infrastructure", "Growth & Expansion")
3. timeframe: Duration (e.g., "Week 1-2", "Month 1", "Weeks 3-4")
4. objectives: 2-4 MEASURABLE objectives with SPECIFIC KPIs and numbers
   Example objectives:
   - "Achieve 2,000 monthly website visitors from organic search within 6 weeks"
   - "Generate 50 qualified leads per month through landing page optimization"
   - "Reduce customer acquisition cost from 50 EUR to 30 EUR per customer"
   NEVER write objectives like "Increase visibility" or "Improve engagement"
5. actions: 3-5 SPECIFIC, DETAILED action items. Each action MUST be an object with:
   - text: Detailed action with EXACT tool name, time estimate, and expected outcome
   - searchTerm: Google search term for learning more about this action
   
   FORMAT FOR ACTION TEXT (MANDATORY):
   "[ACTION VERB] [EXACT TOOL/PLATFORM NAME] - [TIME ESTIMATE] - [EXPECTED OUTCOME]"
   
   Example actions:
   - text: "Install Google Analytics 4 and set up conversion tracking for contact form submissions - 1 hour setup - enables ROI measurement for all channels"
     searchTerm: "Google Analytics 4 conversion tracking setup guide"
   - text: "Create HubSpot CRM Free account and import existing customer contacts - 2 hours initial setup - centralizes all customer data in one place"
     searchTerm: "HubSpot CRM Free setup tutorial"
   - text: "Set up Mailchimp email automation with 3-email welcome sequence - 4 hours to create - expect 25-40% open rates"
     searchTerm: "Mailchimp welcome email automation tutorial"

6. budget: Budget allocation for this phase (if budget context provided)
7. channels: Tools, platforms, or resources needed for this phase
8. milestones: Key success indicators with SPECIFIC metrics to achieve before moving to next phase

${isDeepMode ? `DEEP MODE PREMIUM ANALYSIS - MANDATORY ADDITIONAL FIELDS:

You MUST provide these additional fields for EACH phase:

9. competitorAnalysis: Array with 1 competitor. Include:
   - name: Actual competitor company/tool name (e.g., "Competitor: Salesforce")
   - strengths: 2 specific strengths
   - weaknesses: 2 specific weaknesses or gaps you can exploit
   
10. riskMitigation: Array of 2 backup plans. Format: "IF [metric] is below [target], THEN [specific action]"

11. roiProjection: ROI calculation object with:
    - investment: Total investment for this phase
    - expectedReturn: Expected return
    - timeframe: When to expect returns
    - assumptions: 2 assumptions behind the calculation

DEEP MODE REQUIREMENTS:
- 4 focused phases (same as standard but with more detail)
- Keep objectives to 2-3 per phase
- Keep actions to 3-4 per phase
- Keep milestones to 2-3 per phase
- Include competitor analysis, risk mitigation, and ROI for each phase` : `STANDARD MODE:
- Focus on quick wins and immediate impact
- Keep recommendations practical and achievable for small teams
- Prioritize the most impactful actions with lowest effort
- 4 focused phases`}

FOCUS AREAS for business strategies:
- Technology & Tools (CRM, Analytics, Automation) - always name SPECIFIC tools
- Marketing & Growth (SEO, Content, Social Media) - include SPECIFIC tactics
- Operations & Efficiency (Processes, Workflows) - include TIME savings
- Customer Experience (Support, Engagement) - include METRICS
- Revenue & Monetization (Pricing, Sales) - include NUMBERS

CRITICAL:
- Output must be in English
- No markdown formatting in the output
- Be EXTREMELY specific and actionable - no generic advice
- Every action must include a searchTerm for users to learn more

Use the create_strategy function to return your response.`;

    let userPromptText = `User's business goals and context:\n\n${prompt}`;
    
    if (budget) userPromptText += `\n\nBudget: ${budget}`;
    if (industry) userPromptText += `\nIndustry: ${industry}`;
    if (channels) userPromptText += `\nPreferred Tools/Channels: ${channels}`;
    if (timeline) userPromptText += `\nTimeline: ${timeline}`;
    if (geographic) userPromptText += `\nGeographic Focus: ${geographic}`;

    // Use different models for standard vs deep mode
    const model = isDeepMode ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-flash';
    const maxTokens = isDeepMode ? 12000 : 8000;
    const timeout = isDeepMode ? 60000 : 25000;

    console.log(`Calling AI (model: ${model}, mode: ${isDeepMode ? 'deep' : 'standard'})...`);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    let result: { strategies: StrategyPhase[] };

    if (isDeepMode) {
      // DEEP MODE: Use regular chat completion WITHOUT tool calling to avoid schema complexity limits
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

Return EXACTLY 4 phases. Each phase MUST have competitorAnalysis (1 competitor), riskMitigation (2 items), and roiProjection.`;

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
            // NO tools or tool_choice for deep mode!
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
      console.log('AI response received (deep mode - no tool calling)');

      // Parse the content as JSON directly
      const content = aiData.choices?.[0]?.message?.content;
      if (!content) {
        console.error('No content in AI response');
        throw new Error('Empty AI response');
      }

      // Clean up the response - remove markdown code fences if present
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
        console.error('Invalid structure in parsed JSON');
        throw new Error('Invalid response format from AI');
      }

    } else {
      // STANDARD MODE: Use tool calling with simplified schema
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
      console.log('AI response received (standard mode - tool calling)');

      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.function?.name !== 'create_strategy') {
        console.error('No valid tool call in response');
        throw new Error('Invalid AI response format');
      }

      result = JSON.parse(toolCall.function.arguments);
      
      if (!result.strategies || !Array.isArray(result.strategies)) {
        console.error('Invalid structure');
        throw new Error('Invalid response format from AI');
      }
    }

    console.log(`Parsed ${result.strategies.length} strategy phases (mode: ${isDeepMode ? 'deep' : 'standard'})`);

    // Save to history - map to existing columns
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
      // Don't throw - still return the result
    } else {
      console.log('History saved successfully');
      
      // Auto-cleanup: Keep only the 10 most recent history entries per user
      const HISTORY_LIMIT = 10;
      
      const { data: allHistory } = await supabase
        .from('business_tools_history')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (allHistory && allHistory.length > HISTORY_LIMIT) {
        const idsToDelete = allHistory.slice(HISTORY_LIMIT).map(h => h.id);
        
        const { error: deleteError } = await supabase
          .from('business_tools_history')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) {
          console.error('Error cleaning up old history:', deleteError);
        } else {
          console.log(`Cleaned up ${idsToDelete.length} old history entries for user ${user.id}`);
        }
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
