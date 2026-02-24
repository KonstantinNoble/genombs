

# Competitor-Vorschlaege nach Auswahl ausblenden

## Problem

Nachdem der User Competitors auswaehlt und auf "Analyze" klickt, bleiben die interaktiven Auswahlkarten dauerhaft im Chat sichtbar. Das ist verwirrend, weil der User denken koennte, er muss erneut auswaehlen, und es nimmt unnoetig Platz ein.

## Loesung

Nach dem Klick auf "Analyze" werden die Auswahlkarten durch eine kurze Bestaetigungsnachricht ersetzt, z.B.:

```text
"3 competitors selected for analysis: siift.ai, prometai.app, ideaproof.io"
```

### Aenderung in `src/components/chat/CompetitorSuggestions.tsx`

1. Neuen State `submitted` hinzufuegen (`useState<boolean>(false)`)
2. In der `onAnalyze`-Callback: `setSubmitted(true)` setzen
3. Wenn `submitted === true`: Statt der Karten eine kompakte Bestaetigungsanzeige rendern mit den ausgewaehlten URLs (als einfache Textliste mit Haekchen-Icons)

### Visuelles Ergebnis

**Vorher (nach Klick):** Alle 5 Karten bleiben sichtbar mit Checkboxen

**Nachher (nach Klick):** Kompakte Zusammenfassung:
```text
[Checkmark] 3 competitors selected for analysis:
  - siift.ai
  - prometai.app
  - ideaproof.io
```

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/components/chat/CompetitorSuggestions.tsx` | `submitted` State + Bestaetigungsansicht nach Auswahl |

Keine weiteren Dateien betroffen. Die Nachricht bleibt in der Datenbank erhalten (fuer Kontext), aber die UI zeigt nur noch die Zusammenfassung.

