

## Datenschutzerklaerung: Umfassende inhaltliche Korrektur

Die Datenschutzerklaerung wird an die tatsaechlichen Funktionen des Produkts angepasst. Folgende Probleme wurden identifiziert und werden korrigiert:

---

### Probleme und Korrekturen

**1. Section 6.2 - Marketing Emails (komplett entfernen)**
- Behauptet: Marketing-Consent-Checkbox beim ersten Login, Consent-Status wird gespeichert
- Realitaet: Kein Marketing-Email-Feature existiert im Code, keine Checkbox, kein Consent-Feld
- Korrektur: Gesamte Section 6.2 entfernen

**2. Section 13 - Automatisierte Entscheidungsfindung (aktualisieren)**
- Behauptet: "We do not currently engage in automated decision-making" und "Should we introduce AI-powered features in the future..."
- Realitaet: Das Produkt IST AI-powered. Es nutzt 5 verschiedene AI-Modelle (Gemini Flash, GPT-4o-mini, GPT-4o, Claude Sonnet, Perplexity Sonar Pro) fuer Website-Scoring und Chat
- Korrektur: Klarstellen, dass AI fuer Analyse verwendet wird, aber keine automatisierten Entscheidungen mit rechtlicher Wirkung (Art. 22 GDPR) getroffen werden

**3. Fehlende Section: AI-Datenverarbeitung (neu hinzufuegen)**
Es fehlt komplett eine Beschreibung der AI-Verarbeitung:
- Welche AI-Anbieter genutzt werden (Google/Gemini, OpenAI, Anthropic, Perplexity)
- Welche Daten an diese uebermittelt werden (gecrawlter Website-Inhalt als Markdown, SEO-Metadaten, Chat-Nachrichten)
- Dass die Verarbeitung serverseitig in Edge Functions stattfindet
- Rechtsgrundlage und Drittlandtransfer-Basis fuer jeden Anbieter
- Korrektur: Neue Section nach Section 7 einfuegen

**4. Fehlende Section: Website-Crawling via Firecrawl (neu hinzufuegen)**
- Das Produkt nutzt Firecrawl zum Crawlen von Websites (Markdown, HTML, Links, Screenshots)
- Dies wird nirgends in der Datenschutzerklaerung erwaehnt
- Korrektur: Neue Section hinzufuegen, die Firecrawl als Auftragsverarbeiter beschreibt

**5. Fehlende Section: Google PageSpeed Insights API (neu hinzufuegen)**
- Das Produkt ruft die Google PageSpeed Insights API auf
- Die eingegebene URL wird an Google uebermittelt
- Korrektur: Neue Section hinzufuegen

**6. Section 10 - Datenkategorien (ergaenzen)**
- Fehlend: "Analysis Data" Kategorie (gecrawlter Website-Inhalt, Scores, Profildata)
- Fehlend: "Chat Data" Kategorie (Chat-Nachrichten, Konversationen)
- Korrektur: Zwei neue Zeilen in die Tabelle einfuegen

**7. Section 11 - Empfaenger (ergaenzen)**
- Fehlend: AI-Anbieter (Google Gemini, OpenAI, Anthropic, Perplexity)
- Fehlend: Firecrawl (Website-Crawling)
- Fehlend: Google PageSpeed API
- Korrektur: Zeilen in die Empfaenger-Tabelle einfuegen

**8. Section 14 - Speicherdauer (ergaenzen)**
- Fehlend: Zeile fuer Website-Analyse-Daten (bis Konversation/Account geloescht)
- Fehlend: Zeile fuer Chat-Nachrichten (bis Konversation/Account geloescht)
- Korrektur: Zwei Zeilen ergaenzen

**9. Section 3.1 - Session Cookie bleibt (wie vom User bestaetigt)**
- Der User hat bestaetigt, dass der Session-Cookie tatsaechlich vorhanden ist
- Keine Aenderung noetig

**10. Section 15.7 - Consent-Referenz korrigieren**
- Erwaehnt "marketing emails" als Beispiel fuer Consent-basierte Verarbeitung
- Da Section 6.2 entfernt wird, muss dieses Beispiel angepasst werden

**11. Version und Datum aktualisieren**
- Von "Version 6.0 (February 8, 2026)" auf "Version 7.0 (February 14, 2026)"
- Version History ergaenzen

---

### Struktur nach der Korrektur

Die Sections werden nach Section 7 (Hosting) neu eingefuegt und alle nachfolgenden Sections werden umnummeriert:

1. Introduction and Controller Information (unveraendert)
2. Data Collection When Visiting This Website (unveraendert)
3. Cookies (unveraendert, inkl. Session Cookie)
4. User Authentication (unveraendert)
5. Premium Subscription and Payment Processing (unveraendert)
6. Email Communication (Section 6.2 Marketing Emails entfernt)
7. Hosting and Infrastructure (unveraendert)
8. **NEU: Website Crawling and Analysis (Firecrawl)**
9. **NEU: AI-Powered Data Processing (Google, OpenAI, Anthropic, Perplexity)**
10. **NEU: Google PageSpeed Insights**
11. Contact Form and Email Inquiries (vorher 8)
12. External Links (vorher 9)
13. Categories of Personal Data Processed (vorher 10, ergaenzt)
14. Recipients of Personal Data (vorher 11, ergaenzt)
15. Obligation to Provide Personal Data (vorher 12)
16. Automated Decision-Making and Profiling (vorher 13, aktualisiert)
17. Storage Duration (vorher 14, ergaenzt)
18. Your Rights Under GDPR (vorher 15, Consent-Beispiel korrigiert)
19. Changes to This Privacy Policy (vorher 16)
20. Version History (aktualisiert)

---

### Neue Inhalte im Detail

**Section 8 - Website Crawling:**
- Firecrawl, Inc. als Anbieter
- Daten: Eingegebene URL, gecrawlter Seiteninhalt (Markdown, HTML, Links)
- Screenshots werden in Supabase Storage gespeichert
- Rechtsgrundlage: Art. 6(1)(b) GDPR (Vertragserfullung)
- Drittlandtransfer: SCCs

**Section 9 - AI-Datenverarbeitung:**
- 4 Anbieter: Google (Gemini), OpenAI (GPT-4o/GPT-4o-mini), Anthropic (Claude Sonnet), Perplexity (Sonar Pro)
- Daten die uebermittelt werden: Gecrawlter Website-Inhalt, SEO-Metadaten, Chat-Nachrichten mit Kontext
- Verarbeitung findet serverseitig statt (Edge Functions)
- Keine API-Keys oder sensible Nutzerdaten werden an AI-Anbieter gesendet
- Rechtsgrundlage: Art. 6(1)(b) GDPR
- Drittlandtransfer: DPF/SCCs je nach Anbieter

**Section 10 - Google PageSpeed:**
- Google PageSpeed Insights API
- Daten: Eingegebene URL wird an Google uebermittelt
- Ergebnis: Performance, Accessibility, Best Practices, SEO Scores, Core Web Vitals
- Rechtsgrundlage: Art. 6(1)(b) GDPR

---

### Geaenderte Datei

`src/pages/PrivacyPolicy.tsx` -- Komplett ueberarbeitet mit allen oben beschriebenen Aenderungen

