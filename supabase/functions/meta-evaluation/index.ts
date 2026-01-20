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

// ========== DETERMINISTIC WEIGHTING TYPES ==========

interface WeightedRecommendation {
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  actionItems: string[];
  potentialRisks: string[];
  sourceModel: string;
  weight: number;
  weightedScore: number; // confidence * (weight / 100)
}

interface ComputedConsensus {
  topic: string;
  description: string;
  agreementLevel: 'full' | 'majority';
  supportingModels: string[];
  weightedAgreement: number;
  confidence: number;
  actionItems: string[];
}

interface ComputedDissent {
  topic: string;
  positions: {
    modelName: string;
    position: string;
    reasoning: string;
    weight: number;
  }[];
}

interface ComputedFinal {
  title: string;
  description: string;
  topActions: string[];
  sourceModels: string[];
  confidence: number;
  reasoning: string;
}

// ========== DETERMINISTIC WEIGHTING FUNCTIONS ==========

function calculateWeightedScore(confidence: number, weight: number): number {
  return Math.round(confidence * (weight / 100));
}

function getDominantModel(
  weights: Record<string, number>, 
  responses: Record<string, any>
): { key: string; name: string; weight: number } | null {
  let maxWeight = 0;
  let dominant: { key: string; name: string; weight: number } | null = null;
  
  for (const [key, weight] of Object.entries(weights || {})) {
    if (weight > maxWeight && responses[key] && !responses[key].error) {
      maxWeight = weight;
      dominant = { key, name: responses[key].modelName || key, weight };
    }
  }
  return dominant;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 4) // Use first 4 words for matching
    .join(' ');
}

function computeConsensusFromRecommendations(
  allRecs: WeightedRecommendation[],
  modelCount: number,
  totalWeight: number
): { consensus: ComputedConsensus[]; majority: ComputedConsensus[]; dissent: ComputedDissent[] } {
  
  // Group by similar titles
  const topicGroups = new Map<string, WeightedRecommendation[]>();
  
  for (const rec of allRecs) {
    const normalizedTitle = normalizeTitle(rec.title);
    if (!topicGroups.has(normalizedTitle)) {
      topicGroups.set(normalizedTitle, []);
    }
    topicGroups.get(normalizedTitle)!.push(rec);
  }
  
  const consensus: ComputedConsensus[] = [];
  const majority: ComputedConsensus[] = [];
  const dissent: ComputedDissent[] = [];
  
  for (const [_topic, recs] of topicGroups) {
    const uniqueModels = [...new Set(recs.map(r => r.sourceModel))];
    const groupTotalWeight = recs.reduce((sum, r) => {
      // Only count weight once per unique model
      const modelWeight = recs.find(rec => rec.sourceModel === r.sourceModel)?.weight || 0;
      return sum;
    }, 0);
    
    // Calculate unique model weights
    const uniqueModelWeights = uniqueModels.reduce((sum, model) => {
      const modelRec = recs.find(r => r.sourceModel === model);
      return sum + (modelRec?.weight || 0);
    }, 0);
    
    // Find the position with highest weighted score
    const bestRec = recs.reduce((best, r) => 
      r.weightedScore > best.weightedScore ? r : best
    );
    
    const avgConfidence = Math.round(
      recs.reduce((sum, r) => sum + r.confidence, 0) / recs.length
    );
    
    const computed: ComputedConsensus = {
      topic: bestRec.title,
      description: bestRec.description,
      agreementLevel: uniqueModels.length === modelCount ? 'full' : 'majority',
      supportingModels: uniqueModels,
      weightedAgreement: uniqueModelWeights,
      confidence: avgConfidence,
      actionItems: bestRec.actionItems || []
    };
    
    if (uniqueModels.length === modelCount) {
      // All models agree = Full Consensus
      consensus.push(computed);
    } else if (uniqueModelWeights >= 60) {
      // >= 60% weighted agreement = Majority
      majority.push(computed);
    } else if (uniqueModels.length === 1 && recs.length === 1) {
      // Single model recommendation with < 60% weight = Dissent
      dissent.push({
        topic: bestRec.title,
        positions: recs.map(r => ({
          modelName: r.sourceModel,
          position: r.description,
          reasoning: r.reasoning || '',
          weight: r.weight
        }))
      });
    }
  }
  
  // Sort by weighted agreement (highest first)
  consensus.sort((a, b) => b.weightedAgreement - a.weightedAgreement);
  majority.sort((a, b) => b.weightedAgreement - a.weightedAgreement);
  
  return { consensus, majority, dissent };
}

function computeFinalRecommendation(
  allRecs: WeightedRecommendation[],
  dominantModel: { key: string; name: string; weight: number } | null,
  isPremium: boolean
): ComputedFinal {
  
  // Sort by weightedScore (highest first)
  const sortedRecs = [...allRecs].sort((a, b) => b.weightedScore - a.weightedScore);
  
  if (sortedRecs.length === 0) {
    return {
      title: 'No recommendations available',
      description: 'Unable to generate a final recommendation.',
      topActions: [],
      sourceModels: [],
      confidence: 0,
      reasoning: 'No model recommendations were processed.'
    };
  }
  
  const actionLimit = isPremium ? 7 : 5;
  
  // If a model has >= 50% weight, use its top recommendation as primary
  if (dominantModel && dominantModel.weight >= 50) {
    const dominantRecs = sortedRecs.filter(r => r.sourceModel === dominantModel.name);
    
    if (dominantRecs.length > 0) {
      const topRec = dominantRecs[0];
      
      // Collect action items: 70% from dominant model, 30% from others
      const dominantActions = dominantRecs.flatMap(r => r.actionItems || []);
      const otherActions = sortedRecs
        .filter(r => r.sourceModel !== dominantModel.name)
        .flatMap(r => r.actionItems || []);
      
      const dominantCount = Math.ceil(actionLimit * 0.7);
      const otherCount = actionLimit - dominantCount;
      
      // Deduplicate action items
      const allActions = [
        ...dominantActions.slice(0, dominantCount),
        ...otherActions.slice(0, otherCount)
      ];
      const uniqueActions = [...new Set(allActions)].slice(0, actionLimit);
      
      const otherModels = [...new Set(
        sortedRecs
          .filter(r => r.sourceModel !== dominantModel.name)
          .map(r => r.sourceModel)
      )];
      
      return {
        title: topRec.title,
        description: topRec.description,
        topActions: uniqueActions,
        sourceModels: [dominantModel.name, ...otherModels],
        confidence: topRec.weightedScore,
        reasoning: `This recommendation is primarily driven by ${dominantModel.name} (${dominantModel.weight}% weight). ` +
          `The dominant model's position takes precedence due to user-configured weighting. ` +
          (otherModels.length > 0 
            ? `Supporting perspectives from ${otherModels.join(' and ')} have been incorporated.`
            : '')
      };
    }
  }
  
  // No dominant model: Use highest weightedScore
  const topRec = sortedRecs[0];
  
  // Collect actions proportionally by weight
  const actionsByModel = new Map<string, string[]>();
  for (const rec of sortedRecs) {
    if (!actionsByModel.has(rec.sourceModel)) {
      actionsByModel.set(rec.sourceModel, []);
    }
    actionsByModel.get(rec.sourceModel)!.push(...(rec.actionItems || []));
  }
  
  const weightedActions: string[] = [];
  for (const rec of sortedRecs) {
    const modelActions = actionsByModel.get(rec.sourceModel) || [];
    const actionsToTake = Math.max(1, Math.round((rec.weight / 100) * actionLimit));
    weightedActions.push(...modelActions.slice(0, actionsToTake));
  }
  
  const uniqueActions = [...new Set(weightedActions)].slice(0, actionLimit);
  const sourceModels = [...new Set(sortedRecs.slice(0, 3).map(r => r.sourceModel))];
  
  // Calculate weighted average confidence
  const totalWeight = sortedRecs.reduce((sum, r) => sum + r.weight, 0);
  const weightedConfidence = Math.round(
    sortedRecs.reduce((sum, r) => sum + (r.confidence * r.weight), 0) / totalWeight
  );
  
  return {
    title: topRec.title,
    description: topRec.description,
    topActions: uniqueActions,
    sourceModels,
    confidence: weightedConfidence,
    reasoning: `This recommendation synthesizes insights from ${sourceModels.join(', ')} ` +
      `based on weighted scoring. The highest-scoring recommendation (weighted score: ${topRec.weightedScore}) ` +
      `forms the basis, with action items proportionally distributed by model weight.`
  };
}

// Meta-evaluation tool schema - for LLM formatting only
const getFormattingTool = (isPremium: boolean) => ({
  type: "function",
  function: {
    name: "format_evaluation",
    description: "Format pre-computed analysis results with professional language",
    parameters: {
      type: "object",
      properties: {
        formattedConsensus: {
          type: "array",
          items: {
            type: "object",
            properties: {
              topic: { type: "string" },
              description: { type: "string", description: "Professionally written description" },
              confidence: { type: "number" },
              actionItems: { type: "array", items: { type: "string" } }
            },
            required: ["topic", "description", "confidence", "actionItems"]
          }
        },
        formattedMajority: {
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
        formattedDissent: {
          type: "array",
          items: {
            type: "object",
            properties: {
              topic: { type: "string" },
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
        formattedFinalRecommendation: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            confidence: { type: "number" },
            reasoning: { type: "string" },
            topActions: { type: "array", items: { type: "string" } }
          },
          required: ["title", "description", "confidence", "reasoning", "topActions"]
        },
        synthesisReasoning: { type: "string" },
        ...(isPremium && {
          strategicAlternatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenario: { type: "string" },
                pros: { type: "array", items: { type: "string" } },
                cons: { type: "array", items: { type: "string" } },
                bestFor: { type: "string" }
              },
              required: ["scenario", "pros", "cons", "bestFor"]
            }
          },
          longTermOutlook: {
            type: "object",
            properties: {
              sixMonths: { type: "string" },
              twelveMonths: { type: "string" },
              keyMilestones: { type: "array", items: { type: "string" } }
            },
            required: ["sixMonths", "twelveMonths", "keyMilestones"]
          },
          competitorInsights: { type: "string" }
        })
      },
      required: ["formattedConsensus", "formattedMajority", "formattedDissent", "formattedFinalRecommendation", "synthesisReasoning"]
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

    // ========== STEP 1: COLLECT ALL RECOMMENDATIONS ==========
    const modelSummaries: string[] = [];
    const allRecommendations: WeightedRecommendation[] = [];
    let allCitations: string[] = [];
    let totalWeight = 0;

    for (const modelKey of (selectedModels || Object.keys(modelResponses))) {
      const response = modelResponses[modelKey];
      if (!response || response.error) continue;
      
      const weight = modelWeights?.[modelKey] || 33;
      totalWeight += weight;
      
      modelSummaries.push(
        `${response.modelName} (Weight: ${weight}%, Confidence: ${response.overallConfidence || 0}%): ${response.summary || 'No response'}${isPremium && response.marketContext ? `\nMarket Context: ${response.marketContext}` : ''}`
      );
      
      // Add recommendations with weighted scores
      (response.recommendations || []).forEach((r: any) => {
        allRecommendations.push({
          title: r.title || 'Untitled',
          description: r.description || '',
          confidence: r.confidence || 70,
          reasoning: r.reasoning || '',
          actionItems: r.actionItems || [],
          potentialRisks: r.potentialRisks || [],
          sourceModel: response.modelName,
          weight,
          weightedScore: calculateWeightedScore(r.confidence || 70, weight)
        });
      });
      
      if (response.citations && response.citations.length > 0) {
        allCitations = [...allCitations, ...response.citations];
      }
    }

    // ========== STEP 2: DETERMINISTIC COMPUTATION ==========
    
    // Find dominant model
    const dominantModel = getDominantModel(modelWeights || {}, modelResponses);
    console.log(`Dominant model: ${dominantModel?.name || 'none'} (${dominantModel?.weight || 0}%)`);
    
    // Count active models
    const activeModelCount = (selectedModels || Object.keys(modelResponses)).filter(
      (k: string) => modelResponses[k] && !modelResponses[k].error
    ).length;
    
    // Compute consensus, majority, dissent mathematically
    const { consensus: computedConsensus, majority: computedMajority, dissent: computedDissent } = 
      computeConsensusFromRecommendations(allRecommendations, activeModelCount, totalWeight);
    
    // Compute final recommendation deterministically
    const computedFinal = computeFinalRecommendation(allRecommendations, dominantModel, isPremium);
    
    console.log('Deterministic computation results:', {
      consensusCount: computedConsensus.length,
      majorityCount: computedMajority.length,
      dissentCount: computedDissent.length,
      finalTitle: computedFinal.title,
      finalConfidence: computedFinal.confidence,
      dominantInfluence: dominantModel ? `${dominantModel.name} at ${dominantModel.weight}%` : 'balanced'
    });

    // ========== STEP 3: LLM FOR FORMATTING ONLY ==========
    
    const riskPref = userPreferences?.riskPreference || 3;
    const riskContext = riskPref <= 2 ? 'conservative' : riskPref >= 4 ? 'aggressive' : 'balanced';
    
    const systemPrompt = `You are a professional business writer. Your ONLY job is to POLISH and FORMAT the pre-computed analysis results below.

CRITICAL RULES:
1. You MUST NOT change which topics are consensus/majority/dissent - these are mathematically determined
2. You MUST NOT change the final recommendation title or source models
3. You MUST NOT change the action items order or content - they are weight-prioritized
4. You MUST NOT change confidence scores
5. Your job is ONLY to improve the professional language and add business context

The user has a ${riskContext} risk tolerance. Frame the language accordingly.

${isPremium ? `PREMIUM ADDITIONS:
- Generate 2-3 strategic alternatives based on the dissent points
- Create a 6-month and 12-month outlook
- Synthesize competitor insights from the model summaries` : ''}`;

    const userPrompt = `Here are the PRE-COMPUTED results. Polish the language but keep all decisions intact:

COMPUTED CONSENSUS (${computedConsensus.length} items - ALL models agree on these):
${JSON.stringify(computedConsensus, null, 2)}

COMPUTED MAJORITY (${computedMajority.length} items - >=60% weighted agreement):
${JSON.stringify(computedMajority, null, 2)}

COMPUTED DISSENT (${computedDissent.length} items - <60% agreement, show all positions):
${JSON.stringify(computedDissent, null, 2)}

COMPUTED FINAL RECOMMENDATION (based on ${dominantModel ? `dominant model ${dominantModel.name} at ${dominantModel.weight}%` : 'weighted scoring'}):
${JSON.stringify(computedFinal, null, 2)}

ORIGINAL MODEL SUMMARIES (for context and premium features only):
${modelSummaries.join('\n\n')}

Output the formatted version using the format_evaluation function. Remember: improve language only, do not change decisions.`;

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
        tools: [getFormattingTool(isPremium)],
        tool_choice: { type: "function", function: { name: "format_evaluation" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Formatting API error:', response.status, errorText);
      // Fall back to computed results without formatting
      console.log('Using computed results without LLM formatting');
    }

    let formattedEvaluation: any = null;
    
    if (response.ok) {
      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall?.function?.arguments) {
        try {
          formattedEvaluation = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          console.error('Failed to parse formatted evaluation:', e);
        }
      }
    }

    // ========== STEP 4: MERGE COMPUTED + FORMATTED (computed takes precedence) ==========
    
    const finalEvaluation = {
      consensusPoints: (formattedEvaluation?.formattedConsensus || computedConsensus).map((c: any, i: number) => ({
        topic: computedConsensus[i]?.topic || c.topic,
        description: c.description || computedConsensus[i]?.description,
        agreementLevel: computedConsensus[i]?.agreementLevel || 'full',
        supportingModels: computedConsensus[i]?.supportingModels || [],
        confidence: computedConsensus[i]?.confidence || c.confidence,
        actionItems: computedConsensus[i]?.actionItems || c.actionItems || []
      })),
      majorityPoints: (formattedEvaluation?.formattedMajority || computedMajority).map((m: any, i: number) => ({
        topic: computedMajority[i]?.topic || m.topic,
        description: m.description || computedMajority[i]?.description,
        supportingModels: computedMajority[i]?.supportingModels || m.supportingModels || [],
        confidence: computedMajority[i]?.confidence || m.confidence
      })),
      dissentPoints: (formattedEvaluation?.formattedDissent || computedDissent).map((d: any, i: number) => ({
        topic: computedDissent[i]?.topic || d.topic,
        positions: computedDissent[i]?.positions || d.positions || []
      })),
      finalRecommendation: {
        title: computedFinal.title, // ALWAYS use computed
        description: formattedEvaluation?.formattedFinalRecommendation?.description || computedFinal.description,
        confidence: computedFinal.confidence, // ALWAYS use computed
        reasoning: formattedEvaluation?.formattedFinalRecommendation?.reasoning || computedFinal.reasoning,
        topActions: computedFinal.topActions, // ALWAYS use computed (weight-ordered)
        sourceModels: computedFinal.sourceModels // ALWAYS use computed
      },
      overallConfidence: computedFinal.confidence,
      synthesisReasoning: formattedEvaluation?.synthesisReasoning || 
        `Analysis weighted by user configuration: ${dominantModel ? `${dominantModel.name} (${dominantModel.weight}%) as dominant` : 'balanced weights'}`,
      // Premium features from LLM (these are additive, not overriding)
      ...(isPremium && formattedEvaluation?.strategicAlternatives && {
        strategicAlternatives: formattedEvaluation.strategicAlternatives
      }),
      ...(isPremium && formattedEvaluation?.longTermOutlook && {
        longTermOutlook: formattedEvaluation.longTermOutlook
      }),
      ...(isPremium && formattedEvaluation?.competitorInsights && {
        competitorInsights: formattedEvaluation.competitorInsights
      })
    };

    const processingTime = Date.now() - startTime;
    console.log(`Meta-evaluation completed in ${processingTime}ms (Premium: ${isPremium}, Dominant: ${dominantModel?.name || 'none'})`);

    // ========== STEP 5: SAVE TO HISTORY ==========
    let validationId: string | null = null;
    if (saveToHistory && prompt) {
      try {
        const modelKeys = selectedModels || Object.keys(modelResponses);
        
        const { data: insertedData, error: insertError } = await supabase
          .from('validation_analyses')
          .insert({
            user_id: user.id,
            prompt: prompt,
            risk_preference: riskPref,
            creativity_preference: 3,
            model_responses: modelResponses,
            selected_models: modelKeys,
            model_weights: modelWeights || null,
            gpt_response: modelResponses[modelKeys[0]] || null,
            gemini_pro_response: modelResponses[modelKeys[1]] || null,
            gemini_flash_response: modelResponses[modelKeys[2]] || null,
            consensus_points: finalEvaluation.consensusPoints,
            majority_points: finalEvaluation.majorityPoints,
            dissent_points: finalEvaluation.dissentPoints,
            final_recommendation: finalEvaluation.finalRecommendation,
            overall_confidence: finalEvaluation.overallConfidence,
            processing_time_ms: processingTime
          })
          .select('id')
          .single();
        
        if (insertError) throw insertError;
        validationId = insertedData?.id || null;
        console.log('Validation saved, id:', validationId);
      } catch (saveError) {
        console.error('Failed to save to history:', saveError);
      }
    }

    return new Response(
      JSON.stringify({
        ...finalEvaluation,
        processingTimeMs: processingTime,
        validationId,
        isPremium,
        citations: allCitations.length > 0 ? allCitations : undefined,
        selectedModels,
        modelWeights,
        _debug: {
          dominantModel: dominantModel?.name || null,
          dominantWeight: dominantModel?.weight || null,
          computedConsensusCount: computedConsensus.length,
          computedMajorityCount: computedMajority.length,
          computedDissentCount: computedDissent.length
        }
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
