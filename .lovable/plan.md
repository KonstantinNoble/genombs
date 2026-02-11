

# Feature: Modell-Auswahl im Chat (eigene API Keys)

## Uebersicht

Ein Modell-Selektor wird links neben dem Chat-Eingabefeld eingefuegt. Die Chat Edge Function wird erweitert, um je nach gewaehltem Modell die richtige API direkt mit deinen eigenen API Keys aufzurufen.

## Verifizierte Modellbezeichnungen

Nach Pruefung der aktuellen API-Dokumentationen (Stand Februar 2026):

| Anzeigename | Interner Key | API-Endpoint | API Key Secret | Modell-String (verifiziert) |
|---|---|---|---|---|
| Gemini Flash | `gemini-flash` | `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent` | `GEMINI_API_KEY` (vorhanden) | `gemini-2.5-flash` |
| ChatGPT Mini | `gpt-mini` | `api.openai.com/v1/chat/completions` | `OPENAI_API_KEY` (neu) | `gpt-4o-mini` |
| ChatGPT | `gpt` | `api.openai.com/v1/chat/completions` | `OPENAI_API_KEY` (neu) | `gpt-4o` |
| Claude Sonnet | `claude-sonnet` | `api.anthropic.com/v1/messages` | `ANTHROPIC_API_KEY` (neu) | `claude-sonnet-4-20250514` |
| Perplexity | `perplexity` | `api.perplexity.ai/chat/completions` | `PERPLEXITY_API_KEY` (neu) | `sonar-pro` |

**Wichtig:** `gemini-2.0-flash` (aktuell im Code) wird am 31. Maerz 2026 abgeschaltet -- wird auf `gemini-2.5-flash` aktualisiert.

## Voraussetzung: 3 neue API Keys

Diese muessen im **externen Supabase-Projekt** als Secrets hinterlegt werden (da die Edge Functions dort deployed sind):

- `OPENAI_API_KEY` -- von https://platform.openai.com/api-keys
- `ANTHROPIC_API_KEY` -- von https://console.anthropic.com/settings/keys
- `PERPLEXITY_API_KEY` -- von https://www.perplexity.ai/settings/api

## UI-Design

Links neben dem Textarea erscheint ein kompakter Modell-Selektor-Button mit Popover:

```text
[Gemini Flash v] [____Textarea____] [+] [Send]
```

## Technische Aenderungen

### 1. `src/components/chat/ChatInput.tsx`

- Neuer State `selectedModel` (default: `gemini-flash`)
- Modell-Konstante mit Label, ID, Icon, Beschreibung
- Popover-Button (Radix Popover, bereits installiert) links im Eingabebereich
- `onSend` Signatur wird zu `onSend(message: string, model: string)`

### 2. `src/pages/Chat.tsx`

- `handleSend` akzeptiert `(content: string, model: string)`
- `model` wird an `streamChat()` weitergereicht

### 3. `src/lib/api/chat-api.ts`

- `streamChat` bekommt optionalen Parameter `model?: string`
- Wird im Request-Body mitgesendet: `{ messages, conversationId, model }`

### 4. `supabase/functions/chat/index.ts` -- Model-Router

Die groesste Aenderung. Die Edge Function erhaelt einen Router, der je nach `model`-Parameter die richtige API aufruft:

**Gemini (default):**
- Bleibt aehnlich wie bisher, aber mit `gemini-2.5-flash`
- Eigenes SSE-Format wird per TransformStream in OpenAI-Format konvertiert (wie bisher)
- Nutzt `?alt=sse&key=` Query-Parameter

**OpenAI (gpt / gpt-mini):**
- `POST https://api.openai.com/v1/chat/completions`
- Header: `Authorization: Bearer $OPENAI_API_KEY`
- Body: `{ model, messages: [{role, content}], stream: true }`
- Antwort ist bereits OpenAI-SSE-Format -- wird direkt durchgereicht

**Anthropic (claude-sonnet):**
- `POST https://api.anthropic.com/v1/messages`
- Header: `x-api-key: $ANTHROPIC_API_KEY`, `anthropic-version: 2023-06-01`
- Body: `{ model, messages, max_tokens: 8192, stream: true }`
- **System-Prompt wird separat als `system` Parameter uebergeben** (nicht als Message)
- Eigenes SSE-Format (`content_block_delta` mit `delta.text`) -- muss per TransformStream in OpenAI-Format konvertiert werden

**Perplexity (perplexity):**
- `POST https://api.perplexity.ai/chat/completions`
- Header: `Authorization: Bearer $PERPLEXITY_API_KEY`
- Body: `{ model: "sonar-pro", messages, stream: true }`
- OpenAI-kompatibles Format -- wird direkt durchgereicht

**Fehlerbehandlung:**
- Fehlender API Key: Klare Fehlermeldung zurueck ("OPENAI_API_KEY not configured" etc.)
- Rate Limit (429): Weiterleitung an Frontend
- Jeder Provider hat dedizierte Fehlerbehandlung

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/components/chat/ChatInput.tsx` | Modell-Selektor UI + Popover, `onSend` Signatur |
| `src/pages/Chat.tsx` | `model` Parameter durchreichen |
| `src/lib/api/chat-api.ts` | `model` im Request-Body |
| `supabase/functions/chat/index.ts` | Model-Router mit 4 API-Anbindungen, Gemini Update auf 2.5-flash |

## Nicht betroffen

- `analyze-website/index.ts` -- bleibt separat auf Gemini
- Dashboard-Komponenten -- keine Aenderung
- Datenbank -- keine Schema-Aenderung

