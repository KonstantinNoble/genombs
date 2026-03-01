

# SEO-Optimierung: Natuerlich, technisch korrekt, suchmaschinenfreundlich

## Zusammenfassung

Die Basis ist solide (SEOHead, robots.txt, sitemap, structured data). Es gibt aber mehrere Luecken und Inkonsistenzen, die das Ranking negativ beeinflussen koennen. Kein Keyword-Stuffing, keine AI-typischen Formulierungen — alles bleibt natuerlich.

---

## 1. Chat-Seite: Fehlende SEO-Meta-Tags

`/chat` ist in der Sitemap mit Prioritaet 0.9 gelistet, hat aber **kein SEOHead**. Suchmaschinen sehen keinen Title, keine Description.

**Fix:** SEOHead hinzufuegen mit natuerlichem Title und Description:
- Title: `"Website Analysis Tool – Score Your Site in 60 Seconds"`
- Description: `"Paste your URL and get scored across findability, trust, mobile usability, offer clarity, and conversion readiness. Compare against competitors and get a fix list."`
- Canonical: `/chat`

---

## 2. Dashboard: Fehlender noindex

`/dashboard` ist eine authentifizierte Seite ohne SEOHead. Wenn Crawler sie erreichen, sehen sie keinen noindex-Tag.

**Fix:** SEOHead mit `noindex={true}` hinzufuegen.

---

## 3. index.html: Veraltete und doppelte Inhalte

Mehrere Probleme in der statischen HTML-Fallback-Ebene:

- **Noscript-Bereich:** Credit-Kosten sagen "5-10 credits" — tatsaechlich sind es 9-14 pro Scan und 3-7 pro Chat-Nachricht
- **Structured Data (SoftwareApplication):** Enthaelt "PageSpeed" statt "Code Analysis" (per Memory-Regel geaendert)
- **Structured Data (FAQPage):** Credit-Kosten stimmen nicht mit den aktuellen Werten ueberein
- **Doppelte FAQ-Schemas:** index.html hat ein statisches FAQSchema UND Home.tsx rendert ein dynamisches — Google sieht doppelte FAQPage-Typen

**Fix:**
- Noscript-Credit-Werte aktualisieren
- "PageSpeed" durch "Code Analysis" ersetzen wo noetig in structured data
- Statisches FAQPage-Schema aus index.html **entfernen** (Home.tsx generiert es bereits dynamisch via FAQSchema-Komponente)
- SoftwareApplication-Schema Werte synchronisieren

---

## 4. Footer: Fehlender "How It Works"-Link

Der Footer hat nur Legal + Business Links. "How It Works" fehlt als interner Link. Das schwaeecht die interne Verlinkung — eine der wichtigsten On-Page-SEO-Massnahmen.

**Fix:** "Product"-Spalte im Footer hinzufuegen mit Links zu:
- How It Works (`/how-it-works`)
- Analyze (`/chat`)

---

## 5. Pricing + HowItWorks: BreadcrumbSchema fehlt

Breadcrumbs helfen Google die Seitenstruktur zu verstehen und zeigen Rich Results in der Suche.

**Fix:** BreadcrumbSchema-Komponente (existiert bereits in StructuredData.tsx) auf Pricing und HowItWorks einbinden:
- Home > Pricing
- Home > How It Works

---

## 6. Pricing-FAQ: Kein FAQSchema

Die Pricing-Seite hat FAQ-Inhalte (`pricingFAQ`), aber kein FAQSchema fuer structured data. Das sind verpasste Rich-Result-Chancen.

**Fix:** `FAQSchema` Komponente mit `pricingFAQ` auf der Pricing-Seite rendern.

---

## 7. Keywords in index.html synchronisieren

Die statischen Keywords in index.html enthalten noch "PageSpeed analysis". Per bestehender Regel sollte das "code analysis" oder "website performance analysis" sein.

**Fix:** Keyword-Meta-Tag in index.html aktualisieren.

---

## Technische Uebersicht der Aenderungen

| Datei | Aenderung |
|-------|-----------|
| `src/pages/Chat.tsx` | SEOHead mit Title, Description, Canonical hinzufuegen |
| `src/pages/Dashboard.tsx` | SEOHead mit noindex hinzufuegen |
| `index.html` | Noscript-Credits korrigieren, PageSpeed-Referenzen entfernen, statisches FAQPage-Schema entfernen, Keywords aktualisieren |
| `src/components/Footer.tsx` | "Product"-Spalte mit How It Works + Analyze Links |
| `src/pages/Pricing.tsx` | BreadcrumbSchema + FAQSchema hinzufuegen |
| `src/pages/HowItWorks.tsx` | BreadcrumbSchema hinzufuegen |

**Nicht betroffen (per Anforderung):** Imprint, Privacy Policy, Terms of Service — bleiben mit noindex geschuetzt.

