
# Homepage & Pricing Optimierung: Text-Überarbeitung, Mobile-Test & Testimonials

## Übersicht

Dieser Plan umfasst vier Hauptbereiche:
1. **Text-Überarbeitung**: Konsistenter Startup-Advisory-Ton statt Compliance-Sprache
2. **HowItWorks-Sektion entfernen**: Redundanz mit ProductShowcase beseitigen
3. **Testimonials hinzufügen**: Neue Sektion mit Founder-Zitaten
4. **Mobile-Test**: Responsiveness-Check für alle Sektionen

---

## 1. Text-Überarbeitung: Startup-Ton statt Compliance

### Begriffe die ersetzt werden

| Alt (Compliance)           | Neu (Startup-Advisory)              |
|----------------------------|-------------------------------------|
| Decision Records           | Second Opinions / Analyses          |
| Audit Trail                | Decision History                    |
| Documentation              | Insights / Analysis                 |
| Stakeholder-ready          | Investor-ready                      |
| Audit-grade precision      | Structured analysis                 |

### Betroffene Dateien

#### Hero.tsx (Zeile 126-130)
```text
Vorher: "Decision Records"
Nachher: "Shared Decision History"
```

#### PainPoints.tsx
Texte sind bereits gut auf Startup-Founder ausgerichtet - keine Änderung nötig.

#### WhySynoptas.tsx
Texte sind bereits gut - keine Änderung nötig.

#### Features.tsx (Zeile 74-77)
```text
Vorher: "Track Your Decision Patterns"
Nachher: "Learn From Your Past Decisions"
```

#### CTA.tsx (Zeile 83)
```text
Vorher: "Two free decision records per day"
Nachher: "Two free second opinions per day"
```

#### FAQ.tsx - Mehrere Anpassungen
- "decision records" → "second opinions" oder "analyses"
- "Documented rationale" → "Structured thinking"

#### Pricing.tsx (Zeile 100, 138)
```text
Vorher: "2 decision records per day"
Nachher: "2 analyses per day"

Vorher: "10 decision records per day"
Nachher: "10 analyses per day"

Vorher: "Stakeholder-ready PDF exports"
Nachher: "Investor-ready PDF exports"
```

#### Pricing Page (src/pages/Pricing.tsx)
- Hero: "Professional Decision Documentation" → "Your AI Advisory Board"
- Comparison Table: Anpassung der Feature-Namen
- FAQ: Konsistente Terminologie

---

## 2. HowItWorks-Sektion entfernen

### Begründung
- **Redundanz**: ProductShowcase zeigt bereits 3 Schritte mit Screenshots
- **Kürzere Seite**: Bessere User Experience ohne Wiederholung
- **Fokus**: Weniger Text, mehr visuelle Demonstration

### Änderungen

#### Home.tsx
```tsx
// Entferne Import
- import HowItWorks from "@/components/home/HowItWorks";

// Entferne aus JSX
- <HowItWorks />
```

Die Datei `src/components/home/HowItWorks.tsx` bleibt bestehen (für eventuelle spätere Verwendung), wird aber nicht mehr eingebunden.

---

## 3. Testimonials-Sektion hinzufügen

### Neue Komponente: `src/components/home/Testimonials.tsx`

```text
┌──────────────────────────────────────────────────────────────┐
│                     What Founders Say                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐ │
│  │ "I was about to hire a      │  │ "Before a big pricing   │ │
│  │ $180k engineer. Synoptas    │  │ change, I ran it        │ │
│  │ showed me 2 of 3 models     │  │ through Synoptas. Two   │ │
│  │ flagged cash runway risk.   │  │ models agreed, one      │ │
│  │ I waited 3 months. Glad     │  │ didn't. That dissent    │ │
│  │ I did."                     │  │ made me dig deeper."    │ │
│  │                             │  │                         │ │
│  │ — Marcus R.                 │  │ — Elena K.              │ │
│  │   Solo Founder, SaaS        │  │   Co-Founder, E-Com     │ │
│  └─────────────────────────────┘  └─────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐ │
│  │ "My advisor loved the PDF   │  │ "I use it before every  │ │
│  │ export. 'This is how you    │  │ investor call now.      │ │
│  │ should present decisions    │  │ Forces me to structure  │ │
│  │ to investors,' she said."   │  │ my thinking."           │ │
│  │                             │  │                         │ │
│  │ — David C.                  │  │ — Sofia M.              │ │
│  │   Founder, HealthTech       │  │   Solo Founder, FinTech │ │
│  └─────────────────────────────┘  └─────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Testimonial-Inhalte

| Name        | Rolle                     | Zitat                                                                                                                   |
|-------------|---------------------------|-------------------------------------------------------------------------------------------------------------------------|
| Marcus R.   | Solo Founder, SaaS        | "I was about to hire a $180k engineer. Synoptas showed me 2 of 3 models flagged cash runway risk. I waited 3 months. Glad I did." |
| Elena K.    | Co-Founder, E-Commerce    | "Before a big pricing change, I ran it through Synoptas. Two models agreed, one didn't. That dissent made me dig deeper." |
| David C.    | Founder, HealthTech       | "My advisor loved the PDF export. 'This is how you should present decisions to investors,' she said."                   |
| Sofia M.    | Solo Founder, FinTech     | "I use it before every investor call now. Forces me to structure my thinking."                                          |

### Integration in Home.tsx
```tsx
// Neue Reihenfolge:
<Hero />           // inkl. ProductShowcase
<PainPoints />
<WhySynoptas />
<Testimonials />   // NEU - nach WhySynoptas
<Features />
<Pricing />        // nur für nicht-Premium
<FAQ />
<CTA />
```

---

## 4. Mobile-Responsiveness Check

### Zu testende Bereiche

| Sektion         | Zu prüfen                                         |
|-----------------|---------------------------------------------------|
| Hero            | Text-Größen, CTA-Buttons, ProductShowcase-Bilder  |
| PainPoints      | Grid-Layout (2-spaltig → 1-spaltig)               |
| WhySynoptas     | Comparison-Boxen stacked                          |
| Testimonials    | 2x2 Grid → 1-Spalte auf Mobile                    |
| Features        | 2-spaltig → 1-spaltig                             |
| Pricing         | Cards nebeneinander → gestacked                   |
| FAQ             | Accordion-Touch-Targets                           |
| CTA             | Button-Größen, Text-Wrapping                      |

### Pricing Page Mobile-Check
- Hero-Text nicht überlaufen
- Comparison-Table horizontal scrollbar falls nötig
- FAQ-Items ausreichend Touch-Target

---

## Zusammenfassung der Dateiänderungen

| Datei                                    | Änderung                                    |
|------------------------------------------|---------------------------------------------|
| `src/pages/Home.tsx`                     | HowItWorks entfernen, Testimonials hinzufügen |
| `src/components/home/Testimonials.tsx`   | NEU: Testimonials-Sektion                    |
| `src/components/home/Hero.tsx`           | Text-Anpassung (Decision Records → History)  |
| `src/components/home/Features.tsx`       | Text-Anpassung                               |
| `src/components/home/CTA.tsx`            | Text-Anpassung                               |
| `src/components/home/FAQ.tsx`            | Text-Anpassungen (mehrere)                   |
| `src/components/home/Pricing.tsx`        | Text-Anpassungen                             |
| `src/pages/Pricing.tsx`                  | Text-Anpassungen, Hero-Headline              |

---

## Hinweis zu Testimonials

Die Testimonials sind **fiktiv** aber **realistisch**. Falls echte Testimonials gewünscht sind, können diese später ersetzt werden. Die fiktiven Namen und Rollen sind so gewählt, dass sie die Zielgruppe (Solo Founders, kleine Teams, Startup-Kontext) widerspiegeln.
