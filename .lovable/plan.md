

# AI Summary ohne Credit-Abzug: Inklusiv bei jeder Analyse

## Uebersicht

Die AI Summary (automatische Zusammenfassung nach jeder Website- oder Code-Analyse) soll kuenftig **keine Credits mehr kosten**. Sie ist im Analyse-Preis inbegriffen. Normale Chat-Nachrichten kosten weiterhin Credits.

## Technische Umsetzung

### 1. Chat Edge Function: `skipCredits`-Flag akzeptieren

**Datei:** `supabase/functions/chat/index.ts`

- In der Main-Handler-Funktion (Zeile ~422) wird ein neues optionales Feld `skipCredits` aus dem Request-Body gelesen
- Wenn `skipCredits === true`, wird `checkAndDeductCredits()` komplett uebersprungen
- `creditsDeducted` bleibt `false`, sodass bei Fehlern kein Refund versucht wird
- Sicherheitsmassnahme: `skipCredits` wird nur erlaubt, wenn der User authentifiziert ist (Token wird wie bisher geprueft)

```text
// Zeile ~422: Body-Parsing erweitern
const { messages, conversationId, model: modelKey, skipCredits } = await req.json();

// Zeile ~475: Credit-Check nur wenn nicht skipCredits
if (!skipCredits) {
  const creditResult = await checkAndDeductCredits(...);
  if (!creditResult.ok) { return ... }
  creditsDeducted = true;
  refundUserId = user.id;
}
```

### 2. streamChat API: `skipCredits`-Parameter durchreichen

**Datei:** `src/lib/api/chat-api.ts`

- `streamChat()` bekommt einen neuen optionalen Parameter `skipCredits?: boolean`
- Dieser wird im Request-Body an die Edge Function weitergegeben

```text
export async function streamChat({
  messages, conversationId, accessToken, model, onDelta, onDone,
  skipCredits,  // NEU
}: {
  // ...existing types...
  skipCredits?: boolean;  // NEU
}) {
  body: JSON.stringify({ messages, conversationId, model, skipCredits }),
}
```

### 3. generateSummary: `skipCredits: true` setzen

**Datei:** `src/hooks/useChatMessages.ts`

- In der `generateSummary`-Funktion (Zeile ~223) wird `skipCredits: true` an `streamChat()` uebergeben
- Der gesamte `insufficient_credits`-Error-Handler fuer die Summary (Zeilen 247-262) kann entfernt werden, da dieser Fall nicht mehr eintreten kann
- Ein einfacher `catch`-Block fuer unerwartete Fehler bleibt bestehen

### 4. handleGithubDeepAnalysis: Summary ebenfalls kostenlos

In derselben Datei wird die GitHub-Deep-Analysis-Summary (falls vorhanden) ebenfalls mit `skipCredits: true` aufgerufen, da die Summary Teil der Analyse ist.

## Was sich NICHT aendert

- Normale Chat-Nachrichten (`handleSend`) kosten weiterhin Credits
- Die Analyse selbst (Website/Code) kostet weiterhin Credits (in analyze-website/process-analysis-queue)
- Die Credit-Fehlermeldungen fuer normale Chat-Nachrichten bleiben wie zuletzt implementiert (Free vs Premium differenziert)

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `supabase/functions/chat/index.ts` | `skipCredits`-Flag aus Body lesen, Credit-Check bedingt ueberspringen |
| `src/lib/api/chat-api.ts` | `skipCredits`-Parameter an `streamChat()` hinzufuegen |
| `src/hooks/useChatMessages.ts` | `skipCredits: true` bei `generateSummary` setzen, unnoetigen Error-Handler entfernen |

