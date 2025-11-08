import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ToolRecommendation {
  name: string;
  category: "productivity" | "marketing" | "sales" | "finance" | "hr" | "operations" | "strategy";
  implementation: "quick-win" | "medium-term" | "strategic";
  estimatedCost: string;
  rationale: string;
}

// Input validation schema
const inputSchema = z.object({
  websiteType: z.string().trim().min(1, "Website type is required").max(100, "Website type must be less than 100 characters"),
  websiteStatus: z.string().trim().min(1, "Website status is required").max(50, "Website status must be less than 50 characters"),
  budgetRange: z.string().trim().min(1, "Budget range is required").max(50, "Budget range must be less than 50 characters"),
  websiteGoals: z.string().trim().min(1, "Website goals are required").max(1000, "Website goals must be less than 1000 characters"),
  imageUrls: z.array(z.string().url()).max(2).optional()
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

    const { websiteType, websiteStatus, budgetRange, websiteGoals, imageUrls = [] } = validatedInput;

    console.log('Input validated successfully');

    // Step 3: Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a website tools advisor. Analyze the user's website details and provide personalized tool and strategy recommendations specifically for websites.

Focus EXCLUSIVELY on tools and services relevant for websites:
- Website builders and CMS (e.g., WordPress, Webflow, Framer)
- Analytics and tracking tools (e.g., Google Analytics, Plausible)
- SEO tools (e.g., Ahrefs, SEMrush, Yoast)
- Performance optimization (e.g., Cloudflare, CDN services)
- Conversion optimization (e.g., Hotjar, OptinMonster)
- E-commerce platforms (e.g., Shopify, WooCommerce)
- Design and UX tools
- Marketing automation for websites

${imageUrls.length > 0 ? 'IMPORTANT: Analyze the provided website screenshots to better understand the current design, UX, and functionality. Base your recommendations on visual aspects you observe in the screenshots, such as layout issues, missing elements, design quality, mobile responsiveness indicators, or opportunities for improvement.' : ''}

Use the suggest_tools function to return your recommendations.`;

    const userPrompt = `Website Type: ${websiteType}
Website Status: ${websiteStatus}
Monthly Budget: ${budgetRange}
Website Goals: ${websiteGoals}
${imageUrls.length > 0 ? `\n\nI have provided ${imageUrls.length} screenshot(s) of the website. Please analyze the visual design, user interface, layout, and any visible functionality to inform your tool recommendations. Look for areas that could be improved with specific tools.` : ''}

Please provide personalized website tool recommendations based on this information.`;

    console.log('Calling Lovable AI for website tools...');

    const userMessageContent: any = imageUrls.length > 0
      ? [
          { type: "text", text: userPrompt },
          ...imageUrls.map(url => ({
            type: "image_url",
            image_url: { url }
          }))
        ]
      : userPrompt;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageUrls.length > 0 ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessageContent }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_tools",
              description: "Return 5-7 website tool recommendations",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Tool or service name" },
                        category: { 
                          type: "string",
                          enum: ["analytics", "seo", "performance", "design", "marketing", "ecommerce", "cms", "conversion"]
                        },
                        implementation: {
                          type: "string",
                          enum: ["quick-win", "medium-term", "strategic"]
                        },
                        estimatedCost: { type: "string", description: "Cost range like $0-$50/month" },
                        rationale: { type: "string", description: "Why this tool fits the website" }
                      },
                      required: ["name", "category", "implementation", "estimatedCost", "rationale"],
                      additionalProperties: false
                    }
                  },
                  generalAdvice: {
                    type: "string",
                    description: "Strategic advice based on website type and goals"
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
        industry: websiteType,
        team_size: websiteStatus,
        budget_range: budgetRange,
        business_goals: websiteGoals,
        result: parsedResult,
        screenshot_urls: imageUrls
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
