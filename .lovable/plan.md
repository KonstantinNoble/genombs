

# Redesign: Mobile Blocker Screen

## Ziel
Die aktuelle Mobile-Ansicht wirkt mit Icons, einem nutzlosen "Got it!"-Button und generischen Feature-Karten unprofessionell. Das Redesign wird minimalistisch, ueberzeugend und informativ -- ohne Icons, Emojis oder sinnlose Buttons.

## Was entfernt wird
- Alle Lucide-Icons (Target, Zap, LayoutDashboard, Monitor, ArrowRight)
- Der "Got it!"-Button mit Regenbogen-Glow-Effekt
- Die FeatureCard-Komponente

## Neues Layout
1. **Logo** -- Synvertas-Logo, zentriert
2. **Headline** -- "Built for Desktop" -- kurz, klar, professionell
3. **Erklaerungstext** -- Ein ueberzeugender Absatz: Komplexe Dashboards, Side-by-Side-Vergleiche und interaktive Datenvisualisierung erfordern einen Desktop-Bildschirm
4. **Feature-Liste** -- Schlichte Textpunkte mit feinen Trennlinien, keine Icons:
   - Competitor Benchmarking mit Live-Daten
   - AI-gestuetzte Code- und Performance-Analyse
   - Interaktive Improvement-Dashboards
5. **Domain-Hinweis** -- Schlichte Textzeile: "Oeffne **synvertas.com** auf deinem Computer"

## Technische Details

**Datei:** `src/components/MobileBlocker.tsx`
- Alle Icon-Imports entfernen (Target, Zap, LayoutDashboard, Monitor, ArrowRight)
- FeatureCard-Funktion komplett entfernen
- Button und Glow-Container entfernen
- Neuer textbasierter, minimalistischer Aufbau
- Domain wird auf `synvertas.com` gesetzt

