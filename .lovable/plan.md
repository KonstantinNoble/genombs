

## Text-Polish: Menschlicher, weniger KI-typisch

Die Seite hat noch mehrere typische KI-Merkmale. Hier die konkreten Korrekturen:

---

### 1. Em-Dashes ("—") entfernen

Alle Vorkommen von " — " und " -- " durch Punkte, Kommas oder Umformulierungen ersetzen:

- **Zeile 78** (Feature 3): "...based on the AI analysis of your website — ready to execute." wird zu: "...based on the AI analysis of your website. Ready to execute."
- **Zeile 136** (FAQ): "...scores your site across 5 categories — Findability..." wird zu: "...scores your site across 5 categories: Findability..."
- **Zeile 196** (Hero Subtitle): "...trust, and conversion — with competitor benchmarks..." wird zu: "...trust, and conversion. Includes competitor benchmarks and a prioritized fix list."
- **Zeile 209** (Credits): "20 free credits per day — no credit card required" wird zu: "20 free credits per day. No credit card required."

### 2. "Website Analysis Platform" Tagline entfernen

Die Zeile `<p className="text-sm uppercase tracking-widest...">Website Analysis Platform</p>` (Zeile 188-189) wird komplett entfernt. Das ist ein typisches KI-Template-Muster (kleiner Tagline-Text ueber der Headline).

### 3. Texte natuerlicher formulieren

Einige Stellen klingen noch nach Vorlage:

- **Hero Headline** (Zeile 192-194): "Know exactly what's holding your website back" ist okay, aber der Orange-Span-Split wirkt konstruiert. Aendern zu: `"What's holding your website back?"` (ohne Span-Split, komplett weiss, als direkte Frage)
- **Hero Subtitle** (Zeile 195-197): Kuerzere, natuerlichere Formulierung: "Paste a URL and get scores across five categories, competitor benchmarks, and a prioritized list of what to fix."
- **Features Subheading** (Zeile 241): "A structured breakdown of what works, what doesn't, and what to fix first." ist dreigliedrig (typisches KI-Muster). Aendern zu: "Scores, comparisons, and a concrete fix list for your website."
- **Feature 1 Description** (Zeile 66): Kuerzer: "Your website is scored across five categories: Findability, Mobile Usability, Offer Clarity, Trust and Proof, and Conversion Readiness."
- **Feature 3 Description** (Zeile 78): "Concrete, prioritized optimization tasks based on the analysis. Ready to execute."
- **Use Case Descriptions**: Dreigliedrige Aufzaehlungen aufloesen und direkter formulieren
- **CTA Heading** (Zeile 368): "Try it now" ist generisch. Aendern zu: "See what your website scores"

### 4. FAQ-Texte natuerlicher machen

- Zeile 136: "Absolutely." am Anfang der Sicherheits-Antwort entfernen (typische KI-Floskel). Stattdessen direkt anfangen: "We only analyze publicly available website data."

---

### Zusammenfassung der Aenderungen

Nur eine Datei betroffen: `src/pages/Home.tsx`

Aenderungen:
- Tagline "Website Analysis Platform" entfernt
- Alle Em-Dashes durch Punkte/Doppelpunkte ersetzt
- Hero-Headline als Frage ohne Farb-Split
- Dreigliedrige Aufzaehlungen aufgeloest
- KI-Floskeln ("Absolutely", "at a glance") entfernt
- CTA konkreter formuliert

