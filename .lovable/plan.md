
## Alle Analyse-Sektionen auf einer scrollbaren Seite zusammenfuehren

### Was sich aendert

Die vier Tabs (Overview, Positioning, Offer & CTAs, Trust & Proof) werden durch eine einzelne, durchgehend scrollbare Seite ersetzt. Die Tab-Leiste wird durch eine sticky Navigation ersetzt, die beim Klicken zur jeweiligen Sektion scrollt.

### Aenderungen im Detail

**1. Neue Komponente: `src/components/dashboard/SectionNavBar.tsx`**

Eine schmale, sticky Navigationsleiste mit den vier Sektionsnamen als klickbare Links. Beim Klick scrollt die Seite zur entsprechenden Sektion (smooth scroll via `scrollIntoView`). Die aktive Sektion wird visuell hervorgehoben.

**2. Anpassung: `src/components/dashboard/AnalysisTabs.tsx`**

Die Komponente wird umgebaut: Statt nur den Inhalt eines einzelnen Tabs zu rendern, zeigt sie jetzt alle Sektionen untereinander an, jeweils mit einer Ueberschrift und einer `id` fuer die Scroll-Navigation:

- **Overview** -- WebsiteGrid, ComparisonTable, ImprovementPlan
- **Positioning** -- Positionierungskarten (bisheriger "positioning"-Tab)
- **Offer & CTAs** -- CTA-Karten (bisheriger "offers"-Tab)
- **Trust & Proof** -- Trust-Score-Karten (bisheriger "trust"-Tab)

Die `tab`-Prop entfaellt, da keine Filterung mehr noetig ist.

**3. Anpassung: `src/pages/Chat.tsx`**

- Die Tab-Leiste (`<Tabs>` mit `TabsList`/`TabsTrigger`) wird durch die neue `SectionNavBar` ersetzt
- Der `analysisTab`-State und die bedingte Anzeige (`if tab === "overview"` etc.) werden entfernt
- Stattdessen wird die neue "All-in-One" `AnalysisTabsContent`-Komponente einmal gerendert, die alle Sektionen enthaelt
- Die `SectionNavBar` wird sticky am oberen Rand des Dashboard-Panels positioniert
- Gilt fuer beide Varianten (Mobile und Desktop)

### Verhalten

- Beim Oeffnen sieht der Nutzer alle Sektionen untereinander
- Die Navigationsleiste bleibt beim Scrollen sichtbar (sticky)
- Klick auf einen Sektionsnamen scrollt sanft zur Sektion
- Optional: Ein `IntersectionObserver` hebt die aktive Sektion in der Navigation hervor

### Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/components/dashboard/SectionNavBar.tsx` | Neu -- sticky Scroll-Navigation |
| `src/components/dashboard/AnalysisTabs.tsx` | Umbau -- zeigt alle Sektionen statt einer |
| `src/pages/Chat.tsx` | Tabs entfernen, SectionNavBar + neue AnalysisTabs einbauen |

### Keine Auswirkung auf

- Backend / Edge Functions
- Datenbank
- Andere Seiten oder Komponenten
