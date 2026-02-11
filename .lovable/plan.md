

# Manuelle Loesch-Funktion fuer Konversationen

## Pruefungsergebnis (Punkt 1)

Die automatische Loeschung bei Ueberschreitung von 20 Konversationen ist korrekt implementiert. Alle vier relevanten Tabellen werden in der richtigen Reihenfolge geloescht:

1. `improvement_tasks` (via Edge Function, Service Role Key)
2. `website_profiles` (via Edge Function, Service Role Key)
3. `messages` (via Client, RLS-Policy vorhanden)
4. `conversations` (via Client, RLS-Policy vorhanden)

Keine Aenderungen noetig.

## Neue Funktion (Punkt 2): Manuelles Loeschen von Konversationen

### Aenderung 1: `src/components/chat/ChatSidebar.tsx`

Einen Loeschen-Button (Muelleimer-Icon) zu jedem Konversations-Eintrag in der Sidebar hinzufuegen:

- Das Icon erscheint nur beim Hover ueber den Eintrag
- Klick auf das Icon ruft `onDelete(conversationId)` auf
- Neues Prop `onDelete: (id: string) => void` hinzufuegen
- Bestaetigung per Klick (kein separater Dialog noetig, einfach ein Klick genuegt, da die Funktion nicht destruktiv-kritisch ist - alternativ mit kurzem Confirm-Dialog)

### Aenderung 2: `src/pages/Chat.tsx`

Neue Handler-Funktion `handleDeleteConversation`:

1. `deleteConversation(id, token)` aufrufen (loescht alles aus der DB)
2. Konversation aus dem lokalen State entfernen
3. Falls die geloeschte Konversation aktiv war: zur naechsten wechseln oder `activeId` auf `null` setzen
4. Erfolgsmeldung per Toast anzeigen
5. Fehlerbehandlung mit Fehlermeldung

Die Funktion wird als `onDelete`-Prop an `ChatSidebar` uebergeben.

## Zusammenfassung

| Datei | Aenderung |
|---|---|
| `src/components/chat/ChatSidebar.tsx` | Loeschen-Button (Trash-Icon) pro Konversation, neues `onDelete`-Prop |
| `src/pages/Chat.tsx` | `handleDeleteConversation`-Handler, Weitergabe an Sidebar |

