
# Revert: Code-Analyse-Kosten wiederherstellen + Chat.tsx fixen

## Was ist passiert?

Der letzte Fix war falsch. Die Code-Analyse laeuft ueber `add-github-analysis` (eigener Edge Function Flow), **nicht** ueber `process-analysis-queue`. Das Backend zieht dort tatsaechlich 12/12/16/16/19 Credits ab. Durch den letzten Fix zeigt das Frontend jetzt nur 9/9/12/12/14 an -- der User sieht also weniger als er zahlt.

## Aenderungen

### 1. `src/lib/constants.ts` -- Code-Analyse-Kosten wiederherstellen

Die `codeAnalysis`-Eintraege und die Funktion `getCodeAnalysisCreditCost` muessen zurueck:

```typescript
export const MODEL_CREDIT_COSTS = {
  chat: { ... },        // bleibt
  analysis: { ... },    // bleibt
  codeAnalysis: {       // WIEDERHERSTELLEN
    "gemini-flash": 12,
    "gpt-mini": 12,
    "gpt": 16,
    "claude-sonnet": 16,
    "perplexity": 19,
  },
} as const;

// WIEDERHERSTELLEN
export function getCodeAnalysisCreditCost(modelId: string): number {
  return (MODEL_CREDIT_COSTS.codeAnalysis as Record<string, number>)[modelId] ?? 12;
}
```

### 2. `src/components/chat/ChatInput.tsx` -- getCodeAnalysisCreditCost zurueck

- Import von `getCodeAnalysisCreditCost` wieder hinzufuegen
- `getAnalysisCreditCost(selectedModel)` in Zeile 314 zurueck aendern zu `getCodeAnalysisCreditCost(selectedModel)`

### 3. `src/pages/Chat.tsx` -- Hartkodiertes Modell fixen

Zeile 362: `selectedModel="gemini-flash"` aendern zu `selectedModel={selectedModel}`, damit InlineUrlPrompt die korrekten Kosten fuer das aktuell gewaehlte Modell anzeigt.

## Zusammenfassung

| Datei | Aenderung |
|---|---|
| `src/lib/constants.ts` | `codeAnalysis`-Block und `getCodeAnalysisCreditCost` wiederherstellen |
| `src/components/chat/ChatInput.tsx` | `getCodeAnalysisCreditCost` Import + Verwendung wiederherstellen |
| `src/pages/Chat.tsx` | `selectedModel={selectedModel}` statt `"gemini-flash"` |
