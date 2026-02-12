

# Fix: Ausgewogene Bewertungslogik – weder zu hart noch zu optimistisch

## Problem

Die aktuellen Prompts sind zu nachsichtig:
- "DO NOT automatically cap the score" und "consider that JavaScript-rendered sites may inject these dynamically" ermutigt die KI, fehlende Tags komplett zu ignorieren
- Die IMPORTANT-Anweisung am Ende sagt praktisch "bewerte fehlende Tags nicht negativ"
- Ergebnis: Unrealistisch hohe Scores, auch wenn tatsaechlich wichtige SEO-Elemente fehlen

## Loesung: Ausgewogene Prompts

Fehlende Tags sollen als echte Schwaechen bewertet werden, aber nicht allein den Score bestimmen. Die Bewertung soll **evidenzbasiert** sein.

### Aenderung 1: Findability-Prompt (Zeilen 158-165)

```
**findability**: Base this on the ACTUAL technical data provided:
- Is there a title tag? Is it well-crafted (under 60 chars, contains keywords)?
- Is there a meta description? Is it compelling (under 160 chars)?
- Are Open Graph tags present for social sharing?
- Is there structured data (JSON-LD)? What types?
- How many internal vs external links are there?
- Each MISSING element (title, description, OG tags, structured data) should lower the score by 5-15 points depending on importance.
- A site with all technical tags present AND good content: 80-100.
- A site missing some tags but with strong content and structure: 50-75.
- A site missing most tags: 30-50 regardless of content quality.
```

### Aenderung 2: Mobile Usability-Prompt (Zeilen 167-171)

```
**mobileUsability**: Evaluate mobile responsiveness:
- Viewport meta tag present ("width=device-width, initial-scale=1"): strong positive signal (+20 points baseline).
- Viewport meta NOT FOUND: note as a weakness. Deduct 15-25 points, but do not cap at 40 since some frameworks inject it via JavaScript.
- Content structure: headings, readability, text blocks, content organization.
- Score 70-100: viewport present AND good content structure.
- Score 45-70: viewport missing BUT content structure suggests responsive design.
- Score 20-45: viewport missing AND poor content structure.
```

### Aenderung 3: Viewport-Kontext (Zeile 94) - leicht anpassen

```typescript
// Etwas neutraler, aber nicht entschuldigend:
sections.push(`Viewport Meta: ${seo.viewport ? `"${seo.viewport}"` : "NOT FOUND in static HTML"}`);
```

### Aenderung 4: IMPORTANT-Anweisung (Zeile 179)

```
IMPORTANT: When technical data shows "MISSING", reflect this proportionally in the scores and mention it in weaknesses. Missing elements are real weaknesses even if some may be injected dynamically. Score based on what is actually verifiable in the provided data.
```

## Betroffene Datei

| Datei | Aenderungen |
|---|---|
| `supabase/functions/analyze-website/index.ts` | 4 Stellen: Scoring-Ranges definieren, Viewport-Kontext kuerzen, IMPORTANT-Regel straffen |

## Ergebnis

- Fehlende Tags fuehren zu konkreten, nachvollziehbaren Punktabzuegen (5-25 je nach Element)
- Guter Content kann fehlende Tags teilweise kompensieren, aber nicht vollstaendig
- Klare Score-Bereiche geben der KI Orientierung statt vage Anweisungen
- Scores sind weder zu pessimistisch (alte Version) noch zu optimistisch (aktuelle Version)

