
## Persoenliche Daten vor Suchmaschinen schuetzen

### Ziel
Die Seiten Imprint, Contact und Privacy Policy enthalten deinen Namen, deine Adresse und deine Email. Diese sollen von Suchmaschinen nicht indexiert werden, damit man ueber eine Google-Suche nach deinem Namen oder deiner Email nicht auf deine Webseite stoesst.

### Aenderungen

**1. Imprint-Seite (`src/pages/Imprint.tsx`)**
- `SEOHead`-Komponente mit `noindex={true}` hinzufuegen
- Damit wird der Meta-Tag `<meta name="robots" content="noindex, nofollow">` gesetzt

**2. Contact-Seite (`src/pages/Contact.tsx`)**
- `noindex={true}` zur bestehenden `SEOHead`-Komponente hinzufuegen
- Structured-Data-Schema (`WebPageSchema`) entfernen, da die Seite nicht mehr indexiert werden soll

**3. Privacy-Policy-Seite (`src/pages/PrivacyPolicy.tsx`)**
- `SEOHead`-Komponente mit `noindex={true}` hinzufuegen

**4. Sitemap (`public/sitemap.xml`)**
- Die Eintraege fuer `/contact`, `/privacy-policy` und `/imprint` entfernen, damit Suchmaschinen diese Seiten nicht ueber die Sitemap finden

**5. robots.txt (`public/robots.txt`)**
- `Disallow: /contact`, `Disallow: /imprint`, `Disallow: /privacy-policy` zu allen User-Agent-Bloecken hinzufuegen

### Was bleibt SEO-optimiert
Alle anderen Seiten (Homepage, Chat, Pricing, How It Works) bleiben vollstaendig indexiert und SEO-optimiert. Die Aenderung betrifft ausschliesslich die drei Seiten mit persoenlichen Angaben.

### Technisch
- 5 Dateien werden geaendert
- Dreifacher Schutz: Meta-Tag (noindex), robots.txt (Disallow) und Sitemap-Entfernung
- Bestehende Suchmaschinen-Caches werden nach dem naechsten Crawl aktualisiert (kann einige Tage bis Wochen dauern)
