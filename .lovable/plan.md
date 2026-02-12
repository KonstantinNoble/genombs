

# Fix: rawHtml statt html fuer korrekte SEO-Extraktion

## Problem

Firecrawl's `html`-Format liefert **verarbeitetes HTML**, bei dem `<script>`-Tags (inklusive JSON-LD) und Styles entfernt werden. Dadurch kann die `extractSEOData()`-Funktion keine strukturierten Daten finden, und auch `<meta>`-Tags im `<head>` koennten fehlen.

## Loesung

Eine kleine aber wichtige Aenderung: `rawHtml` statt `html` im Firecrawl-Request verwenden.

### Aenderung in `supabase/functions/analyze-website/index.ts`

**Zeile 451** - Firecrawl formats:
```
Vorher:  formats: ["markdown", "html", "links", "screenshot"]
Nachher: formats: ["markdown", "rawHtml", "links", "screenshot"]
```

**Zeile 472** - Response-Zugriff:
```
Vorher:  html = crawlData.data?.html || crawlData.html || "";
Nachher: html = crawlData.data?.rawHtml || crawlData.rawHtml || "";
```

## Warum ist das wichtig?

| Format | Meta-Tags | JSON-LD Scripts | Vollstaendiger Head |
|---|---|---|---|
| `html` | Teilweise | Nein (entfernt) | Nein |
| `rawHtml` | Ja | Ja | Ja |

## Betroffene Datei

| Datei | Aenderung |
|---|---|
| `supabase/functions/analyze-website/index.ts` | 2 Zeilen: `html` durch `rawHtml` ersetzen |

## Ergebnis

Die SEO-Extraktion erhaelt das vollstaendige, originale HTML und kann alle Meta-Tags, Open Graph Tags und JSON-LD Structured Data korrekt extrahieren.

