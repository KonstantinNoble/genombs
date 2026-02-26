

## Dashboard-Redesign: Hochprofessionelle, technische Webseiten-Aesthetik

### Ziel
Das Dashboard wird zu einer klaren, professionellen Webseite umgestaltet. Alle Icons und Emojis werden entfernt. Stattdessen: klare Typografie, grosszuegiger Whitespace, mono-nummerierte Sektionen, Tabellenstrukturen statt Progress-Bars.

---

### 1. Dashboard Page (`src/pages/Dashboard.tsx`)

- `ArrowLeft` Icon-Import entfernen, durch Text-Pfeil `←` ersetzen
- Seitenbreite von `max-w-4xl` auf `max-w-5xl`
- Titel von `text-4xl` auf `text-5xl`, Untertitel ausfuehrlicher
- **Streak-Bereich komplett umbauen**: 3 einzelne Cards ersetzen durch eine einzige horizontale Statistik-Leiste mit `divide-x divide-border` Separatoren
- Sektions-Header: Nummerierung von `text-xs` auf `text-lg`, Trennlinie darunter
- Abstaende von `mb-14` auf `mb-20`

**Neues Streak-Layout:**
```text
   01 Current Streak    |    02 Longest Streak    |    03 Total Active Days
         12 days               18 days                    42 days
```

### 2. StreakBadge (`src/components/gamification/StreakBadge.tsx`)

- `Flame` Icon-Import komplett entfernen
- Durch pulsierenden Punkt ersetzen (kleiner orangener Dot mit ping-Animation)
- `font-mono` fuer die Streak-Zahl

### 3. BadgeGallery (`src/components/gamification/BadgeGallery.tsx`)

- `Lock` Icon-Import entfernen
- Gesperrte Badges: Lock-Icon durch ein kleines "LOCKED" Text-Label ersetzen
- Opacity von 0.45 auf 0.3 reduzieren fuer staerkeren Kontrast
- Unlock-Datum mit `font-mono`

### 4. AnalyticsOverview (`src/components/gamification/AnalyticsOverview.tsx`)

- `AnimatedBar` Komponente und Progress-Bars komplett entfernen
- "Category Averages" als HTML-Tabelle mit `thead`/`tbody` und Spalten: Category, Score
- "Recent Analyses" als HTML-Tabelle mit Spalten: URL, Score, Date
- `Card`-Import entfernen, native `div` mit `rounded-xl border border-border bg-card/80 backdrop-blur-sm`
- Alle Zahlen `font-mono tabular-nums`

### 5. TodayVsAverage (`src/components/gamification/TodayVsAverage.tsx`)

- `Card`-Import entfernen, native `div` mit gleichen Styles
- Overall-Vergleich als horizontale Leiste mit `divide-x divide-border`
- Category Breakdown als HTML-Tabelle mit Spaltenheadern: Category, Today, Average, Delta
- Alternating row tints beibehalten

---

### Technische Details

Alle Aenderungen folgen den bestehenden Patterns:
- Mono-Nummerierungen ("01", "02", "03") mit groesserer Schrift
- Shimmer-Gradient-Linien als Trenner
- Traffic-Light-Farbsystem (gruen >= 80, orange >= 60, rot < 60)
- Staggered Fade-In-Animationen bleiben erhalten
- Keine Emojis, keine dekorativen Icons
- `font-mono` fuer Zahlen, `tabular-nums` fuer Alignment
- `bg-card/80 backdrop-blur-sm` fuer Glassmorphism-Effekt

