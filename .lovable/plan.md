

# Neuausrichtung: Business Growth & Performance Platform (ohne Icons)

## Ueberblick

Kompletter Umbau des Frontends von "Market Intelligence / Competitor Research" zu einer **Business Growth Platform**: Nutzer scannen ihre eigene Website und erhalten einen strukturierten Wachstumsplan mit ICP, Audience Channels, Optimierungen, Werbestrategien und Marktdaten. Alle Lucide-Icons werden entfernt -- stattdessen werden typografische Elemente, Nummern, farbcodierte Balken und strukturierte Tabellen verwendet, um ein technisches, sauberes Erscheinungsbild zu erzeugen.

---

## Design-Prinzip: Keine Icons, keine Emojis

Statt Icons werden folgende Alternativen eingesetzt:
- **Nummerierte Kreise** (1, 2, 3...) fuer Schritte und Listen
- **Farbige Punkte/Striche** als visuelle Marker (z.B. kleine `w-2 h-2 rounded-full bg-primary` Elemente)
- **Typografische Hierarchie** -- grosse Zahlen, fette Headlines, Uppercase-Labels
- **Farbige Badges** statt Icon+Text Kombination
- **Linke Farbbalken** (`border-l-2 border-primary`) fuer Hervorhebungen
- Die `GenomeCard` Komponente verliert ihren `icon` Prop und zeigt nur noch Titel
- `StatCard` verliert den `icon` Prop -- grosse Zahl oben, Label darunter, kein Icon-Container

---

## 1. Datenmodell (`src/lib/demo-data.ts`) -- Komplett neu

### Neues Interface `GrowthReport` (ersetzt `BusinessGenome`):

```text
GrowthReport {
  id, domain, companyName, segment, status, createdAt
  businessModel: { type, description, revenueModel }
  growthScore: number (0-100)
  summary: string (2-3 Saetze)

  icp: Array<{
    name: string              // "Tech-Savvy Startup Founder"
    role: string              // "CTO / Technical Co-Founder"
    demographics: string      // "25-40, urban, US/EU"
    painPoints: string[]      // 3-4 Schmerzpunkte
    goals: string[]           // 2-3 Ziele
    size: "small"|"medium"|"large"
    priority: "primary"|"secondary"
  }>

  audienceChannels: Array<{
    platform: string          // "Reddit", "LinkedIn", etc.
    relevance: number         // 0-100
    tip: string               // Konkreter Tipp
    category: "social"|"community"|"search"|"content"|"paid"
  }>

  optimizations: Array<{
    area: string              // "CTA Clarity", "Trust Elements"
    currentState: string      // "Weak / Missing"
    recommendation: string    // Konkreter Vorschlag
    priority: "high"|"medium"|"low"
    impact: "high"|"medium"|"low"
  }>

  organicStrategy: {
    seo: { score: number, keywords: string[], recommendation: string }
    content: { formats: string[], topics: string[], frequency: string }
    social: { platforms: string[], contentTypes: string[], cadence: string }
    community: { channels: string[], approach: string }
  }

  paidStrategy: {
    recommendedChannels: Array<{
      channel: string
      budgetLevel: "low"|"medium"|"high"
      format: string
      targetingTip: string
    }>
    competitionLevel: "low"|"medium"|"high"
    estimatedCPC: string
  }

  marketSize: {
    tam: string               // "$120B globally"
    sam: string               // "$15B in API payments"
    som: string               // "$2B addressable"
    competitionIntensity: "low"|"medium"|"high"
    growthTrend: "declining"|"stable"|"growing"|"booming"
    benchmarks: Array<{ metric: string, value: string }>
  }

  trafficData: { ... }        // bleibt wie bisher (SimilarWeb-Platzhalter)
}
```

Demo-Daten fuer Stripe, Notion und Linear werden komplett neu geschrieben -- aus der Perspektive "So verbesserst du dieses Business".

### `demoScans` Array wird angepasst mit neuen Feldern (`segment`, `growthScore`, `sectionsComplete`).

---

## 2. Komponenten-Aenderungen

### Geaenderte Komponenten (Icon-Props entfernen):

**`GenomeCard.tsx`**: `icon` Prop wird entfernt. Nur Titel als `h3` mit Border-Bottom.

**`StatCard.tsx`**: `icon` Prop wird entfernt. Grosse Zahl oben, Label darunter. Optional kleiner farbiger Punkt als Marker.

**`ScanCard.tsx`**: Alle Lucide-Icons entfernt. Status wird durch farbige Text-Badges dargestellt. Fortschrittsbalken fuer "Sections Complete" bleibt. Quick-Actions als Textlinks.

**`EmptyState.tsx`**: Icon wird durch einen gestrichelten Rahmen mit Text ersetzt. `icon` Prop entfaellt.

**`ScanLimitBar.tsx`**: Bleibt (hat keine Icons).

**`GenomeScore.tsx`**: Label aendert sich zu "Growth Readiness". Bleibt als SVG-Kreis (kein Icon, nur Zahl).

**`SectionNav.tsx`**: Labels aendern sich zu den neuen 7 Sektionen.

**`RecommendationCard.tsx`** wird zu **`OptimizationCard.tsx`**: Zeigt Priority + Impact als farbige Badges, Area als Titel, aktuellen Zustand, Empfehlung. Keine Icons.

**`ChannelStrengthBar.tsx`**: Bleibt (zeigt bereits Balken ohne Icons). Wird fuer Audience Channels wiederverwendet.

**`CompetitorPreview.tsx`** wird zu **`MarketSizeCard.tsx`**: Zeigt TAM/SAM/SOM, Wettbewerbsintensitaet, Wachstumstrend. Keine Icons.

**`KeyTakeaways.tsx`** wird zu **`QuickWins.tsx`**: 3-4 priorisierte Sofort-Massnahmen. Nummerierte Liste ohne Icons.

**`FAQSection.tsx`**: Bleibt (keine Icons verwendet).

**`FeatureComparisonTable.tsx`**: Check/X Icons werden durch Text ("Yes"/"No"/"-") ersetzt.

### Neue Komponenten:

**`ICPCard.tsx`**: Persona-Darstellung. Kein Avatar-Bild/Icon. Stattdessen: Name als grosse Headline, Role als Badge, Demographics als Text, Pain Points als nummerierte Liste, Goals als nummerierte Liste. Size/Priority als farbige Badges.

**`AudienceChannelCard.tsx`**: Plattform-Name links, Relevanz als horizontaler Balken (0-100%), Tipp als kursiver Text. Category als kleiner Text-Tag.

**`GrowthStrategySection.tsx`**: Kombinierte Darstellung fuer Organic + Paid. Zwei Spalten. Organic links (SEO, Content, Social, Community als Sub-Sektionen mit Titel + Text). Paid rechts (Channel-Tabelle mit Budget/Format/Targeting).

---

## 3. Seiten-Aenderungen

### Homepage (`/`) -- "Grow your business"

**Alle Icons werden entfernt.** Stattdessen:

- Hero: Nur Text. Headline "Turn your website into a growth engine". Sub: "Scan your website and get a complete growth playbook -- ICP, audience channels, optimization tips, and growth strategies." CTA-Buttons bleiben (ohne Arrow-Icon).
- Social Proof: 4 Zahlen in einer Reihe -- nur grosse Zahl + Label, kein Icon-Container.
- Features: 3 Karten mit Titel + Beschreibung. Kein Icon. Stattdessen grosse Nummer ("01", "02", "03") als visuelles Element.
- Use Cases: 4 Karten -- Titel + Text + Badge. Kein Icon.
- How it Works: 3 Schritte mit Nummer-Kreisen (rein typografisch). Kein Step-Icon.
- Comparison Table: Check/X werden durch "Yes"/"No"/"Partial" Text ersetzt.
- Testimonials: Anfuehrungszeichen als typografisches Element (grosses " Zeichen), kein Quote-Icon.
- FAQ: Bleibt (Accordion hat keine Icons).
- CTA: Nur Text + Button.

**Copy-Aenderungen:**
- "Decode any market" wird zu "Turn your website into a growth engine"
- "Market Intelligence Platform" wird zu "Business Growth Platform"
- "Research any company" wird zu "Scan your website"
- Features werden: "ICP Builder", "Audience Discovery", "Growth Playbook"
- Use Cases: "Launch Optimization", "Customer Acquisition", "Ad Strategy", "Content Planning"
- Comparison: "Business Genome vs. Hiring a Consultant"

### Dashboard (`/dashboard`) -- "Growth Hub"

**Alle Icons entfernt:**
- StatCards: Nur Zahl + Label, kein Icon-Container
- URL-Input: Kein Globe-Icon im Input. Kein Search-Icon im Button. Button sagt nur "Scan".
- Tabs: Kein Badge-Icon, nur Text + Anzahl
- Search Input: Kein Search-Icon, nur Placeholder-Text
- Sort Button: Kein SlidersHorizontal-Icon, nur Text "Newest"/"Oldest"

**Copy-Aenderungen:**
- "Market Research Hub" wird zu "Growth Hub"
- "Research any company" wird zu "Scan your website to get growth insights"
- "Companies Researched" wird zu "Websites Scanned"
- "Research Credits" wird zu "Scan Credits"
- "Research History" wird zu "Scan History"
- Button: "Research" wird zu "Scan"

### Genome View (`/genome/:id`) -- "Growth Report"

**Groesster Umbau. Alle Icons entfernt. Neue Sektionsstruktur:**

**Header:**
- Kein Globe-Icon. Domain als `font-mono` Text.
- "Growth Report: Stripe" statt "Intelligence Report"
- Kein Download-Icon, kein Plus-Icon. Buttons nur mit Text.

**Executive Summary:**
- Kein Sparkles-Icon. Nur "Executive Summary" als Headline.
- GenomeScore Label: "Growth Readiness" statt "Intelligence Depth"
- Mini-Stats: Nur Zahl + Label, keine Icon-Container

**Section Navigation (7 Sektionen statt 11):**
Overview | ICP | Audience Channels | Optimization | Organic Growth | Paid Strategy | Market Size

**Sektions-Karten (alle ohne Icons in GenomeCard):**

1. **Business Snapshot** (ersetzt "How This Company Makes Money"): Titel + Badges + Beschreibung. GenomeCard ohne Icon.

2. **Ideal Customer Profile** (NEU, ersetzt Audience Clusters): 2-3 `ICPCard` Komponenten. Jede zeigt: Name, Role, Demographics, Pain Points (nummeriert), Goals (nummeriert), Size/Priority Badges.

3. **Where Your Audience Lives** (NEU, ersetzt Channel Usage): `AudienceChannelCard` Liste. Pro Plattform: Name, Relevanz-Balken, Tipp, Category-Tag.

4. **Website Optimization** (NEU, ersetzt Recommendations): `OptimizationCard` Grid. Pro Item: Area, Current State, Recommendation, Priority/Impact Badges.

5. **Growth Strategy: Organic** (NEU, ersetzt Funnel + Content): Sub-Sektionen fuer SEO, Content, Social, Community. Jeweils Titel + Text/Liste.

6. **Growth Strategy: Paid** (NEU): Channel-Tabelle mit Budget/Format/Targeting. Competition Level + geschaetzter CPC.

7. **Market Opportunity** (NEU, ersetzt Competitor/KeyTakeaways): TAM/SAM/SOM als grosse Zahlen. Wettbewerbsintensitaet. Wachstumstrend. Benchmarks als kleine Tabelle.

**Entfernte Sektionen:**
- "Their Positioning & Value Props" (Messaging) -- wird in Business Snapshot integriert
- "Content Formats" -- wird in Organic Growth integriert
- "Trust Elements" -- wird in Website Optimization integriert
- "Traffic Data" -- bleibt als optionaler Premium-Bereich am Ende
- "Market Insights" -- ersetzt durch Optimization
- "Key Takeaways" -- ersetzt durch Quick Wins (oben in Summary integriert)
- "Market Landscape" -- ersetzt durch Market Opportunity

### Pricing (`/pricing`) -- Kleine Aenderungen

- Alle Icons in Feature-Listen entfernt (Check/X werden zu "Yes"/"No")
- Trust-Badges: Kein Icon, nur Text mit farbigem Punkt davor
- "market research reports" wird zu "growth reports"
- "Competitive landscape view" wird zu "Market opportunity data"
- FeatureComparisonTable: Text statt Icons
- FAQ bleibt

---

## 4. Dateien-Uebersicht

### Neue Dateien:
- `src/components/genome/ICPCard.tsx`
- `src/components/genome/AudienceChannelCard.tsx`
- `src/components/genome/GrowthStrategySection.tsx`
- `src/components/genome/OptimizationCard.tsx`
- `src/components/genome/MarketSizeCard.tsx`
- `src/components/genome/QuickWins.tsx`

### Geaenderte Dateien:
- `src/lib/demo-data.ts` -- Komplett neues Interface + Demo-Daten
- `src/pages/Home.tsx` -- Alle Icons entfernt, neuer Copy
- `src/pages/Dashboard.tsx` -- Icons entfernt, neuer Copy
- `src/pages/GenomeView.tsx` -- Kompletter Umbau: neue Sektionen, keine Icons
- `src/pages/Pricing.tsx` -- Icons durch Text ersetzt, neuer Copy
- `src/components/genome/GenomeCard.tsx` -- `icon` Prop entfernt
- `src/components/genome/StatCard.tsx` -- `icon` Prop entfernt
- `src/components/genome/ScanCard.tsx` -- Icons entfernt
- `src/components/genome/EmptyState.tsx` -- `icon` Prop entfernt
- `src/components/genome/GenomeScore.tsx` -- Label-Aenderung
- `src/components/genome/SectionNav.tsx` -- Neue Sektions-Labels
- `src/components/genome/FeatureComparisonTable.tsx` -- Text statt Icons
- `src/components/genome/ChannelStrengthBar.tsx` -- wird fuer Audience Channels wiederverwendet

### Geloeschte/Ersetzte Dateien:
- `src/components/genome/RecommendationCard.tsx` -- ersetzt durch `OptimizationCard.tsx`
- `src/components/genome/CompetitorPreview.tsx` -- ersetzt durch `MarketSizeCard.tsx`
- `src/components/genome/KeyTakeaways.tsx` -- ersetzt durch `QuickWins.tsx`

---

## 5. Design-Regeln (erweitert)

- Schwarz-Orange (#0A0A0A + #F97316) -- unveraendert
- Keine Icons, keine Emojis -- ueberall
- Keine Gradients -- nur flache Farben
- Typografische Hierarchie: Grosse Zahlen (text-3xl font-bold), Uppercase-Labels (text-xs uppercase tracking-wide), farbige Badges
- Farbige Marker: Kleine Punkte (`w-2 h-2 rounded-full`) oder linke Borders (`border-l-2`) statt Icons
- Priority/Impact Farben: high=primary (orange), medium=chart-3, low=muted
- Responsive: 1 Spalte mobil, 2 Spalten Desktop

---

## Was NICHT gebaut wird

- Kein Backend / keine API-Anbindung
- Keine echte Scan-Funktion
- Kein echter PDF-Export
- Alle Daten statisch aus demo-data.ts
- Recharts-Diagramme bleiben nur fuer Traffic Data (Premium)

