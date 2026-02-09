

# Growth Strategy entfernen und verbleibende Sektionen erweitern

## Was passiert

Die beiden "Growth Strategy" Sektionen (Organic + Paid) werden entfernt. Deren nuetzliche Inhalte (SEO-Keyword-Tabelle, Paid-Channel-Tabelle) werden in die verbleibenden Sektionen integriert und diese werden deutlich ausfuehrlicher gestaltet.

---

## Neue Sektionsstruktur (6 statt 8)

```text
1. Overview (Executive Summary + Top-3 Priorities)
2. Business Snapshot (erweitert)
3. Performance Overview (erweitert)
4. ICP (deutlich erweitert)
5. Audience Channels (erweitert, absorbiert Paid Channels)
6. Optimization (erweitert)
```

---

## Aenderungen pro Sektion

### 1. Business Snapshot -- Erweitert um Wettbewerbspositionierung

Aktuell: Nur 3 Badges + 1 Beschreibungssatz.

Neu hinzufuegen:
- **Positioning Statement**: Ein Satz der beschreibt wie sich das Unternehmen vom Wettbewerb abhebt (neues Feld `positioning: string`)
- **Key Differentiators**: 3-4 kurze Stichpunkte was das Business einzigartig macht (neues Feld `differentiators: string[]`)
- **Primary Growth Lever**: Was ist der Hauptwachstumshebel? z.B. "Product-Led Growth", "Sales-Led", "Community-Driven" (neues Feld `growthLever: string`)

### 2. Performance Overview -- Erweitert um Score-Empfehlungen

Aktuell: Radar-Chart + Score-Karten mit Insight + Benchmarks-Tabelle.

Neu:
- Jeder Score bekommt zusaetzlich einen **konkreten naechsten Schritt** (neues Feld `nextStep: string` in `ScoreInsight`)
- So sieht der User nicht nur "Below average" sondern auch "Do X to improve"

### 3. ICP -- Deutlich erweitert

Aktuell: Name, Role, Demographics, Pain Points, Goals, Size/Priority.

Neu pro Persona hinzufuegen:
- **Buying Triggers**: Was loest den Kauf aus? z.B. "Series A funding secured", "Current tool contract expires" (neues Feld `buyingTriggers: string[]`)
- **Common Objections**: Welche Einwaende hat diese Persona? z.B. "Too expensive for our stage", "Migration too complex" (neues Feld `objections: string[]`)
- **Where to Find Them**: 2-3 konkrete Orte/Plattformen wo man diese Persona erreicht (neues Feld `whereToFind: string[]`)

Das macht den ICP von einem theoretischen Profil zu einem **Sales-Tool**: Der Unternehmer weiss nicht nur WER sein Kunde ist, sondern auch WANN er kaufbereit ist, WAS ihn zurueckhaelt, und WO er ihn findet.

### 4. Audience Channels -- Absorbiert Paid Strategy

Aktuell: Organic Channels mit Links, Keywords, Formats, Frequency.

Neu:
- Die **Paid Channels** aus der Paid Strategy werden als eigene Eintraege in die Audience Channels Liste integriert, mit category="paid"
- Jeder Paid Channel bekommt die gleiche Struktur wie Organic Channels (Links, Keywords, Formats, Frequency) plus zusaetzlich:
  - **Budget Level** Badge (low/medium/high)
  - **Estimated CPC** als Info-Zeile
  - **Targeting Tip** wird zum `tip` Feld
- Am Anfang der Sektion: **Competition Level** und **Estimated CPC** als kompakte Info-Leiste (aus der alten Paid Strategy uebernommen)
- Die SEO-Keyword-Tabelle aus Organic Growth wird als eigenstaendiger Block **oberhalb** der Channel-Liste eingefuegt mit dem Titel "SEO Keyword Opportunities"

### 5. Optimization -- Erweitert um Aufwand und erwartetes Ergebnis

Aktuell: Area, Current State, Recommendation, Priority/Impact.

Neu pro Optimization hinzufuegen:
- **Estimated Effort**: "1-2 hours", "1 week", "ongoing" (neues Feld `effort: string`)
- **Expected Outcome**: Was passiert wenn man es umsetzt? z.B. "+15-25% more enterprise leads", "Reduced bounce rate" (neues Feld `expectedOutcome: string`)

So sieht der Unternehmer nicht nur "Tu das" sondern auch "So viel Aufwand kostet es" und "Das bringt es dir".

---

## Technische Umsetzung

### Dateien die GEAENDERT werden

**`src/lib/demo-data.ts`:**
- `GrowthReport` Interface: `organicStrategy` und `paidStrategy` Felder entfernen
- `OrganicStrategy`, `PaidStrategy`, `PaidChannel`, `SEOKeyword` Interfaces: `SEOKeyword` bleibt (wird in Audience Channels gebraucht), Rest wird entfernt oder umgebaut
- `GrowthReport` bekommt neue Felder:
  - `businessModel` erweitert um `positioning`, `differentiators`, `growthLever`
  - `seoKeywords: SEOKeyword[]` (aus organicStrategy extrahiert, direkt auf Report-Ebene)
  - `seoScore: number` und `seoRecommendation: string`
  - `paidCompetitionLevel` und `estimatedCPC` auf Report-Ebene
- `ICPPersona` Interface erweitert um `buyingTriggers`, `objections`, `whereToFind`
- `AudienceChannel` Interface erweitert um optionale Felder `budgetLevel` und `estimatedCPC` (fuer Paid Channels)
- `Optimization` Interface erweitert um `effort` und `expectedOutcome`
- `ScoreInsight` Interface erweitert um `nextStep`
- Alle 3 Demo-Datensaetze (Stripe, Notion, Linear) komplett aktualisieren mit neuen Feldern
- Paid Channels werden in die `audienceChannels` Arrays der Demo-Daten integriert

**`src/pages/GenomeView.tsx`:**
- Organic Growth und Paid Strategy Sektionen entfernen
- `GrowthStrategySection` Import entfernen
- Business Snapshot erweitern (Positioning, Differentiators, Growth Lever anzeigen)
- Audience Channels Sektion: SEO-Keyword-Tabelle und Paid-Info-Leiste hinzufuegen
- SectionNav: "Organic Growth" und "Paid Strategy" entfernen

**`src/components/genome/ICPCard.tsx`:**
- Drei neue Abschnitte: Buying Triggers, Common Objections, Where to Find Them
- Buying Triggers als nummerierte Liste mit eigenem Marker-Stil
- Objections als Liste mit einem neutralen Marker
- Where to Find als Badges (aehnlich wie Audience Channel Links)

**`src/components/genome/AudienceChannelCard.tsx`:**
- Oben: SEO-Keyword-Tabelle als eigenen Block rendern (bekommt `seoKeywords` als neuen Prop)
- Paid-Info-Leiste (Competition Level + CPC) als kompakten Header-Block
- Paid Channels bekommen ein "Budget Level" Badge in der Kanal-Ansicht
- Optionaler CPC-Text fuer Paid Channels

**`src/components/genome/OptimizationCard.tsx`:**
- Effort als kompakter Text unter dem Current State (z.B. "Effort: ~2 hours")
- Expected Outcome als hervorgehobener Text am Ende (z.B. mit border-l-2 border-chart-4)

**`src/components/genome/PerformanceChart.tsx`:**
- Score-Karten: zusaetzliche Zeile "Next Step:" unter dem Insight-Text

### Dateien die GELOESCHT werden

- `src/components/genome/GrowthStrategySection.tsx` -- Inhalte werden in andere Sektionen integriert

### Design

- Keine neuen Icons, kein Emoji
- Schwarz-Orange bleibt
- Neue Abschnitte nutzen dieselben Muster: `text-[10px] uppercase tracking-wide` Labels, `border-l-2` Hervorhebungen, farbige Badges
- Buying Triggers: gruener Marker-Punkt (`bg-chart-4`)
- Objections: roter Marker-Punkt (`bg-destructive`)
- Where to Find: Font-Mono Badges (wie bei Audience Channel Links)

