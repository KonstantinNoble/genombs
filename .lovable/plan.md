
# Text-Markierungsfarbe anpassen

## Ziel
Die Standard-blaue Textmarkierung beim Kopieren/Selektieren durch eine gruene Markierung ersetzen, passend zum Synoptas Design-System.

---

## Technische Umsetzung

### Aenderung in `src/index.css`

Innerhalb des bestehenden `@layer base` Blocks (nach Zeile 167) wird ein neuer CSS-Abschnitt hinzugefuegt:

```css
/* Custom text selection color - green branding */
::selection {
  background-color: hsl(142 76% 36% / 0.3);
  color: hsl(0 0% 8%);
}

::-moz-selection {
  background-color: hsl(142 76% 36% / 0.3);
  color: hsl(0 0% 8%);
}
```

### Erklaerung

| Eigenschaft | Wert | Beschreibung |
|-------------|------|--------------|
| `::selection` | Standard-Pseudo-Element | Fuer Chrome, Safari, Edge, Opera |
| `::-moz-selection` | Mozilla-Prefix | Fuer Firefox-Kompatibilitaet |
| `background-color` | `hsl(142 76% 36% / 0.3)` | Primaerfarbe (Gruen) mit 30% Deckkraft |
| `color` | `hsl(0 0% 8%)` | Dunkler Text fuer optimale Lesbarkeit |

### Farbwahl

Die Farbe `hsl(142 76% 36%)` entspricht exakt der `--primary` CSS-Variable des Projekts. Die 30% Transparenz (`/ 0.3`) sorgt dafuer, dass:
- Der Text weiterhin gut lesbar bleibt
- Die Markierung dezent aber erkennbar ist
- Das Design konsistent mit dem restlichen Branding wirkt

---

## Betroffene Datei

- `src/index.css` (1 Aenderung: ca. 10 neue Zeilen)

---

## Erwartetes Ergebnis

Wenn du nach der Aenderung Text auf der Website markierst, wird dieser in einem sanften Gruen statt Blau hervorgehoben - passend zum Synoptas-Farbschema.
