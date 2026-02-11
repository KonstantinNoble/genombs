
# Feature: Vollständig flexible KI-Modell-Auswahl für alle Funktionen

## Status-Analyse

### ✅ Bereits implementiert (Chat):
- **UI**: Model-Selector in `ChatInput.tsx` mit allen 5 Modellen (Gemini Flash, GPT Mini, GPT, Claude, Perplexity)
- **API-Layer**: `streamChat()` in `chat-api.ts` akzeptiert `model` Parameter und sendet ihn im Request-Body
- **Edge Function**: `supabase/functions/chat/index.ts` ist ein vollständiger Model-Router mit:
  - Gemini 2.5 Flash (Streaming mit TransformStream)
  - OpenAI GPT-4o(-mini) (Streaming direkt)
  - Anthropic Claude (Streaming mit TransformStream)
  - Perplexity Sonar Pro (Streaming direkt)

### ❌ Nicht implementiert (Website-Analyse):
- **UI**: `onScan()` Callback in `ChatInput.tsx` (Zeile 31) sendet KEIN `model` Parameter
- **API-Layer**: `analyzeWebsite()` in `chat-api.ts` (Zeile 87-109) hat keinen `model` Parameter
- **Backend**: `supabase/functions/analyze-website/index.ts` ist **hardcoded auf Gemini 2.0 Flash** (Zeile 213):
  - Nutzt nur `gemini-2.0-flash:generateContent` (wird am 31. März 2026 deprecated)
  - Ist **nicht-streaming** (JSON-Output erforderlich)
  - Hat **keine Model-Router-Logik**

### 📊 Dashboard:
- Verbraucht nur die bereits analysierten Daten aus `website_profiles`
- Führt selbst KEINE AI-Calls durch
- Ist **nicht betroffen** von dieser Änderung

## Implementierungsplan

### Phase 1: Frontend (UI + API-Layer)

#### 1.1 `src/components/chat/ChatInput.tsx`
**Zeile 31** (`onScan` Signature):
```text
VORHER: onScan?: (ownUrl: string, competitorUrls: string[]) => void;
NACHHER: onScan?: (ownUrl: string, competitorUrls: string[], model: string) => void;
```

**Zeile 72** (`handleStartAnalysis`):
```text
VORHER: onScan?.(ownUrl.trim(), competitorUrls.map((u) => u.trim()));
NACHHER: onScan?.(ownUrl.trim(), competitorUrls.map((u) => u.trim()), selectedModel);
```

#### 1.2 `src/pages/Chat.tsx`
**Zeile 198** (`handleScan` Signature):
```text
VORHER: const handleScan = async (ownUrl: string, competitorUrls: string[]) => {
NACHHER: const handleScan = async (ownUrl: string, competitorUrls: string[], model?: string) => {
```

**Zeile 220-225** (analyzeWebsite-Aufrufe):
```text
VORHER: analyzeWebsite(url, activeId, isOwn, token)
NACHHER: analyzeWebsite(url, activeId, isOwn, token, model)
```

#### 1.3 `src/lib/api/chat-api.ts`
**Zeile 87-91** (`analyzeWebsite` Signature):
```text
VORHER: 
export async function analyzeWebsite(
  url: string,
  conversationId: string,
  isOwnWebsite: boolean,
  accessToken: string
): Promise<{ profileId: string }> {

NACHHER:
export async function analyzeWebsite(
  url: string,
  conversationId: string,
  isOwnWebsite: boolean,
  accessToken: string,
  model?: string
): Promise<{ profileId: string }> {
```

**Zeile 100** (Request-Body):
```text
VORHER: body: JSON.stringify({ url, conversationId, isOwnWebsite }),
NACHHER: body: JSON.stringify({ url, conversationId, isOwnWebsite, model }),
```

### Phase 2: Backend Edge Function (Hauptarbeit)

#### 2.1 `supabase/functions/analyze-website/index.ts`

**2.1.1 Request-Parameter akzeptieren (Zeile 55)**
```text
VORHER: const { url, conversationId, isOwnWebsite } = await req.json();
NACHHER: const { url, conversationId, isOwnWebsite, model = "gemini-flash" } = await req.json();
```

**2.1.2 Secrets laden (nach Zeile 76)**
Zusätzliche Secrets für alle Provider:
```
const openaiKey = Deno.env.get("OPENAI_API_KEY");
const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
```

**2.1.3 System-Prompt auslagern (vor Zeile 21)**
Der aktuelle `GEMINI_SYSTEM_PROMPT` wird zu `ANALYSIS_SYSTEM_PROMPT`, damit alle Provider dieselbe Anweisung verwenden.

**2.1.4 Model-Router implementieren (nach Status "analyzing", ca. Zeile 187)**

Die aktuelle Gemini-Logik (Zeile 207-306) wird zu 4 Provider-spezifischen Funktionen refaktoriert:

**Gemini (non-streaming, JSON):**
- URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`
- Body: Aktuelles Format mit `responseMimeType: "application/json"` (bereits vorhanden)
- Vorteil: Nutzt `gemini-2.5-flash` statt deprecated `gemini-2.0-flash`

**OpenAI (non-streaming, JSON):**
- URL: `https://api.openai.com/v1/chat/completions`
- Header: `Authorization: Bearer ${openaiKey}`
- Body: 
  ```json
  {
    "model": "gpt-4o" oder "gpt-4o-mini",
    "messages": [{"role": "system", "content": ANALYSIS_SYSTEM_PROMPT}, ...messages],
    "response_format": { "type": "json_object" },
    "temperature": 0.2,
    "max_tokens": 4096
  }
  ```
- JSON-Parsing: `response.choices[0].message.content`

**Anthropic (non-streaming, JSON):**
- URL: `https://api.anthropic.com/v1/messages`
- Header: `x-api-key: ${anthropicKey}`, `anthropic-version: 2023-06-01`
- Body:
  ```json
  {
    "model": "claude-sonnet-4-20250514",
    "system": ANALYSIS_SYSTEM_PROMPT,
    "messages": [...messages],
    "max_tokens": 8192
  }
  ```
- JSON-Parsing: `response.content[0].text` → JSON.parse()

**Perplexity (non-streaming, JSON):**
- URL: `https://api.perplexity.ai/chat/completions`
- Header: `Authorization: Bearer ${perplexityKey}`
- Body:
  ```json
  {
    "model": "sonar-pro",
    "messages": [{"role": "system", "content": ANALYSIS_SYSTEM_PROMPT}, ...messages],
    "temperature": 0.2,
    "max_tokens": 4096
  }
  ```
- JSON-Parsing: `response.choices[0].message.content` → JSON.parse()

**2.1.5 Fehlerbehandlung pro Provider**
- Fehlender API Key: Klar identifizierbare Meldung: `"OPENAI_API_KEY not configured"`, etc.
- HTTP-Fehler (429 Rate Limit, 401 Auth): Status an Frontend durchreichen, Error-Message in DB speichern
- JSON-Parse-Fehler: Error-Message speichern, Status auf `"error"` setzen

**2.1.6 Routen-Logik**
```
if model === "gemini-flash" → Use Gemini (bereits vorhanden)
else if model === "gpt-mini" → Use OpenAI with gpt-4o-mini
else if model === "gpt" → Use OpenAI with gpt-4o
else if model === "claude-sonnet" → Use Anthropic
else if model === "perplexity" → Use Perplexity
else → Default to Gemini
```

## Betroffene Dateien

| Datei | Typ | Zeile(n) | Änderung |
|---|---|---|---|
| `src/components/chat/ChatInput.tsx` | Frontend | 31, 72 | `onScan` Signatur + Aufruf um `selectedModel` erweitern |
| `src/pages/Chat.tsx` | Frontend | 198, 220-225 | `handleScan` akzeptiert + reicht `model` weiter |
| `src/lib/api/chat-api.ts` | API-Layer | 87-91, 100 | `analyzeWebsite()` um `model` Parameter erweitern |
| `supabase/functions/analyze-website/index.ts` | Backend | 21, 55, 76+, 187+ | Kompletter Model-Router: Gemini 2.5 + OpenAI + Anthropic + Perplexity |

## Wichtige Technische Details

### JSON-Output pro Provider (non-streaming)
- **Gemini**: `responseMimeType: "application/json"` im `generationConfig` → JSON native
- **OpenAI**: `response_format: { type: "json_object" }` → JSON native
- **Anthropic**: System-Prompt fordert JSON + `JSON.parse()` auf `response.content[0].text`
- **Perplexity**: System-Prompt fordert JSON + `JSON.parse()` auf `response.choices[0].message.content`

### Nicht-Streaming (im Gegensatz zu Chat)
- Chat braucht Token-by-Token Rendering → **Streaming erforderlich**
- Website-Analyse braucht strukturiertes JSON → **Non-Streaming (warten auf complete response)**

### Gemini-Update: 2.0 → 2.5
- `gemini-2.0-flash` wird am **31. März 2026** deprecated
- Neue Konstante im Analyze-Router: `gemini-2.5-flash`
- Kein Breaking Change, da wir den Model-Parameter nicht hardcodieren

## Anforderungen zur Aktivierung

Die 3 **neuen API Keys** müssen im **externen Supabase-Projekt** als Secrets konfiguriert sein:

1. **`OPENAI_API_KEY`** (von https://platform.openai.com/api-keys)
2. **`ANTHROPIC_API_KEY`** (von https://console.anthropic.com/settings/keys)
3. **`PERPLEXITY_API_KEY`** (von https://www.perplexity.ai/settings/api)

(Hinweis: `GEMINI_API_KEY` ist bereits vorhanden)

## Resultat: Vollständige Flexibilität

Nach dieser Implementierung:
- ✅ **Chat**: Modell-Auswahl funktioniert → Streaming mit allen 5 Modellen
- ✅ **Website-Analyse**: Modell-Auswahl funktioniert → Non-Streaming JSON-Output mit allen 5 Modellen
- ✅ **Dashboard**: Zeigt Ergebnisse an (unabhängig davon, welches Modell analysiert hat)

**Ergebnis**: Der User wählt EIN Modell aus, und **sowohl Chat als auch Website-Analyse** verwenden dieses Modell.

