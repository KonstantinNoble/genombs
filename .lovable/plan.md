

# Fix 5: Frontend-Kostenanzeige fuer Code-Analyse an Backend anpassen

## Problem

Das Backend (`process-analysis-queue`, Zeile 906) zieht bei **jeder** Analyse -- egal ob mit oder ohne GitHub-Repo -- immer `getAnalysisCreditCost(model)` ab:

| Modell | Backend zieht ab | Frontend zeigt an |
|---|---|---|
| gemini-flash | 9 | 12 |
| gpt-mini | 9 | 12 |
| gpt | 12 | 16 |
| claude-sonnet | 12 | 16 |
| perplexity | 14 | 19 |

Der User sieht hoehere Kosten als tatsaechlich abgezogen werden.

## Loesung

**Frontend an Backend anpassen**: Die Code-Analyse (GitHub Deep Analysis) kostet im Backend genau so viel wie eine normale Analyse. Also soll das Frontend auch `getAnalysisCreditCost` verwenden statt `getCodeAnalysisCreditCost`.

## Aenderungen

### `src/components/chat/ChatInput.tsx`

- Import von `getCodeAnalysisCreditCost` entfernen
- Zeile 314: `getCodeAnalysisCreditCost(selectedModel)` ersetzen durch `getAnalysisCreditCost(selectedModel)`

Das betrifft 3 Stellen in der UI:
1. Tooltip-Text ("Costs X credits with ...")
2. Credit-Warnung ("Not enough credits (X needed, ...)")
3. Button-Text ("Start Deep Analysis (X Credits)")

### `src/lib/constants.ts` (optional, Aufraeum-Arbeit)

Die Funktion `getCodeAnalysisCreditCost` und die `codeAnalysis`-Eintraege in `MODEL_CREDIT_COSTS` werden nicht mehr verwendet und koennen entfernt werden, um Verwirrung zu vermeiden.

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/components/chat/ChatInput.tsx` | `getCodeAnalysisCreditCost` durch `getAnalysisCreditCost` ersetzen |
| `src/lib/constants.ts` | Unbenutzten `codeAnalysis`-Block und `getCodeAnalysisCreditCost` entfernen |
