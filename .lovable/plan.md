
## Umbenennung: Synoptas → Synvertas

Globales Suchen-und-Ersetzen von "Synoptas" zu "Synvertas" und "synoptas" zu "synvertas" in allen betroffenen Dateien.

---

### Betroffene Dateien (20 Dateien)

**Frontend-Seiten:**
1. `src/pages/Auth.tsx` - SEO description
2. `src/pages/UpdatePassword.tsx` - SEO description
3. `src/pages/TermsOfService.tsx` - ca. 20 Vorkommen (Vertragstext)
4. `src/pages/PrivacyPolicy.tsx` - Datenschutztext
5. `src/pages/Imprint.tsx` - Impressum
6. `src/pages/Home.tsx` - SEO, FAQ, Strukturdaten
7. `src/pages/Pricing.tsx` - SEO
8. `src/pages/Contact.tsx` - SEO
9. `src/pages/Profile.tsx` - SEO
10. `src/pages/ResetPassword.tsx` - SEO

**Komponenten:**
11. `src/components/Navbar.tsx` - Logo-Text und Alt-Text ("Synoptas" → "Synvertas", Logo-Dateipfad bleibt, nur Alt-Text aendern)
12. `src/components/Footer.tsx` - Markenname und Copyright
13. `src/components/seo/SEOHead.tsx` - siteUrl, fullTitle, og:site_name, twitter:creator, ogImage-URL
14. `src/components/seo/StructuredData.tsx` - Social-Links, Publisher-Name, Logo-URL

**Hooks:**
15. `src/hooks/useFreemiusCheckout.ts` - Kommentar

**Backend (Edge Functions):**
16. `supabase/functions/send-auth-email/index.ts` - E-Mail-Absender, Betreffzeilen, HTML-Inhalte
17. `supabase/functions/register-user/index.ts` - E-Mail-HTML-Inhalte, Absender
18. `supabase/functions/check-reset-eligibility/index.ts` - E-Mail-HTML, Absender, Betreff

**Statische Dateien:**
19. `index.html` - Title, Meta-Tags, Structured Data, Noscript-Inhalte
20. `public/robots.txt` - Kommentare, Sitemap-URL, Host
21. `public/sitemap.xml` - Alle URLs

---

### Hinweise

- Die Favicon-Datei `public/synoptas-favicon.png` wird NICHT umbenannt (gleiches Bild, nur Referenzen im Alt-Text werden aktualisiert). Falls du auch den Dateinamen aendern moechtest, sag Bescheid.
- URLs wie `synoptas.com` werden zu `synvertas.com` geaendert. Falls die Domain noch nicht registriert ist, muessen die URLs spaeter ggf. angepasst werden.
- Die E-Mail-Adresse `mail@wealthconomy.com` bleibt unveraendert (gehoert nicht zum Markennamen).
- Reine Text-Ersetzung, keine strukturellen Aenderungen.
