import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model configurations
const MODELS = {
  gpt: {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    characteristics: {
      reasoning: 'good',
      tendency: 'balanced',
      strengths: ['Speed', 'Efficiency', 'Reliability']
    }
  },
  gptFallback: {
    id: 'openai/gpt-5-nano',
    name: 'GPT-5 Nano',
    characteristics: {
      reasoning: 'good',
      tendency: 'balanced',
      strengths: ['Ultra-fast', 'High reliability', 'Efficient']
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

// Structured output schema for tool calling - base schema
const getRecommendationTool = (isPremium: boolean) => ({
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
              description: { type: "string", description: isPremium ? "Detailed explanation (4-5 sentences with comprehensive reasoning)" : "Detailed explanation (2-3 sentences)" },
              confidence: { type: "number", description: "Confidence level 0-100" },
              riskLevel: { type: "number", description: "Risk level 1-5 (1=conservative, 5=aggressive)" },
              creativityLevel: { type: "number", description: "Creativity level 1-5 (1=factual, 5=innovative)" },
              reasoning: { type: "string", description: isPremium ? "Comprehensive reasoning with market context and competitive considerations" : "Why this recommendation makes sense" },
              actionItems: {
                type: "array",
                items: { type: "string" },
                description: isPremium ? "5-7 concrete, detailed next steps with specific metrics where applicable" : "3-5 concrete next steps"
              },
              potentialRisks: {
                type: "array",
                items: { type: "string" },
                description: isPremium ? "3-5 potential risks with mitigation strategies" : "2-3 potential risks to consider"
              },
              timeframe: { type: "string", description: "Expected implementation timeframe" },
              ...(isPremium && {
                competitiveAdvantage: { type: "string", description: "How this creates competitive advantage in the market" },
                longTermImplications: { type: "string", description: "Long-term strategic implications (12+ months)" },
                resourceRequirements: { type: "string", description: "Key resources needed (budget, team, tools)" }
              })
            },
            required: ["title", "description", "confidence", "riskLevel", "creativityLevel", "reasoning", "actionItems", "potentialRisks", "timeframe"]
          }
        },
        summary: { type: "string", description: isPremium ? "Comprehensive summary of recommendations with strategic context (4-5 sentences)" : "Overall summary of recommendations (2-3 sentences)" },
        overallConfidence: { type: "number", description: "Overall confidence in these recommendations 0-100" },
        ...(isPremium && {
          marketContext: { type: "string", description: "Brief market context and competitive landscape relevant to these recommendations" },
          strategicOutlook: { type: "string", description: "12-month strategic outlook based on these recommendations" }
        })
      },
      required: ["recommendations", "summary", "overallConfidence"]
    }
  }
});

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
    competitiveAdvantage?: string;
    longTermImplications?: string;
    resourceRequirements?: string;
  }[];
  summary: string;
  overallConfidence: number;
  processingTimeMs: number;
  marketContext?: string;
  strategicOutlook?: string;
  error?: string;
  isFallback?: boolean;
}

// Query a single AI model with timeout
async function queryModel(
  modelConfig: typeof MODELS.gpt,
  prompt: string,
  apiKey: string,
  isPremium: boolean,
  timeoutMs: number = 45000
): Promise<ModelResponse> {
  const startTime = Date.now();
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  console.log(`[${modelConfig.name}] Starting query with ${timeoutMs}ms timeout...`);
  
  try {
    // Different system prompts for Free vs Premium
    const recommendationCount = isPremium ? "4-5" : "2-3";
    const detailLevel = isPremium 
      ? "Provide comprehensive, detailed analysis with market context, competitive considerations, and long-term strategic implications."
      : "Provide clear, actionable analysis.";
    
    const systemPrompt = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

Analyze the user's business question and provide ${recommendationCount} concrete, actionable recommendations.
${detailLevel}
Each recommendation should be practical and implementable.
Be specific with numbers, timeframes, and concrete steps.
Consider both opportunities and risks.${isPremium ? `

PREMIUM ANALYSIS REQUIREMENTS:
- Include competitive advantage analysis for each recommendation
- Provide long-term implications (12+ month outlook)
- Add resource requirements (budget estimates, team needs, tools)
- Include market context in your summary
- Provide a 12-month strategic outlook` : ''}`;

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
        tools: [getRecommendationTool(isPremium)],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${modelConfig.name}] Error ${response.status}:`, errorText);
      
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
      console.error(`[${modelConfig.name}] No tool call in response:`, JSON.stringify(data).slice(0, 500));
      throw new Error("No structured response from model");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const processingTime = Date.now() - startTime;
    
    console.log(`[${modelConfig.name}] Completed in ${processingTime}ms with ${parsed.recommendations?.length || 0} recommendations`);
    
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      recommendations: parsed.recommendations || [],
      summary: parsed.summary || "",
      overallConfidence: parsed.overallConfidence || 50,
      processingTimeMs: processingTime,
      ...(isPremium && {
        marketContext: parsed.marketContext,
        strategicOutlook: parsed.strategicOutlook
      })
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    const processingTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.error(`[${modelConfig.name}] Timed out after ${processingTime}ms`);
      return {
        modelId: modelConfig.id,
        modelName: modelConfig.name,
        recommendations: [],
        summary: "",
        overallConfidence: 0,
        processingTimeMs: processingTime,
        error: "Request timed out"
      };
    }
    
    console.error(`[${modelConfig.name}] Failed after ${processingTime}ms:`, error.message);
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      recommendations: [],
      summary: "",
      overallConfidence: 0,
      processingTimeMs: processingTime,
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
    
    console.log(`User ${user.id} is ${isPremium ? 'PREMIUM' : 'FREE'} - using ${isPremium ? 'enhanced' : 'standard'} analysis`);
    
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
      // Streaming response with proper headers to prevent buffering
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let gptResponse: ModelResponse | null = null;
            let geminiProResponse: ModelResponse | null = null;
            let geminiFlashResponse: ModelResponse | null = null;

            // Send initial status
            sendSSE(controller, 'status', { message: 'Starting AI models...', phase: 'starting' });

            console.log('Starting parallel model queries with immediate SSE updates...');

            // Query models in parallel but send SSE immediately when each completes
            const gptPromise = (async () => {
              sendSSE(controller, 'model_started', { model: 'gpt', name: 'GPT-5 Mini' });
              // GPT-5 Mini is faster, 45s timeout should be sufficient
              let response = await queryModel(MODELS.gpt, enhancedPrompt, lovableApiKey, isPremium, 45000);
              
              // If GPT times out, try fallback to GPT-5-nano
              if (response.error === "Request timed out") {
                console.log('[GPT] Primary timed out, trying GPT-5-nano fallback...');
                sendSSE(controller, 'model_retry', { model: 'gpt', message: 'Switching to faster model...' });
                response = await queryModel(MODELS.gptFallback, enhancedPrompt, lovableApiKey, isPremium, 30000);
                response.isFallback = true;
                if (!response.error) {
                  response.modelName = 'GPT-5 Nano (Fallback)';
                }
              }
              
              gptResponse = response;
              console.log(`[GPT] Sending model_complete SSE (error: ${response.error || 'none'})`);
              sendSSE(controller, 'model_complete', { model: 'gpt', response });
              return response;
            })();

            const geminiProPromise = (async () => {
              sendSSE(controller, 'model_started', { model: 'geminiPro', name: 'Gemini 3 Pro' });
              const response = await queryModel(MODELS.geminiPro, enhancedPrompt, lovableApiKey, isPremium, 60000);
              geminiProResponse = response;
              console.log(`[Gemini Pro] Sending model_complete SSE (error: ${response.error || 'none'})`);
              sendSSE(controller, 'model_complete', { model: 'geminiPro', response });
              return response;
            })();

            const geminiFlashPromise = (async () => {
              sendSSE(controller, 'model_started', { model: 'geminiFlash', name: 'Gemini 2.5 Flash' });
              const response = await queryModel(MODELS.geminiFlash, enhancedPrompt, lovableApiKey, isPremium, 45000);
              geminiFlashResponse = response;
              console.log(`[Gemini Flash] Sending model_complete SSE (error: ${response.error || 'none'})`);
              sendSSE(controller, 'model_complete', { model: 'geminiFlash', response });
              return response;
            })();

            // Wait for all to complete (they each send their own SSE when done)
            const results = await Promise.allSettled([gptPromise, geminiProPromise, geminiFlashPromise]);

            const totalProcessingTime = Date.now() - totalStartTime;

            // Extract responses from settled promises
            const finalGptResponse = results[0].status === 'fulfilled' ? results[0].value : gptResponse;
            const finalGeminiProResponse = results[1].status === 'fulfilled' ? results[1].value : geminiProResponse;
            const finalGeminiFlashResponse = results[2].status === 'fulfilled' ? results[2].value : geminiFlashResponse;

            console.log(`All queries completed in ${totalProcessingTime}ms. GPT: ${finalGptResponse?.error ? 'ERROR' : 'OK'}, GeminiPro: ${finalGeminiProResponse?.error ? 'ERROR' : 'OK'}, GeminiFlash: ${finalGeminiFlashResponse?.error ? 'ERROR' : 'OK'}`);

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

            // Send final combined response with isPremium flag
            sendSSE(controller, 'complete', {
              gptResponse: finalGptResponse || { modelId: MODELS.gpt.id, modelName: MODELS.gpt.name, recommendations: [], summary: "", overallConfidence: 0, processingTimeMs: 0, error: "No response" },
              geminiProResponse: finalGeminiProResponse || { modelId: MODELS.geminiPro.id, modelName: MODELS.geminiPro.name, recommendations: [], summary: "", overallConfidence: 0, processingTimeMs: 0, error: "No response" },
              geminiFlashResponse: finalGeminiFlashResponse || { modelId: MODELS.geminiFlash.id, modelName: MODELS.geminiFlash.name, recommendations: [], summary: "", overallConfidence: 0, processingTimeMs: 0, error: "No response" },
              processingTimeMs: totalProcessingTime,
              userPreferences: { riskPreference, creativityPreference },
              isPremium
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
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no'
        }
      });

    } else {
      // Non-streaming response
      const [gptResponse, geminiProResponse, geminiFlashResponse] = await Promise.all([
        queryModel(MODELS.gpt, enhancedPrompt, lovableApiKey, isPremium, 70000),
        queryModel(MODELS.geminiPro, enhancedPrompt, lovableApiKey, isPremium, 60000),
        queryModel(MODELS.geminiFlash, enhancedPrompt, lovableApiKey, isPremium, 45000)
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
          userPreferences: { riskPreference, creativityPreference },
          isPremium
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
