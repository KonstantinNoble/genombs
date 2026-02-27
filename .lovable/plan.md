
Ziel: Die Tabellen sollen nicht nur feste Spaltenbreiten haben, sondern auch optisch exakt ausgerichtet wirken. Aktuell sind die Spaltenbreiten zwar per `colgroup` gesetzt, aber Header- und Body-Zellen nutzen unterschiedliche Innenabstände und teilweise konkurrierende Width-Klassen, wodurch Werte “verschoben” erscheinen.

1) Root-Cause beheben (kein Redesign, nur präzise Layout-Korrektur)
- In allen drei betroffenen Tabellen (`Category Breakdown`, `Category Averages`, `Recent Analyses`) die Zell-Ausrichtung vereinheitlichen:
  - identische horizontale Padding-Logik für `th` und `td` je Spalte
  - gleiche Textausrichtung pro Spalte (`text-left` vs `text-right`) in Kopf und Body
  - `whitespace-nowrap` für numerische Spalten (Score/Date/Delta), damit kein Zeilenumbruch die Wahrnehmung verschiebt
- Konfliktierende Breiten-Helfer in Headern entfernen (z. B. `w-16`, `w-24`, `w-28`), wenn bereits `colgroup` aktiv ist.

2) `src/components/gamification/TodayVsAverage.tsx` gezielt korrigieren
- `colgroup` behalten (40/15/15/30), aber Header-/Body-Zellen pro Spalte auf ein gemeinsames Raster bringen:
  - Kategorie-Spalte: gleiche linke Einrückung in `th` und `td`
  - Today/Average/Delta: identisches `text-right` + identisches rechtes Padding
- Verbleibende `w-*` Klassen in den Headerzellen entfernen, damit nur `colgroup` die Breite steuert.

3) `src/components/gamification/AnalyticsOverview.tsx` gezielt korrigieren
- Tabelle „Category Averages“:
  - `colgroup` (70/30) behalten
  - Header Score-Spalte mit gleichem rechtem Padding wie Score-`td`
- Tabelle „Recent Analyses“:
  - `colgroup` (50/20/30) behalten
  - URL-, Score- und Date-Spalten auf konsistente Header/Body-Paddings bringen
  - URL-Truncation sauber auf ein inneres Element legen (statt uneinheitlicher `td`-Breitenwirkung), damit die 50%-Spalte stabil bleibt

4) Stabilitäts-Feinschliff für Tabellen-Rendering
- Tabellen auf einheitliches Verhalten setzen:
  - `table-fixed` bleibt aktiv
  - konsistente `border-spacing`/Padding-Wahrnehmung (ohne zusätzliche variierende Width-Utilities)
- Bestehende Hover-/Animation-Effekte bleiben unverändert, damit nur das Alignment korrigiert wird.

5) Validierung nach Umsetzung
- Desktop prüfen:
  - Headertext steht exakt über den Werten in jeder Spalte
  - kein sichtbares „Springen“ bei langen URLs oder Chips
- Mobile prüfen:
  - kein unerwarteter Umbruch in numerischen Spalten
  - Spalten bleiben visuell untereinander
- Ergebnis: reine Layout-Korrektur ohne Logikänderung.

Technische Kurzbegründung
- Das Problem ist sehr wahrscheinlich kein fehlendes `colgroup` mehr, sondern eine Kombination aus:
  1) ungleichen `th`/`td` Innenabständen,
  2) zusätzlichen `w-*` Klassen in Headern trotz `colgroup`,
  3) uneinheitlicher Inhaltsbegrenzung (insb. URL-Zelle).
- Durch „ein Raster für alle Zellen“ + „eine einzige Breitenquelle (`colgroup`)“ werden die Spalten wieder sauber ausgerichtet.
