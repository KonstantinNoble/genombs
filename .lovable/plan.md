

## Neue "How It Works" Seite

### Zusammenfassung
Eine separate `/how-it-works` Seite, die professionell und ueberzeugend erklaert, wie Synvertas funktioniert: URL- und Code-Analyse, die 5 KI-Modelle mit ihren individuellen Staerken, und der interaktive AI-Chat. Design konsistent mit den bestehenden Seiten (Navbar, Footer, SEOHead, gleiche Typografie und Farben).

### Seitenstruktur

Die Seite besteht aus 5 Sektionen:

**1. Hero**
- Ueberschrift: "How Synvertas works"
- Untertitel: kurzer Einzeiler, z.B. "From URL to actionable insights in under 60 seconds."

**2. Analyse-Prozess (3 Schritte)**
Horizontale Timeline (wie auf der Homepage), aber detaillierter:
- Step 01: "Paste your URL" -- Beschreibung, dass die Website gecrawlt und strukturiert erfasst wird (Content, CTAs, Trust-Signale, Offers)
- Step 02: "AI analyzes everything" -- Beschreibung der 5 Scoring-Kategorien, PageSpeed-Integration und Competitor-Vergleich
- Step 03: "Get scores, tasks & insights" -- Dashboard mit Scores, Improvement Plan und exportierbaren Ergebnissen

**3. Code Analysis**
Eigene Sektion, die erklaert:
- Oeffentliches GitHub-Repository verbinden
- Code wird ueber 6 Kategorien bewertet (Quality, Security, Performance, Accessibility, Maintainability, SEO)
- Ergebnisse werden neben den Website-Scores angezeigt

**4. Die 5 KI-Modelle**
Grid mit 5 Karten, jede mit:
- Modellname, kurzer Vorteil, Credit-Kosten, Free/Premium-Badge
- Gemini Flash: "Fast responses for quick questions" (1 Credit, Free)
- GPT Mini: "Solid quality at low credit cost" (1 Credit, Free)
- GPT-4o: "Precise analysis and detailed answers" (4 Credits, Premium)
- Claude Sonnet: "Nuanced reasoning and deep analysis" (5 Credits, Premium)
- Perplexity: "Real-time web search for current info" (5 Credits, Premium)

**5. AI Chat**
Erklaerung, dass man nach der Analyse den KI-Modellen gezielte Fragen stellen kann:
- Fragen ueber die eigene Website oder den Code
- Vergleichsfragen zu Wettbewerbern
- Konkrete Verbesserungsvorschlaege anfordern
- Jedes Modell bringt eigene Staerken mit

**6. CTA**
- "Ready to analyze your website?" mit Button zu /auth oder /chat

### Technische Details

**Neue Dateien:**
- `src/pages/HowItWorks.tsx` -- neue Seite mit denselben Patterns wie Home/Pricing (Navbar, Footer, SEOHead, Container-Klassen, Border-Styles)

**Geaenderte Dateien:**
- `src/App.tsx` -- neue Route `/how-it-works` hinzufuegen (lazy loaded)
- `src/components/Navbar.tsx` -- "How It Works" Link in Desktop- und Mobile-Navigation einfuegen (zwischen Home und Pricing)

### Design-Richtlinien
- Schwarzer Hintergrund, Orange-Akzente (#F97316)
- Keine Icons oder Emojis in Sektions-Headern
- Font-Weights: Ueberschriften `font-semibold`, Body `font-normal/medium`
- Karten: `border border-border bg-card rounded-lg`
- Sektionen getrennt durch `border-t border-border`
- Monospace fuer Nummern und technische Werte (`font-mono`)

