

## KI-Modell-Vorteile auf Homepage und Pricing subtil erwaehnen

### Zusammenfassung
Die individuellen Staerken der 5 KI-Modelle werden auf der Homepage und Pricing-Seite erwaehnt -- dezent und informativ, ohne aufdringlich zu wirken.

### Aenderungen

#### 1. Homepage FAQ (`src/pages/Home.tsx`, Zeile 267-270)

Die bestehende FAQ-Antwort "What AI models are available?" wird erweitert, um die Vorteile jedes Modells kurz zu nennen:

**Aktuell:**
"Free users have access to Gemini Flash and GPT Mini. Premium users unlock all 5 models: Gemini Flash, GPT Mini, GPT-4o, Claude Sonnet, and Perplexity."

**Neu:**
"Free users get Gemini Flash (fast, great for quick questions) and GPT Mini (solid quality at low credit cost). Premium unlocks three additional models: GPT-4o (precise analysis and detailed answers), Claude Sonnet (nuanced reasoning and deep analysis), and Perplexity (real-time web search for current info)."

#### 2. Pricing -- Feature-Listen (`src/pages/Pricing.tsx`)

Die Modell-Eintraege in den Feature-Listen werden um kurze Klammerzusaetze ergaenzt:

**Free Plan (Zeile 42):**
- Aktuell: "2 AI models (Gemini Flash, GPT Mini)"
- Neu: "2 AI models — Gemini Flash (fast) & GPT Mini (solid quality)"

**Free Plan (Zeile 48):**
- Aktuell: "Premium AI models (GPT-4o, Claude, Perplexity)"
- Neu: "Premium AI models (GPT-4o, Claude, Perplexity)" -- bleibt gleich (ist durchgestrichen, kein Platz fuer Details)

**Premium Plan (Zeile 55):**
- Aktuell: "All 5 AI models"
- Neu: "All 5 AI models — including GPT-4o, Claude & Perplexity"

#### 3. Feature-Vergleichstabelle (`src/components/genome/FeatureComparisonTable.tsx`)

Die Zeile fuer "Premium models" (Zeile 19) wird leicht ergaenzt:

- Aktuell: "Premium models (GPT-4o, Claude, Perplexity)"
- Neu: "Premium models (GPT-4o, Claude, Perplexity)" -- bleibt hier gleich, da die Tabelle kompakt bleiben soll

Stattdessen wird die Zeile "AI models" (Zeile 13) im Free-Wert angepasst:
- Aktuell: "2 (Gemini Flash, GPT Mini)"
- Neu: "2 (Flash, Mini)"
- Premium bleibt: "All 5"

### Technische Details

- Nur Text-Aenderungen in 2 Dateien: `src/pages/Home.tsx` und `src/pages/Pricing.tsx`
- Keine Aenderung an `FeatureComparisonTable.tsx` -- Tabelle bleibt kompakt
- Kein Backend, keine neuen Komponenten, keine Layout-Aenderungen

