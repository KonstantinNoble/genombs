
# ProductShowcase Redesign: Vertikales Layout mit AI-Gewichtungs-Screenshot

## Übersicht der Änderungen

1. **Neues Bild hinzufügen**: Den Screenshot der AI-Gewichtungsfunktion als erstes Bild einsetzen
2. **Text anpassen**: Der erste Schritt beschreibt jetzt die AI-Modell-Gewichtung
3. **Layout ändern**: Vertikale Anordnung (untereinander) statt horizontale 3-Spalten-Grid

## Neue Struktur

```text
┌─────────────────────────────────────────────────────────────┐
│                      How It Works                            │
│   From question to documented decision in three steps        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ① Weight Your AI Advisors                                   │
│     Choose your models and control their influence.          │
│     Some voices matter more – you decide which ones.         │
│                                                              │
│     ┌─────────────────────────────────────────┐             │
│     │  [AI-GEWICHTUNGS-SCREENSHOT]            │             │
│     └─────────────────────────────────────────┘             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ② Get Multiple Perspectives                                 │
│     Six AI models debate your decision.                      │
│     See where they agree – and where they don't.             │
│                                                              │
│     ┌─────────────────────────────────────────┐             │
│     │  [ANALYSE-SCREENSHOT]                   │             │
│     └─────────────────────────────────────────┘             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ③ Build Your Decision Record                                │
│     Share insights with your team.                           │
│     Create an auditable trail for investors.                 │
│                                                              │
│     ┌─────────────────────────────────────────┐             │
│     │  [WORKSPACES-SCREENSHOT]                │             │
│     └─────────────────────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Neue Texte

| Schritt | Titel | Beschreibung |
|---------|-------|--------------|
| **1** | "Weight Your AI Advisors" | "Choose your models and control their influence. Some voices matter more – you decide which ones." |
| **2** | "Get Multiple Perspectives" | "Six AI models debate your decision. See where they agree – and where they don't." |
| **3** | "Build Your Decision Record" | "Share insights with your team. Create an auditable trail for investors." |

## Technische Umsetzung

### 1. Neues Bild kopieren
- Kopiere das hochgeladene Bild nach `src/assets/model-weights-preview.jpeg`

### 2. ProductShowcase.tsx ändern

**Änderungen:**
- Import des neuen Bildes hinzufügen
- Grid-Layout von `md:grid-cols-3` auf `grid-cols-1` ändern (nur eine Spalte)
- Erste Showcase-Item mit neuem Bild und Text aktualisieren
- Bildgröße anpassen für vertikales Layout (größere Höhe, zentriert)
- Maximale Breite der Bilder begrenzen für Desktop-Ansicht

### 3. Angepasste CSS-Klassen

```tsx
// Vorher: Horizontales Grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

// Nachher: Vertikales Layout mit größerer Bildhöhe
<div className="flex flex-col gap-12 lg:gap-16">
  {showcaseItems.map((item) => (
    <div className="flex flex-col items-center max-w-3xl mx-auto">
      {/* Text zentriert */}
      {/* Bild mit größerer Höhe */}
    </div>
  ))}
</div>
```

## Vorteile des neuen Layouts

| Problem (vorher) | Lösung (nachher) |
|------------------|------------------|
| Bilder verzerrt bei 3-Spalten | Volle Breite, natürliche Proportionen |
| Kleine Bilder schwer lesbar | Größere, zentrierte Bilder |
| AI-Gewichtung nicht erklärt | Neuer Schritt zeigt diese Kernfunktion |

## Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `src/assets/model-weights-preview.jpeg` | Neues Bild (kopiert) |
| `src/components/home/ProductShowcase.tsx` | Vertikales Layout, neuer Text für Schritt 1, neues Bild |
