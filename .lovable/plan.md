
## Dashboard dynamischer und aesthetischer gestalten

### Ziel
Das Dashboard bekommt mehr visuelle Dynamik und Eleganz -- durch subtile Animationen, bessere Raumnutzung, Glow-Effekte und verfeinerte Interaktionen. Alles bleibt konsistent mit der bestehenden technischen Aesthetik (keine Icons/Emojis).

---

### 1. Dashboard Page (`src/pages/Dashboard.tsx`)

**Hero-Bereich aufwerten:**
- Titel mit animiertem Gradient-Shift (langsam wechselnder Farbverlauf statt statischem Gradient)
- Subtitle mit leicht verzoegertem Fade-In fuer gestaffelten Effekt
- Shimmer-Divider etwas breiter/sichtbarer machen (2px statt 1px)

**Streak-Leiste dynamischer:**
- Hover-Effekt auf einzelne Stat-Zellen: leichter Glow + Scale-Up
- Aktive Streak (> 0) bekommt subtilen pulsierenden Border-Glow
- Zahlen groesser (text-5xl statt text-4xl) fuer mehr Impact

**Sektions-Uebergaenge verfeinern:**
- Laengere Stagger-Delays (80ms statt 50ms) fuer eleganteres Einblenden
- Sektionsheader-Nummer bekommt einen subtilen Glow wenn die Sektion sichtbar wird

### 2. AnalyticsOverview (`src/components/gamification/AnalyticsOverview.tsx`)

**Stat-Cards lebendiger:**
- Hover-Effekt verstaerken: leichter Scale-Up (scale-[1.02]) + staerkerer Glow
- Score-Werte mit Traffic-Light-Glow (gruener/oranger/roter Schein hinter der Zahl)
- Mehr Abstand zwischen den Cards (gap-4 statt gap-3)

**Tabellen aesthetischer:**
- Zeilen-Hover mit sanftem linken Border-Akzent in Primaerfarbe
- Score-Zellen mit rundem Hintergrund-Chip im Traffic-Light-Stil
- Header-Zeile mit leichtem Gradient statt harter Border

### 3. TodayVsAverage (`src/components/gamification/TodayVsAverage.tsx`)

**Overall-Vergleich aufwerten:**
- Today-Score groesser und mit Glow-Effekt (wie ein Spotlight)
- Delta-Wert mit animiertem Pfeil-Indikator (reines CSS-Dreieck, kein Icon)
- Hover auf Zellen zeigt subtilen Hintergrund-Pulse

**Tabelle dynamischer:**
- Delta-Spalte mit farbigem Hintergrund-Chip (gruen/rot/neutral)
- Sanfte Zeilen-Einblende-Animation beibehalten, aber mit leichtem Scale-Effekt

### 4. BadgeGallery (`src/components/gamification/BadgeGallery.tsx`)

**Unlocked Badges lebendiger:**
- Hover-Effekt: Badge-Karte hebt sich staerker an + Glow-Ring wird intensiver
- Pulsing-Ring-Animation etwas langsamer und groesser fuer elegantere Wirkung
- Badge-Name bekommt bei Hover einen subtilen Gradient-Text-Effekt

**Locked Badges interessanter:**
- Leichter Glassmorphism-Effekt statt komplettem Fade-Out
- "LOCKED" Label mit animiertem Shimmer-Durchlauf
- Hover zeigt die Unlock-Bedingung prominenter

### 5. CSS Animationen (`src/index.css`)

**Neue Keyframes und Utilities:**
- `dashboard-glow-pulse`: Subtiler pulsierender Box-Shadow fuer aktive Elemente
- `dashboard-gradient-shift`: Langsam wechselnder Hintergrund-Gradient fuer den Titel
- `dashboard-row-highlight`: Linker Border-Slide-In fuer Tabellen-Hover
- `dashboard-score-chip`: Runder Hintergrund mit Traffic-Light-Farbe fuer Score-Werte

---

### Technische Details

- Alle neuen Animationen nutzen `will-change: transform, opacity` fuer GPU-Beschleunigung
- Hover-Effekte nur mit CSS-Transitions, kein JavaScript
- Bestehende Stagger-Animationen und Count-Up-Logik bleiben erhalten
- Keine neuen Dependencies noetig
- Konsistent mit der "No Icons/No Emojis"-Regel
- Alle Farben aus dem bestehenden Design-System (primary, chart-6, destructive)
