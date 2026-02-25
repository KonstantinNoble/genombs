
## Sliding Window fuer Chat-Kontext

### Ziel
Nur die letzten 30 Nachrichten als Kontext an die KI senden, statt den gesamten Verlauf. Das reduziert Token-Kosten und verhindert, dass bei langen Konversationen das Kontext-Fenster der KI ueberschritten wird.

### Aenderung

**Datei: `src/hooks/useChatMessages.ts` (Zeile 301)**

Aktuell:
```typescript
const chatHistory = [...messages, userMsg].map((m) => ({
    role: m.role,
    content: m.content,
}));
```

Neu:
```typescript
const MAX_CONTEXT_MESSAGES = 30;
const allMessages = [...messages, userMsg];
const recentMessages = allMessages.slice(-MAX_CONTEXT_MESSAGES);
const chatHistory = recentMessages.map((m) => ({
    role: m.role,
    content: m.content,
}));
```

**Datei: `src/lib/constants.ts`**
- Neue Konstante `MAX_CONTEXT_MESSAGES = 30` hinzufuegen, damit der Wert zentral konfigurierbar ist

### Auswirkung
- Alle Nachrichten bleiben in der Datenbank und im Chat-Verlauf sichtbar
- Nur der an die KI gesendete Kontext wird auf die letzten 30 Nachrichten begrenzt (ca. 15 User-Nachrichten + 15 Antworten)
- Token-Kosten bleiben konstant, egal wie lang die Konversation wird
- Keine Aenderung am Backend/Edge-Function noetig
