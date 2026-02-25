

## Dashboard Design-Upgrade: Professioneller und dynamischer

### Ueberblick
Das aktuelle Dashboard ist funktional, aber visuell etwas flach -- alle Karten sehen identisch aus, es fehlen visuelle Hierarchien und subtile Premium-Akzente. Das Upgrade macht das Design dynamischer und professioneller, ohne Emojis oder Icons hinzuzufuegen.

### Aenderungen

**1. Dashboard.tsx -- Verbesserter Page Header und Layout**
- Groesserer, markanterer Seitentitel mit einem subtilen Gradient-Texteffekt (orange-to-white)
- Feine horizontale Trennlinie unter dem Header mit animiertem Gradient-Shimmer
- Groessere Section-Headings mit Nummerierung im Mono-Stil ("01", "02", "03") passend zur Projekt-Aesthetic
- Leicht erhoehter Abstand zwischen Sektionen fuer bessere visuelle Atmung

**2. StreakCard -- Premium-Auftritt**
- Subtiler Gradient-Border-Effekt bei Hover (von border-primary/30 zu einem sichtbaren orange Glow)
- Groessere Zahlendarstellung (text-4xl statt text-3xl) fuer mehr Impact
- Ein feiner oberer Akzentstreifen (2px orange Linie) auf der aktiven "Current Streak"-Karte, wenn der Streak > 0 ist
- "Personal best"-Badge mit einem subtilen Shimmer-Effekt statt einfachem Pulse

**3. AnalyticsOverview.tsx -- Aufgewertete Stat-Cards und Bars**
- Stat-Cards erhalten eine subtile Gradient-Hintergrundebene (von card zu leicht aufgehelltem Dunkelton)
- Score-Werte (Average/Best Score) erhalten eine farbliche Kodierung nach dem bestehenden Ampelsystem (gruen >= 80, orange >= 60, rot < 60)
- Progress-Bars werden etwas hoeher (h-2 statt h-1.5) mit einem subtilen Glow-Effekt auf dem Fuellbalken
- "Recent Analyses"-Eintraege erhalten einen dezenten Hover-Effekt mit einem orange Akzent-Punkt links

**4. TodayVsAverage.tsx -- Klarere visuelle Hierarchie**
- Die drei Werte (Today / Average / Delta) erhalten einen staerkeren visuellen Unterschied: "Today" bekommt eine groessere, prominentere Darstellung
- Subtile vertikale Trennlinien (divider) zwischen den drei Spalten
- Die Category-Breakdown-Zeilen erhalten dezente alternating-row-Tints fuer bessere Lesbarkeit

**5. BadgeGallery.tsx -- Elegantere Badge-Darstellung**
- Unlocked Badges: Der Indikator-Punkt wird durch einen subtilen pulsierenden Ring ersetzt (doppelter Ring-Effekt)
- Die Badge-Karten bekommen eine leicht glasige Oberflaeche (backdrop-blur + semi-transparenter Hintergrund)
- Locked Badges: Leichter Blur-Effekt auf dem Text fuer einen staerkeren "gesperrt"-Eindruck

### Technischer Abschnitt

Alle Aenderungen sind rein visuell (CSS/Tailwind-Klassen) -- keine Logik- oder Datenbank-Aenderungen.

Betroffene Dateien:
- `src/pages/Dashboard.tsx` -- Header-Redesign, Section-Nummerierung, StreakCard-Styling
- `src/components/gamification/AnalyticsOverview.tsx` -- Stat-Cards, Bars, Recent-Liste
- `src/components/gamification/TodayVsAverage.tsx` -- Layout-Verbesserung, Divider, Row-Tints
- `src/components/gamification/BadgeGallery.tsx` -- Badge-Karten-Upgrade, Glasmorphism
- `src/index.css` -- Ggf. kleine Keyframe-Animationen (Shimmer, Glow) falls noch nicht vorhanden

Keine neuen Abhaengigkeiten noetig. Alles wird mit bestehenden Tailwind-Klassen und CSS umgesetzt.

