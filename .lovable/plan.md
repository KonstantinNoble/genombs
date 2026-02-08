

# Frontend-Aufbau: Business Genome Plattform

## Ueberblick

Wir bauen zuerst das komplette Frontend -- alle Seiten, Navigation, und das visuelle Design -- mit statischen Demodaten. Keine API-Aufrufe, keine Edge Functions, keine Datenbank-Aenderungen. Alles wird mit Beispieldaten befuellt, sodass du das Look-and-Feel sehen und pruefen kannst, bevor wir das Backend anbinden.

---

## Was genau gebaut wird

### 1. Neue Seite: `/dashboard` -- Analyse-Uebersicht

Die zentrale Seite nach dem Login. Besteht aus:

**Oberer Bereich:**
- URL-Eingabefeld mit grossem "Analyze" Button (orange)
- Scan-Limit-Anzeige: z.B. "2 von 3 Analysen diesen Monat" (als Progress-Bar)
- Upgrade-Hinweis fuer Free-User

**Unterer Bereich: Scan-Historie**
- Karten-Grid (2 Spalten Desktop, 1 Spalte Mobil) mit bisherigen Analysen
- Pro Karte: Domain-Name, Marktsegment, Datum, Status-Badge, Link zur Detail-Ansicht
- Leerer Zustand mit Illustration: "Starte deine erste Analyse"
- 3-4 Beispiel-Karten mit Demodaten (z.B. "stripe.com", "notion.so", "linear.app")

### 2. Neue Seite: `/genome/:id` -- Business Genome Detail-Ansicht

Die Ergebnis-Seite einer Analyse. Aufgebaut als Karten-Dashboard:

**Header:**
- Domain-Name gross, Analyse-Datum, Status-Badge
- "PDF Export" Button und "Neue Analyse" Button

**Karten-Bereiche (jeweils eigene Card-Komponente):**
- **Geschaeftsmodell**: Typ (SaaS, E-Commerce, etc.), kurze Beschreibung
- **Angebotsstruktur**: Liste erkannter Produkte/Services mit Preissignalen
- **Zielgruppen-Cluster**: 2-3 erkannte Zielgruppen mit Beschreibung
- **Funnel-Analyse**: Funnel-Typ (z.B. "Product-Led Growth"), erkannte Elemente
- **Kanal-Nutzung**: Welche Kanaele genutzt werden (SEO, Social, Paid, etc.) als Tags
- **Content-Formate**: Blog, Video, Podcast etc. als Tags
- **Messaging / USPs**: Erkannte Nutzenversprechen als Liste
- **Trust-Elemente**: Testimonials, Logos, Zertifikate
- **Traffic-Daten**: Besucherzahlen, Top-Keywords (SimilarWeb-Platzhalter)

Alles mit Demodaten befuellt (Beispiel: stripe.com).

### 3. Aktualisierte Seite: `/` -- Homepage (Produkt-Landingpage)

Von "Coming Soon" zu einer richtigen Produkt-Seite:

**Hero-Section:**
- Headline: "Understand any business from a single URL"
- Subheadline: "Turn any website into a structured market intelligence report"
- CTA-Button: "Start Analyzing" (fuehrt zu /dashboard oder /auth)
- Darunter: Mock-Screenshot oder stilisiertes Genome-Preview

**Features-Section (3 Spalten):**
- "Domain Intelligence" -- Automatische Geschaeftsmodell-Erkennung
- "Market Positioning" -- Wettbewerbs- und Marktanalyse
- "Actionable Insights" -- Konkrete Empfehlungen

**How-it-Works-Section (3 Schritte):**
1. URL eingeben
2. KI analysiert die Webseite
3. Strukturiertes Business Genome erhalten

**CTA-Section unten:**
- "Ready to decode your market?" mit Button

### 4. Aktualisierte Seite: `/pricing` -- Pricing mit konkreten Features

Die bestehende Pricing-Seite bekommt konkrete Feature-Listen:

**Free Plan ($0/mo):**
- 3 Analysen pro Monat
- Basis Business Genome
- Geschaeftsmodell-Erkennung
- Angebotsstruktur-Analyse

**Premium Plan ($26.99/mo):**
- Unbegrenzte Analysen
- Vollstaendiges Business Genome
- Traffic-Daten (SimilarWeb)
- PDF-Export
- Wettbewerbs-Vergleich (Coming Soon)
- Prioritaets-Support

### 5. Aktualisierte Navigation

**Navbar (Desktop):**
- Home | Dashboard | Pricing | Contact
- "Dashboard" nur sichtbar wenn eingeloggt

**Navbar (Mobil):**
- Gleiches Menue mit Dashboard-Link fuer eingeloggte User

### 6. Neue Komponenten

Wiederverwendbare Komponenten fuer das Genome-Dashboard:

- `GenomeCard` -- Einzelne Info-Karte (Titel, Icon, Inhalt)
- `TagList` -- Horizontal scrollbare Tag-Liste (fuer Kanaele, Formate)
- `ScanCard` -- Karte fuer die Dashboard-Historie
- `EmptyState` -- Leerer Zustand mit Icon und Text
- `ScanLimitBar` -- Progress-Bar fuer Scan-Limit

---

## Dateien die erstellt oder geaendert werden

### Neue Dateien:
- `src/pages/Dashboard.tsx` -- Dashboard-Seite
- `src/pages/GenomeView.tsx` -- Business Genome Detail-Ansicht
- `src/lib/demo-data.ts` -- Statische Demodaten fuer alle Ansichten

### Geaenderte Dateien:
- `src/App.tsx` -- Neue Routen `/dashboard` und `/genome/:id` hinzufuegen
- `src/pages/Home.tsx` -- Komplett ueberarbeitet als Produkt-Landingpage
- `src/pages/Pricing.tsx` -- Konkrete Feature-Listen
- `src/components/Navbar.tsx` -- Dashboard-Link fuer eingeloggte User

---

## Design-Prinzipien

- Schwarz-Orange Farbschema (bestehend, keine Aenderung)
- Keine Gradients -- nur flache Farben
- Karten mit `bg-card border-border` (bestehende Design-Token)
- Orange fuer primaere Aktionen und Highlights
- Helle Texte (`text-foreground`) fuer Hauptinhalte
- Gedaempfte Texte (`text-muted-foreground` bei 85% Helligkeit) fuer sekundaere Infos
- Responsive: Mobile-first, 1-Spalte mobil, 2-3 Spalten Desktop
- Alle Komponenten nutzen bestehende shadcn/ui Bausteine (Card, Badge, Button, Progress)

---

## Was NICHT gebaut wird (spaeter mit Backend)

- Kein Firecrawl-Aufruf
- Kein SimilarWeb-Aufruf
- Keine LLM-Analyse
- Keine Datenbank-Tabellen
- Keine Edge Functions
- Kein echter PDF-Export (Button ist da, Funktion kommt spaeter)
- Keine echte Scan-Limit-Pruefung

