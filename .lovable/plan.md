

# Blog-System: Uebersichtsseite + Einzelartikel-Seiten

## Zusammenfassung

Zwei neue Seiten: `/blog` (Artikeluebersicht) und `/blog/:slug` (Einzelartikel). Statische Daten als TypeScript-Datei — kein Backend noetig. Design folgt dem bestehenden Muster: dunkel, minimalistisch, monospaced Nummerierungen, scroll-reveal Animationen, keine Emojis/Icons.

---

## Neue Dateien

### 1. `src/lib/blog-data.ts` — Statische Blog-Daten

Array mit 4 Beispielartikeln. Jeder Artikel enthaelt:
- `slug`, `title`, `excerpt`, `content` (Markdown-String), `publishedAt`, `readingTime`, `category`

Kategorien z.B.: "Performance", "Strategy", "Technical", "SEO"

Beispiel-Titel (natuerlich klingend):
- "Why Most Website Audits Miss What Actually Matters"
- "The Real Cost of Slow Websites in 2026"
- "What Your Competitors' Code Tells You About Their Strategy"
- "Backlinks That Work: Quality Over Quantity"

Content wird als mehrzeiliger Markdown-String gespeichert mit echten Absaetzen, Zwischenueberschriften und Argumenten — kein Lorem Ipsum, sondern thematisch passende Vorlagentexte.

### 2. `src/pages/Blog.tsx` — Artikeluebersicht

Struktur (gleich wie HowItWorks/Pricing):
- `SEOHead` mit Title/Description/Canonical
- `BreadcrumbSchema` (Home > Blog)
- `Navbar` + `Footer`
- Hero-Section: Ueberschrift "Blog" + Untertitel
- Artikel-Grid: 1 Spalte auf Mobile, 2 auf Desktop
- Jede Karte zeigt: Kategorie-Badge, Titel, Excerpt, Datum + Lesezeit in `font-mono`
- Karten nutzen `border border-border bg-card` + `hover:border-primary/30` (bestehendes Muster)
- `scroll-reveal` / `stagger-reveal` Animationen
- Klick auf Karte navigiert zu `/blog/:slug`

### 3. `src/pages/BlogPost.tsx` — Einzelartikel

- `SEOHead` mit dynamischem Title/Description
- `BreadcrumbSchema` (Home > Blog > Artikeltitel)
- Artikel-Header: Kategorie, Titel, Datum + Lesezeit
- Content wird mit `react-markdown` + `remark-gfm` gerendert (bereits installiert)
- Zurueck-Link zum Blog
- Styling fuer Markdown-Content: Prose-aehnliche Typografie ueber Tailwind-Klassen direkt auf dem Container
- Am Ende: CTA-Box "Ready to analyze your website?" (gleicher Stil wie HowItWorks CTA)

---

## Bestehende Dateien — Aenderungen

### 4. `src/App.tsx`

Zwei neue lazy-loaded Routes:
```
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
```
Routes:
- `/blog` → `<Blog />`
- `/blog/:slug` → `<BlogPost />`

### 5. `src/components/Navbar.tsx`

"Blog" Link in Desktop-Navigation und Mobile-Navigation hinzufuegen (oeffentlich sichtbar, nicht hinter Auth).

### 6. `src/components/Footer.tsx`

"Blog" Link in der "Product"-Spalte hinzufuegen.

### 7. `public/sitemap.xml`

Neue Eintraege:
- `/blog` mit Prioritaet 0.7, changefreq weekly
- `/blog/why-most-website-audits-miss-what-actually-matters` (und die anderen 3 Slugs) mit Prioritaet 0.6

---

## Design-Details

- Artikelkarten: `border border-border bg-card rounded-lg p-6 sm:p-8` mit `hover:border-primary/30 transition-colors duration-200`
- Kategorie: `<span>` mit `text-xs font-mono uppercase tracking-wider text-primary`
- Datum/Lesezeit: `text-sm font-mono text-muted-foreground`
- Markdown-Content: Custom CSS-Klassen auf dem Container fuer `h2`, `h3`, `p`, `ul`, `blockquote` Styling — passend zum dunklen Theme
- Subtiler horizontaler Trennstrich (`h-px bg-border`) zwischen Header und Content
- Kein Bild pro Artikel — rein typografisch, technisch, clean

---

## Technische Details

| Datei | Aenderung |
|-------|-----------|
| `src/lib/blog-data.ts` | Neu: Statische Artikeldaten (4 Posts) |
| `src/pages/Blog.tsx` | Neu: Uebersichtsseite mit Grid |
| `src/pages/BlogPost.tsx` | Neu: Einzelartikel mit Markdown-Rendering |
| `src/App.tsx` | 2 neue Routes (lazy) |
| `src/components/Navbar.tsx` | "Blog" Link (Desktop + Mobile) |
| `src/components/Footer.tsx` | "Blog" Link in Product-Spalte |
| `public/sitemap.xml` | 5 neue URL-Eintraege |

