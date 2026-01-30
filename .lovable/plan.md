
# ProductShowcase Redesign: Alle Screenshots mit überzeugenden Texten

## Übersicht

Ich werde die `ProductShowcase`-Komponente komplett umgestalten, sodass alle drei Screenshots gleichzeitig angezeigt werden – jeweils mit einem überzeugenden Titel und Text darüber.

## Neues Layout

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│     ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│     │  1. ASK          │  │  2. ANALYZE      │  │  3. DOCUMENT     │   │
│     │  Describe your   │  │  Get multiple    │  │  Share with your │   │
│     │  challenge...    │  │  perspectives... │  │  team...         │   │
│     │                  │  │                  │  │                  │   │
│     │  [INPUT BILD]    │  │  [ANALYSE BILD]  │  │  [TEAMS BILD]    │   │
│     │                  │  │                  │  │                  │   │
│     └──────────────────┘  └──────────────────┘  └──────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Mobile:** Die drei Karten werden vertikal gestapelt.

## Überzeugende Texte für jedes Bild

| Schritt | Titel | Subtext |
|---------|-------|---------|
| **1. Ask** | "Describe Your Challenge" | "No templates, no complexity. Just explain what you're facing in plain language." |
| **2. Analyze** | "Get Multiple Perspectives" | "Six AI models debate your decision. See where they agree – and where they don't." |
| **3. Document** | "Build Your Decision Record" | "Share insights with your team. Create an auditable trail for investors." |

## Design-Details

- **Cards:** Jede Karte bekommt den Browser-Mockup-Stil (dots, rounded corners)
- **Nummerierung:** Schritt 1, 2, 3 für klaren Ablauf
- **Hover-Effekt:** Leichte Vergrößerung beim Hover
- **Responsive:** 3 Spalten auf Desktop, 1 Spalte auf Mobile
- **Keine Tab-Navigation mehr** – alles sichtbar

## Technische Umsetzung

### Datei: `src/components/home/ProductShowcase.tsx`

Änderungen:
1. `useState` und Tab-Navigation entfernen
2. Grid-Layout mit 3 Spalten implementieren
3. Für jeden Screenshot eine eigene Card mit:
   - Schritt-Nummer (Badge)
   - Überzeugendem Titel
   - Beschreibungstext
   - Browser-Mockup mit Bild

### Code-Struktur

```tsx
const showcaseItems = [
  {
    step: 1,
    title: "Describe Your Challenge",
    description: "No templates, no complexity. Just explain what you're facing in plain language.",
    image: inputPreview,
    alt: "..."
  },
  {
    step: 2,
    title: "Get Multiple Perspectives",
    description: "Six AI models debate your decision. See where they agree – and where they don't.",
    image: analysisPreview,
    alt: "..."
  },
  {
    step: 3,
    title: "Build Your Decision Record",
    description: "Share insights with your team. Create an auditable trail for investors.",
    image: workspacesPreview,
    alt: "..."
  }
];

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {showcaseItems.map((item) => (
    <ShowcaseCard key={item.step} {...item} />
  ))}
</div>
```

## Erwarteter Conversion-Impact

| Vorher (Tabs) | Nachher (Alle sichtbar) |
|---------------|------------------------|
| User muss klicken um alles zu sehen | Alles auf einen Blick |
| Niedrige Interaktionsrate | Höhere Engagement-Rate |
| Versteckter Wert | Sofort erkennbarer Wert |

## Zusammenfassung der Änderungen

| Datei | Änderung |
|-------|----------|
| `src/components/home/ProductShowcase.tsx` | Komplettes Redesign: Grid-Layout mit allen 3 Bildern + überzeugende Texte |
