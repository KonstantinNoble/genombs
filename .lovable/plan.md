
# Fix: Realistische Mobile- und SEO-Bewertung

## Problem

Zwei Stellen in `supabase/functions/analyze-website/index.ts` führen zu unrealistischen niedrigen Scores für Mobile Usability und Findability:

1. **Zu harter Viewport-Check (Zeile 167)**: Der Prompt capped mobileUsability automatisch auf max. 40, wenn kein Viewport-Meta-Tag im statischen HTML gefunden wird
2. **Negativ suggestive Kontextbeschreibung (Zeile 94)**: Der Text "MISSING (likely not mobile-responsive)" beeinflusst die KI unbewusst zu niedrigeren Scores, obwohl moderne SPAs/React-Apps das Viewport-Tag per JavaScript setzen

## Root Cause

Moderne Websites (React, Vue, Angular) injizieren Meta-Tags dynamisch nach dem initialen HTML-Parse. Firecrawl erfasst nur das statische HTML **vor** der JavaScript-Ausführung, weshalb diese Tags fehlen – obwohl die Seite perfekt responsive ist.

## Lösung

### 1. Neutraler Kontext (Zeile 94)

**Vorher:**
```typescript
sections.push(`Viewport Meta: ${seo.viewport ? `"${seo.viewport}"` : "MISSING (likely not mobile-responsive)"}`);
```

**Nachher:**
```typescript
sections.push(`Viewport Meta: ${seo.viewport ? `"${seo.viewport}"` : "NOT FOUND in static HTML (may be set dynamically via JavaScript)"}`);
```

### 2. Realistischer Scoring-Prompt (Zeilen 166-169)

**Vorher:**
```
**mobileUsability**: Check the viewport meta tag:
- If viewport meta is MISSING, score should be significantly lower (max 40) and state this.
- If viewport is present ("width=device-width, initial-scale=1"), that's a positive signal.
- Also assess content structure (headings, readability, content length).
```

**Nachher:**
```
**mobileUsability**: Evaluate mobile responsiveness by examining:
- Viewport meta tag: If present ("width=device-width, initial-scale=1"), that's a positive signal.
- If viewport meta is NOT FOUND in static HTML: Note this but DO NOT automatically cap the score. 
  Many modern websites (SPAs, React, Angular apps) inject meta tags via JavaScript, which may not appear in the static HTML.
- Content structure: headings, readability, text blocks, content organization that suggests responsive design.
- Only score very low (30-40) if the content itself shows poor mobile design (e.g., very wide unbroken tables, extremely long text lines, no clear hierarchy).
```

### 3. Findability-Prompt auch anpassen (Zeilen 158-164)

**Vorher:**
```
**findability**: Base this on the ACTUAL technical data provided:
- Is there a title tag? Is it well-crafted (under 60 chars, contains keywords)?
- Is there a meta description? Is it compelling (under 160 chars)?
- Are Open Graph tags present for social sharing?
- Is there structured data (JSON-LD)? What types?
- How many internal vs external links are there?
- If any of these are MISSING, lower the score and mention it explicitly.
```

**Nachher:**
```
**findability**: Base this on the ACTUAL technical data provided:
- Is there a title tag? Is it well-crafted (under 60 chars, contains keywords)?
- Is there a meta description? Is it compelling (under 160 chars)?
- Are Open Graph tags present for social sharing?
- Is there structured data (JSON-LD)? What types?
- How many internal vs external links are there?
- If technical tags are MISSING: Note this as a weakness, but consider that JavaScript-rendered sites may inject these dynamically.
- Weigh content quality, keyword usage, heading hierarchy, and internal linking structure alongside technical meta-tag presence.
```

## Betroffene Datei

| Datei | Änderungen |
|---|---|
| `supabase/functions/analyze-website/index.ts` | 3 Stellen: Kontext neutral formulieren + 2x Prompts lockern |

## Ergebnis

- Mobile-responsive Websites mit dynamisch gesetzten Meta-Tags erhalten realistische Scores (70+)
- Fehlende Tags werden weiterhin als Weakness erwähnt, bestrafen aber nicht unverhältnismäßig
- Die KI bewertet anhand des Gesamtbildes (Inhalt + Struktur), nicht nur anhand eines einzelnen technischen Signals
- Scores sind reproduzierbar und fair für modernes Web-Design

