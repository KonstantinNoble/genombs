
# Code-Analyse Pipeline vereinheitlichen

## Gefundene Probleme

### Problem 1: Zwei inkompatible Code-Analyse-Formate
Der `process-analysis-queue` Worker benutzt den alten `ANALYSIS_SYSTEM_PROMPT`, der fuer `codeAnalysis` nur ein primitives Format anfordert:
- `codeQuality`: eine einzelne Zahl (kein Objekt)
- `securityFlags` / `performanceFlags` statt Sub-Scores mit `score`, `issues`, `recommendations`
- Keine Kategorien fuer Security, Performance, Accessibility, Maintainability, SEO

Der `add-github-analysis` Endpunkt benutzt dagegen `buildCodeAnalysisPrompt` mit dem detaillierten 6-Kategorien-Format.

**Auswirkung:** Wenn ein User bei der Erstanalyse eine GitHub-URL angibt, kommen die Code-Analyse-Daten im alten Format. Das Frontend zeigt dann Security=0, Performance=0, Accessibility=0, Maintainability=0, SEO=0.

### Problem 2: Keine Validierung im Queue-Pfad
`process-analysis-queue` speichert `analysisResult.codeAnalysis` direkt ohne Validierung (Zeile 697). Der `add-github-analysis` hat bereits `validateCodeAnalysis()`, aber der Queue-Pfad nutzt diese nicht.

### Problem 3: Doppelter Code
Beide Edge Functions duplizieren den gesamten Model-Router (analyzeWithGemini, analyzeWithOpenAI, etc.) und parseJsonResponse. Das ist wartungsintensiv und fehleranfaellig.

## Loesung

### Aenderung 1: `process-analysis-queue/index.ts` -- Code-Analyse-Prompt aktualisieren

Den `ANALYSIS_SYSTEM_PROMPT` so aendern, dass er bei vorhandenem Source Code das gleiche detaillierte Format wie `add-github-analysis` anfordert. Konkret den Abschnitt ab Zeile 173 ersetzen:

**Vorher (Zeilen 173-186):**
```
If SOURCE CODE data is provided (from a GitHub repository), also evaluate and add a "codeAnalysis" key:
{
  "codeAnalysis": {
    "codeQuality": N,
    "techStack": ["React", "Tailwind", "TypeScript"],
    "securityFlags": ["No CSP header configured", "API keys in client code"],
    "performanceFlags": ["Large bundle size", "No code splitting"]
  }
}
```

**Nachher:**
```
If SOURCE CODE data is provided (from a GitHub repository), also evaluate and add a "codeAnalysis" key with this exact structure:
{
  "codeAnalysis": {
    "summary": "Brief overall assessment (2-3 sentences)",
    "techStack": ["detected technologies"],
    "codeQuality": {
      "score": 0-100,
      "strengths": ["specific positive findings"],
      "weaknesses": ["specific issues found"]
    },
    "security": {
      "score": 0-100,
      "issues": ["security concerns found"],
      "recommendations": ["actionable fixes"]
    },
    "performance": {
      "score": 0-100,
      "issues": ["performance anti-patterns"],
      "recommendations": ["optimization suggestions"]
    },
    "accessibility": {
      "score": 0-100,
      "issues": ["accessibility problems"],
      "recommendations": ["improvements"]
    },
    "maintainability": {
      "score": 0-100,
      "issues": ["maintainability concerns"],
      "recommendations": ["refactoring suggestions"]
    },
    "seo": {
      "score": 0-100,
      "codeIssues": ["SEO-related code issues"],
      "recommendations": ["SEO improvements"]
    }
  }
}
```

### Aenderung 2: `process-analysis-queue/index.ts` -- Validierung hinzufuegen

Die gleiche `validateCodeAnalysis()` Funktion aus `add-github-analysis` in den Queue-Worker uebernehmen. An Zeile 696-698 aendern:

**Vorher:**
```typescript
if (githubData && analysisResult.codeAnalysis) {
  updatePayload.code_analysis = analysisResult.codeAnalysis;
}
```

**Nachher:**
```typescript
if (githubData && analysisResult.codeAnalysis) {
  updatePayload.code_analysis = validateCodeAnalysis(analysisResult.codeAnalysis);
}
```

Plus die `validateCodeAnalysis`-Funktion (identisch zu der in `add-github-analysis`) vor der `processQueue`-Funktion einfuegen.

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `supabase/functions/process-analysis-queue/index.ts` | Code-Analyse-Prompt vereinheitlichen + Validierung |

## Was sich NICHT aendert
- `add-github-analysis/index.ts` -- bereits korrekt mit neuem Format + Validierung
- `CodeAnalysisCard.tsx` -- bereits korrekt, erwartet das neue Format
- Bestehende Analysen aus Weg 2 bleiben korrekt

## Hinweis
Bereits gespeicherte Analysen, die ueber Weg 1 (Queue) erstellt wurden, behalten ihr altes Format. Nur neue Analysen werden das korrekte Format haben.
