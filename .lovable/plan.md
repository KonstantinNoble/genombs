
# Feature: URL-Hinweis wenn User ohne Analyse chattet

## Was passiert

Wenn ein User eine Chat-Nachricht schreibt, aber noch keine URLs analysiert hat (d.h. `profiles` ist leer), wird die Nachricht abgefangen. Statt sie direkt abzusenden, oeffnet sich ein Hinweis-Dialog mit dem URL-Formular -- aehnlich dem bestehenden "+" Pop-up.

## Ablauf

```text
User tippt Nachricht und drueckt Enter
  |
  v
Gibt es bereits Profile in dieser Conversation?
  |
  Ja --> Nachricht normal senden (Chat mit KI)
  |
  Nein --> Hinweis-Dialog oeffnen:
           "Um deine Website zu analysieren, gib zuerst deine URLs ein."
           [URL-Formular mit eigene Website + 3 Competitors]
           [Start Analysis Button]
```

Die eingegebene Nachricht geht dabei nicht verloren -- sie wird im Textfeld behalten, sodass der User nach der Analyse weiterchatten kann.

## Technische Aenderungen

### 1. `ChatInput.tsx` -- Neue Prop `hasProfiles`

Eine neue Prop `hasProfiles: boolean` wird hinzugefuegt. Die `handleSend`-Funktion prueft diesen Wert:

- `hasProfiles === true`: Nachricht normal via `onSend()` absenden
- `hasProfiles === false`: Statt zu senden, den URL-Dialog oeffnen. Die Nachricht bleibt im Textfeld stehen. Im Dialog wird ein zusaetzlicher Hinweistext angezeigt: "To get started, add your website and at least one competitor."

Der Dialog selbst ist bereits vorhanden und wird wiederverwendet -- es wird lediglich ein optionaler Hinweistext oben eingefuegt, der nur erscheint, wenn der Dialog durch eine "fehlende URLs"-Situation geoeffnet wurde.

### 2. `Chat.tsx` -- Prop durchreichen

Die `hasProfiles`-Information wird an `ChatInput` weitergegeben:

```
<ChatInput
  onSend={handleSend}
  onScan={handleScan}
  disabled={!activeId || isStreaming}
  hasProfiles={profiles.length > 0}
/>
```

### Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/chat/ChatInput.tsx` | Neue Prop `hasProfiles`, Send-Logik anpassen, Hinweistext im Dialog |
| `src/pages/Chat.tsx` | `hasProfiles` Prop an ChatInput uebergeben |
