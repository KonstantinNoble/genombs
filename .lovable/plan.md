

# Dynamischer Konversationsname basierend auf der analysierten Website

## Problem

Alle Konversationen heissen "New Analysis", was es schwierig macht, sie in der Sidebar voneinander zu unterscheiden.

## Loesung

Sobald eine Website-Analyse gestartet wird, wird der Konversationstitel automatisch auf die URL der eigenen Website aktualisiert (z.B. "synoptas.com"). So kann der Benutzer sofort erkennen, welche Analyse zu welcher Konversation gehoert.

### Aenderung 1: Neue Funktion `updateConversationTitle` in `src/lib/api/chat-api.ts`

Eine neue Funktion wird hinzugefuegt, die den Titel einer Konversation in der Datenbank aktualisiert:

```typescript
export async function updateConversationTitle(conversationId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", conversationId);
  if (error) throw error;
}
```

### Aenderung 2: Titel-Update in `src/pages/Chat.tsx` nach Analyse-Start

In der `handleAnalyze`-Funktion wird nach dem Start der Analyse der Konversationstitel auf eine gekuerzte Version der eigenen Website-URL gesetzt (z.B. `www.example.com` wird zu `example.com`). Zusaetzlich wird der lokale State (`conversations`) aktualisiert, damit die Sidebar sofort den neuen Namen anzeigt.

Die URL wird bereinigt:
- `https://www.example.com/path` wird zu `example.com`
- Protokoll (http/https) und "www." werden entfernt

### Ablauf

1. Benutzer startet eine Analyse mit einer eigenen URL
2. Die `handleAnalyze`-Funktion extrahiert die Domain aus der URL
3. Der Konversationstitel wird in der Datenbank auf die Domain aktualisiert
4. Der lokale `conversations`-State wird aktualisiert, damit die Sidebar sofort reagiert

## Technische Details

| Datei | Aenderung |
|---|---|
| `src/lib/api/chat-api.ts` | Neue Funktion `updateConversationTitle` |
| `src/pages/Chat.tsx` | Import der neuen Funktion, Aufruf in `handleAnalyze` nach Analyse-Start, lokaler State-Update fuer Sidebar |

