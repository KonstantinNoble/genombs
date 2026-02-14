

## Homepage und Pricing modernisieren

Beide Seiten werden visuell aufgefrischt und inhaltlich aktualisiert -- ohne Gradients, ohne Emojis/Icons, nur mit Typografie, Spacing und klaren Strukturen.

---

### Homepage (Home.tsx)

**Hero-Bereich**
- Groessere Headline mit besserem Zeilenabstand
- Subtitel kompakter und praegnanter formuliert
- Mini-Preview-Card entfernen (wirkt veraltet) -- stattdessen ein einfacher Social-Proof-Satz direkt unter den Buttons ("Trusted by 500+ businesses")

**Stats-Leiste**
- Aktualisierte Werte und besseres visuelles Gewicht
- Trennlinien zwischen den einzelnen Stats auf Desktop

**Features-Sektion**
- Drei-Spalten-Layout beibehalten, aber mit groesseren Titeln und mehr Whitespace
- Nummern (01, 02, 03) prominent als dekorative Elemente

**Use Cases**
- Von 2x2 Grid zu einem vertikalen, abwechselnden Layout (Text links/rechts)
- Oder alternativ: kompaktere Cards mit klarerem Scan-Flow

**How it Works**
- Horizontale Timeline-Darstellung mit verbindenden Linien zwischen den Schritten
- Klarer visueller Fortschritt von Schritt 1 zu 3

**Comparison Table**
- Aufgeraeumt mit besserem Kontrast fuer "Yes/No"-Werte
- Primaerfarbe fuer Business-Genome-Spalte beibehalten

**Testimonials**
- Groessere Zitat-Schrift, sauberere Cards
- Dezenter Rahmen statt grossem Anfuehrungszeichen

**CTA-Bereich**
- Link-Fix: "/dashboard" zu "/chat" aendern (Dashboard existiert nicht mehr)
- Kompakterer, staerkerer Call-to-Action

**FAQ**
- Bleibt wie gehabt (FAQSection-Komponente)

---

### Pricing (Pricing.tsx)

**Hero**
- Kompakterer Header mit weniger vertikalem Abstand

**Pricing Cards**
- Visuell staerker differenziert: Free-Card schlichter, Premium-Card mit leichtem primary-Hintergrund-Tint (bg-primary/5)
- Preis prominenter dargestellt
- Feature-Listen mit besserem Spacing und klarerer "included/not included"-Darstellung

**Trust Badges**
- In einer horizontalen Linie unter den Cards, mit Trennstrichen

**Feature Comparison Table**
- Besserer visueller Kontrast, sauberere Zellen

**CTA-Bereich**
- Staerker hervorgehoben mit einem umrandeten Container

---

### Technische Details

**Geaenderte Dateien:**
1. `src/pages/Home.tsx` -- Komplettes Redesign der Sektionen (Struktur bleibt gleich, nur visuelles Upgrade)
2. `src/pages/Pricing.tsx` -- Visuelles Upgrade der Cards und Sektionen
3. `src/components/genome/FeatureComparisonTable.tsx` -- Kleinere visuelle Verbesserungen (Spacing, Kontrast)

**Keine neuen Abhaengigkeiten noetig.** Alles wird mit vorhandenen Tailwind-Klassen und shadcn/ui-Komponenten umgesetzt.

**Keine Icons/Emojis, keine Gradients** -- nur Typografie, Farbe (primary = Orange), Borders und Whitespace.

