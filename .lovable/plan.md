

# Fix: Graue Farben durch lebendige, marken-konforme Farben ersetzen

## Problem

Aktuell werden viele Balken und Punkte grau angezeigt, weil:

1. **`--chart-6`** (fuer Scores >= 80, Strength-Dots) ist auf `0 0% 70%` gesetzt = reines Grau
2. **Competitor-Balken** in der ComparisonTable verwenden `bg-muted-foreground/40` = ebenfalls grau
3. Die gesamte Chart-Palette besteht fast nur aus Orange-Varianten und einem Grau

## Loesung

### 1. Neue Chart-Farbpalette in `src/index.css`

Die Chart-Farben werden durch eine visuelle Abstufung ersetzt, die zum Schwarz-Orange-Design passt, aber mehr Kontrast und Lebendigkeit bietet:

| Variable | Alt (HSL) | Neu (HSL) | Farbe |
|----------|-----------|-----------|-------|
| `--chart-1` | `25 95% 53%` (Orange) | bleibt | Primaer-Orange |
| `--chart-2` | `30 90% 45%` (Dunkel-Orange) | `30 90% 48%` | Warm-Orange |
| `--chart-3` | `20 85% 60%` (Hell-Orange) | `20 85% 60%` | bleibt |
| `--chart-4` | `35 80% 50%` | `45 90% 50%` | Amber/Gold |
| `--chart-5` | `15 75% 55%` | `160 70% 45%` | Tuerkis-Gruen (Kontrast) |
| `--chart-6` | **`0 0% 70%` (GRAU)** | **`145 65% 42%`** | **Gruen (fuer "gut")** |
| `--chart-7` | `40 70% 45%` | `200 70% 50%` | Blau (zusaetzlicher Kontrast) |

Die Kern-Aenderung: `--chart-6` wird von Grau zu **Gruen**, was intuitiv "gut/positiv" signalisiert und sofort erkennbar ist.

### 2. Balken-Farblogik in `WebsiteProfileCard.tsx`

Die `CategoryBar`-Komponente verwendet aktuell:
- Score >= 80: `bg-chart-6` (war grau, wird gruen)
- Score >= 60: `bg-primary` (orange)
- Score < 60: `bg-destructive` (rot)

Das wird beibehalten, da mit der neuen Gruen-Farbe die Ampellogik (Gruen/Orange/Rot) intuitiv funktioniert.

Die `ScoreRing`-Farbe verwendet ebenfalls `hsl(var(--chart-6))` fuer >= 80, das wird also automatisch mitgeaendert.

### 3. Competitor-Balken in `ComparisonTable.tsx`

Statt `bg-muted-foreground/40` (grau) fuer Competitor-Balken wird `bg-chart-4` (Amber/Gold) verwendet, sodass Competitors klar sichtbar sind und sich visuell von der eigenen Seite (orange `bg-primary`) unterscheiden.

Auch der Legend-Dot fuer Competitors wird von `bg-muted-foreground/40` zu `bg-chart-4` geaendert.

### 4. Trust-Bar in `AnalysisTabs.tsx`

Der Trust-Score-Balken verwendet ebenfalls `bg-primary` -- das bleibt, da es gut funktioniert.

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/index.css` | Chart-Farben `--chart-4` bis `--chart-7` in `:root` und `.dark` aendern |
| `src/components/dashboard/ComparisonTable.tsx` | Competitor-Balken: `bg-muted-foreground/40` zu `bg-chart-4` |

## Keine Aenderungen noetig

- `WebsiteProfileCard.tsx` -- profitiert automatisch von der neuen `--chart-6` Farbe
- `AnalysisTabs.tsx` -- nutzt `bg-primary`, das bereits orange ist
- `tailwind.config.ts` -- Chart-Farben sind bereits registriert

