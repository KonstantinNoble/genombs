import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IdeaRecommendation {
  name: string;
  category: string;
  viability: string;
  estimatedInvestment: string;
  rationale: string;
  // Deep mode fields
  detailedSteps?: string[];
  expectedROI?: string;
  riskLevel?: string;
  prerequisites?: string[];
  metrics?: string[];
  implementationTimeline?: string;
}

// Input validation schema
const inputSchema = z.object({
  websiteType: z.string().trim().min(1).max(100),
  websiteStatus: z.string().trim().min(1).max(50),
  budgetRange: z.string().trim().min(1).max(50),
  businessContext: z.string().trim().min(1).max(1000),
  // Premium-only fields
  targetAudience: z.string().optional(),
  competitionLevel: z.string().optional(),
  growthStage: z.string().optional(),
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
    console.log('Business ideas request received');

    // Parse request early to get analysis mode
    const requestBody = await req.json();
    const isDeepMode = requestBody.analysisMode === "deep";

    // Get user's premium status and mode-specific counts
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('is_premium, deep_analysis_count, deep_analysis_window_start, standard_analysis_count, standard_analysis_window_start')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error reading credits:', creditsError);
      throw new Error('Failed to check credits');
    }

    const isPremium = creditsData?.is_premium ?? false;
    
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
          console.log(`⛔ Deep analysis limit reached: ${currentDeepCount}/${deepLimit}`);
          console.log(`⏰ Window ends at: ${windowEndsAt.toISOString()}`);
          
          return new Response(
            JSON.stringify({ 
              error: `Deep analysis limit reached (${currentDeepCount}/${deepLimit}). Next available at ${windowEndsAt.toISOString()}.`
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      console.log(`✅ Deep analysis allowed. Current count: ${currentDeepCount}/${deepLimit}`);
    } else {
      const currentStandardCount = creditsData?.standard_analysis_count ?? 0;
      const standardWindowStart = creditsData?.standard_analysis_window_start;
      
      if (standardWindowStart) {
        const windowEndsAt = new Date(new Date(standardWindowStart).getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < windowEndsAt && currentStandardCount >= standardLimit) {
          console.log(`⛔ Standard analysis limit reached: ${currentStandardCount}/${standardLimit}`);
          console.log(`⏰ Window ends at: ${windowEndsAt.toISOString()}`);
          
          return new Response(
            JSON.stringify({ 
              error: isPremium 
                ? `Standard analysis limit reached (${currentStandardCount}/${standardLimit}). Try deep analysis or wait until ${windowEndsAt.toISOString()}.`
                : `Free limit reached (${currentStandardCount}/${standardLimit}). Please wait 24 hours.`
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      console.log(`✅ Standard analysis allowed. Current count: ${currentStandardCount}/${standardLimit}`);
    }

    console.log('Limit check passed');

    // Validate input (already parsed above)
    let validatedInput;
    try {
      validatedInput = inputSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid input', 
            details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    const { websiteType, websiteStatus, budgetRange, businessContext, targetAudience, competitionLevel, growthStage, analysisMode } = validatedInput;
    
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

    const systemPrompt = isDeepMode
      ? `You are an ADVANCED business improvement advisor. Use the suggest_ideas function to provide detailed recommendations.
${targetAudience ? `Target audience: ${targetAudience}` : ''}
${competitionLevel ? `Competition level: ${competitionLevel}` : ''}
${growthStage ? `Growth stage: ${growthStage}` : ''}

Provide 8-10 DETAILED, actionable improvement ideas with:
- detailedSteps: Array of concrete implementation steps
- expectedROI: ROI projection with specific timeframes
- riskLevel: "low" | "medium" | "high"
- prerequisites: What must be in place first
- metrics: How to measure success
- implementationTimeline: Time estimate

In generalAdvice, include:
- Prioritization matrix (Quick Wins first)
- Industry-specific insights
- Competitive analysis
- 3-6 month roadmap

Focus on revenue growth, efficiency, customer experience, market expansion, cost reduction, and digital transformation.`
      : `You are a business improvement advisor. Use the suggest_ideas function to analyze the EXISTING business and provide 5-7 concise, actionable improvement recommendations.

Focus on revenue growth, efficiency, customer experience, market expansion, cost reduction, and digital transformation.`;

    const userPrompt = `Website Type: ${websiteType}
Website Status: ${websiteStatus}
Budget Range: ${budgetRange}
Current Business Context: ${businessContext}

Please provide personalized improvement recommendations to grow and optimize this EXISTING business.`;

    // Define tool schema for structured output
    const toolSchema = {
      type: "object" as const,
      properties: {
        recommendations: {
          type: "array" as const,
          items: {
            type: "object" as const,
            properties: {
              name: { type: "string" as const },
              category: { type: "string" as const },
              viability: { type: "string" as const },
              estimatedInvestment: { type: "string" as const },
              rationale: { type: "string" as const },
              ...(isDeepMode ? {
                detailedSteps: { 
                  type: "array" as const, 
                  items: { type: "string" as const } 
                },
                expectedROI: { type: "string" as const },
                riskLevel: { 
                  type: "string" as const, 
                  enum: ["low", "medium", "high"] 
                },
                prerequisites: { 
                  type: "array" as const, 
                  items: { type: "string" as const } 
                },
                metrics: { 
                  type: "array" as const, 
                  items: { type: "string" as const } 
                },
                implementationTimeline: { type: "string" as const }
              } : {})
            },
            required: isDeepMode 
              ? ["name", "category", "viability", "estimatedInvestment", "rationale", "detailedSteps", "expectedROI", "riskLevel", "prerequisites", "metrics", "implementationTimeline"]
              : ["name", "category", "viability", "estimatedInvestment", "rationale"],
            additionalProperties: false
          }
        },
        generalAdvice: { type: "string" as const }
      },
      required: ["recommendations", "generalAdvice"],
      additionalProperties: false
    };

    console.log('🤖 Calling AI (model: google/gemini-2.5-flash, mode: ' + (isDeepMode ? 'deep' : 'standard') + ')...');

    const timeout = isDeepMode ? 30000 : 20000;
    
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    let aiResponse: Response;
    try {
      const aiStartTime = Date.now();
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_ideas",
                description: isDeepMode 
                  ? "Return 8-10 detailed business improvement ideas with comprehensive analysis"
                  : "Return 5-7 concise business improvement recommendations",
                parameters: toolSchema
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "suggest_ideas" } }
        }),
        signal: abortController.signal,
      });
      
      clearTimeout(timeoutId);
      console.log(`⏱️ AI call completed in ${Date.now() - aiStartTime}ms`);
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
    console.log(`✅ AI response received (total time: ${Date.now() - startTime}ms)`);

    // Parse Tool Call response
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== 'suggest_ideas') {
      console.error('No valid tool call in response');
      throw new Error('Invalid response format from AI');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error('Failed to parse tool call arguments:', e);
      throw new Error('Invalid response format from AI');
    }

    // Validate structure
    if (!parsedResult.recommendations || !Array.isArray(parsedResult.recommendations)) {
      console.error('Invalid structure in tool call response');
      throw new Error('Invalid response format from AI');
    }

    console.log(`Parsed ${parsedResult.recommendations.length} recommendations`);

    // Insert into history with analysis_mode
    const { error: historyError } = await supabase
      .from('business_ideas_history')
      .insert({
        user_id: user.id,
        industry: websiteType,
        team_size: websiteStatus,
        budget_range: budgetRange,
        business_context: businessContext,
        result: parsedResult,
        analysis_mode: analysisMode || 'standard'
      });

    if (historyError) {
      console.error('Error saving history:', historyError);
      throw new Error('Failed to save recommendations');
    }

    console.log('History saved successfully');

    // Increment the correct counter
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
      
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          deep_analysis_count: newDeepCount,
          deep_analysis_window_start: newDeepWindowStart,
          updated_at: now.toISOString()
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('Error updating deep analysis credits:', updateError);
      } else {
        console.log(`✅ Deep analysis count updated: ${newDeepCount}/${deepLimit}`);
      }
    } else {
      const standardWindowStart = creditsData?.standard_analysis_window_start;
      const standardCount = creditsData?.standard_analysis_count ?? 0;
      
      let newStandardCount = standardCount + 1;
      let newStandardWindowStart = standardWindowStart;
      
      if (!standardWindowStart || new Date(standardWindowStart).getTime() + 24 * 60 * 60 * 1000 <= now.getTime()) {
        newStandardCount = 1;
        newStandardWindowStart = now.toISOString();
      }
      
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          standard_analysis_count: newStandardCount,
          standard_analysis_window_start: newStandardWindowStart,
          updated_at: now.toISOString()
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('Error updating standard analysis credits:', updateError);
      } else {
        console.log(`✅ Standard analysis count updated: ${newStandardCount}/${standardLimit}`);
      }
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in business-ideas-advisor:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
