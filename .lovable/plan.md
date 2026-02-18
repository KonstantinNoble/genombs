

# Website- und Code-Analyse gleichzeitig im Dashboard

## Uebersicht
Beide Analyse-Bereiche werden immer im Dashboard angezeigt -- untereinander, klar getrennt. Wenn fuer einen Bereich keine Daten vorliegen, erscheint ein Platzhalter-Hinweis statt der Ergebnisse.

## Aenderungen

### 1. `src/components/dashboard/AnalysisTabs.tsx`

**Aktuelle Logik:** Zeigt Website-Sektionen nur wenn `profile_data` existiert, Code-Sektion nur wenn `code_analysis` existiert. Wenn keins vorhanden, wird nichts gezeigt.

**Neue Logik:**
- Die fruehe `if (!ownSite) return null` Pruefung bleibt -- ohne Profil kein Dashboard
- Immer zwei klar getrennte Bloecke rendern:
  - **Block 1: "Website Analysis"** (mit Globe-Icon als Header)
    - Wenn `profile_data` vorhanden: Overview, Positioning, Offers, Trust wie bisher
    - Wenn nicht: Ein Platzhalter-Card mit Globe-Icon, Titel "Scan your website" und Beschreibung "Analyze your website URL to unlock positioning, trust, and conversion insights."
  - **Separator** (horizontale Trennlinie via `Separator`-Komponente)
  - **Block 2: "Code Analysis"** (mit Code-Icon als Header)
    - Wenn `code_analysis` vorhanden: CodeAnalysisCard wie bisher
    - Wenn nicht: Ein Platzhalter-Card mit Code-Icon, Titel "Analyze your repository" und Beschreibung "Connect a GitHub repository to unlock code quality, security, and performance insights."

### 2. `src/components/dashboard/SectionNavBar.tsx`

**Aktuelle Logik:** Zeigt nur Tabs fuer vorhandene Daten.

**Neue Logik:**
- Immer alle Tabs anzeigen (Overview, Positioning, Offers, Trust, Code Quality)
- Vertikaler Trenner (`w-px h-4 bg-border`) zwischen den Website-Tabs und dem Code-Tab
- Tabs ohne zugehoerige Daten werden ausgegraut: `opacity-40 pointer-events-none cursor-default`
- Props bleiben gleich (`hasCodeAnalysis`, `hasWebsiteAnalysis`), aber statt Tabs auszublenden, werden sie nur deaktiviert

### 3. `src/components/dashboard/CodeAnalysisCard.tsx`

**Zusaetzliche Absicherung gegen React Error #31:**
- `overallScore` wird durch `Math.round(Number(...))` geprueft, Fallback auf `0` bei `NaN`
- Gleiche Absicherung fuer alle Sub-Scores in `extractScore`
- `strengths` und `weaknesses` Arrays werden mit `.filter(item => typeof item === "string")` gefiltert, damit keine verschachtelten Objekte durchrutschen

---

## Technische Details

### Platzhalter-Card Komponente (inline in AnalysisTabs.tsx)

```text
+-------------------------------------------+
|  [Icon]                                   |
|  Scan your website / Analyze your repo    |
|  Beschreibung was enthalten waere         |
+-------------------------------------------+
```

Gestaltet als Card mit `border-dashed border-border`, zentriertem Icon (Globe oder Code), Titel und kurzer Beschreibung in `text-muted-foreground`.

### Nav-Bar Layout

```text
[ Overview | Positioning | Offers | Trust ]  |  [ Code Quality ]
  (aktiv/normal)                (grau)           (aktiv/normal oder grau)
```

### Betroffene Dateien
1. `src/components/dashboard/AnalysisTabs.tsx` -- Beide Sektionen immer rendern, Platzhalter bei fehlenden Daten
2. `src/components/dashboard/SectionNavBar.tsx` -- Alle Tabs immer zeigen, inaktive ausgegraut, visueller Trenner
3. `src/components/dashboard/CodeAnalysisCard.tsx` -- Robustere Score-Extraktion mit NaN-Schutz

