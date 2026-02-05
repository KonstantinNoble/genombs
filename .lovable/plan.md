

# Optimiertes Semantisches Title-Matching (Finale Version)

## Zusammenfassung

Implementierung eines robusten Hybrid-Matching-Algorithmus für die `meta-evaluation` Edge Function mit allen technischen Feinschliff-Korrekturen.

---

## Änderungen gegenüber dem vorherigen Plan

| Punkt | Vorher | Nachher |
|-------|--------|---------|
| ACTION_VERBS | Gemischte Roh- und Canonical-Formen | Nur kanonische Formen |
| Target-Extraktion | Wert-basierter Filter | Index-basierter Filter |
| Bonus | Multiplikativ (`* 1.2`) | Additiv (`+ 0.15`) |
| Fallback | Kein echter Fallback | Fallback bei < 2 Keywords |
| Normalisierung | Inkonsistent (`a-z` vs `a-z0-9`) | Einheitlich `a-z0-9` |

---

## Technische Implementation

### 1. Einheitliche Normalisierungsfunktion

```typescript
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}
```

### 2. Canonical Token Map

```typescript
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
```

### 3. ACTION_VERBS nur in kanonischer Form

```typescript
// NUR kanonische Verben - keine Synonyme mehr im Set
const ACTION_VERBS = new Set([
  'scale', 'focus', 'launch', 'build', 'validate', 'hire', 'develop',
  'optimize', 'reduce', 'improve', 'create', 'establish', 'implement',
  'integrate', 'invest', 'acquire', 'retain', 'enter', 'dominate'
]);
```

### 4. Action + Target Extraktion (Index-basiert)

```typescript
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
```

### 5. Verbesserter Similarity-Algorithmus

```typescript
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
```

### 6. Erhöhte Schwelle

```typescript
function findSimilarGroup(
  title: string, 
  existingGroups: Map<string, WeightedRecommendation[]>,
  threshold: number = 0.50
): string | null {
  for (const [groupTitle] of existingGroups) {
    if (calculateEnhancedSimilarity(title, groupTitle) >= threshold) {
      return groupTitle;
    }
  }
  return null;
}
```

---

## Erwartete Verbesserungen

| Szenario | Vorher | Nachher |
|----------|--------|---------|
| "Focus on Customer Acquisition" vs "Focus on Customer Retention" | Gruppiert (50%) | Getrennt (30% nach Penalty) |
| "Scale Engineering Team" vs "Scale Sales Team" | Gruppiert (50%) | Getrennt (Penalty greift) |
| "Validate Market Fit" vs "Test Market Assumptions" | Getrennt (25%) | Gruppiert (Kanonisierung) |
| "Scale Engineering Team" vs "Grow Engineering Org" | Getrennt (33%) | Gruppiert (Kanonisierung) |
| "MVP launch" vs "Launch MVP" | Instabil | Stabil (Fallback greift) |

---

## Dateiänderungen

| Datei | Änderung |
|-------|----------|
| `supabase/functions/meta-evaluation/index.ts` | Zeilen 136-178: Bestehende Funktionen ersetzen durch neue Implementation |

---

## Algorithmus-Eigenschaften

| Eigenschaft | Status |
|-------------|--------|
| Deterministisch | Ja |
| Transitiv (Synonyme) | Ja (durch Kanonisierung) |
| Stabil bei kurzen Titeln | Ja (Fallback) |
| Konsistente Normalisierung | Ja (einheitliche Funktion) |
| Index-basierte Filterung | Ja (keine Wert-Kollisionen) |

