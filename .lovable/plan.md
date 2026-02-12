

# Analyse-Genauigkeit verbessern: Mehr Daten fuer die KI

## Problem

Die KI bekommt aktuell nur den Textinhalt (Markdown) der Website. Fuer technische Kategorien wie "Findability/SEO" und "Mobile Usability" fehlen ihr die entscheidenden Daten:

- Keine HTML-Meta-Tags (title, description, og:tags, robots)
- Keine viewport-Einstellungen (mobile-responsive Indikator)
- Keine strukturierten Daten (JSON-LD / Schema.org)
- Keine Link-Struktur (interne/externe Verlinkung)

## Loesung

### Aenderung 1: Mehr Formate von Firecrawl anfordern (`analyze-website/index.ts`)

Firecrawl unterstuetzt zusaetzliche Formate. Wir fordern `html` und `links` zusaetzlich zu `markdown` und `screenshot` an:

```typescript
formats: ["markdown", "html", "links", "screenshot"],
```

### Aenderung 2: Meta-Tags und strukturierte Daten aus dem HTML extrahieren (`analyze-website/index.ts`)

Eine neue Hilfsfunktion `extractSEOData(html)` parst den HTML-Head-Bereich und extrahiert:

- `<title>` Tag
- `<meta name="description">` 
- `<meta name="viewport">` (zeigt ob mobile-responsive)
- `<meta name="robots">`
- Open Graph Tags (`og:title`, `og:description`, `og:image`)
- Strukturierte Daten (`<script type="application/ld+json">`)
- Canonical URL

Dies geschieht ueber einfache Regex-Extraktion (kein DOM-Parser noetig in Deno).

### Aenderung 3: Erweiterten Kontext an die KI uebergeben (`analyze-website/index.ts`)

Statt nur den Markdown zu senden, wird ein erweiterter Kontext zusammengestellt:

```
Website URL: example.com

=== SEO & TECHNICAL DATA ===
Title Tag: "Example - Best Service"
Meta Description: "We offer the best..."
Viewport: "width=device-width, initial-scale=1"
Robots: "index, follow"
Open Graph: og:title="...", og:description="..."
Structured Data (JSON-LD): {"@type": "LocalBusiness", ...}
Internal Links: 12
External Links: 5

=== WEBSITE CONTENT ===
[Markdown content...]
```

### Aenderung 4: Analyse-Prompt praezisieren (`analyze-website/index.ts`)

Den `ANALYSIS_SYSTEM_PROMPT` aktualisieren, damit die KI die neuen Daten gezielt nutzt:

- **findability**: Bewertung basierend auf den tatsaechlichen Meta-Tags, strukturierten Daten, Title-Tag-Qualitaet und Link-Struktur
- **mobileUsability**: Pruefung ob viewport-Meta-Tag vorhanden ist, plus Inhaltsstruktur-Analyse
- Die KI soll bei fehlenden Daten dies explizit erwaehnen statt zu raten

## Betroffene Datei

| Datei | Aenderung |
|---|---|
| `supabase/functions/analyze-website/index.ts` | Firecrawl-Formate erweitern, SEO-Extraktion, erweiterter KI-Kontext, Prompt-Update |

## Ergebnis

Die KI erhaelt konkrete technische Daten und kann fundierte Bewertungen abgeben statt zu schaetzen. Die Scores fuer Findability und Mobile Usability werden deutlich realistischer.

