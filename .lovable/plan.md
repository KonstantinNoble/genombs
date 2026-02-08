

# Perspektivwechsel: Von Website-Audit zu Market Intelligence

## Das Problem

Das aktuelle UI ist aus der Perspektive einer **Selbst-Analyse** aufgebaut -- als wuerde der User seine eigene Website analysieren (wie ein SEO-Audit-Tool). Aber das Produkt ist **Market Intelligence**: Man analysiert FREMDE Unternehmen, um den MARKT zu verstehen.

Konkrete Beispiele, was aktuell falsch ist:

```text
AKTUELL (falsch)                              RICHTIG (Market Intelligence)
--------------------------------------------- -----------------------------------------------
"Enter a URL to generate a Business Genome"   "Research any company to decode its market"
Recommendations: "Add a free trial to         Market Insight: "72% of competitors in this
your funnel"                                  segment offer free trials -- this is a
                                              standard market pattern"
"Genome Completeness" Score                   "Intelligence Depth" Score
"Credits Remaining" (eigene Scans)            "Research Credits" (Markt-Recherchen)
"Your Business Genome"                        "Market Intelligence Report"
Traffic Data als Self-Check                   Traffic Data als Wettbewerbs-Intelligence
"Analyze" Button                              "Research" Button
```

---

## Was sich aendert (Seite fuer Seite)

### 1. Dashboard -- Von "Analyse-Cockpit" zu "Research Hub"

**Aktuell:** "Enter a URL to generate a Business Genome"
**Neu:** "Research any company -- decode its market position, strategy, and playbook"

Aenderungen:
- Headline: "Market Research Hub" statt "Welcome back"
- URL-Input Label: "Which company do you want to research?" statt "Enter URL"
- Button: "Research" statt "Analyze"
- Supported-Text: "Enter any company website to generate a market intelligence report"
- Stats: "Companies Researched" statt "Total Analyses"
- Stats: "Research Credits" statt "Credits Remaining"
- Recent URLs: "Recent Research" statt "Recent"
- Tab-Sektion: "Research History" statt "Analyses"
- ScanCard: Framing als "researched company" nicht als "analysierte eigene Seite"

### 2. Genome View -- Von "Self-Audit" zu "Intelligence Dossier"

Dies ist die groesste Aenderung. Jede Sektion muss aus der Perspektive eines EXTERNEN BETRACHTERS formuliert sein.

**Header:**
- Aktuell: "Stripe" mit Badges
- Neu: "Intelligence Report: Stripe" -- klar als Forschungsobjekt markiert
- Untertitel: "Market position analysis for Financial Infrastructure / Payments"

**Executive Summary:**
- Aktuell: Zusammenfassung der Firma
- Neu: Zusammenfassung MIT Markt-Kontext: "Stripe dominates the API-first payment infrastructure segment. Key takeaway for market researchers: Their PLG motion and developer-first positioning create high barriers to entry."
- Score umbenennen: "Intelligence Depth" statt "Genome Completeness"
- Mini-Stats umbenennen: "Offers Detected" bleibt, "Channels Active" bleibt -- das sind externe Beobachtungen, das passt

**Section Navigation:**
- Aktuell: Overview | Offers | Audience | Funnel | etc.
- Neu: Overview | Market Position | Offers | Audience | Growth Strategy | Channels | Content | Trust | Traffic | Market Insights

**Business Model Card:**
- Framing aendern: "How this company makes money" statt nur Badges
- Untertitel: "Observed business model and revenue structure"

**Offer Structure Card:**
- Framing: "Products & Services detected" -- als externe Beobachtung
- Untertitel: "What this company sells and at what price points"

**Audience Clusters Card:**
- Framing: "Who they target" -- nicht "Deine Zielgruppen"
- Untertitel: "Identified target audiences based on messaging and content analysis"

**Funnel Analysis Card:**
- Framing: "Their growth playbook" statt "Your funnel"
- Untertitel: "How this company acquires and converts customers"

**Messaging Card:**
- Framing: "Their positioning & value props"
- Untertitel: "Key messages and unique selling propositions detected"

**Channels Card:**
- Framing: "Where they reach their audience"
- Untertitel: "Distribution channels and their relative strength"

**Traffic Data Card:**
- Das ist bereits korrekt -- externe Traffic-Daten sind Market Intelligence

**Recommendations Section -- KOMPLETT UMBAUEN:**
- Aktuell: Ratschlaege fuer die analysierte Firma ("Add a free trial...")
- Neu: **"Market Insights"** -- Was der RESEARCHER aus dieser Analyse lernen kann

Neue Empfehlungs-Kategorien:
- **Market Pattern**: "72% of companies in this segment use PLG -- this is the dominant go-to-market strategy"
- **Competitive Gap**: "Content marketing (case studies) is underutilized in this segment -- potential opportunity"
- **Entry Barrier**: "Developer documentation quality is a key differentiator -- new entrants need to match this"
- **Market Signal**: "Transaction-based pricing is standard in this segment -- subscription models are rare"

Jede Empfehlung wird zu einem "Market Insight" mit:
- Insight-Typ (Pattern, Gap, Barrier, Signal) statt Priority
- Beschreibung aus Markt-Perspektive
- "What this means" Erklaerung (warum das relevant ist)

**Competitor Snapshot:**
- Aktuell: "3 competitors detected" mit Lock
- Neu: "Market Landscape" -- "3 major players in this segment detected"
- Framing: "Other companies operating in this market space"

**Neuer Bereich: "Key Takeaways"**
- 3-4 Bullet Points am Ende der Seite
- Zusammenfassung der wichtigsten Markt-Erkenntnisse
- z.B. "This segment is dominated by PLG companies with developer-first positioning"
- z.B. "Average pricing transparency is high -- public pricing is expected"
- z.B. "SEO and developer documentation are the primary acquisition channels"

### 3. Homepage -- Messaging anpassen

**Hero:**
- Aktuell: "Understand any business from a single URL"
- Neu: "Decode any market from a single URL" -- Fokus auf MARKT, nicht auf einzelnes Business

**Sub-Headline:**
- Aktuell: "Turn any website into a structured market intelligence report"
- Neu: "Research any company to understand its market, strategy, and competitive position -- in under 60 seconds"

**Features:**
- "Domain Intelligence" bleibt (passt schon)
- "Market Positioning" wird zu "Competitive Intelligence" -- "See how any company positions itself and who they compete with"
- "Actionable Insights" wird zu "Market Insights" -- "Discover market patterns, competitive gaps, and strategic opportunities"

**Use Cases -- Texte anpassen:**
- "Competitor Research": "Decode a competitor's entire playbook in seconds -- from pricing to funnel strategy"
- "Market Entry": "Research the key players before entering a new market. Understand what works."
- "Sales Intelligence": "Research prospects before the first call. Know their business model, pain points, and tech stack."
- "Content Strategy": "Analyze what content works in any market segment. Find the gaps others miss."

**Comparison Table:**
- "Cost per Analysis" wird zu "Cost per Research"

**Testimonials -- Texte anpassen:**
- Aus "I can now analyze any company" wird "I can research any competitor's strategy in under a minute"

### 4. Pricing -- Kleine Anpassungen

- "3 Analyses per month" wird zu "3 Market Research Reports per month"
- "Unlimited Analyses" wird zu "Unlimited Market Research"
- Feature-Liste: "Competitor Analysis" wird zu "Competitive Landscape View"

### 5. Demo-Daten (`demo-data.ts`) -- Recommendations umschreiben

Die gesamte `recommendations` Struktur aendert sich:

Alte Struktur:
```text
priority: "high" | "medium" | "low"
category: "Content" | "Channel" | "Funnel" | "Positioning"
description: "Advice for the company"
```

Neue Struktur:
```text
insightType: "pattern" | "gap" | "barrier" | "signal"
category: "Market" | "Channel" | "Content" | "Positioning"
description: "Market observation"
implication: "What this means for researchers"
```

Beispiele fuer Stripe:
- Pattern: "Developer documentation is the primary acquisition channel in the payment infrastructure segment. 4 out of 5 top players invest heavily in docs."
  - Implication: "Any new entrant needs best-in-class developer docs to compete."
- Gap: "Case studies and social proof content are surprisingly underutilized in this segment despite high enterprise deal values."
  - Implication: "Content marketing focused on case studies could be a differentiation opportunity."
- Barrier: "Transaction-based pricing with free sandbox access creates high switching costs once integrated."
  - Implication: "Competing on price alone is insufficient -- developer experience is the moat."
- Signal: "All top players in this segment are expanding into financial services beyond payments (lending, incorporation, treasury)."
  - Implication: "The segment is expanding from pure payments to full financial infrastructure."

---

## Technische Aenderungen

### Dateien die GEAENDERT werden:
- `src/lib/demo-data.ts` -- Recommendation-Interface + alle Demo-Empfehlungen umschreiben
- `src/pages/Dashboard.tsx` -- Copy/Labels/Framing
- `src/pages/GenomeView.tsx` -- Alle Section-Titel, Executive Summary, Market Insights statt Recommendations
- `src/pages/Home.tsx` -- Hero, Features, Use Cases, Testimonials Copy
- `src/pages/Pricing.tsx` -- Labels anpassen
- `src/components/genome/RecommendationCard.tsx` -- Wird zu MarketInsightCard (neues Design mit insightType)
- `src/components/genome/CompetitorPreview.tsx` -- "Market Landscape" statt "Competitor Snapshot"
- `src/components/genome/EmptyState.tsx` -- "Research" statt "Analyze"
- `src/components/genome/ScanCard.tsx` -- "Researched" Framing
- `src/components/genome/GenomeScore.tsx` -- "Intelligence Depth" Label

### Dateien die NEU erstellt werden:
- `src/components/genome/KeyTakeaways.tsx` -- Neuer Bereich am Ende der Genome View mit 3-4 zusammenfassenden Markt-Erkenntnissen

### Design:
- Keine visuellen/Farb-Aenderungen -- nur Text und Perspektive
- Schwarz-Orange Farbschema bleibt unveraendert
- Alle bestehenden Komponenten und Layouts bleiben
- insightType-Badges bekommen eigene Farben (pattern=blau, gap=orange, barrier=rot, signal=gruen)

---

## Zusammenfassung der Perspektiv-Verschiebung

```text
VORHER (Self-Audit)              NACHHER (Market Intelligence)
-------------------------------  --------------------------------
"Analyze your website"           "Research any company"
"Your Business Genome"           "Intelligence Report"
"Improve your funnel"            "This is how the market works"
"Add a free trial"               "Free trials are standard here"
"Your competitors"               "Market landscape"
"Genome Completeness"            "Intelligence Depth"
User = analysiertes Unternehmen  User = externer Researcher
```

Das Produkt wird damit klar zu dem, was es sein soll: Ein Tool, mit dem man JEDEN Markt von aussen verstehen kann -- nicht ein Audit-Tool fuer die eigene Webseite.
