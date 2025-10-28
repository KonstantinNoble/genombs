import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    console.log('Processing business tools request for user:', user.id);

    // Check daily analysis limit
    const { data: limitData, error: limitError } = await supabase.rpc(
      'check_and_update_analysis_limit',
      { p_user_id: user.id }
    );

    if (limitError) {
      console.error('Error checking analysis limit:', limitError);
      throw new Error('Failed to check analysis limit');
    }

    if (!limitData) {
      return new Response(
        JSON.stringify({ 
          error: 'Daily limit reached. You can request new recommendations once every 24 hours.' 
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { industry, teamSize, budgetRange, businessGoals } = await req.json();

    if (!industry || !teamSize || !budgetRange || !businessGoals) {
      throw new Error('Missing required fields');
    }

    console.log('Request parameters:', { industry, teamSize, budgetRange, businessGoals });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert business consultant and technology advisor specializing in helping businesses optimize their operations and achieve their goals through strategic tool selection and process improvements.

Your role is to:
1. Carefully analyze the SPECIFIC business context provided by the user (industry, team size, budget, and goals)
2. Recommend 5-7 HIGHLY TAILORED, specific tools or strategies that DIRECTLY address their unique situation
3. Provide clear rationale explaining HOW each recommendation specifically solves their stated goals
4. Consider cost-effectiveness, ease of implementation, and ROI based on THEIR budget
5. Focus on practical solutions that can be implemented relatively quickly

CRITICAL GUIDELINES - READ THE USER INPUT CAREFULLY:
- ALWAYS reference the user's specific industry, goals, and context in your recommendations
- Recommend SPECIFIC tools (e.g., "Notion for project management" not just "project management tool")
- TAILOR recommendations to their exact budget - don't recommend expensive enterprise solutions for small budgets
- If they mention specific pain points or goals, DIRECTLY address those in your recommendations
- Balance quick wins with long-term strategic improvements based on what THEY asked for
- Include a mix of software tools, processes, and strategic recommendations that fit THEIR unique situation
- Be realistic about implementation complexity considering THEIR team size
- Focus on proven tools and methodologies that align with THEIR industry

PERSONALIZATION RULES:
- Quote or reference the user's specific goals in your rationale
- If they mention team challenges, address those specifically
- If they mention growth targets, align recommendations to those targets
- Adapt your language and examples to their industry context
- Make each recommendation feel uniquely crafted for them, not generic advice

IMPORTANT DISCLAIMER:
- These are general recommendations based on common business needs
- Each business is unique and should evaluate tools based on their specific requirements
- Recommendations do not constitute professional consulting advice
- Always do your own research and due diligence before implementing any tool or strategy`;

    const userPrompt = `Please analyze this specific business carefully and provide HIGHLY CUSTOMIZED tool/strategy recommendations that directly address their unique situation:

Industry: ${industry}
Team Size: ${teamSize}
Budget Range: ${budgetRange}
Primary Business Goals: ${businessGoals}

IMPORTANT: Read the goals and context carefully. Your recommendations must be specifically tailored to:
- Their exact industry and business model
- Their team size and budget constraints
- Their specific goals and challenges mentioned above

Provide 5-7 specific, actionable recommendations that DIRECTLY help THIS business achieve THEIR stated goals within THEIR constraints. Reference their specific situation in your rationale.`;

    const requestBody = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "recommend_business_tools",
            description: "Provide business tool and strategy recommendations",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Name of the tool or strategy"
                      },
                      category: {
                        type: "string",
                        enum: ["productivity", "marketing", "sales", "finance", "hr", "operations", "strategy"],
                        description: "Category of the recommendation"
                      },
                      implementation: {
                        type: "string",
                        enum: ["quick-win", "medium-term", "strategic"],
                        description: "Implementation timeline"
                      },
                      estimatedCost: {
                        type: "string",
                        description: "Estimated cost range (e.g., 'Free', '$10-50/month', '$100+/month')"
                      },
                      rationale: {
                        type: "string",
                        description: "Why this recommendation is valuable for this business"
                      }
                    },
                    required: ["name", "category", "implementation", "estimatedCost", "rationale"],
                    additionalProperties: false
                  }
                },
                generalAdvice: {
                  type: "string",
                  description: "Overall strategic advice for this business (2-3 sentences)"
                }
              },
              required: ["recommendations", "generalAdvice"],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "recommend_business_tools" } }
    };

    console.log('Calling Lovable AI with request body');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`AI API failed with status ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Parsed recommendations:', result);

    // Save to history
    const { error: insertError } = await supabase
      .from('business_tools_history')
      .insert({
        user_id: user.id,
        industry,
        team_size: teamSize,
        budget_range: budgetRange,
        business_goals: businessGoals,
        result
      });

    if (insertError) {
      console.error('Error saving to history:', insertError);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in business-tools-advisor function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});