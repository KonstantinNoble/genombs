

# Fix: German Text in Analysis Summary Prompt

## Problem

The AI summary prompt generated after website analysis (in `src/pages/Chat.tsx`, lines 237-243) is written entirely in German. This causes the AI to respond in German, contradicting the project's English-only design.

## Specific Issues (all in `src/pages/Chat.tsx`)

**Line 240** - German labels in data template:
- `[EIGENE WEBSITE]` should be `[OWN WEBSITE]`
- `Staerken:` should be `Strengths:`
- `Schwaechen:` should be `Weaknesses:`
- `Kategorien:` should be `Categories:`

**Lines 243** - Entire prompt is German:
- `"Du bist ein Website-Analyse-Experte..."` should be English
- `"Fasse die Ergebnisse zusammen..."` should be English
- `"Antworte auf Deutsch"` explicitly instructs the AI to answer in German -- must be removed

## Solution

Replace the German summary prompt with an English equivalent:

```text
BEFORE (line 240):
`[EIGENE WEBSITE]` / `Staerken:` / `Schwaechen:` / `Kategorien:`

AFTER:
`[OWN WEBSITE]` / `Strengths:` / `Weaknesses:` / `Categories:`
```

```text
BEFORE (line 243):
"Du bist ein Website-Analyse-Experte. Hier sind die Ergebnisse...
Fasse die Ergebnisse zusammen... Antworte auf Deutsch..."

AFTER:
"You are a website analysis expert. Here are the results of the
completed analysis:... Summarize the results:
1. How does the own website compare to competitors?
2. What are the key strengths and weaknesses?
3. Provide 3-5 concrete, prioritized action items.
Be structured and concise."
```

## Affected File

| File | Lines | Change |
|---|---|---|
| `src/pages/Chat.tsx` | 240, 243 | Replace German labels and prompt with English |

## No Other Files Affected

- `AnalysisProgress.tsx`: Already English
- `analyze-website/index.ts`: System prompt already English
- `chat/index.ts`: System prompt already English ("Answer in the same language as the user's message" -- this is fine since the summary prompt will now be in English)

