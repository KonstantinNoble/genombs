import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model ID mapping for direct Google AI API
const GOOGLE_MODEL_MAPPING: Record<string, string> = {
  'google/gemini-3-flash-preview': 'gemini-2.5-flash',
  'google/gemini-2.5-flash': 'gemini-2.5-flash',
  'google/gemini-3-pro-preview': 'gemini-2.5-pro',
  'google/gemini-2.5-pro': 'gemini-2.5-pro',
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
  agreementLevel: 'full' | 'partial';
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
  agreementLevel: 'full' | 'partial';
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

// ========== (Removed: CONTEXTUAL PREMIUM FALLBACK FUNCTIONS) ==========
// Premium fields now return null if LLM formatting fails - UI handles gracefully

// ========== JSON RECOVERY UTILITIES (String-Aware) ==========

/**
 * Sanitizes JSON strings by escaping raw control characters (newlines, tabs, etc.)
 * and closing truncated strings. This fixes "Unterminated string" errors.
 */
function sanitizeJsonStrings(jsonStr: string): string {
  let result = '';
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    
    // Inside a string: escape control characters
    if (inString) {
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  
  // If still inside a string at EOF, close it (truncated string)
  if (inString) {
    result += '"';
    console.log('[JSON Sanitize] Closed truncated string at EOF');
  }
  
  return result;
}

/**
 * String-aware repair: counts brackets/braces ONLY outside of strings,
 * then adds missing closures at the end.
 */
function repairTruncatedJSONStringAware(jsonStr: string): string {
  let repaired = jsonStr.trim();
  
  // String-aware counting (only count outside of strings)
  let inString = false;
  let escaped = false;
  let openBraces = 0, closeBraces = 0;
  let openBrackets = 0, closeBrackets = 0;
  
  for (const char of repaired) {
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    
    if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') closeBraces++;
      else if (char === '[') openBrackets++;
      else if (char === ']') closeBrackets++;
    }
  }
  
  // If balanced, return as-is
  if (openBraces === closeBraces && openBrackets === closeBrackets) {
    return repaired;
  }
  
  console.log(`[JSON Repair] Unbalanced: { ${openBraces}/${closeBraces} } [ ${openBrackets}/${closeBrackets} ]`);
  
  // Add missing closing brackets first (innermost)
  const missingBrackets = Math.max(0, openBrackets - closeBrackets);
  repaired += ']'.repeat(missingBrackets);
  
  // Then add missing closing braces
  const missingBraces = Math.max(0, openBraces - closeBraces);
  repaired += '}'.repeat(missingBraces);
  
  console.log(`[JSON Repair] Added ${missingBrackets} ] and ${missingBraces} }`);
  
  return repaired;
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

// ========== SEMANTIC TITLE MATCHING (IMPROVED MULTILINGUAL) ==========

// Extended stop words with German
const STOP_WORDS = new Set([
  // English
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
  'by', 'is', 'are', 'be', 'this', 'that', 'your', 'their', 'its', 'as', 'from',
  'it', 'we', 'you', 'they', 'our', 'can', 'will', 'should', 'would', 'could',
  'have', 'has', 'had', 'do', 'does', 'did', 'been', 'being', 'was', 'were',
  // German
  'der', 'die', 'das', 'ein', 'eine', 'einer', 'einem', 'einen', 'und', 'oder',
  'aber', 'in', 'im', 'auf', 'an', 'zu', 'zum', 'zur', 'fur', 'fuer', 'mit', 'von',
  'ist', 'sind', 'sein', 'war', 'waren', 'wird', 'werden', 'wurde', 'wurden',
  'sie', 'er', 'es', 'wir', 'ihr', 'sie', 'haben', 'hat', 'hatte', 'hatten',
  'kann', 'konnen', 'soll', 'sollen', 'muss', 'mussen', 'diese', 'dieser', 'diesem'
]);

// ========== CANONICAL TOKEN MAPPING (EXPANDED WITH GERMAN) ==========

const CANONICAL_TOKENS: Record<string, string> = {
  // Validierung → "validate"
  'test': 'validate', 'verify': 'validate', 'confirm': 'validate',
  'check': 'validate', 'assess': 'validate', 'pilot': 'validate',
  'trial': 'validate', 'experiment': 'validate',
  'validieren': 'validate', 'prufen': 'validate', 'pruefen': 'validate',
  'testen': 'validate', 'verifizieren': 'validate',
  
  // Wachstum → "scale"
  'grow': 'scale', 'expand': 'scale', 'increase': 'scale',
  'amplify': 'scale', 'accelerate': 'scale',
  'skalieren': 'scale', 'wachsen': 'scale', 'erweitern': 'scale',
  
  // Teams → "team"
  'org': 'team', 'squad': 'team', 'group': 'team', 'staff': 'team',
  'organisation': 'team', 'mannschaft': 'team', 'gruppe': 'team',
  
  // Launch → "launch"
  'release': 'launch', 'deploy': 'launch', 'introduce': 'launch',
  'rollout': 'launch', 'ship': 'launch',
  'starten': 'launch', 'launchen': 'launch', 'einfuhren': 'launch', 'einfuehren': 'launch',
  
  // Hire → "hire"
  'recruit': 'hire', 'onboard': 'hire',
  'einstellen': 'hire', 'rekrutieren': 'hire', 'anwerben': 'hire',
  
  // Focus → "focus"
  'concentrate': 'focus', 'prioritize': 'focus',
  'fokussieren': 'focus', 'konzentrieren': 'focus', 'priorisieren': 'focus',
  
  // Markt → "market"
  'segment': 'market', 'audience': 'market',
  'markt': 'market', 'zielgruppe': 'market',
  
  // Kunde → "customer"
  'user': 'customer', 'client': 'customer', 'buyer': 'customer',
  'kunde': 'customer', 'kunden': 'customer', 'nutzer': 'customer',
  
  // Use/Leverage → "use"
  'utilize': 'use', 'leverage': 'use', 'adopt': 'use', 'employ': 'use',
  'nutzen': 'use', 'verwenden': 'use', 'einsetzen': 'use',
  
  // Build → "build"
  'create': 'build', 'develop': 'build', 'establish': 'build', 'construct': 'build',
  'erstellen': 'build', 'aufbauen': 'build', 'entwickeln': 'build', 'bauen': 'build',
  
  // Improve → "improve"
  'enhance': 'improve', 'optimize': 'improve', 'strengthen': 'improve', 'boost': 'improve',
  'verbessern': 'improve', 'optimieren': 'improve', 'verstarken': 'improve', 'verstaerken': 'improve',
  
  // Strategy → "strategy"
  'approach': 'strategy', 'plan': 'strategy', 'method': 'strategy',
  'strategie': 'strategy', 'ansatz': 'strategy', 'methode': 'strategy',
  
  // Implement → "implement"
  'umsetzen': 'implement', 'implementieren': 'implement', 'ausfuhren': 'implement', 'ausfuehren': 'implement'
};

function canonicalize(word: string): string {
  const lower = word.toLowerCase();
  return CANONICAL_TOKENS[lower] || lower;
}

// NUR kanonische Verben - keine Synonyme mehr im Set
const ACTION_VERBS = new Set([
  'scale', 'focus', 'launch', 'build', 'validate', 'hire', 'develop',
  'optimize', 'reduce', 'improve', 'create', 'establish', 'implement',
  'integrate', 'invest', 'acquire', 'retain', 'enter', 'dominate', 'use'
]);

// Einheitliche Normalisierungsfunktion - jetzt Unicode-freundlich
function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
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

// ========== INTENT SIGNATURE: Title + ActionItems for better matching ==========

function extractIntentSignature(rec: WeightedRecommendation): string {
  const titlePart = rec.title || '';
  const actionPart = (rec.actionItems || []).slice(0, 2).join(' ');
  return `${titlePart} ${actionPart}`;
}

function calculateIntentSimilarity(rec1: WeightedRecommendation, rec2: WeightedRecommendation): number {
  const intent1 = extractCanonicalKeywords(extractIntentSignature(rec1));
  const intent2 = extractCanonicalKeywords(extractIntentSignature(rec2));
  
  if (intent1.size === 0 || intent2.size === 0) return 0;
  
  const intersection = new Set([...intent1].filter(k => intent2.has(k)));
  const union = new Set([...intent1, ...intent2]);
  
  return intersection.size / union.size;
}

// NEW: Description-based similarity for additional matching signal
function calculateDescriptionSimilarity(rec1: WeightedRecommendation, rec2: WeightedRecommendation): number {
  // Use first 200 chars of description for efficiency
  const desc1 = (rec1.description || '').substring(0, 200);
  const desc2 = (rec2.description || '').substring(0, 200);
  
  const keywords1 = extractCanonicalKeywords(desc1);
  const keywords2 = extractCanonicalKeywords(desc2);
  
  if (keywords1.size === 0 || keywords2.size === 0) return 0;
  
  const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
  const union = new Set([...keywords1, ...keywords2]);
  
  return intersection.size / union.size;
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
  
  // Schritt 5: REDUCED Penalty bei gleicher Action + unterschiedlichem Target (0.8 statt 0.6)
  if (sameAction && !sameTarget && target1.length > 0 && target2.length > 0) {
    similarity *= 0.8;
  }
  
  // Schritt 6: ADDITIVER Bonus für gleiche Action UND gleiches Target
  if (sameAction && sameTarget && target1.length > 0) {
    similarity = Math.min(1.0, similarity + 0.15);
  }
  
  return similarity;
}

// ========== COMBINED SIMILARITY: Title + Intent + Description ==========

function calculateCombinedSimilarity(rec1: WeightedRecommendation, rec2: WeightedRecommendation): number {
  const titleSim = calculateEnhancedSimilarity(rec1.title, rec2.title);
  const intentSim = calculateIntentSimilarity(rec1, rec2);
  const descSim = calculateDescriptionSimilarity(rec1, rec2);
  
  // Take the maximum of all three - if any signal matches well, that's enough
  return Math.max(titleSim, intentSim, descSim);
}

// ========== UNION-FIND (DISJOINT SET) FOR GRAPH-BASED CLUSTERING ==========

class UnionFind {
  private parent: number[];
  private rank: number[];
  
  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = new Array(size).fill(0);
  }
  
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }
  
  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);
    
    if (rootX !== rootY) {
      // Union by rank
      if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY;
      } else if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX;
      } else {
        this.parent[rootY] = rootX;
        this.rank[rootX]++;
      }
    }
  }
  
  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }
  
  getClusters(): Map<number, number[]> {
    const clusters = new Map<number, number[]>();
    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i);
      if (!clusters.has(root)) {
        clusters.set(root, []);
      }
      clusters.get(root)!.push(i);
    }
    return clusters;
  }
}

function clusterRecommendations(
  allRecs: WeightedRecommendation[],
  threshold: number = 0.32, // LOWERED from 0.35
  fallbackThreshold: number = 0.24 // LOWERED from 0.28
): Map<number, WeightedRecommendation[]> {
  
  const n = allRecs.length;
  if (n === 0) return new Map();
  
  const uf = new UnionFind(n);
  
  // Debug: Track cross-model similarity pairs
  const crossModelPairs: { i: number; j: number; sim: number; models: string[] }[] = [];
  
  // Pairwise similarity computation and union
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sim = calculateCombinedSimilarity(allRecs[i], allRecs[j]);
      
      // Track cross-model pairs for debugging
      if (allRecs[i].sourceModel !== allRecs[j].sourceModel) {
        crossModelPairs.push({
          i, j, sim,
          models: [allRecs[i].sourceModel, allRecs[j].sourceModel]
        });
      }
      
      if (sim >= threshold) {
        uf.union(i, j);
      }
    }
  }
  
  // Log top 10 cross-model similarity pairs
  crossModelPairs.sort((a, b) => b.sim - a.sim);
  const top10 = crossModelPairs.slice(0, 10);
  const maxCrossModelSimilarity = crossModelPairs.length > 0 ? crossModelPairs[0].sim : 0;
  const crossModelPairsAboveThreshold = crossModelPairs.filter(p => p.sim >= threshold).length;
  
  console.log('Cross-model similarity analysis:', {
    totalPairs: crossModelPairs.length,
    maxSimilarity: maxCrossModelSimilarity.toFixed(3),
    pairsAboveThreshold: crossModelPairsAboveThreshold,
    threshold
  });
  
  console.log('Top 10 cross-model similarity pairs:');
  for (const pair of top10) {
    console.log(`  ${allRecs[pair.i].title.substring(0, 30)} <-> ${allRecs[pair.j].title.substring(0, 30)}: ${pair.sim.toFixed(3)} [${pair.models.join(' vs ')}]`);
  }
  
  // Get initial clusters
  let clusters = uf.getClusters();
  let clusteringPass = 'strict';
  
  // Check if we have any multi-model clusters
  let hasMultiModelCluster = false;
  for (const [_, indices] of clusters) {
    const uniqueModels = new Set(indices.map(i => allRecs[i].sourceModel));
    if (uniqueModels.size >= 2) {
      hasMultiModelCluster = true;
      break;
    }
  }
  
  // Adaptive fallback: if no multi-model clusters, try lower threshold with guardrail
  if (!hasMultiModelCluster && crossModelPairs.length > 0) {
    console.log(`No multi-model clusters at threshold ${threshold}, trying fallback ${fallbackThreshold}`);
    clusteringPass = 'fallback';
    
    const ufFallback = new UnionFind(n);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const sim = calculateCombinedSimilarity(allRecs[i], allRecs[j]);
        if (sim >= fallbackThreshold) {
          // Guardrail: require at least 1 common canonical keyword (reduced from 2)
          const keywords1 = extractCanonicalKeywords(allRecs[i].title);
          const keywords2 = extractCanonicalKeywords(allRecs[j].title);
          const commonKeywords = [...keywords1].filter(k => keywords2.has(k));
          
          if (commonKeywords.length >= 1) {
            ufFallback.union(i, j);
          }
        }
      }
    }
    clusters = ufFallback.getClusters();
    
    // Check again for multi-model clusters
    hasMultiModelCluster = false;
    for (const [_, indices] of clusters) {
      const uniqueModels = new Set(indices.map(i => allRecs[i].sourceModel));
      if (uniqueModels.size >= 2) {
        hasMultiModelCluster = true;
        break;
      }
    }
  }
  
  // NEW: Loose Pass for Cross-Model only if still no multi-model clusters
  if (!hasMultiModelCluster && crossModelPairs.length > 0) {
    console.log(`Still no multi-model clusters, trying loose cross-model pass`);
    clusteringPass = 'loose';
    
    const ufLoose = new UnionFind(n);
    
    // First, apply strict threshold for same-model pairs
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (allRecs[i].sourceModel === allRecs[j].sourceModel) {
          const sim = calculateCombinedSimilarity(allRecs[i], allRecs[j]);
          if (sim >= threshold) {
            ufLoose.union(i, j);
          }
        }
      }
    }
    
    // Then, apply loose matching for cross-model pairs
    for (const pair of crossModelPairs) {
      const rec1 = allRecs[pair.i];
      const rec2 = allRecs[pair.j];
      
      // Extract action-target for both
      const { action: action1, target: target1 } = extractActionTarget(rec1.title);
      const { action: action2, target: target2 } = extractActionTarget(rec2.title);
      
      // Loose condition: same canonical action AND (at least 1 common keyword OR intent similarity > 0.15)
      const sameAction = action1 === action2 && action1.length > 0;
      const keywords1 = extractCanonicalKeywords(rec1.title);
      const keywords2 = extractCanonicalKeywords(rec2.title);
      const commonKeywords = [...keywords1].filter(k => keywords2.has(k));
      const intentSim = calculateIntentSimilarity(rec1, rec2);
      
      if (sameAction && (commonKeywords.length >= 1 || intentSim > 0.15)) {
        ufLoose.union(pair.i, pair.j);
        console.log(`Loose match: "${rec1.title.substring(0, 25)}" <-> "${rec2.title.substring(0, 25)}" (action: ${action1}, commonKW: ${commonKeywords.length}, intentSim: ${intentSim.toFixed(2)})`);
      }
    }
    
    clusters = ufLoose.getClusters();
  }
  
  // Convert to Map<clusterId, recommendations[]>
  const result = new Map<number, WeightedRecommendation[]>();
  for (const [clusterId, indices] of clusters) {
    result.set(clusterId, indices.map(i => allRecs[i]));
  }
  
  console.log(`Graph-based clustering (${clusteringPass} pass): ${n} recommendations -> ${result.size} clusters`);
  
  return result;
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
  
  // Debug: Log input recommendations per model
  const modelRecCounts = new Map<string, number>();
  for (const rec of allRecs) {
    modelRecCounts.set(rec.sourceModel, (modelRecCounts.get(rec.sourceModel) || 0) + 1);
  }
  console.log('Active models and recommendation counts:');
  for (const [model, count] of modelRecCounts) {
    const sampleTitles = allRecs
      .filter(r => r.sourceModel === model)
      .slice(0, 3)
      .map(r => r.title.substring(0, 40));
    console.log(`  ${model}: ${count} recs - samples: ${sampleTitles.join(' | ')}`);
  }
  
  // NEW: Use graph-based Union-Find clustering (order-independent)
  const clusters = clusterRecommendations(allRecs);
  
  const consensus: ComputedConsensus[] = [];
  const majority: ComputedConsensus[] = [];
  const dissent: ComputedDissent[] = [];
  
  for (const [_clusterId, recs] of clusters) {
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
      agreementLevel: uniqueModels.length === modelCount ? 'full' : 'partial',
      supportingModels: uniqueModels,
      weightedAgreement: uniqueModelWeights,
      confidence: avgConfidence,
      actionItems: bestRec.actionItems || []
    };
    
    // Classification Logic:
    // Agreement = at least 2 models agree (full or partial)
    // Dissent = only 1 model recommends this (true outlier)
    
    if (uniqueModels.length === modelCount) {
      // Full Consensus: All models agree
      computed.agreementLevel = 'full';
      consensus.push(computed);
      console.log(`Full consensus: "${bestRec.title.substring(0, 40)}" - ${uniqueModels.length}/${modelCount} models [${uniqueModels.join(', ')}]`);
    } else if (uniqueModels.length >= 2) {
      // Partial Consensus: >= 2 models agree (but not all)
      computed.agreementLevel = 'partial';
      consensus.push(computed);
      console.log(`Partial consensus: "${bestRec.title.substring(0, 40)}" - ${uniqueModels.length}/${modelCount} models [${uniqueModels.join(', ')}]`);
    } else if (uniqueModels.length === 1) {
      // True Dissent: Only 1 model recommends this
      dissent.push({
        topic: bestRec.title,
        positions: recs.map(r => ({
          modelName: r.sourceModel,
          position: r.description,
          reasoning: r.reasoning || '',
          weight: r.weight
        }))
      });
      console.log(`Dissent (outlier): "${bestRec.title.substring(0, 40)}" - only ${uniqueModels[0]}`);
    }
  }
  
  // Sort by weighted agreement (highest first)
  consensus.sort((a, b) => b.weightedAgreement - a.weightedAgreement);
  majority.sort((a, b) => b.weightedAgreement - a.weightedAgreement);
  
  console.log(`Final classification: ${consensus.length} agreements, ${dissent.length} dissents`);
  
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

// Gemini Response Schema (uppercase types for Gemini API)
function getGeminiResponseSchema(isPremium: boolean): any {
  const baseSchema = {
    type: "OBJECT",
    properties: {
      formattedConsensus: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            topic: { type: "STRING" },
            description: { type: "STRING" },
            confidence: { type: "NUMBER" },
            actionItems: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["topic", "description", "confidence", "actionItems"]
        }
      },
      formattedMajority: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            topic: { type: "STRING" },
            description: { type: "STRING" },
            supportingModels: { type: "ARRAY", items: { type: "STRING" } },
            confidence: { type: "NUMBER" }
          },
          required: ["topic", "description", "supportingModels", "confidence"]
        }
      },
      formattedDissent: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            topic: { type: "STRING" },
            positions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  modelName: { type: "STRING" },
                  position: { type: "STRING" },
                  reasoning: { type: "STRING" }
                },
                required: ["modelName", "position", "reasoning"]
              }
            }
          },
          required: ["topic", "positions"]
        }
      },
      formattedFinalRecommendation: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },
          confidence: { type: "NUMBER" },
          reasoning: { type: "STRING" },
          topActions: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["title", "description", "confidence", "reasoning", "topActions"]
      },
      synthesisReasoning: { type: "STRING" }
    },
    required: ["formattedConsensus", "formattedMajority", "formattedDissent", "formattedFinalRecommendation", "synthesisReasoning"]
  };
  
  if (isPremium) {
    baseSchema.properties = {
      ...baseSchema.properties,
      strategicAlternatives: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            scenario: { type: "STRING" },
            pros: { type: "ARRAY", items: { type: "STRING" } },
            cons: { type: "ARRAY", items: { type: "STRING" } },
            bestFor: { type: "STRING" }
          },
          required: ["scenario", "pros", "cons", "bestFor"]
        }
      },
      longTermOutlook: {
        type: "OBJECT",
        properties: {
          sixMonths: { type: "STRING" },
          twelveMonths: { type: "STRING" },
          keyMilestones: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["sixMonths", "twelveMonths", "keyMilestones"]
      },
      competitorInsights: { type: "STRING", maxLength: 800 }
    };
    baseSchema.required = [...baseSchema.required, "strategicAlternatives", "longTermOutlook", "competitorInsights"];
  }
  
  return baseSchema;
}

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
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();
      
      if (teamMember?.role === 'viewer') {
        return new Response(
          JSON.stringify({ error: 'Viewers cannot create analyses. Please upgrade your role or contact the team admin.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const startTime = Date.now();
    console.log(`Starting meta-evaluation for user ${user.id}, Premium: ${isPremium}, BusinessContext: ${!!businessContext}`);

    // ========== STEP 1: COLLECT AND WEIGHT ALL RECOMMENDATIONS ==========
    
    const allRecommendations: WeightedRecommendation[] = [];
    const modelSummaries: string[] = [];
    let allCitations: string[] = [];
    let totalWeight = 0;

    // Process each model's response
    for (const modelKey of (selectedModels || Object.keys(modelResponses))) {
      const response = modelResponses[modelKey];
      if (!response || response.error) {
        console.log(`Skipping ${modelKey}: ${response?.error || 'no response'}`);
        continue;
      }
      
      const weight = modelWeights?.[modelKey] || 33;
      totalWeight += weight;
      
      // TRIMMED model summaries for formatting prompt (reduce token usage)
      const summaryTrimmed = (response.summary || 'No response').substring(0, 300);
      const marketContextTrimmed = isPremium && response.marketContext 
        ? response.marketContext.substring(0, 200) 
        : '';
      
      modelSummaries.push(
        `${response.modelName} (${weight}%): ${summaryTrimmed}${marketContextTrimmed ? `\nMarket: ${marketContextTrimmed}` : ''}`
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

    // ========== STEP 3: LLM FOR FORMATTING ONLY (via direct Google AI API with Schema) ==========
    
    const riskContext = riskPref <= 2 ? 'conservative' : riskPref >= 4 ? 'aggressive' : 'balanced';
    
    // Build TRIMMED business context section (reduce token usage)
    let businessContextSection = '';
    if (businessContext && (businessContext.website_url || businessContext.website_summary || businessContext.industry)) {
      const contextParts: string[] = [];
      if (businessContext.industry) contextParts.push(`Industry: ${businessContext.industry}`);
      if (businessContext.company_stage) contextParts.push(`Stage: ${businessContext.company_stage}`);
      if (businessContext.team_size) contextParts.push(`Team: ${businessContext.team_size}`);
      if (businessContext.target_market) contextParts.push(`Market: ${businessContext.target_market}`);
      // Trim website summary to avoid token overflow
      if (businessContext.website_summary) {
        const trimmedSummary = businessContext.website_summary.substring(0, 500);
        contextParts.push(`Website Summary: ${trimmedSummary}...`);
      }
      
      businessContextSection = `\nBUSINESS CONTEXT:\n${contextParts.join('\n')}\n`;
    }
    
    // TRIMMED system prompt
    const systemPrompt = `You are a business writer. Polish the pre-computed analysis below.
${businessContextSection}
RULES:
1. Do NOT change which items are consensus/majority/dissent
2. Do NOT change titles, action items order, or confidence scores
3. ONLY improve language and add context
4. User has ${riskContext} risk tolerance

${isPremium ? `PREMIUM FEATURES REQUIRED (STRICT LENGTH LIMITS):
- strategicAlternatives: 2-3 scenarios with pros/cons/bestFor (each field max 150 chars)
- longTermOutlook: 6-month, 12-month projections + milestones (each max 200 chars)
- competitorInsights: max 600 chars STRICT of competitive analysis` : ''}`;

    // TRIMMED user prompt - only send essential data
    const consensusSummary = computedConsensus.map(c => ({
      topic: c.topic.substring(0, 100),
      description: c.description.substring(0, 200),
      confidence: c.confidence,
      actionItems: c.actionItems.slice(0, 3).map(a => a.substring(0, 100))
    }));
    
    // REDUCED: 3 dissents (from 5), 100 chars position (from 150) to prevent truncation
    const dissentSummary = computedDissent.slice(0, 3).map(d => ({
      topic: d.topic.substring(0, 80),
      positions: d.positions.slice(0, 2).map(p => ({
        modelName: p.modelName,
        position: p.position.substring(0, 100)
      }))
    }));
    
    const finalSummary = {
      title: computedFinal.title.substring(0, 100),
      description: computedFinal.description.substring(0, 300),
      topActions: computedFinal.topActions.slice(0, 5).map(a => a.substring(0, 100)),
      confidence: computedFinal.confidence
    };
    
    const userPrompt = `Polish these results (keep decisions intact):

CONSENSUS (${computedConsensus.length}):
${JSON.stringify(consensusSummary)}

MAJORITY (${computedMajority.length}):
${JSON.stringify(computedMajority.slice(0, 3))}

DISSENT (${computedDissent.length}):
${JSON.stringify(dissentSummary)}

FINAL:
${JSON.stringify(finalSummary)}

MODELS: ${modelSummaries.join('\n')}`;

    // Use direct Google AI API with response schema
    const directModelId = GOOGLE_MODEL_MAPPING['google/gemini-3-flash-preview'] || 'gemini-2.5-flash';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${directModelId}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": googleApiKey // Header-based auth
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
            maxOutputTokens: 8192, // Increased to prevent truncation (Gemini 2.5 Flash max)
            responseMimeType: "application/json",
            responseSchema: getGeminiResponseSchema(isPremium)
          }
        }),
      }
    );

    let formattedEvaluation: any = null;
    let formattingParsed = false;
    let formattingParseError: string | null = null;
    let formattingFinishReason: string | null = null;
    let formattingContentLength: number | null = null;

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Formatting API error (using computed fallback):', response.status, errorText.substring(0, 200));
      formattingParseError = `API error: ${response.status}`;
    } else {
      const data = await response.json();
      formattingFinishReason = data.candidates?.[0]?.finishReason || null;
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      formattingContentLength = content?.length || 0;
      
      if (content) {
        try {
          // With response schema, content should be clean JSON
          formattedEvaluation = JSON.parse(content);
          formattingParsed = true;
          console.log('Formatting parsed successfully (schema-enforced)');
        } catch (e) {
          formattingParseError = e instanceof Error ? e.message : String(e);
          console.log('[Formatting] Initial parse failed, trying recovery:', formattingParseError);
          console.log('Content preview:', content?.substring(0, 300));
          
          // Fallback 1: try extracting JSON from potential markdown
          try {
            const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
              formattedEvaluation = JSON.parse(codeBlockMatch[1]);
              formattingParsed = true;
              formattingParseError = 'Recovered from code block';
              console.log('Recovered JSON from code block');
            }
          } catch {
            // Continue to next recovery attempt
          }
          
          // Fallback 2: Sanitize strings + String-aware truncation repair
          if (!formattingParsed) {
            try {
              // Step 1: Sanitize strings (escapes control chars, closes truncated strings)
              const sanitized = sanitizeJsonStrings(content);
              
              // Step 2: Repair structure (close brackets/braces - string-aware)
              const repaired = repairTruncatedJSONStringAware(sanitized);
              
              const parsed = JSON.parse(repaired);
              if (parsed && typeof parsed === 'object') {
                formattedEvaluation = parsed;
                formattingParsed = true;
                formattingParseError = 'Recovered via sanitize+repair';
                console.log('Recovered JSON via sanitize+repair');
              }
            } catch (recoveryError) {
              // Keep original error - continuing without premium polish
              console.log('[Formatting] Recovery failed, continuing without premium polish:', recoveryError instanceof Error ? recoveryError.message : String(recoveryError));
            }
          }
        }
      }
    }

    // ========== STEP 4: MERGE COMPUTED + FORMATTED (computed is ALWAYS source of truth) ==========
    // CRITICAL: Computed lists are the iteration basis - LLM can only polish text, never remove items
    
    const finalEvaluation = {
      // CONSENSUS: Iterate over computedConsensus, optionally enhance with LLM formatting
      consensusPoints: computedConsensus.map((computed, i) => {
        const formatted = formattedEvaluation?.formattedConsensus?.[i];
        return {
          topic: computed.topic, // ALWAYS computed
          description: formatted?.description || computed.description,
          agreementLevel: computed.agreementLevel, // ALWAYS computed
          supportingModels: computed.supportingModels, // ALWAYS computed
          confidence: computed.confidence, // ALWAYS computed
          actionItems: computed.actionItems // ALWAYS computed (weight-ordered)
        };
      }),
      // MAJORITY: Same pattern - computed is basis
      majorityPoints: computedMajority.map((computed, i) => {
        const formatted = formattedEvaluation?.formattedMajority?.[i];
        return {
          topic: computed.topic, // ALWAYS computed
          description: formatted?.description || computed.description,
          supportingModels: computed.supportingModels, // ALWAYS computed
          confidence: computed.confidence // ALWAYS computed
        };
      }),
      // DISSENT: Same pattern - computed is basis
      dissentPoints: computedDissent.map((computed, i) => {
        const formatted = formattedEvaluation?.formattedDissent?.[i];
        return {
          topic: computed.topic, // ALWAYS computed
          positions: computed.positions.map((pos, j) => ({
            modelName: pos.modelName, // ALWAYS computed
            position: formatted?.positions?.[j]?.position || pos.position,
            reasoning: formatted?.positions?.[j]?.reasoning || pos.reasoning,
            weight: pos.weight // ALWAYS computed
          }))
        };
      }),
      finalRecommendation: {
        title: computedFinal.title, // ALWAYS computed
        description: formattedEvaluation?.formattedFinalRecommendation?.description || computedFinal.description,
        confidence: computedFinal.confidence, // ALWAYS computed
        reasoning: formattedEvaluation?.formattedFinalRecommendation?.reasoning || computedFinal.reasoning,
        topActions: computedFinal.topActions, // ALWAYS computed (weight-ordered)
        sourceModels: computedFinal.sourceModels // ALWAYS computed
      },
      overallConfidence: computedFinal.confidence,
      synthesisReasoning: formattedEvaluation?.synthesisReasoning || 
        `Analysis weighted by user configuration: ${dominantModel ? `${dominantModel.name} (${dominantModel.weight}%) as dominant` : 'balanced weights'}`,
      // Premium features - null if LLM formatting failed (UI handles gracefully)
      ...(isPremium && {
        strategicAlternatives: formattedEvaluation?.strategicAlternatives || null,
        longTermOutlook: formattedEvaluation?.longTermOutlook || null,
        competitorInsights: formattedEvaluation?.competitorInsights || null
      })
    };
    
    console.log('Merge complete - computed as source of truth:', {
      consensusCount: finalEvaluation.consensusPoints.length,
      majorityCount: finalEvaluation.majorityPoints.length,
      dissentCount: finalEvaluation.dissentPoints.length,
      formattingParsed,
      formattingFinishReason,
      formattingContentLength
    });
    
    // Log premium feature status
    if (isPremium) {
      console.log('Premium features status:', {
        strategicAlternatives: formattedEvaluation?.strategicAlternatives ? 'available' : 'null',
        longTermOutlook: formattedEvaluation?.longTermOutlook ? 'available' : 'null',
        competitorInsights: formattedEvaluation?.competitorInsights ? 'available' : 'null'
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
          computedDissentCount: computedDissent.length,
          formattingParsed,
          formattingParseError,
          formattingFinishReason,
          formattingContentLength,
          formattedConsensusLength: formattedEvaluation?.formattedConsensus?.length ?? null,
          formattedDissentLength: formattedEvaluation?.formattedDissent?.length ?? null
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
