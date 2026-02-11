

# Fix: KI-Einleitung und Löschung alter Profile

## Problem 1: KI stellt sich vor / zitiert die Analyse

Die KI antwortet mit "As an expert website & marketing analyst at Synoptas, I've thoroughly reviewed..." -- das passiert aus zwei Gruenden:

1. Der **System-Prompt** (Zeile 10) sagt woertlich "You are an expert website & marketing analyst at Synoptas" und die KI wiederholt das.
2. Der **Summary-Prompt** (Zeile 254 in Chat.tsx) sagt "Summarize the results" -- die KI fasst dann brav alles zusammen, anstatt die Daten als Kontext zu nutzen.

### Loesung

**`supabase/functions/chat/index.ts` -- System-Prompt (Zeile 10-20)**

Neue Anweisung hinzufuegen:
- "NEVER introduce yourself, state your role, or say things like 'As an expert...' or 'I've reviewed the profiles'"
- "Use the data as background context to answer naturally and directly -- do NOT summarize or repeat the analysis data back to the user unless explicitly asked"

**`src/pages/Chat.tsx` -- Summary-Prompt (Zeile 254)**

Den automatischen Summary-Prompt umformulieren von "Summarize the results" zu etwas wie:
- "Based on the analysis results, give the user a brief, actionable overview. Focus on the most important finding and top 3 action items. Do NOT repeat scores or list all data -- be conversational and direct."

---

## Problem 2: Alte Profile werden nicht geloescht

Die Funktion `deleteProfilesForConversation` in `chat-api.ts` (Zeile 87-99) hat **keine Fehlerbehandlung**. Wenn die Loeschung fehlschlaegt (z.B. durch Netzwerk- oder Auth-Probleme), wird der Fehler stillschweigend ignoriert und die neuen Profile werden neben den alten erstellt.

### Loesung

**`src/lib/api/chat-api.ts` -- deleteProfilesForConversation (Zeile 87-99)**

- Fehlerbehandlung fuer beide DELETE-Aufrufe (improvement_tasks und website_profiles) hinzufuegen
- Fehler loggen und werfen, damit der Aufrufer weiss, dass die Loeschung fehlgeschlagen ist

**`src/pages/Chat.tsx` -- handleScan (Zeile 220-223)**

- Try-Catch um den Delete-Aufruf, mit Toast-Fehlermeldung falls Loeschung fehlschlaegt
- Analyse trotzdem fortsetzen, aber den User informieren

---

## Zusammenfassung

| Datei | Aenderung |
|---|---|
| `supabase/functions/chat/index.ts` | System-Prompt: keine Selbstvorstellung, Daten als Kontext nutzen |
| `src/pages/Chat.tsx` | Summary-Prompt umformulieren: direkt und aktionsorientiert |
| `src/lib/api/chat-api.ts` | Fehlerbehandlung fuer Profil-Loeschung |
| `src/pages/Chat.tsx` | Try-Catch und User-Feedback bei fehlgeschlagener Loeschung |

