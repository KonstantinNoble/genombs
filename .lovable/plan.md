

## Homepage und Pricing: Komplette inhaltliche Korrektur

Alle falschen/erfundenen Features werden entfernt und durch die tatsaechlichen Produktfunktionen ersetzt, die aus dem Code abgeleitet wurden.

---

### Was ist aktuell falsch

**Homepage Features-Sektion (01, 02, 03):**
- "ICP Builder" -- existiert nicht als Feature
- "Audience Discovery" -- existiert nicht als Feature  
- "Growth Playbook" -- existiert nicht als Feature
- Diese drei Features sind komplett erfunden

**Homepage Use Cases:**
- "Customer Acquisition", "Ad Strategy", "Content Planning" beschreiben Funktionen die nicht existieren
- Referenzen zu "audience channels", "paid advertising recommendations", "budgets" -- alles nicht vorhanden

**Homepage Comparison Table:**
- "7 structured sections" -- stimmt nicht, es gibt 4 Dashboard-Tabs (Overview, Positioning, Offer & CTAs, Trust & Proof)
- "Actionable Strategies: Yes" -- uebertrieben, es gibt Improvement Tasks aber keine "Strategies"

**Homepage FAQ:**
- "ICP profiles, audience channels" in der Growth Report Beschreibung -- existiert nicht

**Homepage Hero/SEO:**
- "growth playbook with ICP, audience channels" -- falsch
- SEO keywords enthalten "ICP builder, audience discovery" -- falsch

**Pricing / FeatureComparisonTable:**
- "API access (Coming Soon)" -- nicht geplant, sollte entfernt werden

---

### Was das Produkt tatsaechlich macht (aus dem Code)

1. **Website-Analyse**: URL eingeben, AI crawlt und analysiert die Seite
2. **5 Scoring-Kategorien**: Findability, Mobile Usability, Offer Clarity, Trust & Proof, Conversion Readiness
3. **Profil-Daten**: Name, Target Audience, USP, CTAs, Site Structure, Strengths, Weaknesses
4. **4 Dashboard-Tabs**: Overview, Positioning, Offer & CTAs, Trust & Proof
5. **Competitor-Vergleich**: Score-Vergleichstabelle wenn mehrere URLs analysiert werden
6. **Improvement Plan**: Konkrete Aufgaben mit Prioritaeten
7. **PageSpeed Insights**: Google Core Web Vitals Integration
8. **AI Chat**: Kontextbezogene Fragen zur Analyse stellen

---

### Korrekturen

**Home.tsx -- Features (01, 02, 03) ersetzen durch:**
- 01: "Website Scoring" -- AI bewertet deine Website in 5 Kategorien: Findability, Mobile Usability, Offer Clarity, Trust & Proof, Conversion Readiness
- 02: "Competitor Analysis" -- Vergleiche deine Website mit bis zu 3 Wettbewerbern. Sieh Staerken, Schwaechen und Score-Unterschiede auf einen Blick
- 03: "Improvement Plan" -- Erhalte konkrete, priorisierte Optimierungsvorschlaege basierend auf der AI-Analyse deiner Website

**Home.tsx -- Use Cases ersetzen durch realistische Szenarien:**
- Pre-Launch Check: Website vor dem Launch auf Schwachstellen pruefen
- Competitor Benchmarking: Eigene Scores mit Wettbewerbern vergleichen
- Conversion Optimization: CTAs, Trust-Signale und Angebote verbessern
- Performance Monitoring: PageSpeed und Core Web Vitals tracken

**Home.tsx -- Comparison Table korrigieren:**
- "7 structured sections" aendern zu "5 scoring categories + PageSpeed"
- "Actionable Strategies" aendern zu "Improvement Tasks"

**Home.tsx -- FAQ korrigieren:**
- Growth Report Beschreibung: ICP/audience-Referenzen entfernen, durch tatsaechliche Features ersetzen

**Home.tsx -- Hero/SEO korrigieren:**
- "growth playbook" durch "website analysis" ersetzen
- SEO keywords aktualisieren

**Home.tsx -- Steps korrigieren:**
- Schritt 3: "ICP, audience channels" entfernen

**FeatureComparisonTable.tsx:**
- "API access (Coming Soon)" Zeile entfernen

---

### Geaenderte Dateien

1. `src/pages/Home.tsx` -- Features, Use Cases, Comparison Table, FAQ, Hero, SEO-Meta
2. `src/components/genome/FeatureComparisonTable.tsx` -- API access Zeile entfernen

Die Pricing-Seite (`src/pages/Pricing.tsx`) ist inhaltlich bereits korrekt bis auf die indirekte Nutzung der FeatureComparisonTable.

