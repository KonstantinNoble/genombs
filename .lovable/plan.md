

## Inline URL-Eingabe statt Pop-up

### Konzept

Wenn ein Nutzer eine Nachricht schreibt, ohne vorher eine URL-Analyse gestartet zu haben, erscheint statt des Pop-up-Dialogs eine automatische Systemnachricht im Chat. Diese Nachricht enthaelt ein eingebettetes URL-Eingabeformular mit der gleichen Funktionalitaet wie der bisherige Dialog.

### Aenderungen

**1. Neue Komponente: `src/components/chat/InlineUrlPrompt.tsx`**

Eine Chat-Bubble im Stil einer Assistenten-Nachricht, die folgendes enthaelt:
- Hinweistext: "Please enter your website URL and at least one competitor before chatting with the AI about your website."
- URL-Eingabefelder (gleiche Logik wie im Dialog): Your Website + 3 Competitor-Felder
- Premium-Locks und Credit-Locks fuer die zusaetzlichen Felder (gleich wie bisher)
- "Start Analysis" Button
- Die gleiche Validierungslogik (https://, Punkt erforderlich, etc.)

**2. Aenderung in `src/components/chat/ChatInput.tsx`**

- `handleSend`: Statt `setDialogOpen(true)` wenn `!hasProfiles`, wird ein Callback `onPromptUrl` aufgerufen
- Neues Prop `onPromptUrl?: () => void` hinzufuegen

**3. Aenderung in `src/pages/Chat.tsx`**

- State `showInlineUrlPrompt` hinzufuegen
- Wenn `onPromptUrl` ausgeloest wird: Die eingegebene User-Nachricht trotzdem als Nachricht speichern, dann `showInlineUrlPrompt = true` setzen
- Die `InlineUrlPrompt`-Komponente wird als letzte Nachricht im Chat-Verlauf angezeigt (vor dem Scroll-Anchor)
- Wenn der Nutzer im Inline-Formular "Start Analysis" klickt, wird `handleScan` aufgerufen und das Prompt verschwindet
- Wenn Profiles geladen werden (nach Analyse), verschwindet das Prompt automatisch

### Technische Details

```text
Aktueller Flow:
User tippt Nachricht -> hasProfiles=false -> Pop-up oeffnet sich -> User muss URLs eingeben

Neuer Flow:
User tippt Nachricht -> hasProfiles=false -> Nachricht wird gespeichert ->
Systemnachricht mit URL-Formular erscheint im Chat -> User gibt URLs ein ->
Klickt "Start Analysis" -> Analyse startet, Prompt verschwindet
```

### Dateien

| Datei | Aenderung |
|---|---|
| `src/components/chat/InlineUrlPrompt.tsx` | Neue Komponente (URL-Eingabe als Chat-Nachricht) |
| `src/components/chat/ChatInput.tsx` | `handleSend` ruft `onPromptUrl` statt Dialog auf |
| `src/pages/Chat.tsx` | State-Management fuer Inline-Prompt, Einbindung der Komponente |

Der bisherige URL-Dialog (Plus-Button) bleibt weiterhin verfuegbar, damit Nutzer auch spaeter neue Analysen starten koennen.

