

# Mobile Blocker: Dynamisches Redesign mit Animationen und Grafiken

## Ziel
Die statische Textseite wird in eine visuell ansprechende, animierte Erfahrung verwandelt -- mit CSS-Animationen, abstrakten SVG-Grafiken und gestaffelten Einblendungen. Weiterhin ohne Icons oder Emojis, aber deutlich lebendiger.

## Neue visuelle Elemente

### 1. Animierter Hintergrund
- Subtiles **Dot-Grid-Pattern** (bereits im CSS vorhanden als `.dot-grid`)
- Zwei **schwebende Gradient-Orbs** (orange/primaer, halbtransparent) die langsam pulsieren und sich bewegen -- erzeugen Tiefe und Dynamik

### 2. Abstrakte Dashboard-Grafik (reines SVG/CSS)
- Eine stilisierte, abstrakte Darstellung eines Desktop-Dashboards aus CSS-Shapes:
  - Rechteckige "Panels" mit abgerundeten Ecken und subtilen Borders
  - Animierte "Datenbalken" die sich nacheinander fuellen (Balkendiagramm-Effekt)
  - Ein simulierter Radar-Chart-Kreis mit rotierendem Sweep
- Zeigt visuell, *was* der User auf dem Desktop sehen wuerde
- Komplett in CSS/SVG, keine externen Assets

### 3. Gestaffelte Einblendungen (Stagger Animations)
- Jedes Element (Logo, Headline, Text, Grafik, Features, Domain-Hinweis) blendet nacheinander ein
- Nutzt die vorhandenen `animate-fade-in` Keyframes mit individuellen `animation-delay` Werten
- Features gleiten einzeln von unten rein

### 4. Animierte Feature-Zeilen
- Jede Feature-Zeile hat einen kleinen **orangefarbenen Punkt** der bei Einblendung pulsiert
- Subtiler Shimmer-Effekt auf der aktiven Zeile

### 5. Domain-Hinweis mit Glow
- "synvertas.com" bekommt einen dezenten orangefarbenen Text-Glow der sanft pulsiert

## Layout-Reihenfolge
1. Logo (fade-in, delay 0)
2. Headline "Built for Desktop" (fade-in, delay 0.1s)
3. Erklaerungstext (fade-in, delay 0.2s)
4. **Abstrakte Dashboard-Grafik** (scale-in, delay 0.3s)
5. Feature-Liste (stagger fade-in, delays 0.5s / 0.6s / 0.7s)
6. Domain-Hinweis (fade-in, delay 0.9s)

## Technische Details

**Datei:** `src/components/MobileBlocker.tsx`
- Inline-SVG oder CSS-basierte Dashboard-Illustration hinzufuegen
- Gradient-Orbs als absolut positionierte `div`s mit CSS-Animationen
- Alle Animationen ueber Tailwind-Klassen + inline `style={{ animationDelay }}` 
- `dot-grid` Klasse auf den Container anwenden

**Datei:** `src/index.css`
- Neue Keyframes fuer die Dashboard-Grafik:
  - `@keyframes bar-fill` -- Balken fuellen sich von 0% auf Zielbreite
  - `@keyframes float` -- Sanftes Schweben der Orbs
  - `@keyframes radar-sweep` -- Rotation des Radar-Sweep-Indikators
  - `@keyframes dot-pulse` -- Pulsierender Punkt neben Features

