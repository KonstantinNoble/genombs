

# Fix: Alte Analysen werden nicht geloescht + URL-Felder leeren

## Problem

Alte Website-Profile werden nicht zuverlaessig geloescht, wenn eine neue Analyse gestartet wird. Dadurch haeufen sich doppelte Profile an (z.B. "Synoptas" erscheint mehrfach). Zusaetzlich bleiben die URL-Felder nach dem Start einer Analyse gefuellt, was dazu fuehren kann, dass alte URLs versehentlich erneut analysiert werden.

## Ursachenanalyse

1. **Delete funktioniert moeglicherweise nicht**: Die Funktion `deleteProfilesForConversation` in `chat-api.ts` nutzt den User-Client mit RLS. Fehler werden zwar geloggt, aber die Analyse laeuft trotzdem weiter (Zeile 224-226 in Chat.tsx: "Continuing with new analysis").
2. **Race Condition**: Die Realtime-Subscription (Zeile 89-118) laedt Profile bei jedem DB-Event neu. Waehrend der Delete laeuft, koennte die Subscription alte Daten zurueckladen.
3. **URL-Felder bleiben gefuellt**: `ChatInput.tsx` Zeile 90 sagt explizit "URLs are intentionally NOT cleared" -- dadurch werden bei erneutem Klick auf "Start Analysis" dieselben URLs nochmal analysiert.

## Loesung

### Aenderung 1: `src/lib/api/chat-api.ts` -- Delete robuster machen

Die Delete-Funktion wird verbessert:
- Nach dem Loeschen wird verifiziert, dass tatsaechlich keine Profile mehr existieren
- Falls Profile uebrig bleiben, wird ein zweiter Loeschversuch gestartet
- Rueckgabe der Anzahl geloeschter Profile fuer Debugging

### Aenderung 2: `src/pages/Chat.tsx` -- Analyse erst starten wenn Delete bestaetigt

- Die Analyse wird **nicht** gestartet, wenn der Delete fehlschlaegt (statt "Continuing with new analysis")
- Toast-Fehlermeldung und Abbruch
- Realtime-Subscription wird kurzzeitig pausiert waehrend des Delete+Insert-Zyklus

### Aenderung 3: `src/pages/Chat.tsx` -- URL-Felder nach Start leeren

- Neue Callback-Prop `onClearUrls` an `ChatInput` uebergeben
- Nach erfolgreichem Start der Analyse wird diese Callback-Funktion aufgerufen
- Die URL-States (ownUrl, comp1, comp2, comp3) werden zurueckgesetzt

### Aenderung 4: `src/components/chat/ChatInput.tsx` -- Reset-Funktion

- `onClearUrls` Prop hinzufuegen
- Kommentar auf Zeile 90 entfernen, stattdessen URLs nach Analyse-Start leeren

### Aenderung 5: `src/pages/Chat.tsx` -- Deduplizierung als Sicherheitsnetz

- Bevor Profile in den State geschrieben werden, nach URL deduplizieren (nur das neueste Profil pro URL behalten)
- Dies ist eine Sicherheitsebene fuer den Fall, dass trotz Delete alte Eintraege uebrig bleiben

## Zusammenfassung

| Datei | Aenderung |
|---|---|
| `src/lib/api/chat-api.ts` | Delete-Funktion mit Verifikation und Retry |
| `src/pages/Chat.tsx` | Analyse stoppen wenn Delete fehlschlaegt, Realtime-Pause, Deduplizierung |
| `src/pages/Chat.tsx` | URL-Felder nach Analyse-Start leeren |
| `src/components/chat/ChatInput.tsx` | `onClearUrls` Prop + URL-Reset |

