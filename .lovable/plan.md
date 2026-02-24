

# Scoring-Prompts ueberarbeiten: Mehr KI-Einfluss, weniger starre Mathematik

## Problem

Die Kategorien `findability` und `mobileUsability` verwenden starre additive Punktesysteme ("+15 fuer Title Tag", "+25 fuer Viewport"), die die KI zwingen, mechanisch Punkte zu zaehlen statt die tatsaechliche Qualitaet zu bewerten. Die drei anderen Kategorien (`offerClarity`, `trustProof`, `conversionReadiness`) nutzen bereits holistische Scoring-Guides -- und genau das soll fuer ALLE Kategorien gelten.

Zusaetzlich gibt es keine Server-seitige Validierung: Der `overallScore` wird blind von der KI uebernommen statt als Durchschnitt berechnet.

## Loesung

### 1. Prompt ueberarbeiten (beide Dateien)

Alle 5 Kategorien bekommen **holistische Scoring-Guides** (wie offerClarity bereits hat). Die KI erhaelt Orientierungspunkte und Faktoren, aber keine starren "+X Punkte"-Formeln. Die HARD CAPs und PageSpeed-Anchoring bleiben als Leitplanken bestehen, aber weicher formuliert.

**Neuer Prompt-Stil fuer findability (Beispiel):**
```text
**findability** (Technical SEO):
Evaluate the website's discoverability based on the provided SEO metadata.
Consider: title tag quality, meta description, Open Graph tags, structured data,
canonical URL, robots configuration, internal/external linking, content relevance.
SCORING GUIDE: 80-100 = comprehensive SEO setup with all major elements present
and well-crafted. 60-79 = good foundation but missing some elements.
40-59 = basic presence but significant gaps. 20-39 = minimal SEO effort.
0-19 = virtually no SEO optimization.
IMPORTANT: If title AND meta description are both missing, score should
generally not exceed 35. Missing elements are real weaknesses.
```

**Neuer Prompt-Stil fuer mobileUsability (Beispiel):**
```text
**mobileUsability** (Mobile readiness):
Assess how well the site is prepared for mobile users based on available data.
Consider: viewport configuration, heading hierarchy, content structure,
navigation patterns, responsive indicators, touch-friendliness.
SCORING GUIDE: 80-100 = clearly mobile-optimized with proper viewport and
excellent structure. 60-79 = good mobile readiness with minor gaps.
40-59 = basic mobile support but notable issues. 20-39 = poor mobile
experience likely. 0-19 = no mobile consideration evident.
IMPORTANT: If viewport meta is not found in the HTML, be cautious --
score should generally stay below 60 unless content structure is exceptional.
```

### 2. Server-seitige Score-Validierung (process-analysis-queue)

Nach der KI-Antwort wird eine `validateAndNormalizeScores()` Funktion eingefuegt:

```text
function validateAndNormalizeScores(result) {
  const clamp = (v) => {
    const n = Number(v);
    return isNaN(n) ? 50 : Math.max(0, Math.min(100, Math.round(n)));
  };

  const cs = result.categoryScores ?? {};
  result.categoryScores = {
    findability: clamp(cs.findability),
    mobileUsability: clamp(cs.mobileUsability),
    offerClarity: clamp(cs.offerClarity),
    trustProof: clamp(cs.trustProof),
    conversionReadiness: clamp(cs.conversionReadiness),
  };

  // overallScore = true mathematical average (never trust AI's number)
  const values = Object.values(result.categoryScores);
  result.overallScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return result;
}
```

Dies wird in Zeile ~877 (nach `routeAnalysis()`) aufgerufen, BEVOR die Daten in die DB geschrieben werden.

### 3. PageSpeed-Anchoring beibehalten aber entschaerfen

Statt "MUST be within +/-8 points" wird es zu "should strongly consider" -- die KI bekommt die PageSpeed-Daten als Referenz, wird aber nicht mechanisch daran gebunden.

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `supabase/functions/process-analysis-queue/index.ts` | Prompt holistic umschreiben, `validateAndNormalizeScores()` einfuegen nach AI-Response |
| `supabase/functions/analyze-website/index.ts` | Gleicher Prompt (Kopie synchron halten) |

## Was sich NICHT aendert

- Die JSON-Ausgabestruktur bleibt identisch
- Die PageSpeed-Daten werden weiterhin an den Prompt angehaengt
- Die codeAnalysis-Validierung bleibt
- Die Credit-Logik bleibt unveraendert

