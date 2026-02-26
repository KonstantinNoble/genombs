

## Tabellen-Spalten korrekt ausrichten

### Problem
Die Spalten in den Tabellen (Category Breakdown, Category Averages, Recent Analyses) sind nicht korrekt ausgerichtet. Header und Daten-Zellen haben keine konsistenten Breitenangaben, wodurch die Inhalte visuell verschoben erscheinen.

### Loesung
Allen drei Tabellen feste, prozentuale Spaltenbreiten ueber `<colgroup>` zuweisen und die Textausrichtung zwischen Header und Body-Zellen konsistent machen.

---

### Aenderungen

#### 1. `src/components/gamification/TodayVsAverage.tsx` — Category Breakdown

`<colgroup>` vor `<thead>` einfuegen:
```html
<colgroup>
  <col style="width: 40%" />
  <col style="width: 15%" />
  <col style="width: 15%" />
  <col style="width: 30%" />
</colgroup>
```

Sicherstellen, dass `<td>`-Zellen fuer Today/Average/Delta dieselbe `text-right` Ausrichtung wie die `<th>` Header haben, und die `pr-3`/`pl-3` Paddings konsistent auf beiden Ebenen gesetzt sind.

#### 2. `src/components/gamification/AnalyticsOverview.tsx` — Category Averages

`<colgroup>` einfuegen:
```html
<colgroup>
  <col style="width: 70%" />
  <col style="width: 30%" />
</colgroup>
```

#### 3. `src/components/gamification/AnalyticsOverview.tsx` — Recent Analyses

`<colgroup>` einfuegen:
```html
<colgroup>
  <col style="width: 50%" />
  <col style="width: 20%" />
  <col style="width: 30%" />
</colgroup>
```

---

### Ergebnis
- Spaltenbreiten sind fest definiert und verrutschen nicht mehr
- Header und Daten sind exakt untereinander ausgerichtet
- Keine Logik-Aenderungen, nur Layout-Fixes

