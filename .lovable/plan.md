

# Feature-Seiten entfernen (nur 3 Seiten)

## Was wird entfernt

Nur diese 3 Seiten-Dateien werden geloescht:
- `src/pages/Dashboard.tsx`
- `src/pages/GenomeView.tsx`
- `src/pages/CompetitorAnalysis.tsx`

## Aenderungen in bestehenden Dateien

### src/App.tsx
- Lazy-Imports fuer `Dashboard`, `GenomeView` und `CompetitorAnalysis` entfernen
- Die 3 zugehoerigen `<Route>`-Eintraege entfernen

### src/components/Navbar.tsx
- Links zu Dashboard und Competitor Analysis entfernen (falls vorhanden)

Sonst aendert sich nichts. Pricing, Genome-Komponenten, Demo-Daten, Freemius -- alles bleibt wie es ist.

