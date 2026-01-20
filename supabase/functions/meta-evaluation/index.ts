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
  competitiveAdvantage?: string;
  longTermImplications?: string;
  resourceRequirements?: string;
}

interface ModelResponse {
  modelId: string;
  modelName: string;
  recommendations: ModelRecommendation[];
  summary: string;
  overallConfidence: number;
  marketContext?: string;
  strategicOutlook?: string;
  error?: string;
  citations?: string[];
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

// Meta-evaluation tool schema - dynamic based on premium
const getMetaEvaluationTool = (isPremium: boolean) => ({
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
            topActions: { 
              type: "array", 
              items: { type: "string" }, 
              description: isPremium ? "Top 7 prioritized actions with specific metrics and deadlines" : "Top 5 prioritized actions" 
            }
          },
          required: ["title", "description", "confidence", "reasoning", "topActions"]
        },
        overallConfidence: { type: "number", description: "Overall confidence in the meta-analysis 0-100" },
        synthesisReasoning: { type: "string", description: "Explanation of how the synthesis was created" },
        ...(isPremium && {
          strategicAlternatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenario: { type: "string", description: "Alternative strategic path" },
                pros: { type: "array", items: { type: "string" } },
                cons: { type: "array", items: { type: "string" } },
                bestFor: { type: "string", description: "When this alternative is best suited" }
              },
              required: ["scenario", "pros", "cons", "bestFor"]
            },
            description: "2-3 alternative strategic paths if main recommendations don't fit"
          },
          longTermOutlook: {
            type: "object",
            properties: {
              sixMonths: { type: "string", description: "Expected position in 6 months" },
              twelveMonths: { type: "string", description: "Expected position in 12 months" },
              keyMilestones: { type: "array", items: { type: "string" } }
            },
            required: ["sixMonths", "twelveMonths", "keyMilestones"],
            description: "Long-term outlook if recommendations are followed"
          },
          competitorInsights: {
            type: "string",
            description: "Key competitive considerations synthesized from all models"
          }
        })
      },
      required: ["consensusPoints", "majorityPoints", "dissentPoints", "finalRecommendation", "overallConfidence", "synthesisReasoning"]
    }
  }
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
      modelResponses,
      selectedModels,
      modelWeights,
      userPreferences,
      prompt,
      saveToHistory = true,
      isPremium = false
    } = await req.json();

    console.log(`Meta-evaluation started for user ${user.id} (Premium: ${isPremium})`);
    console.log(`Selected models: ${selectedModels?.join(', ')}, Weights: ${JSON.stringify(modelWeights)}`);
    const startTime = Date.now();

    // Build context from all model responses with weights
    const modelSummaries: string[] = [];
    const allRecommendations: any[] = [];
    let allCitations: string[] = [];

    for (const modelKey of (selectedModels || Object.keys(modelResponses))) {
      const response = modelResponses[modelKey];
      if (!response || response.error) continue;
      
      const weight = modelWeights?.[modelKey] || 33;
      
      modelSummaries.push(
        `${response.modelName} (Weight: ${weight}%, Confidence: ${response.overallConfidence || 0}%): ${response.summary || 'No response'}${isPremium && response.marketContext ? `\nMarket Context: ${response.marketContext}` : ''}`
      );
      
      // Add recommendations with model name and weight
      (response.recommendations || []).forEach((r: any) => {
        allRecommendations.push({ ...r, model: response.modelName, weight });
      });
      
      // Collect citations from Perplexity
      if (response.citations && response.citations.length > 0) {
        allCitations = [...allCitations, ...response.citations];
      }
    }

    const riskPref = userPreferences?.riskPreference || 3;

    // Build weighted context explanation
    const weightedContext = selectedModels?.map((key: string) => {
      const weight = modelWeights?.[key] || 33;
      const modelName = modelResponses[key]?.modelName || key;
      return `${modelName}: ${weight}%`;
    }).join(', ') || 'Equal weights';

    const premiumInstructions = isPremium ? `
PREMIUM ANALYSIS REQUIREMENTS:
5. Provide STRATEGIC ALTERNATIVES: 2-3 alternative paths if main recommendations don't fit
6. Include LONG-TERM OUTLOOK: 6-month and 12-month projections with key milestones
7. Synthesize COMPETITOR INSIGHTS from all model recommendations
8. Provide 7 top actions (instead of 5) with specific metrics and deadlines` : '';

    const systemPrompt = `You are a meta-analyst synthesizing recommendations from multiple AI models.

MODEL WEIGHTS (user-configured):
${weightedContext}

When synthesizing, give proportionally more influence to higher-weighted models.
A model with 60% weight should have roughly double the influence of a model with 30% weight.

User preferences:
- Risk tolerance: ${riskPref <= 2 ? 'Conservative (prefer safe options)' : riskPref >= 4 ? 'Aggressive (open to bold moves)' : 'Balanced'}

Your task:
1. Identify CONSENSUS: Where do all 3 models agree? (green - high confidence)
2. Identify MAJORITY: Where do 2/3 models agree? (yellow - medium confidence)
3. Identify DISSENT: Where do models disagree? Present each position fairly (red - requires user decision)
4. Create FINAL RECOMMENDATION: Weight based on user-configured model weights AND risk preferences${premiumInstructions}

Weight interpretation guide:
- Models with higher weights (50%+) should strongly influence the final recommendation
- Models with medium weights (25-50%) contribute significant input
- Models with lower weights (<25%) provide supporting perspective`;

    const userPrompt = `Here are the recommendations from the selected AI models:

${modelSummaries.join('\n\n')}

DETAILED RECOMMENDATIONS:
${JSON.stringify(allRecommendations, null, 2)}

${allCitations.length > 0 ? `\nWEB SOURCES (from Perplexity research):\n${allCitations.slice(0, 10).map((c, i) => `${i + 1}. ${c}`).join('\n')}` : ''}

Please analyze these and provide a ${isPremium ? 'comprehensive premium-tier' : 'standard'} meta-evaluation, respecting the configured model weights.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [getMetaEvaluationTool(isPremium)],
        tool_choice: { type: "function", function: { name: "provide_meta_evaluation" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Meta-evaluation API error:', response.status, errorText);
      throw new Error(`Meta-evaluation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Meta-evaluation API response structure:', JSON.stringify({
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      hasToolCalls: !!data.choices?.[0]?.message?.tool_calls,
      toolCallsLength: data.choices?.[0]?.message?.tool_calls?.length,
      finishReason: data.choices?.[0]?.finish_reason,
      messageContent: data.choices?.[0]?.message?.content?.substring?.(0, 200)
    }));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      // Log more detail about what we received
      console.error('No tool call in response. Full message:', JSON.stringify(data.choices?.[0]?.message));
      
      // Try to extract from content if tool call failed
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        console.log('Attempting to parse from content instead');
        try {
          // Sometimes the model returns JSON in content instead of tool call
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const evaluation = JSON.parse(jsonMatch[0]);
            if (evaluation.consensusPoints || evaluation.finalRecommendation) {
              console.log('Successfully parsed evaluation from content');
              const processingTime = Date.now() - startTime;
              return new Response(
                JSON.stringify({
                  ...evaluation,
                  processingTimeMs: processingTime,
                  isPremium,
                  selectedModels,
                  modelWeights
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        } catch (parseError) {
          console.error('Failed to parse content as JSON:', parseError);
        }
      }
      
      throw new Error("No structured response from meta-evaluation");
    }

    const evaluation = JSON.parse(toolCall.function.arguments);
    const processingTime = Date.now() - startTime;

    console.log(`Meta-evaluation completed in ${processingTime}ms (Premium features: ${isPremium})`);

    // Save to history if requested
    let validationId: string | null = null;
    if (saveToHistory && prompt) {
      try {
        const modelKeys = selectedModels || Object.keys(modelResponses);
        
        // Use new dynamic columns for all model responses
        const { data: insertedData, error: insertError } = await supabase
          .from('validation_analyses')
          .insert({
            user_id: user.id,
            prompt: prompt,
            risk_preference: riskPref,
            creativity_preference: 3, // No longer used, default value
            // New dynamic storage - stores all model responses regardless of count
            model_responses: modelResponses,
            selected_models: modelKeys,
            model_weights: modelWeights || null,
            // Legacy columns for backward compatibility (first 3 models only)
            gpt_response: modelResponses[modelKeys[0]] || null,
            gemini_pro_response: modelResponses[modelKeys[1]] || null,
            gemini_flash_response: modelResponses[modelKeys[2]] || null,
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
      }
    }

    return new Response(
      JSON.stringify({
        ...evaluation,
        processingTimeMs: processingTime,
        validationId,
        isPremium,
        citations: allCitations.length > 0 ? allCitations : undefined,
        selectedModels,
        modelWeights
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
