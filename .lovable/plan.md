

# Frontend-Erweiterung: Umfassende Strukturen und Funktionsuebersichten

## Ueberblick

Das aktuelle Frontend hat die Grundbausteine, wirkt aber noch wie ein Prototyp. Dieses Update macht aus jeder Seite eine vollwertige, professionelle Ansicht mit echten Strukturen, Leisten, Indikatoren und Funktionsuebersichten -- sodass das Produkt "Business Genome" sofort greifbar wird.

---

## 1. Homepage (`/`) -- Vollstaendige Produkt-Landingpage

**Aktuell:** Hero + 3 Feature-Cards + 3 Schritte + CTA = 4 Sektionen, relativ schlank.

**Neu hinzugefuegt:**

### Social-Proof-Leiste (nach Hero)
- Zahlenreihe: "500+ Businesses Analyzed" | "12 Market Segments" | "< 60s per Analysis"
- Animierte Counter-Zahlen (statisch als Demo)

### Use-Cases-Sektion (nach Features)
- 3-4 konkrete Anwendungsfaelle als Karten:
  - "Competitor Research" -- Wettbewerber analysieren in Sekunden
  - "Market Entry" -- Neuen Markt verstehen bevor man einsteigt
  - "Sales Intelligence" -- Leads qualifizieren durch Website-Analyse
  - "Content Strategy" -- Content-Luecken im Markt finden
- Jede Karte mit Icon, Titel, Beschreibung und Beispiel-Badge

### Vergleichstabelle (neue Sektion)
- "Business Genome vs. Traditional Tools"
- Tabelle mit Zeilen: Speed, Depth, Cost, Automation, Graph-based
- Business Genome hat Haekchen/Check, andere Tools haben X oder "Partial"

### Testimonial-Platzhalter (vor CTA)
- 2-3 Zitat-Karten mit Platzhalter-Namen und -Firmen
- Vorbereitet fuer echte Testimonials spaeter

### FAQ-Sektion (vor Footer)
- Accordion-Element mit 5-6 haeufigen Fragen:
  - "What is a Business Genome?"
  - "How accurate is the analysis?"
  - "What data sources do you use?"
  - "How long does an analysis take?"
  - "Can I export reports?"
  - "Is my data secure?"

---

## 2. Dashboard (`/dashboard`) -- Vollstaendiges Analyse-Cockpit

**Aktuell:** Nur URL-Input + Scan-Limit-Bar + Scan-History. Keine Uebersicht.

**Neu hinzugefuegt:**

### Begruessung + Quick-Stats-Leiste (oben)
- "Welcome back, [Name]" oder "Welcome back" (wenn kein Name vorhanden)
- 4 Stat-Karten nebeneinander:
  - "Total Analyses" (Zahl + Icon)
  - "This Month" (Zahl + Icon)
  - "Credits Remaining" (Zahl + Fortschrittsbalken)
  - "Plan" (Free/Premium Badge + Upgrade-Link)

### Verbesserter URL-Input-Bereich
- Bleibt, bekommt aber einen Hinweis-Text:
  - "Supported: Company websites, SaaS landing pages, E-Commerce shops"
- Und eine "Recent URLs" Schnellauswahl darunter (letzte 3 analysierte Domains als Chips)

### Tab-Navigation fuer Scan-Historie
- Tabs: "All" | "Completed" | "In Progress" | "Failed"
- Suchfeld zum Filtern nach Domain/Company
- Sortierung: "Newest first" / "Oldest first"

### Verbesserte ScanCard
- Zusaetzlich zum bestehenden Inhalt:
  - Kleine Tag-Zeile mit erkanntem Business Model (z.B. "SaaS", "E-Commerce")
  - Genome-Completeness-Indikator (kleiner Fortschrittsbalken: "9/9 sections analyzed")
  - Quick-Actions: "View" | "Re-analyze" | "Delete" (als Hover-Aktionen)

### Leerer Zustand verbessert
- Groesserer visueller Bereich mit gestricheltem Border
- Schritt-fuer-Schritt Anleitung: "1. Enter URL  2. Click Analyze  3. View your Genome"
- Beispiel-URL als klickbarer Vorschlag: "Try: stripe.com"

---

## 3. Genome-Ansicht (`/genome/:id`) -- Vollstaendiges Intelligence-Dashboard

**Aktuell:** 9 Karten in einem Grid. Keine Uebersicht, kein Scoring, keine Navigation.

**Neu hinzugefuegt:**

### Executive Summary (neuer Bereich oben, volle Breite)
- Zusammenfassung in 2-3 Saetzen (aus Demo-Daten)
- Genome-Score als grosser Kreis-Indikator (z.B. "87/100") mit Label "Genome Completeness"
- 4 Mini-Stat-Karten daneben:
  - "Offers Detected" (Zahl)
  - "Audience Clusters" (Zahl)
  - "Channels Active" (Zahl)
  - "Trust Signals" (Zahl)

### Inhaltsverzeichnis / Quick-Navigation
- Horizontale Leiste mit klickbaren Ankern zu jeder Genome-Sektion
- Sticky am oberen Rand beim Scrollen
- Aktive Sektion wird highlighted (z.B. orange Unterstrich)
- Sektionen: Overview | Offers | Audience | Funnel | Messaging | Channels | Content | Trust | Traffic

### Verbesserte Genome-Cards

**Business Model Card (erweitert):**
- Zusaetzlich: "Revenue Model" Tag (z.B. "Transaction-based", "Subscription")
- "Pricing Transparency" Indikator (Low/Medium/High als farbige Badge)

**Offer Structure Card (erweitert):**
- Tabellen-artige Darstellung statt nur Liste
- Spalten: Name | Type | Price Signal | Tier
- Visuelle Trennung zwischen Angeboten

**Audience Clusters Card (erweitert):**
- Jeder Cluster bekommt einen "Size Estimate" Tag (Small/Medium/Large)
- Und ein "Priority" Level (Primary/Secondary)

**Funnel Analysis Card (erweitert):**
- Visueller Funnel als vertikale Leiste/Fortschrittsanzeige
- Jedes Element mit Nummer und Verbindungslinie
- Funnel-Score: "Completeness: 4/5 stages"

**Channel Usage Card (erweitert):**
- Nicht nur Tags, sondern eine Tabelle mit:
  - Channel-Name | Strength (Low/Medium/High als farbige Balken) | Priority

**Traffic Data Card (erweitert):**
- Balkendiagramm fuer Traffic Sources (mit recharts, bereits installiert)
- Kreisdiagramm / Donut fuer Traffic-Verteilung

### Neue Sektionen

**Recommendations (neuer Bereich):**
- 3-5 konkrete Empfehlungen basierend auf der Analyse
- Jede Empfehlung als Karte mit:
  - Priority (High/Medium/Low) als farbige Badge
  - Kategorie (Content, Channel, Funnel, Positioning)
  - Beschreibung
- Beispiel: "Add a free trial to your funnel -- 72% of competitors offer one"
- Premium-only Badge fuer detailliertere Empfehlungen

**Competitor Snapshot (neuer Platzhalter-Bereich):**
- "Coming Soon" Bereich mit Vorschau
- "Top 3 Competitors detected" mit Platzhalter-Karten
- Lock-Icon fuer Premium
- CTA: "Upgrade to unlock competitor analysis"

### PDF Export Vorschau
- Button bleibt disabled, aber beim Hover: Tooltip "Coming soon -- Premium feature"

---

## 4. Pricing (`/pricing`) -- Erweiterte Preis-Seite

**Aktuell:** 2 Karten + CTA. Minimal.

**Neu hinzugefuegt:**

### Feature-Vergleichstabelle (nach den Karten)
- Vollstaendige Tabelle mit allen Features
- Zeilen: Analyses/Month, Business Model, Offers, Audience, Funnel, Channels, Content, Trust, Traffic Data, PDF Export, Competitor Analysis, API Access, Priority Support
- Spalten: Free | Premium
- Check/X Icons pro Zelle

### FAQ-Sektion
- Accordion mit Pricing-spezifischen Fragen:
  - "Can I cancel anytime?"
  - "What happens when I hit the free limit?"
  - "Do you offer annual billing?"
  - "Is there a refund policy?"

### Trust-Leiste
- Kleine Icons/Badges: "Cancel anytime" | "No credit card for free" | "SSL encrypted" | "GDPR compliant"

---

## 5. Neue/Erweiterte Komponenten

### Neue Komponenten:
- `StatCard` -- Kleine Statistik-Karte (Zahl, Label, Icon, optionaler Trend)
- `GenomeScore` -- Kreis-Indikator fuer Genome-Completeness
- `SectionNav` -- Sticky horizontale Navigation fuer Genome-Ansicht
- `FeatureComparisonTable` -- Tabelle fuer Pricing-Vergleich
- `RecommendationCard` -- Empfehlungskarte mit Priority-Badge
- `ChannelStrengthBar` -- Horizontaler Staerke-Balken
- `CompetitorPreview` -- Platzhalter fuer Wettbewerbsanalyse
- `FAQSection` -- Wiederverwendbare Accordion-FAQ-Komponente

### Erweiterte Demo-Daten (`demo-data.ts`):
- `recommendations` Array pro Genome (3-5 Empfehlungen)
- `executiveSummary` pro Genome (2-3 Saetze)
- `genomeScore` pro Genome (0-100)
- `channelStrengths` mit Staerke-Werten pro Kanal
- `competitors` Platzhalter-Array (3 erkannte Wettbewerber)
- `audienceCluster.size` und `.priority` Felder
- `pricingTransparency` Feld (low/medium/high)
- `revenueModel` Feld

---

## 6. Technische Details

### Dateien die ERSTELLT werden:
- `src/components/genome/StatCard.tsx`
- `src/components/genome/GenomeScore.tsx`
- `src/components/genome/SectionNav.tsx`
- `src/components/genome/RecommendationCard.tsx`
- `src/components/genome/ChannelStrengthBar.tsx`
- `src/components/genome/CompetitorPreview.tsx`
- `src/components/genome/FeatureComparisonTable.tsx`
- `src/components/genome/FAQSection.tsx`

### Dateien die GEAENDERT werden:
- `src/lib/demo-data.ts` -- Erweiterte Datenstruktur und Inhalte
- `src/pages/Home.tsx` -- 4 neue Sektionen
- `src/pages/Dashboard.tsx` -- Stats, Tabs, verbesserte Karten
- `src/pages/GenomeView.tsx` -- Summary, Navigation, Empfehlungen, Charts
- `src/pages/Pricing.tsx` -- Vergleichstabelle, FAQ, Trust-Leiste
- `src/components/genome/ScanCard.tsx` -- Zusaetzliche Infos und Quick-Actions

### Verwendete bestehende Bibliotheken:
- `recharts` (bereits installiert) -- fuer Traffic-Diagramme
- `@radix-ui/react-accordion` (bereits installiert) -- fuer FAQs
- `@radix-ui/react-tabs` (bereits installiert) -- fuer Dashboard-Tabs
- `@radix-ui/react-progress` (bereits installiert) -- fuer Staerke-Balken
- `@radix-ui/react-tooltip` (bereits installiert) -- fuer Hover-Infos
- `lucide-react` (bereits installiert) -- fuer Icons

### Design-Regeln (unveraendert):
- Schwarz-Orange Farbschema (#0A0A0A + #F97316)
- Keine Gradients -- nur flache Farben
- `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`
- Responsive: 1 Spalte mobil, 2-3 Spalten Desktop

---

## Was NICHT gebaut wird (bleibt Demo/Platzhalter)

- Kein Backend / keine API-Anbindung
- Keine echte Scan-Funktion
- Kein echter PDF-Export
- Keine echte Wettbewerbsanalyse
- Alle Daten sind statisch aus `demo-data.ts`

