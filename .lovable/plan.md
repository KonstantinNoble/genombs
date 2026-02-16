

## SEO und Texte bereinigen: Alle "Business Genome" / alte Produktbeschreibungen entfernen

### Problem

An mehreren Stellen finden sich noch Texte aus der alten Version (Decision-Making-Tool, "Business Genome", "AI Advisory Board", "$26.99", "3 AI models analyze decisions", etc.). Das betrifft sowohl sichtbare Texte als auch unsichtbare SEO-Metadaten und strukturierte Daten.

### Betroffene Dateien und Aenderungen

**1. `index.html` (groesster Handlungsbedarf)**
- Meta-Keywords: "AI advisory board, startup decisions, second opinions" ersetzen durch website-analyse-relevante Keywords
- Noscript-Bereich (Zeile 52-140): Komplett veralteter Text ueber "decision making", "three AI models", "consensus & dissent", "investor-ready reports", "$26.99/month". Wird durch aktuelle Produktbeschreibung ersetzt (Website-Scoring, Competitor Analysis, Improvement Plan)
- Structured Data / SoftwareApplication (Zeile 145-170): Beschreibt "AI Advisory Board", "second opinions from three AI models", "$26.99/month". Wird aktualisiert auf Website-Analyse-Tool mit korrektem Preis ($14.99) und aktuellen Features
- Link `/validate` im noscript wird zu `/chat`

**2. `src/components/seo/SEOHead.tsx`**
- Standard-Keywords (Zeile 7): "AI advisory board, startup decisions, second opinions, business analysis, investor-ready, founder tools, strategic advice" ersetzen durch: "website analysis, website scoring, AI website audit, competitor analysis, conversion optimization, PageSpeed insights"

**3. `src/pages/Home.tsx`**
- Zeile 210: WebPageSchema name "Business Genome - Turn your website into a growth engine" wird zu "Synvertas - Turn your website into a growth engine"
- Zeile 211: WebPageSchema description "Scan your website and get a complete growth playbook." wird aktualisiert
- Zeile 381: Vergleichstabelle Spaltenheader "Business Genome" wird zu "Synvertas"

**4. `src/pages/Pricing.tsx`**
- Zeile 24: SEOHead description "Simple, transparent pricing for Business Genome." wird zu "...for Synvertas."
- Zeile 90: SEOHead title "Pricing - Business Genome" wird zu "Pricing - Synvertas"

**5. `public/sitemap.xml`**
- `/validate` existiert nicht mehr, wird durch `/chat` ersetzt
- Datumsangaben werden auf 2026-02-16 aktualisiert

### Zusammenfassung

| Datei | Aenderungstyp |
|---|---|
| index.html | Noscript-Text, Structured Data, Keywords |
| SEOHead.tsx | Standard-Keywords |
| Home.tsx | 3 Textstellen (Schema + Tabelle) |
| Pricing.tsx | 2 SEO-Texte |
| sitemap.xml | URL + Datum |

Keine funktionalen Aenderungen, keine neuen Abhaengigkeiten. Nur Text- und SEO-Korrekturen.

