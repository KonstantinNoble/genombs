

# Homepage: Neue Features hervorheben

## Uebersicht
Die Homepage wird erweitert, um die neuen Funktionen -- insbesondere die automatische Konkurrentensuche mit KI -- ueberzeugend zu praesentieren. Ausserdem wird ein kleiner Bug gefixt (deutsche Texte in CompetitorSuggestions).

## Aenderungen

### 1. Feature-Karte "Auto Competitor Discovery" hinzufuegen (`src/pages/Home.tsx`)

Neues Feature `05` im `features`-Array:

```text
05 - Auto Competitor Discovery
"Don't know your competitors? Let AI find them. Toggle auto-search and we'll identify your top competitors before the analysis even starts."
```

### 2. Neuer Use Case hinzufuegen (`src/pages/Home.tsx`)

Neuer Eintrag im `useCases`-Array:

```text
Badge: "AI-Powered"
Title: "Auto Competitor Discovery"
Description: "Not sure who you're competing with? Enable AI-powered competitor search and we'll identify relevant competitors for you -- no manual URL entry needed."
```

### 3. Hero-Subtext erweitern (`src/pages/Home.tsx`)

Aktuelle Beschreibung:
> "Paste a URL and get scores across five categories, competitor benchmarks, and a prioritized list of what to fix."

Neue Beschreibung:
> "Paste a URL and get scores across five categories, AI-powered competitor discovery, and a prioritized list of what to fix."

### 4. Social Proof Stats anpassen (`src/pages/Home.tsx`)

Den vierten Stat-Block aendern von:
> "Incl." / "PageSpeed & Code Analysis"

zu:
> "AI" / "Auto Competitor Search"

### 5. Vergleichstabelle erweitern (`src/pages/Home.tsx`)

Neue Zeile im `comparisonRows`-Array:

| Feature | Synvertas | Consultant |
|---|---|---|
| Auto Competitor Discovery | Yes | Manual research |

### 6. FAQ erweitern (`src/pages/Home.tsx`)

Neue FAQ:
> **"Can AI find my competitors for me?"**
> "Yes. When starting an analysis, you can toggle 'Find competitors automatically with AI.' Our system uses AI-powered web search to identify your most relevant competitors based on your website's industry and positioning. You then select which ones to include in the analysis."

### 7. Bugfix: Deutsche Texte in CompetitorSuggestions (`src/components/chat/CompetitorSuggestions.tsx`)

Zeilen 70-72 aendern:
- "Limit erreicht: max. X Competitors auswaehlbar" -> "Limit reached: max. X competitors selectable"
- "X / Y Competitors ausgewaehlt" -> "X / Y competitors selected"

## Dateien

| Datei | Aenderung |
|---|---|
| `src/pages/Home.tsx` | Feature 05, Use Case, Hero-Text, Stats, Vergleichstabelle, FAQ |
| `src/components/chat/CompetitorSuggestions.tsx` | Deutsche Texte -> Englisch |

