

# Umfassender Fix: Verbleibende Credit-Diskrepanzen

## Status nach den bisherigen Fixes

| Komponente | Status |
|---|---|
| `src/lib/constants.ts` | OK -- `codeAnalysis` (12/12/16/16/19) und `getCodeAnalysisCreditCost` vorhanden |
| `src/components/chat/ChatInput.tsx` | OK -- verwendet `getCodeAnalysisCreditCost` fuer GitHub Deep Analysis Dialog |
| `src/pages/Chat.tsx` | OK -- uebergibt dynamisches `selectedModel` an InlineUrlPrompt |
| `supabase/functions/add-github-analysis/index.ts` | OK -- Backend hat 12/12/16/16/19 (Frontend passt sich an) |

## Verbleibendes Problem: InlineUrlPrompt "Code Analysis" Tab

Die Komponente `src/components/chat/InlineUrlPrompt.tsx` hat einen **Code Analysis** Tab (Zeile 89-99), der folgende Probleme hat:

### Problem 1: Keine Kostenanzeige

Der Code Analysis Tab zeigt dem User **nicht**, wie viele Credits die Analyse kostet. Der Button sagt nur "Analyze Code" ohne Creditangabe. Der Website Analysis Tab zeigt dagegen korrekt die Kosten pro URL.

### Problem 2: Keine Credit-Pruefung

Die Variable `canStartGithubOnly` (Zeile 60) prueft nur ob die URL gueltig ist -- **nicht** ob der User genuegend Credits hat:

```text
const canStartGithubOnly = githubUrl.trim() && isValidGithubUrl(githubUrl) && ... ;
```

Das heisst: Ein User mit 0 Credits kann den Button klicken und bekommt erst einen Backend-Fehler.

### Problem 3: Falscher Import

`InlineUrlPrompt` importiert nur `getAnalysisCreditCost` (9/9/12/12/14), aber fuer Code-Analyse muss `getCodeAnalysisCreditCost` (12/12/16/16/19) verwendet werden.

---

## Aenderungen

### `src/components/chat/InlineUrlPrompt.tsx`

1. **Import erweitern**: `getCodeAnalysisCreditCost` zusaetzlich importieren
2. **Credit-Kosten berechnen**: `const codeAnalysisCost = getCodeAnalysisCreditCost(selectedModel)` hinzufuegen
3. **Credit-Pruefung**: `canStartGithubOnly` um Credit-Check erweitern:
   ```text
   const notEnoughForCode = remainingCredits < codeAnalysisCost;
   const canStartGithubOnly = ... && !notEnoughForCode;
   ```
4. **Kostenanzeige im UI**: Text hinzufuegen der die Kosten anzeigt (analog zum ChatInput Dialog):
   ```text
   "Costs X credits with [Model]"
   ```
5. **Credit-Warnung**: Wenn nicht genug Credits, Warnung anzeigen:
   ```text
   "Not enough credits (X needed, Y remaining)"
   ```
6. **Button-Text**: Credits im Button anzeigen:
   ```text
   "Analyze Code (X Credits)"
   ```

---

## Zusammenfassung

| Datei | Aenderung |
|---|---|
| `src/components/chat/InlineUrlPrompt.tsx` | `getCodeAnalysisCreditCost` importieren, Credit-Check + Kostenanzeige + Warnung fuer Code Analysis Tab |

Es ist nur eine Datei betroffen. Alle anderen Dateien sind bereits korrekt.

