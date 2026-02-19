

## GitHub Code Analysis als Feature auf Home und Pricing erwähnen

### Zusammenfassung
Die Deep Code Analysis (GitHub-Repository-Analyse) wird als zusätzliches Feature auf der Homepage und der Pricing-Seite sichtbar gemacht.

### Änderungen

#### 1. Homepage (`src/pages/Home.tsx`)

**Features-Sektion** -- Neues viertes Feature-Karten hinzufügen:
- Nummer: "04"
- Titel: "Code Analysis"
- Beschreibung: "Connect a public GitHub repository and get your source code scored across six categories: quality, security, performance, accessibility, maintainability, and SEO."

**Social Proof Stats** -- Neuen Stat-Eintrag hinzufuegen:
- Den vierten Stat ("Incl. / PageSpeed Data") anpassen oder einen fuenften Eintrag "Code Analysis" ergaenzen, um die GitHub-Analyse zu erwaehnen.

**Use Cases** -- Neuen Use Case hinzufuegen:
- Badge: "Code Review"
- Titel: "Code Analysis"
- Beschreibung: "Link your public GitHub repository and get your code scored across six categories -- from security to maintainability."

**FAQ** -- Neuen FAQ-Eintrag:
- Frage: "What is the Code Analysis?"
- Antwort: Erklaert, dass ein oeffentliches GitHub-Repository verknuepft werden kann und der Code in sechs Kategorien bewertet wird.

#### 2. Pricing-Seite (`src/pages/Pricing.tsx`)

**Feature-Listen** -- In beide Plans (Free und Premium) einen Eintrag hinzufuegen:
- Free: "GitHub Code Analysis" (included: true)
- Premium: "GitHub Code Analysis" (included: true)

#### 3. Feature-Vergleichstabelle (`src/components/genome/FeatureComparisonTable.tsx`)

**Neue Zeile** in der `features`-Liste:
- Name: "GitHub Code Analysis"
- Free: true (Yes)
- Premium: true (Yes)

### Technische Details

- Alle Aenderungen sind rein im Frontend (keine Backend-Aenderungen noetig)
- Das Feature-Grid auf der Homepage wird von 3 auf 4 Spalten erweitert (mit `md:grid-cols-4` oder bleibt bei 3 Spalten wobei die vierte Karte darunter erscheint -- je nach Design-Praeferenz wird `md:grid-cols-2 lg:grid-cols-4` verwendet)
- Die bestehende Reihenfolge und Nummerierung der Features bleibt konsistent

