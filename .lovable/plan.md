

# Competitor Analysis Feature + Premium-Struktur

## Teil 1: Competitor Analysis als eigene Seite

### Konzept

Eine neue Seite `/competitor-analysis` die vom Dashboard aus erreichbar ist. Der User gibt seine eigene URL und bis zu 3 Konkurrenz-URLs ein. Das System generiert einen Vergleichsreport mit Score-Vergleichen, Staerken/Schwaechen und konkreten Empfehlungen.

### Seitenstruktur

```text
/competitor-analysis
  - URL-Eingabe: Eigene URL + 2-3 Wettbewerber-URLs
  - Vergleichs-Dashboard:
    1. Score Comparison (Radar-Chart: alle Unternehmen ueberlagert)
    2. Head-to-Head Tabelle (6 Dimensionen nebeneinander)
    3. SWOT-Analyse (pro Wettbewerber)
    4. Keyword Gaps (Keywords die Wettbewerber haben, du nicht)
    5. Channel Gaps (Kanaele die Wettbewerber nutzen, du nicht)
    6. Actionable Takeaways (3-5 konkrete Massnahmen basierend auf Gaps)
```

### Premium-Gating auf der Competitor-Seite

- **Free User**: Kann die Seite oeffnen, sieht den URL-Eingabebereich. Beim Klick auf "Analyze" erscheint ein Upgrade-Hinweis ("Competitor Analysis is a Premium feature").
- **Premium User**: Voller Zugriff, kann Analysen durchfuehren und speichern.

### Demo-Daten

Es werden Demo-Competitor-Analysen erstellt (z.B. Stripe vs PayPal vs Square), damit die Seite sofort testbar ist. Ein Demo-Link wird im Dashboard fuer Premium-User angezeigt.

---

## Teil 2: Premium-Struktur im bestehenden Dashboard/Report

### Was wird Premium-gated im Growth Report

Aktuell sieht jeder User alles. Neu wird der Report in Free und Premium Bereiche aufgeteilt:

**Free (immer sichtbar):**
- Executive Summary + Top 3 Priorities
- Business Snapshot (Badges + Beschreibung, OHNE Positioning/Differentiators)
- Performance Overview: Nur Radar-Chart, KEINE Score-Insights, KEINE Benchmarks
- ICP: Nur Name, Role, Demographics, Pain Points -- OHNE Buying Triggers, Objections, Where to Find
- Audience Channels: Nur Plattform-Name + Relevanz + Tip -- OHNE spezifische Links, Keywords, Formate, SEO-Tabelle
- Optimization: Nur Area + Recommendation -- OHNE Effort, Expected Outcome

**Premium (mit Blur/Lock-Overlay):**
- Business Snapshot: Positioning Statement + Key Differentiators + Growth Lever
- Performance Overview: Score-Insights mit Next Steps + Industry Benchmarks Tabelle
- ICP: Buying Triggers, Objections, Where to Find Them
- Audience Channels: Spezifische Links, Keywords, Formate, Frequency, SEO-Keyword-Tabelle, Paid-Channel-Daten
- Optimization: Effort + Expected Outcome

### Visuelles Premium-Gating

Die Premium-Inhalte werden NICHT versteckt, sondern mit einem **Blur-Overlay** angezeigt:
- Der Premium-Content wird gerendert, aber mit `blur-sm` CSS und einem halbtransparenten Overlay
- Auf dem Overlay steht: "Unlock with Premium" + ein Button der zur Pricing-Seite fuehrt
- So sieht der Free-User, DASS es mehr gibt, und bekommt Appetit auf den vollen Report

### Premium-Lock Komponente

Eine wiederverwendbare `PremiumLock` Wrapper-Komponente:
```text
<PremiumLock>
  <Buying Triggers Content />
</PremiumLock>
```
- Wenn `isPremium = true`: Zeigt den Content normal
- Wenn `isPremium = false`: Zeigt den Content mit Blur + Upgrade-CTA

---

## Teil 3: Pricing-Seite und Feature-Tabelle aktualisieren

Die Pricing-Seite hat noch veraltete Features (Market Size, Traffic Data, Quick Wins, Organic/Paid Strategy). Diese werden aktualisiert:

**Neue Free Features:**
- 3 Growth Reports/Monat
- Business Snapshot (Basis)
- Performance Radar-Chart
- ICP Profiles (Basis)
- Channel Overview (Basis)
- Optimization Empfehlungen (Basis)

**Neue Premium Features:**
- Unlimited Growth Reports
- Competitor Analysis (NEU)
- Detailed Score Insights + Next Steps
- Industry Benchmarks
- ICP Buying Triggers + Objections
- Specific Channel Links + Keywords + SEO-Tabelle
- Optimization Effort + Expected Outcomes
- PDF Export
- Priority Support

---

## Technische Umsetzung

### Neue Dateien

**`src/pages/CompetitorAnalysis.tsx`:**
- Neue Seite mit URL-Eingabe (eigene URL + bis zu 3 Wettbewerber)
- Premium-Gate: Free User sieht Eingabe + Upgrade-CTA, Premium User sieht Demo-Report
- Sections: Score Comparison (Radar), Head-to-Head Tabelle, SWOT, Keyword Gaps, Channel Gaps, Takeaways
- Nutzt `useAuth()` fuer `isPremium` Check

**`src/components/genome/PremiumLock.tsx`:**
- Wiederverwendbare Wrapper-Komponente
- Props: `children`, optional `title` fuer den CTA-Text
- Liest `isPremium` aus `useAuth()`
- Premium: rendert `children` normal
- Free: rendert `children` mit `blur-sm opacity-60 pointer-events-none` + absolut positioniertes Overlay mit "Unlock Premium" Button

**`src/components/genome/CompetitorRadarChart.tsx`:**
- Recharts Radar-Chart der mehrere Unternehmen ueberlagert (verschiedene Farben)
- Nutzt die gleichen 6 Dimensionen wie PerformanceChart

**`src/components/genome/CompetitorSWOT.tsx`:**
- SWOT-Grid (Strengths, Weaknesses, Opportunities, Threats) pro Wettbewerber
- Einfache 2x2 Grid-Karten mit farbcodierten Headern

**`src/lib/demo-competitor-data.ts`:**
- Demo-Daten fuer eine Competitor-Analyse (Stripe vs PayPal vs Square)
- Interfaces: `CompetitorAnalysis`, `CompetitorProfile`, `KeywordGap`, `ChannelGap`

### Geaenderte Dateien

**`src/App.tsx`:**
- Neue Route `/competitor-analysis` hinzufuegen (lazy loaded)

**`src/pages/Dashboard.tsx`:**
- Neuen "Competitor Analysis" Button/Link im Dashboard Header-Bereich (neben dem URL-Eingabefeld oder als eigene Karte)
- Premium Badge am Button wenn User nicht Premium ist

**`src/pages/GenomeView.tsx`:**
- `PremiumLock` Wrapper um die Premium-Bereiche der einzelnen Sektionen:
  - Business Snapshot: Positioning + Differentiators
  - Performance: Score Insights + Benchmarks
  - ICP: Buying Triggers + Objections + Where to Find
  - Audience Channels: Specific Links + Keywords + Formats + SEO-Tabelle + Paid-Info
  - Optimization: Effort + Expected Outcome

**`src/pages/Pricing.tsx`:**
- Feature-Listen aktualisieren (veraltete Features entfernen, neue hinzufuegen)
- "Competitor Analysis" als Premium-Feature hervorheben

**`src/components/genome/FeatureComparisonTable.tsx`:**
- Feature-Liste aktualisieren mit den neuen Free/Premium Aufteilungen

**`src/components/Navbar.tsx`:**
- "Competitor Analysis" Link in die Navigation aufnehmen (nur sichtbar wenn eingeloggt)

### Design

- Gleicher Schwarz-Orange Stil wie bestehende Seiten
- Premium-Lock: Halbtransparentes schwarzes Overlay mit weissem Text und orangem Button
- Competitor-Seite: Gleiche Card/GenomeCard Komponenten, gleiche Typographie
- Radar-Chart: Orange fuer eigenes Unternehmen, verschiedene Grautoene fuer Wettbewerber
- SWOT: Gruene (Strengths), Rote (Weaknesses), Blaue (Opportunities), Gelbe (Threats) Border-Left Markierungen

