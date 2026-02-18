
# Dashboard-Styling: Schrift vergroessern und Button-Farbe anpassen

## Aenderungen in `src/components/dashboard/AnalysisTabs.tsx`

### 1. Sektions-Header groesser machen
- "Website Analysis" und "Code Analysis" Header von `text-xs` auf `text-sm` aendern
- Sub-Header (Overview, Positioning, etc.) bleiben bei `text-xs`

### 2. PlaceholderCard Schrift vergroessern
- Titel von `text-sm` auf `text-base`
- Beschreibung von `text-xs` auf `text-sm`

### 3. Button-Farbe verbessern
- Button von `variant="outline"` auf `variant="default"` aendern (Orange/Primary-Farbe statt schwarzer Outline)
- Das nutzt die bestehende Primary-Farbe (#F97316 / Orange) und bietet klaren Kontrast auf dem dunklen Hintergrund

## Betroffene Datei
- `src/components/dashboard/AnalysisTabs.tsx`
