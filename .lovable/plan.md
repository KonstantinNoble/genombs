

# Chat-Limit auf 20 Konversationen

## Ziel

Maximal 20 Konversationen pro User erlauben. Wenn eine neue erstellt wird und bereits 20 existieren, wird die aelteste automatisch geloescht -- inklusive aller zugehoerigen Nachrichten, Profile und Tasks aus der Datenbank.

## Umsetzung

### Aenderung 1: `src/lib/api/chat-api.ts` -- Funktion zum Loeschen einer Konversation

Neue Funktion `deleteConversation(conversationId, accessToken)` hinzufuegen, die:
- Die `delete-profiles` Edge Function aufruft (loescht Profile + Tasks)
- Danach die Nachrichten (`messages`) fuer die Konversation loescht
- Dann die Konversation selbst loescht

Da Nachrichten und Konversationen korrekte RLS-Policies haben (`auth.uid() = user_id`), koennen diese direkt ueber den Client geloescht werden. Nur Profile/Tasks brauchen die Edge Function.

**Hinweis:** Die `messages`-Tabelle hat aktuell keine DELETE-Policy. Es wird eine Migration noetig sein, um eine DELETE-Policy hinzuzufuegen.

### Aenderung 2: Datenbank-Migration -- DELETE-Policy fuer `messages`

Neue RLS-Policy: "Users can delete messages in own conversations" mit der Bedingung:
```sql
EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
```

### Aenderung 3: `src/pages/Chat.tsx` -- Limit-Pruefung bei neuer Konversation

In `handleNewConversation`:
1. Nach dem Erstellen der neuen Konversation pruefen, ob die Gesamtanzahl > 20 ist
2. Falls ja, die aelteste Konversation (letzte in der nach `updated_at` sortierten Liste) identifizieren
3. `deleteConversation` fuer die aelteste aufrufen
4. Die geloeschte Konversation aus dem lokalen State entfernen

## Zusammenfassung

| Datei / Bereich | Aenderung |
|---|---|
| DB-Migration | DELETE-Policy fuer `messages`-Tabelle |
| `src/lib/api/chat-api.ts` | Neue `deleteConversation`-Funktion |
| `src/pages/Chat.tsx` | Limit-Pruefung in `handleNewConversation`, aelteste Konversation loeschen wenn > 20 |

