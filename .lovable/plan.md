

# Code Analysis Bugs beheben

## Bug 1 (Kosmetisch): Code Quality Score gleich gross wie Sub-Scores

Der grosse Score-Ring fuer "Code Quality" ist nicht falsch, aber irrefuehrend weil er groesser dargestellt wird als die anderen Scores. 

**Loesung:** Code Quality wird in die Sub-Scores-Reihe aufgenommen und hat die gleiche Groesse (42px statt 56px). Der separate grosse Ring und der Header-Bereich werden entfernt -- alle 6 Scores stehen gleichberechtigt nebeneinander.

**Datei:** `src/components/dashboard/CodeAnalysisCard.tsx`

## Bug 2 (Echt): SEO Score ist immer 0

Der AI-Prompt fordert fuer SEO kein `score`-Feld an. Das Frontend liest `ca.seo?.score`, bekommt `undefined` und zeigt 0.

**Loesung:** Im Prompt `"score": 0-100` zum SEO-Objekt hinzufuegen.

**Datei:** `supabase/functions/add-github-analysis/index.ts` (Zeilen 62-65)

## Bug 3 (Echt): Keine Validierung der AI-Antwort

Die AI-Antwort wird direkt in die Datenbank geschrieben ohne zu pruefen ob Scores numerisch sind, Felder fehlen oder das Format stimmt.

**Loesung:** Eine `validateCodeAnalysis()`-Funktion einbauen, die:
- Alle Scores auf Zahlen 0-100 clamped (fehlende Werte bekommen Default 50)
- Arrays validiert (nicht-String-Eintraege entfernt)
- Fehlende Objekte mit leeren Defaults auffuellt

**Datei:** `supabase/functions/add-github-analysis/index.ts` (vor Zeile 314)

## Technische Details

### CodeAnalysisCard.tsx -- Alle Scores gleich gross

```typescript
// Code Quality wird Teil der subScores-Reihe
const subScores = [
  { label: "Code Quality", score: overallScore },
  { label: "Security", score: extractScore(ca.security) },
  { label: "Performance", score: extractScore(ca.performance) },
  { label: "Accessibility", score: extractScore(ca.accessibility) },
  { label: "Maintainability", score: extractScore(ca.maintainability) },
  { label: "SEO", score: seoScore },
];

// Header-Bereich wird vereinfacht (kein grosser Ring mehr)
// Alle Scores werden als gleichgrosse Ringe (size=42) in einer Reihe dargestellt
```

### add-github-analysis/index.ts -- SEO-Score im Prompt

```json
"seo": {
  "score": 0-100,
  "codeIssues": ["SEO-related code issues found"],
  "recommendations": ["specific SEO improvements to implement in code"]
}
```

### add-github-analysis/index.ts -- Validierungsfunktion

```typescript
function validateCodeAnalysis(raw: any): Record<string, unknown> {
  const clamp = (v: unknown, fallback = 50) => {
    const n = Number(v);
    return isNaN(n) ? fallback : Math.max(0, Math.min(100, Math.round(n)));
  };
  const ensureArr = (v: unknown) =>
    Array.isArray(v) ? v.filter(i => typeof i === "string") : [];
  const ensureSub = (obj: any) => ({
    score: clamp(obj?.score),
    issues: ensureArr(obj?.issues),
    recommendations: ensureArr(obj?.recommendations),
  });

  return {
    summary: typeof raw?.summary === "string" ? raw.summary : "",
    techStack: ensureArr(raw?.techStack),
    codeQuality: {
      score: clamp(raw?.codeQuality?.score ?? raw?.codeQuality),
      strengths: ensureArr(raw?.codeQuality?.strengths),
      weaknesses: ensureArr(raw?.codeQuality?.weaknesses),
    },
    security: ensureSub(raw?.security),
    performance: ensureSub(raw?.performance),
    accessibility: ensureSub(raw?.accessibility),
    maintainability: ensureSub(raw?.maintainability),
    seo: {
      score: clamp(raw?.seo?.score),
      codeIssues: ensureArr(raw?.seo?.codeIssues ?? raw?.seo?.issues),
      recommendations: ensureArr(raw?.seo?.recommendations),
    },
    strengths: ensureArr(raw?.strengths ?? raw?.codeQuality?.strengths),
    weaknesses: ensureArr(raw?.weaknesses ?? raw?.codeQuality?.weaknesses),
    securityIssues: ensureArr(raw?.securityIssues ?? raw?.security?.issues),
    recommendations: ensureArr(raw?.recommendations),
  };
}

// Zeile 311 aendern:
const rawAnalysis = await routeAnalysis(selectedModel, aiPrompt);
const codeAnalysis = validateCodeAnalysis(rawAnalysis);
```

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/dashboard/CodeAnalysisCard.tsx` | Code Quality in Sub-Score-Reihe, alle gleich gross |
| `supabase/functions/add-github-analysis/index.ts` | SEO-Score im Prompt + Validierungsfunktion |

