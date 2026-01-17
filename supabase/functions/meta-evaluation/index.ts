import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModelRecommendation {
  title: string;
  description: string;
  confidence: number;
  riskLevel: number;
  creativityLevel: number;
  reasoning: string;
  actionItems: string[];
  potentialRisks: string[];
  timeframe: string;
}

interface ModelResponse {
  modelId: string;
  modelName: string;
  recommendations: ModelRecommendation[];
  summary: string;
  overallConfidence: number;
  error?: string;
}

interface ConsensusPoint {
  topic: string;
  description: string;
  agreementLevel: 'full' | 'majority';
  supportingModels: string[];
  confidence: number;
  actionItems: string[];
}

interface DissentPoint {
  topic: string;
  positions: {
    modelName: string;
    position: string;
    reasoning: string;
    riskLevel: number;
  }[];
}

interface FinalRecommendation {
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  actionItems: string[];
  sourceModels: string[];
}

// Meta-evaluation tool schema
const META_EVALUATION_TOOL = {
  type: "function",
  function: {
    name: "provide_meta_evaluation",
    description: "Analyze multiple AI model responses and provide a synthesized evaluation",
    parameters: {
      type: "object",
      properties: {
        consensusPoints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              topic: { type: "string", description: "The topic all models agree on" },
              description: { type: "string", description: "Description of the consensus" },
              confidence: { type: "number", description: "Confidence 0-100" },
              actionItems: { type: "array", items: { type: "string" } }
            },
            required: ["topic", "description", "confidence", "actionItems"]
          }
        },
        majorityPoints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              topic: { type: "string" },
              description: { type: "string" },
              supportingModels: { type: "array", items: { type: "string" } },
              confidence: { type: "number" }
            },
            required: ["topic", "description", "supportingModels", "confidence"]
          }
        },
        dissentPoints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              topic: { type: "string", description: "The topic of disagreement" },
              positions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    modelName: { type: "string" },
                    position: { type: "string" },
                    reasoning: { type: "string" }
                  },
                  required: ["modelName", "position", "reasoning"]
                }
              }
            },
            required: ["topic", "positions"]
          }
        },
        finalRecommendation: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            confidence: { type: "number" },
            reasoning: { type: "string" },
            topActions: { type: "array", items: { type: "string" }, description: "Top 5 prioritized actions" }
          },
          required: ["title", "description", "confidence", "reasoning", "topActions"]
        },
        overallConfidence: { type: "number", description: "Overall confidence in the meta-analysis 0-100" },
        synthesisReasoning: { type: "string", description: "Explanation of how the synthesis was created" }
      },
      required: ["consensusPoints", "majorityPoints", "dissentPoints", "finalRecommendation", "overallConfidence", "synthesisReasoning"]
    }
  }
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
      throw new Error('Unauthorized');
    }

    const { 
      gptResponse, 
      geminiProResponse, 
      geminiFlashResponse,
      userPreferences,
      prompt,
      saveToHistory = true
    } = await req.json();

    console.log(`Meta-evaluation started for user ${user.id}`);
    const startTime = Date.now();

    // Build context from all model responses
    const modelSummaries = [
      gptResponse?.error ? null : `GPT-5.2 (${gptResponse?.overallConfidence || 0}% confidence): ${gptResponse?.summary || 'No response'}`,
      geminiProResponse?.error ? null : `Gemini 3 Pro (${geminiProResponse?.overallConfidence || 0}% confidence): ${geminiProResponse?.summary || 'No response'}`,
      geminiFlashResponse?.error ? null : `Gemini Flash (${geminiFlashResponse?.overallConfidence || 0}% confidence): ${geminiFlashResponse?.summary || 'No response'}`
    ].filter(Boolean).join('\n\n');

    const allRecommendations = [
      ...(gptResponse?.recommendations || []).map((r: any) => ({ ...r, model: 'GPT-5.2' })),
      ...(geminiProResponse?.recommendations || []).map((r: any) => ({ ...r, model: 'Gemini 3 Pro' })),
      ...(geminiFlashResponse?.recommendations || []).map((r: any) => ({ ...r, model: 'Gemini Flash' }))
    ];

    const riskPref = userPreferences?.riskPreference || 3;
    const creativityPref = userPreferences?.creativityPreference || 3;

    const systemPrompt = `You are a meta-analyst synthesizing recommendations from multiple AI models.

User preferences:
- Risk tolerance: ${riskPref <= 2 ? 'Conservative (prefer safe options)' : riskPref >= 4 ? 'Aggressive (open to bold moves)' : 'Balanced'}
- Creativity preference: ${creativityPref <= 2 ? 'Factual/Data-driven' : creativityPref >= 4 ? 'Creative/Innovative' : 'Balanced mix'}

Your task:
1. Identify CONSENSUS: Where do all 3 models agree? (green - high confidence)
2. Identify MAJORITY: Where do 2/3 models agree? (yellow - medium confidence)
3. Identify DISSENT: Where do models disagree? Present each position fairly (red - requires user decision)
4. Create FINAL RECOMMENDATION: Weight based on user's risk/creativity preferences

Model weight guide:
- For conservative users: Weight Gemini Flash (pragmatic) higher
- For aggressive users: Weight creative suggestions higher
- For factual preference: Weight GPT-5.2 (accurate) higher
- For creative preference: Weight Gemini 3 Pro higher`;

    const userPrompt = `Here are the recommendations from 3 AI models:

${modelSummaries}

DETAILED RECOMMENDATIONS:
${JSON.stringify(allRecommendations, null, 2)}

Please analyze these and provide a meta-evaluation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview", // Fast model for meta-analysis
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [META_EVALUATION_TOOL],
        tool_choice: { type: "function", function: { name: "provide_meta_evaluation" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Meta-evaluation API error:', response.status, errorText);
      throw new Error(`Meta-evaluation failed: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from meta-evaluation");
    }

    const evaluation = JSON.parse(toolCall.function.arguments);
    const processingTime = Date.now() - startTime;

    console.log(`Meta-evaluation completed in ${processingTime}ms`);

    // Save to history if requested
    let validationId: string | null = null;
    if (saveToHistory && prompt) {
      try {
        const { data: insertedData, error: insertError } = await supabase
          .from('validation_analyses')
          .insert({
            user_id: user.id,
            prompt: prompt,
            risk_preference: riskPref,
            creativity_preference: creativityPref,
            gpt_response: gptResponse,
            gemini_pro_response: geminiProResponse,
            gemini_flash_response: geminiFlashResponse,
            consensus_points: evaluation.consensusPoints,
            majority_points: evaluation.majorityPoints,
            dissent_points: evaluation.dissentPoints,
            final_recommendation: evaluation.finalRecommendation,
            overall_confidence: evaluation.overallConfidence,
            processing_time_ms: processingTime
          })
          .select('id')
          .single();
        
        if (insertError) throw insertError;
        validationId = insertedData?.id || null;
        console.log('Validation analysis saved to history, id:', validationId);
      } catch (saveError) {
        console.error('Failed to save to history:', saveError);
        // Don't fail the request if saving fails
      }
    }

    return new Response(
      JSON.stringify({
        ...evaluation,
        processingTimeMs: processingTime,
        validationId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Meta-evaluation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Meta-evaluation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
