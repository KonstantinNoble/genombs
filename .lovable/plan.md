
# Vollständige Unabhängigkeit von Lovable - Migrations-Plan

## Status-Übersicht

| Komponente | Aktuell | Für Unabhängigkeit nötig |
|------------|---------|--------------------------|
| Frontend Client | ✅ Zeigt auf fhzqngbbvwpfdmhjfnvk | Erledigt |
| Datenbank | ✅ Externes Supabase | Erledigt |
| Auth | ⚠️ "Invalid API Key" Fehler | Konfiguration prüfen |
| Edge Functions | ❌ Lovable Cloud | Code-Änderung + manuelles Deployment |
| AI Gateway | ❌ ai.gateway.lovable.dev | Direkte APIs nutzen |

---

## Phase 1: Auth-Fehler beheben

Der "Invalid API Key" Fehler entsteht durch fehlende Auth-Konfiguration im externen Supabase.

**Im Supabase Dashboard (fhzqngbbvwpfdmhjfnvk):**

1. **Authentication → URL Configuration:**
   - Site URL: `https://synoptas.com`
   - Redirect URLs:
     - `https://synoptas.com/*`
     - `https://wealthconomy.lovable.app/*`
     - `http://localhost:5173/*`

2. **Anon Key prüfen:**
   - Vergleiche den Key in `src/lib/supabase/external-client.ts` mit dem im Supabase Dashboard (Settings → API)

---

## Phase 2: Edge Functions manuell auf externes Supabase deployen

Da Lovable automatisch auf Lovable Cloud deployed, musst du die Edge Functions manuell auf dein externes Supabase deployen.

**Schritte:**
1. Supabase CLI installieren: `npm install -g supabase`
2. Mit deinem externen Projekt verbinden: `supabase link --project-ref fhzqngbbvwpfdmhjfnvk`
3. Secrets setzen:
```bash
supabase secrets set RESEND_API_KEY=xxx
supabase secrets set CLAUDE_API_KEY=xxx
supabase secrets set PERPLEXITY_API_KEY=xxx
supabase secrets set FREEMIUS_API_KEY=xxx
# ... etc
```
4. Functions deployen: `supabase functions deploy`

---

## Phase 3: Lovable AI Gateway ersetzen (Kritisch!)

Die Edge Functions nutzen `ai.gateway.lovable.dev` für GPT und Gemini. Für vollständige Unabhängigkeit müssen wir direkte API-Aufrufe implementieren.

### Änderungen in `multi-ai-query/index.ts`:

**Vorher (Zeile 223):**
```typescript
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  headers: { "Authorization": `Bearer ${lovableApiKey}` }
});
```

**Nachher:**
```typescript
// Für GPT-Modelle → OpenAI API direkt
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: { "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}` }
});

// Für Gemini-Modelle → Google AI API direkt
const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
  headers: { "x-goog-api-key": `${Deno.env.get('GOOGLE_AI_API_KEY')}` }
});
```

### Neue Secrets benötigt:
- `OPENAI_API_KEY` - Von OpenAI Platform
- `GOOGLE_AI_API_KEY` - Von Google AI Studio

### Betroffene Dateien:
1. `supabase/functions/multi-ai-query/index.ts`
   - Zeile 223: GPT-Modelle über Lovable Gateway
   - Zeile 584-590: LOVABLE_API_KEY Check

2. `supabase/functions/meta-evaluation/index.ts`
   - Zeile 759: Gemini über Lovable Gateway
   - Zeile 586-590: LOVABLE_API_KEY Check

---

## Phase 4: Model-Konfiguration anpassen

Die Modell-IDs müssen an die jeweiligen APIs angepasst werden:

**Lovable Gateway Format:**
- `openai/gpt-5-mini`
- `google/gemini-3-pro-preview`

**Direkte API Formate:**
- OpenAI: `gpt-4o-mini`, `gpt-4o`
- Google: `gemini-1.5-pro`, `gemini-1.5-flash`

---

## Technische Implementierung

### Schritt 1: OpenAI API Integration

```typescript
async function queryOpenAIModel(
  modelId: string,
  prompt: string,
  apiKey: string
): Promise<ModelResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId, // z.B. "gpt-4o-mini"
      messages: [...],
      tools: [getRecommendationTool(isPremium)],
      tool_choice: { type: "function", function: { name: "provide_recommendations" } }
    }),
  });
  // ...
}
```

### Schritt 2: Google AI API Integration

```typescript
async function queryGeminiModel(
  modelId: string,
  prompt: string,
  apiKey: string
): Promise<ModelResponse> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { ... }
      }),
    }
  );
  // Response-Format ist anders als OpenAI!
}
```

---

## Zusammenfassung: Was muss geändert werden

### Code-Änderungen (durch mich):
1. `multi-ai-query/index.ts` - Lovable Gateway → OpenAI + Google AI direkt
2. `meta-evaluation/index.ts` - Lovable Gateway → Google AI direkt
3. Model-ID Mapping anpassen

### Manuelle Schritte (durch dich):
1. **OpenAI API Key** besorgen (https://platform.openai.com)
2. **Google AI API Key** besorgen (https://aistudio.google.com)
3. **Im Supabase Dashboard** die neuen Secrets setzen:
   - `OPENAI_API_KEY`
   - `GOOGLE_AI_API_KEY`
4. **Auth-URLs** im externen Supabase konfigurieren
5. **Edge Functions** manuell deployen via Supabase CLI

---

## Kosten-Hinweis

Aktuell nutzt Lovable AI Gateway einen Pool-basierten Zugang zu GPT und Gemini. Bei direkter Nutzung zahlst du:
- **OpenAI GPT-4o**: ~$2.50 / 1M Input-Tokens
- **OpenAI GPT-4o-mini**: ~$0.15 / 1M Input-Tokens
- **Google Gemini 1.5 Pro**: ~$1.25 / 1M Input-Tokens
- **Google Gemini 1.5 Flash**: ~$0.075 / 1M Input-Tokens

Bei Genehmigung werde ich die Edge Functions umschreiben, um die direkten APIs zu nutzen.
