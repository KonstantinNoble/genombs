import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ToolRecommendation {
  name: string;
  category: "performance" | "seo" | "conversion" | "analytics" | "accessibility" | "hosting" | "design";
  implementation: "quick-win" | "medium-term" | "strategic";
  estimatedCost: string;
  rationale: string;
}

// Input validation schema
const inputSchema = z.object({
  websiteType: z.string().trim().min(1, "Website type is required").max(100, "Website type must be less than 100 characters"),
  websiteSize: z.string().trim().min(1, "Website size is required").max(50, "Website size must be less than 50 characters"),
  budgetRange: z.string().trim().min(1, "Budget range is required").max(50, "Budget range must be less than 50 characters"),
  websiteGoals: z.string().trim().min(1, "Website goals are required").max(1500, "Website goals must be less than 1500 characters")
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

    console.log('Business tools request received');

    // Step 1: Check credits BEFORE AI call (read-only)
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('analysis_count, analysis_window_start')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error reading credits:', creditsError);
      throw new Error('Failed to check credits');
    }

    const now = new Date();
    let currentCount = creditsData?.analysis_count ?? 0;
    let windowStart = creditsData?.analysis_window_start ? new Date(creditsData.analysis_window_start) : null;

    // Credit check performed

    // Check if window expired
    if (windowStart && (now.getTime() - windowStart.getTime()) > 24 * 60 * 60 * 1000) {
      console.log('Window expired, resetting (in-memory check)');
      currentCount = 0;
      windowStart = null;
    }

    // Block if limit reached
    if (currentCount >= 2) {
      console.log(`Limit reached: ${currentCount}/2 in current window`);
      return new Response(
        JSON.stringify({ error: 'Daily limit reached. Please wait 24 hours before requesting new recommendations.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Limit check passed, proceeding with AI call');

    // Step 2: Parse and validate input
    const requestBody = await req.json();
    
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

    const { websiteType, websiteSize, budgetRange, websiteGoals } = validatedInput;

    console.log('Input validated successfully');

    // Step 3: Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a website optimization advisor. Analyze the user's website context and provide personalized tool and optimization recommendations.

CRITICAL REQUIREMENTS:
- Provide 7-10 detailed recommendations
- Each recommendation's rationale must be at least 150 words
- Include specific implementation details
- Focus on website performance, SEO, conversion, analytics, accessibility, hosting, and design
- Provide actionable steps and expected outcomes

Use the suggest_tools function to return your recommendations.`;

    const userPrompt = `Website Type: ${websiteType}
Website Size: ${websiteSize}
Budget Range: ${budgetRange}
Website Goals: ${websiteGoals}

Please provide personalized website tool and optimization recommendations based on this information. Remember to provide 7-10 recommendations with detailed explanations (minimum 150 words each).`;

    console.log('Calling Lovable AI for business tools...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_tools",
              description: "Return 7-10 website tool and optimization recommendations with detailed explanations",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Website tool or optimization strategy name" },
                        category: {
                          type: "string",
                          enum: ["performance", "seo", "conversion", "analytics", "accessibility", "hosting", "design"]
                        },
                        implementation: {
                          type: "string",
                          enum: ["quick-win", "medium-term", "strategic"]
                        },
                        estimatedCost: { type: "string", description: "Cost range like $0-$50/month" },
                        rationale: { type: "string", description: "Detailed explanation (minimum 150 words) covering why this tool fits their website, implementation steps, expected outcomes, and specific benefits" }
                      },
                      required: ["name", "category", "implementation", "estimatedCost", "rationale"],
                      additionalProperties: false
                    }
                  },
                  generalAdvice: {
                    type: "string",
                    description: "Comprehensive strategic roadmap (200+ words) for website optimization including prioritization, timeline, and key milestones. Break into clear sections with actionable steps."
                  }
                },
                required: ["recommendations", "generalAdvice"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_tools" } }
      }),
    });

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

    // Step 4: Parse tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== 'suggest_tools') {
      console.error('No valid tool call in response');
      throw new Error('Invalid AI response format');
    }

    const parsedResult = JSON.parse(toolCall.function.arguments);
    
    if (!parsedResult.recommendations || !Array.isArray(parsedResult.recommendations)) {
      console.error('Invalid structure - no recommendations array');
      throw new Error('Invalid response format from AI');
    }

    console.log(`Parsed ${parsedResult.recommendations.length} recommendations`);

    // Step 5: Insert into history
    const { error: historyError } = await supabase
      .from('business_tools_history')
      .insert({
        user_id: user.id,
        website_type: websiteType,
        website_size: websiteSize,
        budget_range: budgetRange,
        website_goals: websiteGoals,
        result: parsedResult
      });

    if (historyError) {
      console.error('Error saving history:', historyError);
      throw new Error('Failed to save recommendations');
    }

    console.log('History saved successfully');

    // Step 6: Update credits AFTER successful insert
    const newWindowStart = windowStart ?? now;
    const newCount = currentCount + 1;

    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: user.id,
        analysis_count: newCount,
        analysis_window_start: newWindowStart.toISOString(),
        last_analysis_at: now.toISOString(),
        updated_at: now.toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Error updating credits:', updateError);
      // Non-fatal - we already saved the result
    } else {
      console.log('Credits updated successfully');
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in business-tools-advisor:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
