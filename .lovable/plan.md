

# Plan: Chat-Frontend mit echtem Backend verbinden

## Problem
Das Frontend zeigt aktuell nur Mock-Daten an. Die Edge Functions (`analyze-website`, `chat`) und die Datenbank-Tabellen sind zwar bereit, aber `Chat.tsx` importiert alles aus `mock-chat-data.ts` und macht keine echten API-Aufrufe.

## Uebersicht der Aenderungen

### 1. Neuen API-Client erstellen (`src/lib/api/chat-api.ts`)
Zentraler Client fuer alle Backend-Aufrufe zum **externen** Supabase-Projekt:
- `createConversation(userId)` -- Neue Conversation in der DB anlegen
- `loadConversations(userId)` -- Alle Conversations des Users laden
- `saveMessage(conversationId, role, content)` -- Nachricht in DB speichern
- `analyzeWebsite(url, conversationId, isOwnWebsite, authToken)` -- Edge Function `analyze-website` aufrufen
- `loadProfiles(conversationId)` -- Website-Profile fuer eine Conversation laden
- `streamChat(messages, conversationId, authToken, onDelta, onDone)` -- Streaming-Chat via Edge Function `chat`

Alle Aufrufe nutzen den **externen Supabase-Client** aus `src/lib/supabase/external-client.ts`.

### 2. `Chat.tsx` komplett refactoren
Statt Mock-Daten:
- **Conversations** aus `conversations`-Tabelle laden (per `useEffect`)
- **Neue Conversation** in DB anlegen statt nur im State
- **Nachrichten senden**: User-Nachricht in DB speichern, dann `streamChat()` aufrufen, Token fuer Token die Assistant-Antwort rendern, am Ende Assistant-Nachricht in DB speichern
- **Scan/Analyse starten**: Beim Klick auf "Start Analysis" im Dialog fuer jede URL `analyzeWebsite()` aufrufen, Profile via Realtime oder Polling aktualisieren
- **Dashboard-Panel**: Echte `website_profiles` aus der DB laden statt `mockWebsiteProfiles`
- **Auth-Check**: User muss eingeloggt sein (via `useAuth()`), sonst Redirect zu Login

### 3. Typen anpassen
Neue Datei `src/types/chat.ts` mit Typen die zur DB-Struktur passen:
- `Conversation` (mit `id`, `user_id`, `title`, `created_at`, `updated_at`)
- `Message` (mit `id`, `conversation_id`, `role`, `content`, `created_at`)
- `WebsiteProfile` (mit allen DB-Feldern inkl. `status`, `profile_data`, `category_scores`, etc.)
- `ImprovementTask`

### 4. Dashboard-Komponenten anpassen
`WebsiteGrid`, `ComparisonTable`, `ImprovementPlan` importieren aktuell den Typ `WebsiteProfile` aus `mock-chat-data.ts`. Diese muessen auf den neuen DB-kompatiblen Typ umgestellt werden, wobei die Feld-Namenskonvention von camelCase auf snake_case wechselt (oder ein Mapping-Layer eingefuegt wird).

### 5. Realtime fuer Website-Profile
Wenn ein User eine Analyse startet, durchlaeuft das Profil die Status `crawling` -> `analyzing` -> `completed`. Per Supabase Realtime-Subscription auf `website_profiles` wird der Status live im Dashboard aktualisiert (Ladebalken, dann fertiges Profil).

### 6. Chat-Nachricht mit Markdown rendern
`ChatMessage.tsx` nutzt bereits `react-markdown` -- das bleibt bestehen und funktioniert mit den echten AI-Antworten.

---

## Technische Details

### API-Aufrufe zum externen Supabase

```text
Edge Function URL-Schema:
https://xnkspttfhcnqzhmazggn.supabase.co/functions/v1/analyze-website
https://xnkspttfhcnqzhmazggn.supabase.co/functions/v1/chat

Auth-Header: Bearer <session.access_token>
Apikey-Header: <EXTERNAL_ANON_KEY>
```

### Streaming-Chat-Flow

```text
User tippt Nachricht
  |
  v
Nachricht in DB speichern (messages-Tabelle)
  |
  v
fetch() an /functions/v1/chat mit SSE-Stream
  |
  v
Token fuer Token in State aktualisieren (letzte Assistant-Message updaten)
  |
  v
Bei [DONE]: fertige Nachricht in DB speichern
```

### Analyse-Flow

```text
User klickt "Start Analysis" mit URLs
  |
  v
Fuer jede URL: POST an /functions/v1/analyze-website
  |
  v
Realtime-Subscription auf website_profiles
  |
  v
Status-Updates live im Dashboard anzeigen:
  crawling -> Spinner
  analyzing -> "KI analysiert..."
  completed -> Profil-Karte mit Scores
  error -> Fehlermeldung
```

### Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/lib/api/chat-api.ts` | Neu: API-Client |
| `src/types/chat.ts` | Neu: DB-kompatible Typen |
| `src/pages/Chat.tsx` | Refactor: Mock -> echte API-Aufrufe |
| `src/components/chat/ChatInput.tsx` | Keine Aenderung noetig |
| `src/components/chat/ChatMessage.tsx` | Pruefen ob Markdown-Rendering ok |
| `src/components/chat/WebsiteProfileCard.tsx` | Typ-Anpassung (snake_case Felder) |
| `src/components/dashboard/WebsiteGrid.tsx` | Typ-Import aendern |
| `src/components/dashboard/ComparisonTable.tsx` | Typ-Import aendern |
| `src/components/dashboard/ImprovementPlan.tsx` | Typ-Import aendern |
| `src/components/dashboard/AnalysisTabs.tsx` | Typ-Import aendern |

### Nicht geaendert
- Edge Functions bleiben wie sie sind (bereits korrekt implementiert)
- `mock-chat-data.ts` bleibt als Referenz, wird aber nicht mehr importiert
- Auth-System bleibt unveraendert (nutzt bereits externen Supabase-Client)

