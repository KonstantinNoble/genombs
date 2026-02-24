

## Competitor-Vorschlagskarten immer sichtbar lassen

Nach dem Klick auf "Analyze" werden die Competitor-Karten aktuell durch eine kompakte Zusammenfassung ersetzt (gruener Haken + URL-Liste). Diese Zusammenfassung soll entfernt werden, sodass die Karten immer in voller Groesse sichtbar bleiben.

### Aenderung

**Datei: `src/components/chat/CompetitorSuggestions.tsx`**

Das Verhalten nach dem Absenden wird angepasst:

- Die vollstaendigen Karten (Name, URL, Beschreibung) bleiben **immer sichtbar**
- Nach dem Absenden werden die Checkboxen als **checked und disabled** dargestellt
- Der "Analyze"-Button wird durch einen Bestaetigungstext ersetzt (z.B. "X competitor(s) selected for analysis")
- Der kompakte `submitted`-Rueckgabewert (gruener Haken + URL-Liste) wird entfernt

### Visuelles Ergebnis

**Vorher (nach Absenden):**
```text
[Gruener Haken] 2 competitors selected for analysis:
  - https://siift.ai
  - https://prometai.app
```

**Nachher (nach Absenden):**
```text
[x] Siift.ai           (disabled checkbox, checked)
    https://siift.ai
    AI-powered coaching...

[x] PrometAI            (disabled checkbox, checked)
    https://prometai.app
    Decision-making tools...

[ ] IdeaProof            (disabled checkbox, unchecked)
    https://ideaproof.io
    ...

[Haken] 2 competitors selected for analysis
```

### Technischer Abschnitt

- Nur eine Datei betroffen: `src/components/chat/CompetitorSuggestions.tsx`
- Der fruehe `if (submitted) return (...)` Block wird entfernt
- Stattdessen werden im `submitted`-Zustand alle Karten mit `disabled`-Checkboxen und den gespeicherten Auswahlen gerendert
- Nicht ausgewaehlte Karten bekommen reduzierte Opazitaet
- Der "Analyze"-Button wird durch eine Bestaetigungsanzeige ersetzt
- Keine Aenderung an der Datenbank oder an anderen Komponenten noetig

