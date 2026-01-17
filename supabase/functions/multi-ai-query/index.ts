import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model configurations
const MODELS = {
  gpt: {
    id: 'openai/gpt-5.2',
    name: 'GPT-5.2',
    characteristics: {
      reasoning: 'excellent',
      tendency: 'balanced',
      strengths: ['Complex reasoning', 'Nuanced analysis', 'Accuracy']
    }
  },
  geminiPro: {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    characteristics: {
      reasoning: 'strong',
      tendency: 'creative',
      strengths: ['Big context', 'Multimodal', 'Comprehensive']
    }
  },
  geminiFlash: {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    characteristics: {
      reasoning: 'good',
      tendency: 'pragmatic',
      strengths: ['Speed', 'Efficiency', 'Practical solutions']
    }
  }
};

// Structured output schema for tool calling
const RECOMMENDATION_TOOL = {
  type: "function",
  function: {
    name: "provide_recommendations",
    description: "Provide structured business recommendations based on the query",
    parameters: {
      type: "object",
      properties: {
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Short, actionable recommendation title" },
              description: { type: "string", description: "Detailed explanation (2-3 sentences)" },
              confidence: { type: "number", description: "Confidence level 0-100" },
              riskLevel: { type: "number", description: "Risk level 1-5 (1=conservative, 5=aggressive)" },
              creativityLevel: { type: "number", description: "Creativity level 1-5 (1=factual, 5=innovative)" },
              reasoning: { type: "string", description: "Why this recommendation makes sense" },
              actionItems: {
                type: "array",
                items: { type: "string" },
                description: "3-5 concrete next steps"
              },
              potentialRisks: {
                type: "array",
                items: { type: "string" },
                description: "2-3 potential risks to consider"
              },
              timeframe: { type: "string", description: "Expected implementation timeframe" }
            },
            required: ["title", "description", "confidence", "riskLevel", "creativityLevel", "reasoning", "actionItems", "potentialRisks", "timeframe"]
          }
        },
        summary: { type: "string", description: "Overall summary of recommendations (2-3 sentences)" },
        overallConfidence: { type: "number", description: "Overall confidence in these recommendations 0-100" }
      },
      required: ["recommendations", "summary", "overallConfidence"]
    }
  }
};

interface ModelResponse {
  modelId: string;
  modelName: string;
  recommendations: {
    title: string;
    description: string;
    confidence: number;
    riskLevel: number;
    creativityLevel: number;
    reasoning: string;
    actionItems: string[];
    potentialRisks: string[];
    timeframe: string;
  }[];
  summary: string;
  overallConfidence: number;
  processingTimeMs: number;
  error?: string;
}

// Query a single AI model
async function queryModel(
  modelConfig: typeof MODELS.gpt,
  prompt: string,
  apiKey: string
): Promise<ModelResponse> {
  const startTime = Date.now();
  
  try {
    const systemPrompt = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

Analyze the user's business question and provide 2-4 concrete, actionable recommendations.
Each recommendation should be practical and implementable.
Be specific with numbers, timeframes, and concrete steps.
Consider both opportunities and risks.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelConfig.id,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        tools: [RECOMMENDATION_TOOL],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${modelConfig.name} error:`, response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded");
      }
      if (response.status === 402) {
        throw new Error("Payment required");
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from model");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      recommendations: parsed.recommendations || [],
      summary: parsed.summary || "",
      overallConfidence: parsed.overallConfidence || 50,
      processingTimeMs: Date.now() - startTime
    };

  } catch (error: any) {
    console.error(`${modelConfig.name} query failed:`, error);
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      recommendations: [],
      summary: "",
      overallConfidence: 0,
      processingTimeMs: Date.now() - startTime,
      error: error.message
    };
  }
}

// Helper function to send SSE
function sendSSE(controller: ReadableStreamDefaultController, event: string, data: any) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const { prompt, riskPreference = 3, creativityPreference = 3, streaming = true } = await req.json();

    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ error: "Please provide a business question" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Multi-AI query started for user ${user.id}`);
    const totalStartTime = Date.now();

    // Check user limits
    const { data: creditsData } = await supabase
      .from('user_credits')
      .select('is_premium, validation_count, validation_window_start')
      .eq('user_id', user.id)
      .maybeSingle();

    const isPremium = creditsData?.is_premium ?? false;
    const validationLimit = isPremium ? 20 : 2; // Free: 2/day, Premium: 20/day
    
    // Check if within 24h window
    const now = new Date();
    const windowStart = creditsData?.validation_window_start ? new Date(creditsData.validation_window_start) : null;
    const windowExpired = !windowStart || now.getTime() - windowStart.getTime() > 24 * 60 * 60 * 1000;
    const currentCount = windowExpired ? 0 : (creditsData?.validation_count ?? 0);

    if (currentCount >= validationLimit) {
      const windowEndsAt = new Date(windowStart!.getTime() + 24 * 60 * 60 * 1000);
      return new Response(
        JSON.stringify({ 
          error: "LIMIT_REACHED",
          isPremium,
          currentCount,
          limit: validationLimit,
          resetAt: windowEndsAt.toISOString()
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the enhanced prompt with user context
    const enhancedPrompt = `${prompt}

Context for your analysis:
- User prefers ${riskPreference <= 2 ? 'conservative' : riskPreference >= 4 ? 'aggressive/bold' : 'balanced'} recommendations
- User values ${creativityPreference <= 2 ? 'data-driven, factual' : creativityPreference >= 4 ? 'creative, innovative' : 'a mix of practical and creative'} approaches`;

    if (streaming) {
      // Streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Query all 3 models in parallel
            sendSSE(controller, 'status', { message: 'Querying GPT-5.2...', model: 'gpt' });
            sendSSE(controller, 'status', { message: 'Querying Gemini 3 Pro...', model: 'geminiPro' });
            sendSSE(controller, 'status', { message: 'Querying Gemini Flash...', model: 'geminiFlash' });

            const [gptResponse, geminiProResponse, geminiFlashResponse] = await Promise.all([
              queryModel(MODELS.gpt, enhancedPrompt, lovableApiKey),
              queryModel(MODELS.geminiPro, enhancedPrompt, lovableApiKey),
              queryModel(MODELS.geminiFlash, enhancedPrompt, lovableApiKey)
            ]);

            // Send individual model responses as they complete
            sendSSE(controller, 'model_complete', { model: 'gpt', response: gptResponse });
            sendSSE(controller, 'model_complete', { model: 'geminiPro', response: geminiProResponse });
            sendSSE(controller, 'model_complete', { model: 'geminiFlash', response: geminiFlashResponse });

            const totalProcessingTime = Date.now() - totalStartTime;

            // Update user credits
            const updateData: any = {
              validation_count: windowExpired ? 1 : currentCount + 1,
            };
            if (windowExpired) {
              updateData.validation_window_start = now.toISOString();
            }
            
            await supabase
              .from('user_credits')
              .update(updateData)
              .eq('user_id', user.id);

            // Send final combined response
            sendSSE(controller, 'complete', {
              gptResponse,
              geminiProResponse,
              geminiFlashResponse,
              processingTimeMs: totalProcessingTime,
              userPreferences: { riskPreference, creativityPreference }
            });

            controller.close();
          } catch (error: any) {
            console.error('Streaming error:', error);
            sendSSE(controller, 'error', { error: error.message });
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
      });

    } else {
      // Non-streaming response
      const [gptResponse, geminiProResponse, geminiFlashResponse] = await Promise.all([
        queryModel(MODELS.gpt, enhancedPrompt, lovableApiKey),
        queryModel(MODELS.geminiPro, enhancedPrompt, lovableApiKey),
        queryModel(MODELS.geminiFlash, enhancedPrompt, lovableApiKey)
      ]);

      const totalProcessingTime = Date.now() - totalStartTime;

      // Update user credits
      const updateData: any = {
        validation_count: windowExpired ? 1 : currentCount + 1,
      };
      if (windowExpired) {
        updateData.validation_window_start = now.toISOString();
      }
      
      await supabase
        .from('user_credits')
        .update(updateData)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({
          gptResponse,
          geminiProResponse,
          geminiFlashResponse,
          processingTimeMs: totalProcessingTime,
          userPreferences: { riskPreference, creativityPreference }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Multi-AI query error:', error);
    
    if (error.message === 'Rate limit exceeded') {
      return new Response(
        JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (error.message === 'Payment required') {
      return new Response(
        JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
