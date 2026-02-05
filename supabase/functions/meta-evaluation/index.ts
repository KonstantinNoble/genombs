import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model ID mapping for direct Google AI API
const GOOGLE_MODEL_MAPPING: Record<string, string> = {
  'google/gemini-3-flash-preview': 'gemini-1.5-flash',
  'google/gemini-2.5-flash': 'gemini-1.5-flash',
  'google/gemini-3-pro-preview': 'gemini-1.5-pro',
  'google/gemini-2.5-pro': 'gemini-1.5-pro',
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

// ========== SEMANTIC TITLE MATCHING ==========

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
  'by', 'is', 'are', 'be', 'this', 'that', 'your', 'their', 'its', 'as', 'from',
  'it', 'we', 'you', 'they', 'our', 'can', 'will', 'should', 'would', 'could',
  'have', 'has', 'had', 'do', 'does', 'did', 'been', 'being', 'was', 'were'
]);

// ========== CANONICAL TOKEN MAPPING ==========

const CANONICAL_TOKENS: Record<string, string> = {
  // Validierung → "validate"
  'test': 'validate', 'verify': 'validate', 'confirm': 'validate',
  'check': 'validate', 'assess': 'validate', 'pilot': 'validate',
  'trial': 'validate', 'experiment': 'validate',
  
  // Wachstum → "scale"
  'grow': 'scale', 'expand': 'scale', 'increase': 'scale',
  'amplify': 'scale', 'accelerate': 'scale',
  
  // Teams → "team"
  'org': 'team', 'squad': 'team', 'group': 'team', 'staff': 'team',
  
  // Launch → "launch"
  'release': 'launch', 'deploy': 'launch', 'introduce': 'launch',
  'rollout': 'launch', 'ship': 'launch',
  
  // Hire → "hire"
  'recruit': 'hire', 'onboard': 'hire',
  
  // Focus → "focus"
  'concentrate': 'focus', 'prioritize': 'focus',
  
  // Markt → "market"
  'segment': 'market', 'audience': 'market',
  
  // Kunde → "customer"
  'user': 'customer', 'client': 'customer', 'buyer': 'customer'
};

function canonicalize(word: string): string {
  const lower = word.toLowerCase();
  return CANONICAL_TOKENS[lower] || lower;
}

// NUR kanonische Verben - keine Synonyme mehr im Set
const ACTION_VERBS = new Set([
  'scale', 'focus', 'launch', 'build', 'validate', 'hire', 'develop',
  'optimize', 'reduce', 'improve', 'create', 'establish', 'implement',
  'integrate', 'invest', 'acquire', 'retain', 'enter', 'dominate'
]);

// Einheitliche Normalisierungsfunktion
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function extractActionTarget(title: string): { action: string; target: string } {
  const normalized = normalizeText(title);
  const words = normalized.split(/\s+/).filter(w => w.length > 2);
  
  // Content-Wörter (ohne Stop-Words)
  const contentWords = words.filter(w => !STOP_WORDS.has(w));
  
  // Erste Aktion finden (nach Kanonisierung prüfen)
  let actionIndex = -1;
  for (let i = 0; i < contentWords.length; i++) {
    if (ACTION_VERBS.has(canonicalize(contentWords[i]))) {
      actionIndex = i;
      break;
    }
  }
  
  // Action kanonisieren
  const action = actionIndex >= 0 
    ? canonicalize(contentWords[actionIndex]) 
    : (contentWords[0] ? canonicalize(contentWords[0]) : '');
  
  // Target = letzte 2 Content-Wörter, Action per INDEX entfernen
  const targetWords = contentWords.filter((_, idx) => idx !== actionIndex);
  const lastTwo = targetWords.slice(-2);
  
  // Beide Wörter kanonisieren und zusammenfügen
  const target = lastTwo.map(w => canonicalize(w)).join(' ');
  
  return { action, target };
}

function extractCanonicalKeywords(text: string): Set<string> {
  return new Set(
    normalizeText(text)
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word))
      .map(word => canonicalize(word))
  );
}

// Fallback: Einfacher Token-Jaccard ohne Kanonisierung
function calculateSimpleJaccard(title1: string, title2: string): number {
  const words1 = new Set(
    normalizeText(title1).split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
  );
  const words2 = new Set(
    normalizeText(title2).split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
  );
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

function calculateEnhancedSimilarity(title1: string, title2: string): number {
  // Schritt 1: Exakte Übereinstimmung nach Normalisierung
  const norm1 = normalizeText(title1);
  const norm2 = normalizeText(title2);
  if (norm1 === norm2) return 1.0;
  
  // Schritt 2: Kanonisierte Keywords extrahieren
  const keywords1 = extractCanonicalKeywords(title1);
  const keywords2 = extractCanonicalKeywords(title2);
  
  // Fallback für sehr kurze Titel (< 2 Keywords)
  if (keywords1.size < 2 || keywords2.size < 2) {
    return calculateSimpleJaccard(title1, title2);
  }
  
  // Schritt 3: Action + Target Extraktion
  const { action: action1, target: target1 } = extractActionTarget(title1);
  const { action: action2, target: target2 } = extractActionTarget(title2);
  
  const sameAction = action1 === action2;
  const sameTarget = target1 === target2;
  
  // Schritt 4: Jaccard auf kanonisierten Keywords
  const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
  const union = new Set([...keywords1, ...keywords2]);
  
  let similarity = intersection.size / union.size;
  
  // Schritt 5: Penalty bei gleicher Action + unterschiedlichem Target
  if (sameAction && !sameTarget && target1.length > 0 && target2.length > 0) {
    similarity *= 0.6;
  }
  
  // Schritt 6: ADDITIVER Bonus für gleiche Action UND gleiches Target
  if (sameAction && sameTarget && target1.length > 0) {
    similarity = Math.min(1.0, similarity + 0.15);
  }
  
  return similarity;
}

function findSimilarGroup(
  title: string, 
  existingGroups: Map<string, WeightedRecommendation[]>,
  threshold: number = 0.50 // Erhöht von 0.35 auf 0.50 für stabileres Matching
): string | null {
  for (const [groupTitle] of existingGroups) {
    if (calculateEnhancedSimilarity(title, groupTitle) >= threshold) {
      return groupTitle;
    }
  }
  return null;
}

// ========== RISK SCORE AS MATHEMATICAL WEIGHT ==========

const AGGRESSIVE_PATTERNS = [
  { pattern: /scale\s*(rapidly|aggressively|fast|quickly)/i, score: 1.5 },
  { pattern: /disrupt|disruptive|disruption/i, score: 1.5 },
  { pattern: /bold\s*(move|strategy|investment|action)/i, score: 1.0 },
  { pattern: /aggressive\s*(growth|expansion|marketing|approach)/i, score: 1.5 },
  { pattern: /invest\s*heavily|significant\s*investment|major\s*investment/i, score: 1.0 },
  { pattern: /first[\s-]mover|market\s*leader|dominate/i, score: 0.8 },
  { pattern: /rapid\s*expansion|quick\s*scale|accelerate/i, score: 1.0 },
  { pattern: /all[\s-]in|go\s*big|maximize/i, score: 1.2 },
  { pattern: /immediately|now|urgent|asap/i, score: 0.6 }
];

const CONSERVATIVE_PATTERNS = [
  { pattern: /test\s*(first|before|carefully|initially)/i, score: -1.5 },
  { pattern: /pilot\s*(program|project|phase|test)/i, score: -1.0 },
  { pattern: /validate|validation|verify/i, score: -0.8 },
  { pattern: /gradual|incremental|step[\s-]by[\s-]step|phased/i, score: -1.0 },
  { pattern: /minimize\s*risk|risk[\s-]averse|low[\s-]risk|reduce\s*risk/i, score: -1.5 },
  { pattern: /cautious|careful|conservative|measured/i, score: -1.0 },
  { pattern: /small[\s-]scale|limited\s*(test|rollout|trial)/i, score: -0.8 },
  { pattern: /research\s*first|analyze\s*before|evaluate/i, score: -0.7 },
  { pattern: /wait|hold|pause|consider/i, score: -0.5 }
];

function estimateRecommendationRiskLevel(rec: WeightedRecommendation): number {
  const text = `${rec.title} ${rec.description} ${(rec.actionItems || []).join(' ')}`.toLowerCase();
  
  let riskScore = 3; // Neutral baseline
  
  for (const { pattern, score } of AGGRESSIVE_PATTERNS) {
    if (pattern.test(text)) riskScore += score;
  }
  
  for (const { pattern, score } of CONSERVATIVE_PATTERNS) {
    if (pattern.test(text)) riskScore += score; // score is already negative
  }
  
  return Math.max(1, Math.min(5, Math.round(riskScore)));
}

function calculateRiskAdjustedScore(
  rec: WeightedRecommendation,
  userRiskPreference: number // 1-5
): number {
  const recRiskLevel = estimateRecommendationRiskLevel(rec);
  
  // Alignment calculation (0 to 1): 1 = perfect match, 0 = max discrepancy
  const alignment = 1 - (Math.abs(recRiskLevel - userRiskPreference) / 4);
  
  // Risk bonus: up to +25% for perfect alignment
  const riskBonus = rec.weightedScore * alignment * 0.25;
  
  return rec.weightedScore + riskBonus;
}

function estimateActionRiskLevel(action: string): number {
  const text = action.toLowerCase();
  
  // Aggressive action keywords
  if (/immediately|now|asap|urgent|launch|scale|expand|invest|go\s*live/i.test(text)) return 4;
  if (/bold|aggressive|rapid|accelerate|maximize/i.test(text)) return 5;
  
  // Conservative action keywords
  if (/test|pilot|validate|research|analyze|review|assess|evaluate/i.test(text)) return 2;
  if (/plan|prepare|consider|document|monitor/i.test(text)) return 2;
  if (/careful|gradual|limited|small/i.test(text)) return 1;
  
  return 3; // Neutral
}

function computeConsensusFromRecommendations(
  allRecs: WeightedRecommendation[],
  modelCount: number,
  totalWeight: number
): { consensus: ComputedConsensus[]; majority: ComputedConsensus[]; dissent: ComputedDissent[] } {
  
  // Group by semantically similar titles
  const topicGroups = new Map<string, WeightedRecommendation[]>();
  
  for (const rec of allRecs) {
    // Find existing group with similar title
    const existingGroup = findSimilarGroup(rec.title, topicGroups);
    
    if (existingGroup) {
      topicGroups.get(existingGroup)!.push(rec);
    } else {
      // Create new group with this title as key
      topicGroups.set(rec.title, [rec]);
    }
  }
  
  console.log(`Semantic grouping: ${allRecs.length} recommendations -> ${topicGroups.size} topic groups`);
  
  const consensus: ComputedConsensus[] = [];
  const majority: ComputedConsensus[] = [];
  const dissent: ComputedDissent[] = [];
  
  for (const [_topic, recs] of topicGroups) {
    const uniqueModels = [...new Set(recs.map(r => r.sourceModel))];
    
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
  isPremium: boolean,
  userRiskPreference: number = 3 // NEW: Risk preference parameter (1-5)
): ComputedFinal {
  
  // Sort by risk-adjusted weighted score (highest first)
  const sortedRecs = [...allRecs].sort((a, b) => 
    calculateRiskAdjustedScore(b, userRiskPreference) - 
    calculateRiskAdjustedScore(a, userRiskPreference)
  );
  
  // Log risk adjustment for debugging
  if (sortedRecs.length > 0) {
    const topRec = sortedRecs[0];
    console.log('Risk-adjusted scoring:', {
      userRiskPreference,
      topRecTitle: topRec.title.substring(0, 50),
      topRecOriginalScore: topRec.weightedScore,
      topRecRiskLevel: estimateRecommendationRiskLevel(topRec),
      topRecAdjustedScore: calculateRiskAdjustedScore(topRec, userRiskPreference)
    });
  }
  
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
  
  // Sort action items by risk alignment
  const sortActionsByRiskAlignment = (actions: string[]): string[] => {
    return [...actions].sort((a, b) => {
      const aRisk = estimateActionRiskLevel(a);
      const bRisk = estimateActionRiskLevel(b);
      const aAlign = 1 - Math.abs(aRisk - userRiskPreference) / 4;
      const bAlign = 1 - Math.abs(bRisk - userRiskPreference) / 4;
      return bAlign - aAlign; // Higher alignment first
    });
  };
  
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
      
      // Sort and deduplicate action items by risk alignment
      const sortedDominantActions = sortActionsByRiskAlignment(dominantActions);
      const sortedOtherActions = sortActionsByRiskAlignment(otherActions);
      
      const allActions = [
        ...sortedDominantActions.slice(0, dominantCount),
        ...sortedOtherActions.slice(0, otherCount)
      ];
      const uniqueActions = [...new Set(allActions)].slice(0, actionLimit);
      
      const otherModels = [...new Set(
        sortedRecs
          .filter(r => r.sourceModel !== dominantModel.name)
          .map(r => r.sourceModel)
      )];
      
      const riskContext = userRiskPreference <= 2 ? 'conservative' : 
                          userRiskPreference >= 4 ? 'aggressive' : 'balanced';
      
      return {
        title: topRec.title,
        description: topRec.description,
        topActions: uniqueActions,
        sourceModels: [dominantModel.name, ...otherModels],
        confidence: topRec.weightedScore,
        reasoning: `This recommendation is primarily driven by ${dominantModel.name} (${dominantModel.weight}% weight). ` +
          `Action items are prioritized for a ${riskContext} risk profile. ` +
          (otherModels.length > 0 
            ? `Supporting perspectives from ${otherModels.join(' and ')} have been incorporated.`
            : '')
      };
    }
  }
  
  // No dominant model: Use highest risk-adjusted weightedScore
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
  
  // Sort by risk alignment and deduplicate
  const sortedWeightedActions = sortActionsByRiskAlignment(weightedActions);
  const uniqueActions = [...new Set(sortedWeightedActions)].slice(0, actionLimit);
  const sourceModels = [...new Set(sortedRecs.slice(0, 3).map(r => r.sourceModel))];
  
  // Calculate weighted average confidence
  const totalWeight = sortedRecs.reduce((sum, r) => sum + r.weight, 0);
  const weightedConfidence = Math.round(
    sortedRecs.reduce((sum, r) => sum + (r.confidence * r.weight), 0) / totalWeight
  );
  
  const riskContext = userRiskPreference <= 2 ? 'conservative' : 
                      userRiskPreference >= 4 ? 'aggressive' : 'balanced';
  
  return {
    title: topRec.title,
    description: topRec.description,
    topActions: uniqueActions,
    sourceModels,
    confidence: weightedConfidence,
    reasoning: `This recommendation synthesizes insights from ${sourceModels.join(', ')} ` +
      `based on weighted scoring with ${riskContext} risk alignment. ` +
      `The highest-scoring recommendation (risk-adjusted score: ${calculateRiskAdjustedScore(topRec, userRiskPreference).toFixed(1)}) ` +
      `forms the basis, with action items prioritized by risk preference.`
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
      required: isPremium 
        ? ["formattedConsensus", "formattedMajority", "formattedDissent", "formattedFinalRecommendation", "synthesisReasoning", "strategicAlternatives", "longTermOutlook", "competitorInsights"]
        : ["formattedConsensus", "formattedMajority", "formattedDissent", "formattedFinalRecommendation", "synthesisReasoning"]
    }
  }
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== CODE-LEVEL JWT VERIFICATION ==========
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Direct Google AI API key (no more Lovable Gateway)
    const googleApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!googleApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Create auth client with user's token for JWT verification
    const token = authHeader.slice('Bearer '.length);
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });

    // Verify JWT via getClaims (works with ES256 signing keys)
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT verification failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      console.error('No user ID in JWT claims');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token claims' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create user object for compatibility with existing code
    const user = { id: userId };

    const { 
      modelResponses,
      selectedModels,
      modelWeights,
      userPreferences,
      prompt,
      saveToHistory = true,
      isPremium = false,
      teamId = null,
      businessContext = null
    } = await req.json();

    // ========== VIEWER ROLE CHECK ==========
    // Viewers can only read, not create analyses in team context
    if (teamId) {
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();
      
      if (memberError || !memberData) {
        return new Response(
          JSON.stringify({ error: 'Not a member of this team' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (memberData.role === 'viewer') {
        return new Response(
          JSON.stringify({ error: 'Viewers cannot create team analyses. Ask your team admin for Member access.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

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
    
    // Get risk preference for deterministic computation
    const riskPref = userPreferences?.riskPreference || 3;
    console.log(`User risk preference: ${riskPref} (${riskPref <= 2 ? 'conservative' : riskPref >= 4 ? 'aggressive' : 'balanced'})`);
    
    // Compute consensus, majority, dissent mathematically
    const { consensus: computedConsensus, majority: computedMajority, dissent: computedDissent } = 
      computeConsensusFromRecommendations(allRecommendations, activeModelCount, totalWeight);
    
    // Compute final recommendation deterministically with risk adjustment
    const computedFinal = computeFinalRecommendation(allRecommendations, dominantModel, isPremium, riskPref);
    
    console.log('Deterministic computation results:', {
      consensusCount: computedConsensus.length,
      majorityCount: computedMajority.length,
      dissentCount: computedDissent.length,
      finalTitle: computedFinal.title,
      finalConfidence: computedFinal.confidence,
      dominantInfluence: dominantModel ? `${dominantModel.name} at ${dominantModel.weight}%` : 'balanced',
      riskPreference: riskPref
    });

    // ========== STEP 3: LLM FOR FORMATTING ONLY (via direct Google AI API) ==========
    
    const riskContext = riskPref <= 2 ? 'conservative' : riskPref >= 4 ? 'aggressive' : 'balanced';
    
    // Build business context section for the prompt if available
    let businessContextSection = '';
    if (businessContext && (businessContext.website_url || businessContext.website_summary || businessContext.industry)) {
      const contextParts: string[] = [];
      if (businessContext.industry) contextParts.push(`Industry: ${businessContext.industry}`);
      if (businessContext.company_stage) contextParts.push(`Stage: ${businessContext.company_stage}`);
      if (businessContext.team_size) contextParts.push(`Team Size: ${businessContext.team_size}`);
      if (businessContext.target_market) contextParts.push(`Target Market: ${businessContext.target_market}`);
      if (businessContext.geographic_focus) contextParts.push(`Geographic Focus: ${businessContext.geographic_focus}`);
      if (businessContext.website_url) contextParts.push(`Website: ${businessContext.website_url}`);
      if (businessContext.website_summary) contextParts.push(`Website Analysis:\n${businessContext.website_summary}`);
      
      businessContextSection = `
BUSINESS CONTEXT (Consider this when polishing recommendations):
${contextParts.join('\n')}
`;
    }
    
    const systemPrompt = `You are a professional business writer. Your ONLY job is to POLISH and FORMAT the pre-computed analysis results below.
${businessContextSection}
CRITICAL RULES:
1. You MUST NOT change which topics are consensus/majority/dissent - these are mathematically determined
2. You MUST NOT change the final recommendation title or source models
3. You MUST NOT change the action items order or content - they are weight-prioritized
4. You MUST NOT change confidence scores
5. Your job is ONLY to improve the professional language and add business context
${businessContext?.website_summary ? '6. IMPORTANT: Reference specific points from the Website Analysis when relevant to make recommendations more tailored' : ''}

The user has a ${riskContext} risk tolerance. Frame the language accordingly.

${isPremium ? `PREMIUM USER - MANDATORY PREMIUM FEATURES:
You MUST generate ALL of the following premium features for this premium user. These are REQUIRED, not optional:

1. strategicAlternatives (REQUIRED): Generate exactly 2-3 alternative strategic scenarios based on the dissent points and different approaches. Each must have scenario, pros (array), cons (array), and bestFor fields.

2. longTermOutlook (REQUIRED): Create specific projections with:
   - sixMonths: Detailed 6-month projection
   - twelveMonths: Detailed 12-month projection  
   - keyMilestones: At least 3 key milestones

3. competitorInsights (REQUIRED): Synthesize actionable competitive analysis based on the model summaries${businessContext?.website_summary ? ' and the Website Analysis' : ''}. This should be a detailed paragraph.

FAILURE TO INCLUDE THESE PREMIUM FIELDS IS NOT ACCEPTABLE. Every premium user MUST receive all three premium sections.` : ''}

IMPORTANT: Respond with a valid JSON object matching the format_evaluation schema. Include all required fields.`;

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

Output the formatted version as JSON. Remember: improve language only, do not change decisions.`;

    // Use direct Google AI API instead of Lovable Gateway
    const directModelId = GOOGLE_MODEL_MAPPING['google/gemini-3-flash-preview'] || 'gemini-1.5-flash';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${directModelId}:generateContent?key=${googleApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            { 
              role: "user", 
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] 
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Formatting API error:', response.status, errorText);
      // Fall back to computed results without formatting
      console.log('Using computed results without LLM formatting');
    }

    let formattedEvaluation: any = null;
    
    if (response.ok) {
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        try {
          // Try to extract JSON from content (might be wrapped in markdown code blocks)
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
          const jsonStr = jsonMatch ? jsonMatch[1] : content;
          formattedEvaluation = JSON.parse(jsonStr);
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
      // Premium features with fallback defaults
      ...(isPremium && {
        strategicAlternatives: formattedEvaluation?.strategicAlternatives?.length > 0 
          ? formattedEvaluation.strategicAlternatives 
          : [
              {
                scenario: "Conservative Approach",
                pros: ["Lower risk exposure", "Gradual learning curve", "Easier to pivot if needed", "Preserves resources"],
                cons: ["Slower market capture", "May miss timing windows", "Competitors may move faster"],
                bestFor: "Risk-averse stakeholders or organizations with limited resources"
              },
              {
                scenario: "Aggressive Scaling",
                pros: ["First-mover advantage", "Faster market penetration", "Stronger competitive position"],
                cons: ["Higher capital requirements", "Greater operational risk", "Less room for error"],
                bestFor: "Well-funded ventures with high risk tolerance and strong execution capabilities"
              }
            ],
        longTermOutlook: formattedEvaluation?.longTermOutlook?.sixMonths 
          ? formattedEvaluation.longTermOutlook 
          : {
              sixMonths: "Initial implementation phase focusing on market validation and establishing core operations. Key focus on building foundational capabilities and early customer feedback.",
              twelveMonths: "Scaling phase with emphasis on growth metrics and operational efficiency. Expected to achieve key milestones and demonstrate product-market fit.",
              keyMilestones: [
                "Complete initial market entry strategy and validation",
                "Achieve product-market fit with measurable customer satisfaction",
                "Scale operations to meet growing demand",
                "Establish sustainable competitive advantages"
              ]
            },
        competitorInsights: formattedEvaluation?.competitorInsights 
          || "Based on the multi-model analysis, focus on differentiation through unique value propositions and operational excellence. Monitor competitor movements closely and maintain agility to respond to market changes. Leverage identified strengths while addressing gaps in current positioning."
      })
    };
    
    // Log premium feature generation status
    if (isPremium) {
      console.log('Premium features status:', {
        strategicAlternativesFromLLM: !!formattedEvaluation?.strategicAlternatives?.length,
        longTermOutlookFromLLM: !!formattedEvaluation?.longTermOutlook?.sixMonths,
        competitorInsightsFromLLM: !!formattedEvaluation?.competitorInsights,
        usingDefaults: !formattedEvaluation?.strategicAlternatives?.length || !formattedEvaluation?.longTermOutlook?.sixMonths || !formattedEvaluation?.competitorInsights
      });
    }

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
            team_id: teamId || null,
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
            processing_time_ms: processingTime,
            // Store premium status and content for history reconstruction
            is_premium: isPremium,
            strategic_alternatives: finalEvaluation.strategicAlternatives || null,
            long_term_outlook: finalEvaluation.longTermOutlook || null,
            competitor_insights: finalEvaluation.competitorInsights || null,
            citations: allCitations.length > 0 ? allCitations : null
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
