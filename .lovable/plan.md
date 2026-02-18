
# Code Analysis fuer alle User freischalten (mit Credit-Kosten)

## Credit-Kosten-Empfehlung

Die URL-Analyse kostet 5-10 Credits je nach Modell. Da die Code Analysis aufwaendiger ist (GitHub-Repo abrufen + AI-Analyse), empfehle ich folgende Kosten:

| Modell | URL-Analyse | Code Analysis (neu) |
|--------|------------|---------------------|
| Gemini Flash | 5 | 8 |
| GPT Mini | 5 | 8 |
| GPT | 8 | 12 |
| Claude Sonnet | 8 | 12 |
| Perplexity | 10 | 15 |

Das macht die Code Analysis ca. 50-60% teurer als die URL-Analyse, was den hoeheren Aufwand widerspiegelt, aber fuer Free-User (20 Credits/Tag) trotzdem mindestens 2x pro Tag nutzbar bleibt.

## Aenderungen

### 1. `src/lib/constants.ts`
- Neue Kategorie `codeAnalysis` in `MODEL_CREDIT_COSTS` hinzufuegen mit den oben genannten Werten
- Neue Funktion `getCodeAnalysisCreditCost(modelId)` exportieren

### 2. `supabase/functions/add-github-analysis/index.ts`
- Premium-Check (Zeilen 252-264) durch Credit-Check ersetzen:
  - `credits_used` und `daily_credits_limit` aus `user_credits` lesen
  - Verbleibende Credits berechnen
  - Credit-Kosten fuer das gewaehlte Modell pruefen (Mapping im Edge Function Code)
  - Bei nicht genuegend Credits: Fehler 403 mit klarer Meldung
  - Nach erfolgreicher Analyse: `credits_used` um die Kosten erhoehen via UPDATE

### 3. `src/components/chat/ChatInput.tsx`
- Zeile 304: `{isPremium && (` entfernen -- GitHub-Button fuer alle User sichtbar machen
- Credit-Check hinzufuegen: Button zeigt Tooltip wenn nicht genug Credits vorhanden
- Credit-Kosten-Anzeige im Popover (z.B. "Costs 8 credits")

### 4. `src/pages/Chat.tsx`
- Zeile 390: `&& isPremium` Bedingung entfernen -- GitHub-URLs im Chat werden fuer alle User erkannt
- Vor dem Aufruf von `handleGithubDeepAnalysis` pruefen ob genuegend Credits vorhanden sind

### 5. `src/components/dashboard/AnalysisTabs.tsx`
- Der "Start Code Analysis" Button im Platzhalter funktioniert bereits ueber `onOpenGithubDialog` -- keine Aenderung noetig, da der GitHub-Dialog jetzt fuer alle User offen ist

## Technische Details

### Credit-Kosten im Edge Function

```typescript
const CODE_ANALYSIS_COSTS: Record<string, number> = {
  "gemini-flash": 8,
  "gpt-mini": 8,
  "gpt": 12,
  "claude-sonnet": 12,
  "perplexity": 15,
};

// Ersetze den Premium-Check durch:
const { data: credits } = await supabase
  .from("user_credits")
  .select("credits_used, daily_credits_limit")
  .eq("user_id", user.id)
  .single();

const remaining = (credits?.daily_credits_limit ?? 20) - (credits?.credits_used ?? 0);
const cost = CODE_ANALYSIS_COSTS[selectedModel] ?? 8;

if (remaining < cost) {
  return new Response(
    JSON.stringify({ error: `Not enough credits. Need ${cost}, have ${remaining}.` }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ... nach erfolgreicher Analyse:
await supabase
  .from("user_credits")
  .update({ credits_used: (credits?.credits_used ?? 0) + cost })
  .eq("user_id", user.id);
```

### Constants Update

```typescript
export const MODEL_CREDIT_COSTS = {
  chat: { ... },
  analysis: { ... },
  codeAnalysis: {
    "gemini-flash": 8,
    "gpt-mini": 8,
    "gpt": 12,
    "claude-sonnet": 12,
    "perplexity": 15,
  },
} as const;

export function getCodeAnalysisCreditCost(modelId: string): number {
  return (MODEL_CREDIT_COSTS.codeAnalysis as Record<string, number>)[modelId] ?? 8;
}
```

### Betroffene Dateien
1. `src/lib/constants.ts` -- Neue Credit-Kosten
2. `supabase/functions/add-github-analysis/index.ts` -- Premium-Gate durch Credit-System ersetzen
3. `src/components/chat/ChatInput.tsx` -- GitHub-Button fuer alle sichtbar
4. `src/pages/Chat.tsx` -- Premium-Bedingung bei GitHub-URL-Erkennung entfernen
