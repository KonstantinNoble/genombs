

# SEO-Optimierung: Natuerlich, zielgruppengerecht, suchmaschinenfreundlich

## Uebersicht
Die aktuelle SEO-Basis ist solide (Structured Data, sitemap, robots.txt, canonical tags). Es gibt aber klare Luecken bei Keywords, Meta-Descriptions, Seitenstruktur und inhaltlicher Tiefe. Ziel: Bessere Rankings fuer kaufbereite Nutzer, ohne dass Google den Content als KI-generiert einstuft.

## Kernprinzip: Natuerlich statt KI-typisch
- Kurze, direkte Saetze statt generischer Marketing-Floskeln
- Konkrete Zahlen und spezifische Details statt vager Versprechen
- Variierende Satzlaenge und echte Nutzerperspektive
- Keine Keyword-Ueberladung, stattdessen semantische Varianten

---

## Aenderungen im Detail

### 1. `index.html` - Fallback Meta Tags verbessern

**Problem:** Title und Description sind zu generisch ("optimize your website", "chatting with an ai that knows your site"). Das rankt schlecht und klingt KI-generiert.

**Neu:**
- Title: `Synvertas – Website Scoring, Competitor Analysis & Improvement Plan`
- Description: `Scan any website in under 60 seconds. Get scores across 5 categories, compare up to 3 competitors, and receive a step-by-step improvement plan. Free to start.`
- og:title und twitter:title: gleicher neuer Title
- og:description und twitter:description: gleiche neue Description
- Noscript-Bereich: "Auto Competitor Discovery" und "Code Analysis" als Bullet Points ergaenzen
- SoftwareApplication Schema: featureList um "Auto Competitor Discovery" und "GitHub Code Analysis" ergaenzen

### 2. `src/components/seo/SEOHead.tsx` - Bessere Default Keywords

**Problem:** Default-Keywords sind zu breit und nicht zielgruppenspezifisch.

**Neu:**
```
keywords = "website scoring tool, website audit, competitor benchmarking, conversion optimization, PageSpeed analysis, website improvement plan, site analyzer"
```

### 3. `src/pages/Home.tsx` - SEOHead optimieren

**Problem:** Title ist zu lang ("Synvertas – Turn your website into a growth engine | Synvertas" = doppeltes Branding). Description fehlen spezifische Keywords.

**Neu:**
- Title: `Website Scoring & Competitor Analysis Tool` (wird zu "Website Scoring & Competitor Analysis Tool | Synvertas")
- Description: `Scan your website and get scores across 5 categories, compare against competitors, and receive a step-by-step improvement plan. Results in under 60 seconds. Free to start.`
- Keywords: `website scoring, website audit tool, competitor analysis, conversion optimization, PageSpeed insights, website improvement plan, SEO audit, site analyzer`

Ausserdem: FAQSchema aus StructuredData.tsx auf der Homepage einbinden (fehlt aktuell trotz vorhandener FAQ-Daten).

### 4. `src/pages/Pricing.tsx` - Meta Tags optimieren

**Problem:** Description "Simple, transparent pricing" ist zu vage, keine Keywords.

**Neu:**
- Title: `Pricing – Free & Premium Plans`
- Description: `Start with 20 free credits per day. Upgrade to Premium for 100 daily credits, 5 AI models, and up to 3 competitor URLs. Plans start at $14.99/month.`
- Keywords: `website analysis pricing, website audit cost, free website scanner, premium website tool`

### 5. `src/pages/HowItWorks.tsx` - Meta Tags optimieren

**Aktion:** SEOHead Title und Description pruefen und mit konkreten Keywords versehen.

- Title: `How It Works – Scan, Score, Improve`
- Description: `Paste your URL, get AI-powered scores across 5 categories, and receive a prioritized improvement plan. Three steps, under 60 seconds, no setup needed.`
- Keywords: `how website analysis works, website scoring process, AI website audit steps`

### 6. `src/pages/Contact.tsx` - Keywords ergaenzen

**Neu:**
- Keywords: `contact synvertas, website analysis support, help, feedback`

### 7. `public/sitemap.xml` - Fehlende Seite ergaenzen

**Problem:** Die `/how-it-works` Seite fehlt in der Sitemap.

**Neu:** Eintrag fuer `/how-it-works` mit priority 0.7 hinzufuegen. Ausserdem `lastmod` auf aktuelles Datum (2026-02-23) setzen fuer alle Seiten.

### 8. `public/robots.txt` - Crawl-Budget schuetzen

**Neu:** Geschuetzte Routen explizit blockieren:
```
Disallow: /auth
Disallow: /profile
Disallow: /achievements
Disallow: /reset-password
Disallow: /update-password
Disallow: /auth-callback
```

### 9. `src/pages/Home.tsx` - H-Tag-Hierarchie und semantische Struktur

**Problem:** Der Hero-H1 ("What's holding your website back?") ist emotional gut, aber enthaelt kein einziges Keyword. Suchmaschinen brauchen dort relevante Begriffe.

**Loesung:** Eine versteckte, aber crawlbar lesbare `<span className="sr-only">` innerhalb des H1 ergaenzen:
```
<span className="sr-only">Website Scoring and Competitor Analysis Tool</span>
```
Dies ist ein gaengiges SEO-Pattern fuer SPAs und kein Cloaking, da der Inhalt fuer Screenreader sichtbar ist.

---

## Zusammenfassung der betroffenen Dateien

| Datei | Aenderung |
|---|---|
| `index.html` | Title, Description, OG/Twitter Tags, Noscript, Schema |
| `src/components/seo/SEOHead.tsx` | Default-Keywords |
| `src/pages/Home.tsx` | SEOHead Props, FAQSchema, H1 sr-only Keyword |
| `src/pages/Pricing.tsx` | SEOHead Props |
| `src/pages/HowItWorks.tsx` | SEOHead Props |
| `src/pages/Contact.tsx` | Keywords |
| `public/sitemap.xml` | how-it-works Seite, lastmod aktualisieren |
| `public/robots.txt` | Auth/Profile Routen blockieren |

