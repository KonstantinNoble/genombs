

# Fix: Competitor-Auswahl dauerhaft beibehalten

## Problem

Der `submitted`-State in `CompetitorSuggestions` ist nur React-State im Arbeitsspeicher. Wenn der User die Conversation wechselt und zurueckkommt, wird die Komponente neu gemountet und `submitted` ist wieder `false` -- die Karten erscheinen erneut.

## Loesung

Nach dem Klick auf "Analyze" wird das Nachrichten-Metadata in der Datenbank aktualisiert, sodass die ausgewaehlten URLs dauerhaft gespeichert sind. Beim naechsten Laden der Nachricht erkennt die Komponente, dass bereits eine Auswahl getroffen wurde.

### 1. `src/components/chat/ChatMessage.tsx`

- Aus dem Message-Metadata pruefen, ob `selected_urls` bereits vorhanden ist
- Falls ja, diese als `initialSelectedUrls` an `CompetitorSuggestions` weitergeben
- Neuen Callback `onCompetitorsSelected` implementieren, der nach erfolgreicher Auswahl das Metadata in der Datenbank aktualisiert (via Supabase UPDATE auf `messages`-Tabelle)

### 2. `src/components/chat/CompetitorSuggestions.tsx`

- Neue Props: `initialSelectedUrls?: string[]`
- Wenn `initialSelectedUrls` vorhanden und nicht leer ist, direkt im "submitted"-Zustand starten (kompakte Zusammenfassung anzeigen)
- Nach Klick auf "Analyze": `onAnalyze` aufrufen UND zusaetzlich den Parent ueber die Auswahl informieren

### 3. Datenbank-Update in ChatMessage

Nach dem Analyze-Klick wird das Metadata der Nachricht aktualisiert:

```sql
UPDATE messages 
SET metadata = jsonb_set(metadata, '{selected_urls}', '["url1","url2"]')
WHERE id = 'message_id';
```

Dies geschieht ueber den Supabase-Client direkt in der ChatMessage-Komponente.

## Ablauf

```text
User klickt "Analyze 3 competitors"
  -> CompetitorSuggestions ruft onAnalyze(urls) auf
  -> ChatMessage aktualisiert message.metadata.selected_urls in DB
  -> Komponente zeigt kompakte Zusammenfassung

User wechselt Conversation und kommt zurueck
  -> Nachricht wird aus DB geladen (mit selected_urls im Metadata)
  -> CompetitorSuggestions erhaelt initialSelectedUrls
  -> Komponente startet direkt im "submitted"-Zustand
```

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/components/chat/CompetitorSuggestions.tsx` | Neue Prop `initialSelectedUrls`, damit beim Mount direkt der submitted-Zustand gesetzt wird |
| `src/components/chat/ChatMessage.tsx` | Metadata-Update in DB nach Auswahl, `initialSelectedUrls` aus Metadata lesen und weitergeben |

