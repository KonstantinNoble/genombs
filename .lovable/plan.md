

# Today Score vs Average Score -- Achievements Page

## Uebersicht

Neue Sektion auf der Achievements-Seite, die den heutigen Score der eigenen Website mit dem historischen Durchschnitt vergleicht. Nur eigene Websites (`is_own_website = true`) werden beruecksichtigt. Die Darstellung zeigt Verbesserung oder Verschlechterung in Prozentpunkten -- sowohl fuer den Gesamtscore als auch fuer jede einzelne Kategorie.

## Datenlogik

- **Datenquelle**: Tabelle `website_profiles` mit Filter `is_own_website = true` und `status = 'completed'`
- **Today Score**: Die neueste Analyse von heute (UTC). Falls heute keine Analyse vorliegt, wird "No analysis today" angezeigt
- **Average Score**: Durchschnitt aller bisherigen eigenen Website-Analysen (exklusive heute, um einen fairen Vergleich zu ermoeglichen)
- **Delta**: `today_score - average_score` in Prozentpunkten (positiv = Verbesserung, negativ = Verschlechterung)
- Gleiche Logik fuer alle 5 Kategorien: Findability, Mobile Usability, Offer Clarity, Trust & Proof, Conversion Readiness

## Design

Technisch-futuristisch, passend zum bestehenden Stil:

- Dunkle Card mit `border-border bg-card`, monospaced Zahlen (`font-mono`, `tabular-nums`)
- Obere Reihe: Gesamtscore-Vergleich -- drei Spalten: "TODAY", "AVERAGE", "DELTA"
- Delta-Wert farblich kodiert: `text-emerald-400` bei Verbesserung, `text-red-400` bei Verschlechterung, `text-muted-foreground` bei Gleichstand
- Delta-Prafix: `+` oder `-` vor den Prozentpunkten, Suffix `pp` (percentage points)
- Darunter: Kategorie-Breakdown als kompakte Zeilen mit gleicher Logik
- Kein Einsatz von Emojis oder Lucide-Icons
- Sektion-Header: `text-[10px] uppercase tracking-widest` (wie bereits bei "Category Averages" und "Recent Analyses")

## Technische Umsetzung

### Neue Datei: `src/components/gamification/TodayVsAverage.tsx`

- Props: `userId: string`, `refreshKey?: number`
- Eigener `useEffect` fuer Datenabfrage ueber den externen Supabase-Client
- Query: `website_profiles` WHERE `user_id`, `is_own_website = true`, `status = 'completed'`, sortiert nach `created_at desc`
- Berechnung im Frontend:
  - Filtern nach heutigem Datum (UTC)
  - Durchschnitt ueber alle aelteren Eintraege berechnen
  - Delta pro Kategorie und Gesamt
- Loading-Skeleton und Empty-State analog zu `AnalyticsOverview`
- Count-Up-Animation fuer die Zahlen (gleiche `useCountUp`-Logik)

### Aenderung: `src/pages/Achievements.tsx`

- Import der neuen `TodayVsAverage`-Komponente
- Einfuegen als neue Sektion zwischen den Streak-Cards und der Analytics-Sektion
- Sektion-Header: "Today vs Average"
- Gleiche Entrance-Animation (fade-up mit Delay)

## Visuelles Layout (vereinfacht)

```text
+--------------------------------------------------+
|  TODAY VS AVERAGE                                 |
+--------------------------------------------------+
|  TODAY        AVERAGE        DELTA                |
|  78           72             +6 pp                |
+--------------------------------------------------+
|  Findability         82    75    +7 pp            |
|  Mobile Usability    71    70    +1 pp            |
|  Offer Clarity       80    74    +6 pp            |
|  Trust & Proof       68    72    -4 pp            |
|  Conversion Ready    89    69    +20 pp           |
+--------------------------------------------------+
```

