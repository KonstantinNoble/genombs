

## Dashboard-Redesign: Professionelle, technische Webseiten-Aesthetik

### Ziel
Das Dashboard soll wie eine hochprofessionelle, technische Webseite wirken -- nicht wie eine App oder Webapp. Klare Typografie, grosszuegige Whitespace, mono-numerierte Sektionen, keine Emojis/Icons. Orientierung an der bestehenden visuellen Identitaet (orange Akzente, dunkles Theme, Shimmer-Effekte).

### Zusaetzlich: Build-Fehler in Edge Functions beheben
Die 22 TypeScript-Fehler in `chat/index.ts`, `analyze-website/index.ts` und `process-analysis-queue/index.ts` werden durch fehlende Typ-Annotationen bei Supabase-Queries verursacht. Diese werden parallel behoben.

---

### Aenderungen

#### 1. Dashboard Page (`src/pages/Dashboard.tsx`)

**Strukturelle Verbesserungen:**
- ArrowLeft-Icon entfernen (keine Icons) -- stattdessen reinen Text-Link "Back to Analysis" verwenden
- Seitenbreite von `max-w-4xl` auf `max-w-5xl` erhoehen fuer grosszuegigere Wirkung
- Hero-Bereich vergroessern: Titel von `text-4xl` auf `text-5xl`, Untertitel ausfuehrlicher
- Streak-Cards von 3-Spalten-Grid auf ein horizontales Layout mit klaren Trennlinien umbauen (wie eine Statistik-Leiste auf einer Webseite)
- Sektions-Header mit groesserer mono-Nummerierung und feiner Trennlinie darunter
- Mehr vertikaler Abstand zwischen Sektionen (mb-14 auf mb-20)

**Streak-Bereich neu als horizontale Statistik-Leiste:**
```
   01 Current Streak    |    02 Longest Streak    |    03 Total Active Days
         12 days               18 days                    42 days
```
- Horizontale Anordnung mit vertikalen Separatoren
- Grosse mono-Zahlen, kleine Labels darunter
- Kein Card-Border, stattdessen eine einzige umschliessende Container-Linie

#### 2. AnalyticsOverview (`src/components/gamification/AnalyticsOverview.tsx`)

- Stat-Cards visuell verfeinern: groessere Zahlen, klarere Hierarchie
- "Category Averages" Abschnitt mit Tabellenstruktur statt Progress-Bars (wirkt professioneller/technischer)
- "Recent Analyses" als saubere Tabelle mit Spaltenheadern (URL, Score, Date)
- Subtile Zeilen-Hover-Effekte beibehalten

#### 3. TodayVsAverage (`src/components/gamification/TodayVsAverage.tsx`)

- Drei-Spalten-Vergleich (Today / Average / Delta) beibehalten, aber visuell schaerfer trennen
- Vertikale Linien als echte Separator-Elemente
- Kategorie-Tabelle mit Spaltenheadern (Category, Today, Average, Delta)

#### 4. BadgeGallery (`src/components/gamification/BadgeGallery.tsx`)

- Lock-Icon entfernen (keine Icons)
- Gesperrte Badges stattdessen mit "LOCKED" Text-Label und staerkerer Opacity-Reduktion
- Unlocked-Badges: Pulsing-Ring-Indikator beibehalten (ist technisch, kein Icon)
- Saubereres Grid-Layout

#### 5. StreakBadge (`src/components/gamification/StreakBadge.tsx`)

- Flame-Icon entfernen, durch pulsierenden Punkt ersetzen (konsistent mit dem Rest)
- Text "12 day streak" bleibt

#### 6. Build-Fehler beheben

**`supabase/functions/chat/index.ts`:**
- `refundCredits` und `checkAndDeductCredits`: Typ-Annotationen fuer `data` und `credits` hinzufuegen mit expliziten Interfaces
- Supabase-Client-Parameter mit `any` typisieren um SupabaseClient-Inkompatibilitaet zu loesen

**`supabase/functions/analyze-website/index.ts`:**
- Gleiche Typ-Annotationen fuer `refundCredits` und `checkAnalysisCredits`
- `baseCredits` und `credits` explizit typisieren

**`supabase/functions/process-analysis-queue/index.ts`:**
- `processingCount` Null-Check mit `?? 0` beheben

---

### Technische Details

Alle Aenderungen folgen den bestehenden Patterns:
- Mono-Nummerierungen ("01", "02", "03")
- Shimmer-Gradient-Linien als Trenner
- Traffic-Light-Farbsystem (gruen >= 80, orange >= 60, rot < 60)
- Staggered Fade-In-Animationen
- Keine Emojis, keine dekorativen Icons
- `font-mono` fuer Zahlen, `tabular-nums` fuer Alignment
- `bg-background/60` fuer Durchschein-Effekt des Hintergrundbilds

