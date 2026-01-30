
# Screenshot-Integration für Conversion-Optimierung

## Analyse der Screenshots

Du hast 3 Screenshots mit unterschiedlichen Zwecken:

| Screenshot | Inhalt | Conversion-Wert | Beste Platzierung |
|------------|--------|-----------------|-------------------|
| **Analyse-Ergebnis** | Validation Results mit Consensus, Premium Insights, Model Responses | Sehr hoch - zeigt den Hauptwert | Hero-Section (primär) |
| **Input-Bereich** | Frage-Eingabe mit Beispielen | Mittel - zeigt Einfachheit | "How It Works" Step 1 |
| **Workspaces** | Team-Management | Niedrig für Solo-Founder | Features-Section (optional) |

---

## Strategie: Screenshot-Showcase in Hero

Der **Analyse-Ergebnis-Screenshot** ist der wichtigste - er zeigt dem Besucher sofort, was er bekommt. Dieser sollte prominent in der Hero-Section erscheinen.

### Layout-Lösung für unterschiedliche Bildgrößen

Da die Screenshots unterschiedliche Größen haben, verwende ich ein "Browser-Mockup"-Design:

```
┌─────────────────────────────────────────────────────────┐
│  ●  ●  ●                synoptas.com                    │  <- Browser-Header (normalisiert alle Größen)
├─────────────────────────────────────────────────────────┤
│                                                         │
│              [Screenshot wird hier eingefügt]           │
│              (object-fit: cover/contain)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Vorteile:**
- Alle Screenshots sehen professionell aus
- Unterschiedliche Größen werden durch den Browser-Rahmen normalisiert
- Verstärkt die "echte App"-Wahrnehmung

---

## Implementierungsplan

### 1. Neue Komponente: ProductShowcase

**Neue Datei:** `src/components/home/ProductShowcase.tsx`

Erstellt einen eleganten Browser-Mockup-Rahmen, der:
- Screenshots in einheitlicher Größe darstellt
- Responsive ist (mobil kleiner, desktop größer)
- Optional zwischen Screenshots wechseln kann (Tabs)

### 2. Hero.tsx Erweiterung

Nach den Trust Indicators (Zeile 130) wird die ProductShowcase-Komponente eingefügt:

```
[Hero Text]
[CTA Buttons]
[Trust Indicators]

     ↓ NEU ↓

[ProductShowcase mit Analyse-Screenshot]
```

### 3. Optional: HowItWorks.tsx mit Input-Screenshot

Bei Step 1 ("Describe your challenge") könnte der Input-Screenshot eingefügt werden, um den Prozess zu visualisieren.

---

## Texte für die Screenshots

### Unter dem Hero-Screenshot:
- Badge: "Live Analysis Preview"
- Subtext: "See how multiple AI perspectives help you make better decisions"

### Alternative Tabs (wenn alle 3 gezeigt werden sollen):
1. **"Analysis"** - Zeigt Validation Results
2. **"Input"** - Zeigt Frage-Eingabe
3. **"Teams"** - Zeigt Workspaces

---

## Technische Details

### Asset-Handling
1. Screenshots werden nach `src/assets/` kopiert
2. Import als ES6-Module für optimales Bundling
3. Verwendung von `object-fit: cover` mit fixierter Höhe

### Browser-Mockup CSS
```css
.browser-mockup {
  border-radius: 12px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.15);
}

.browser-header {
  height: 32px;
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 6px;
}

.browser-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: hsl(var(--muted-foreground) / 0.3);
}
```

### Responsive Verhalten
- **Desktop:** Max-Breite 1000px, Höhe 500px
- **Tablet:** Max-Breite 100%, Höhe 400px
- **Mobile:** Max-Breite 100%, Höhe 300px, horizontal scrollbar möglich

---

## Empfehlung

**Für den Start:** Nur den Analyse-Screenshot (Nr. 3) in die Hero-Section einfügen.

**Begründung:**
- Er zeigt den höchsten Wert (Ergebnis einer Analyse)
- Weniger Ablenkung für den Besucher
- Die anderen Screenshots können später in den entsprechenden Sections hinzugefügt werden

---

## Dateien die erstellt/geändert werden

| Datei | Änderung |
|-------|----------|
| `src/assets/analysis-preview.jpeg` | Kopie des Analyse-Screenshots |
| `src/components/home/ProductShowcase.tsx` | Neue Komponente für Browser-Mockup |
| `src/components/home/Hero.tsx` | Import und Einbindung der ProductShowcase |

---

## Nächste Schritte nach Umsetzung

1. **Social Proof:** Testimonials-Section hinzufügen
2. **Decision Counter:** "X+ decisions analyzed" in Hero
3. **Input-Screenshot:** In HowItWorks.tsx bei Step 1 einbinden
