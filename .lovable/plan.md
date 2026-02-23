
# Homepage Feature-Sektion Redesign

## Was sich aendert

### 1. Features: Von 5 Karten auf 3 umfassende Karten

Die aktuellen 5 einzelnen Feature-Karten werden zu 3 groesseren, inhaltlich staerkeren Karten zusammengefasst:

| Neue Karte | Inhalt (zusammengefasst aus) |
|---|---|
| **Website Scoring & Insights** | "Website Scoring" + "Code Analysis" -- Scoring ueber 5 Kategorien plus optionale Code-Analyse via GitHub |
| **Competitor Intelligence** | "Competitor Analysis" + "Auto Competitor Discovery" -- Vergleich mit bis zu 3 Wettbewerbern, mit optionaler KI-gesteutzter automatischer Erkennung |
| **Actionable Improvement Plan** | "Improvement Plan" -- Priorisierte, konkrete Optimierungsaufgaben basierend auf der Analyse |

### 2. Verbessertes Karten-Design

- Groessere Karten mit mehr Padding und visueller Praesenz
- Jede Karte bekommt ein Lucide-Icon (z.B. `BarChart3`, `Users`, `ListChecks`)
- Subtiler Gradient-Border beim Hover (orange Akzent)
- Die 3 Karten werden in einer gleichmaessigen 3-Spalten-Reihe dargestellt (sauberes Grid)

### 3. "How it Works" Verweis unterhalb der Features

Direkt unter dem Feature-Grid wird ein kompakter Call-to-Action-Bereich eingefuegt:
- Text: "Want to see the full process?"
- Link-Button: "See How it Works" mit Pfeil-Icon, verlinkt auf `/how-it-works`
- Dezent gestaltet, passt zum bestehenden Design

## Betroffene Datei

| Datei | Aenderung |
|---|---|
| `src/pages/Home.tsx` | `features`-Array von 5 auf 3 Eintraege reduzieren, Icons hinzufuegen, "How it Works"-Link unter dem Grid, Karten-Styling verbessern |

## Technische Details

- Das `features`-Array wird auf 3 Objekte reduziert, jeweils mit einem zusaetzlichen `icon`-Feld (Lucide-Icon-Komponente)
- Das Grid bleibt `grid-cols-1 md:grid-cols-3` (kein `lg:grid-cols-3` noetig, da 3 Karten immer gleichmaessig aufgehen)
- Karten bekommen mehr `p-10` statt `p-8`, groessere Ueberschriften
- Unterhalb des Grids wird ein zentrierter Link-Block mit `Link to="/how-it-works"` eingefuegt
- Keine neuen Dateien oder Abhaengigkeiten noetig
