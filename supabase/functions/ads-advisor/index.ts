import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StrategyPhase {
  phase: number;
  title: string;
  timeframe: string;
  objectives: string[];
  actions: string[];
  budget?: string;
  channels?: string[];
  milestones?: string[];
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
        console.log('⚠️ Premium subscription expired, denying premium access');
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
          console.log(`⛔ Deep analysis limit reached: ${currentDeepCount}/${deepLimit}`);
          
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
      console.log(`✅ Deep analysis allowed. Current count: ${currentDeepCount}/${deepLimit}`);
    } else {
      const currentStandardCount = creditsData?.ads_standard_analysis_count ?? 0;
      const standardWindowStart = creditsData?.ads_standard_analysis_window_start;
      
      if (standardWindowStart) {
        const windowEndsAt = new Date(new Date(standardWindowStart).getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < windowEndsAt && currentStandardCount >= standardLimit) {
          console.log(`⛔ Standard analysis limit reached: ${currentStandardCount}/${standardLimit}`);
          
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
      console.log(`✅ Standard analysis allowed. Current count: ${currentStandardCount}/${standardLimit}`);
    }

    // Validate input
    const validatedInput = inputSchema.parse(requestBody);
    const { prompt, budget, industry, channels, timeline, geographic, analysisMode } = validatedInput;
    
    console.log('📊 Analysis mode:', {
      isPremium,
      analysisMode: analysisMode || 'standard',
      isDeepMode
    });

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const phaseCount = "EXACTLY 4";
    
    const systemPrompt = `You are a strategic advertising planner. Create a phased advertising strategy based on the user's input.

OUTPUT REQUIREMENTS:
- Return ${phaseCount} strategy phases as a structured timeline
- Each phase should build upon the previous one
- Focus on actionable, practical advertising strategies
- Consider the user's context (budget, industry, timeline if provided)

PHASE STRUCTURE:
Each phase must include:
1. phase: Phase number (1, 2, 3, etc.)
2. title: Clear, action-oriented title (e.g., "Foundation & Brand Awareness", "Scaling & Optimization")
3. timeframe: Duration (e.g., "Week 1-2", "Month 1", "Weeks 3-4")
4. objectives: 2-4 clear, measurable objectives for this phase
5. actions: 3-5 specific, actionable steps to implement
6. budget: Budget allocation for this phase (if budget context provided)
7. channels: Recommended advertising channels for this phase
8. milestones: Key success indicators to achieve before moving to next phase

${isDeepMode ? `DEEP MODE - Enhanced Analysis:
- Provide more detailed actions with implementation specifics
- Include competitive positioning strategies
- Add risk mitigation suggestions in objectives
- Include A/B testing recommendations in actions
- Provide ROI projections where applicable` : `STANDARD MODE:
- Focus on quick wins and immediate impact
- Keep recommendations practical and achievable
- Prioritize the most impactful channels`}

CRITICAL:
- Output must be in English
- No markdown formatting in the output
- Focus on advertising platforms: Google Ads, Meta Ads (Facebook/Instagram), LinkedIn Ads, TikTok Ads, YouTube Ads, Display/Programmatic
- Be specific and actionable, not generic

Use the create_strategy function to return your response.`;

    let userPromptText = `User's advertising goals and context:\n\n${prompt}`;
    
    if (budget) userPromptText += `\n\nBudget: ${budget}`;
    if (industry) userPromptText += `\nIndustry: ${industry}`;
    if (channels) userPromptText += `\nPreferred Channels: ${channels}`;
    if (timeline) userPromptText += `\nTimeline: ${timeline}`;
    if (geographic) userPromptText += `\nGeographic Target: ${geographic}`;

    console.log('🤖 Calling AI (model: google/gemini-2.5-flash, mode: ' + (isDeepMode ? 'deep' : 'standard') + ')...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPromptText }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'create_strategy',
            description: 'Create a phased advertising strategy',
            parameters: {
              type: 'object',
              properties: {
                strategies: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      phase: { type: 'number', description: 'Phase number (1, 2, 3, etc.)' },
                      title: { type: 'string', description: 'Clear phase title' },
                      timeframe: { type: 'string', description: 'Duration like "Week 1-2" or "Month 1"' },
                      objectives: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: '2-4 clear objectives'
                      },
                      actions: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: '3-5 specific actions'
                      },
                      budget: { type: 'string', description: 'Budget allocation for this phase' },
                      channels: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Recommended channels'
                      },
                      milestones: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Key success indicators'
                      }
                    },
                    required: ['phase', 'title', 'timeframe', 'objectives', 'actions']
                  },
                  minItems: isDeepMode ? 4 : 2,
                  maxItems: isDeepMode ? 6 : 3
                }
              },
              required: ['strategies']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'create_strategy' } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI service error');
    }

    const aiData = await aiResponse.json();
    console.log('✅ AI response received');

    if (!aiData.choices?.[0]?.message?.tool_calls?.[0]) {
      console.error('Unexpected AI response structure:', JSON.stringify(aiData));
      throw new Error('Invalid AI response');
    }

    const toolCall = aiData.choices[0].message.tool_calls[0];
    const result = JSON.parse(toolCall.function.arguments);

    console.log(`Parsed ${result.strategies?.length || 0} strategy phases`);

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
        
      console.log(`✅ Deep analysis count updated: ${newDeepCount}/${deepLimit}`);
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
        
      console.log(`✅ Standard analysis count updated: ${newStandardCount}/${standardLimit}`);
    }

    console.log(`✅ Request completed in ${Date.now() - startTime}ms`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in ads-advisor:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: error.errors.map(e => e.message).join(', ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
