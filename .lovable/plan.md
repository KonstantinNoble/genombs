

## Homepage und How It Works -- Animationen und Aesthetik verbessern

### Zusammenfassung
Die Homepage hat bereits einige Animationen (scroll-reveal, count-up, typing-effect), aber die How It Works Seite ist komplett statisch. Beide Seiten werden mit konsistenten, professionellen Animationen aufgewertet, die das bestehende Animations-System (scroll-reveal, stagger-reveal, scroll-reveal-scale) nutzen.

### Aenderungen

#### 1. How It Works -- Animationen hinzufuegen (`src/pages/HowItWorks.tsx`)

Die Seite ist aktuell vollstaendig statisch. Folgende Animationen werden ergaenzt:

- **Hero**: `animate-fade-in` auf Ueberschrift, `animate-fade-in-up` mit Delay auf Untertitel (wie Homepage)
- **Analysis Steps**: Jeder Schritt erhaelt `stagger-reveal` mit gestaffeltem `animationDelay`, die Step-Nummern bekommen `scroll-reveal-scale`
- **Code Analysis Sektion**: Header mit `scroll-reveal`, Card mit `scroll-reveal-scale`, Kategorie-Grid-Items mit `stagger-reveal`
- **AI Models Sektion**: Header mit `scroll-reveal`, Model-Karten mit `stagger-reveal` und gestaffeltem Delay
- **AI Chat Sektion**: Header mit `scroll-reveal`, Capabilities-Card mit `scroll-reveal-scale`
- **CTA**: `scroll-reveal-scale` auf den gesamten CTA-Block

Zusaetzlich wird der IntersectionObserver aus der Homepage uebernommen (gleicher `setupObserver` Pattern), damit die scroll-basierten Klassen funktionieren.

#### 2. How It Works -- Visuelle Verbesserungen (`src/pages/HowItWorks.tsx`)

- **Step-Nummern**: `accent-stripe` auf die Step-Container und `step-circle-pulse` fuer die Nummern (wie Homepage "How it works" Timeline)
- **Connecting Line**: Vertikale Linie zwischen den Steps (border-left mit primary-Akzent)
- **Code Categories**: `accent-stripe` auf die Kategorie-Karten
- **AI Model Cards**: Dezenter hover-lift-Effekt (scale + border-color transition)
- **Chat Capabilities**: Bullet-Punkte mit `stagger-reveal` einzeln einblenden
- **Sektions-Header**: `dot-grid` Hintergrund auf Hero und CTA Sektionen (wie Homepage)

#### 3. Homepage -- Kleinere Verbesserungen (`src/pages/Home.tsx`)

- **Feature Cards**: Hover-Effekt `translate-y` hinzufuegen (leichtes Anheben beim Hover)
- **Use Cases**: `scroll-reveal-left` fuer Badge-Spalte, `scroll-reveal-right` fuer Content-Spalte (statt nur `stagger-reveal`)
- **Comparison Table Rows**: Zeilen einzeln mit `stagger-reveal` einblenden statt die ganze Tabelle auf einmal
- **CTA Button**: `btn-glow` Sweep-Effekt hinzufuegen

#### 4. Neue CSS-Animation (`src/index.css`)

Eine neue `animate-fade-in-up` Keyframe-Animation hinzufuegen (wird im Hero der HowItWorks-Seite gebraucht):

```css
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(16px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

Ausserdem ein dezenter Hover-Lift fuer Karten:

```css
.hover-lift {
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
}
```

### Technische Details

**Geaenderte Dateien:**
- `src/pages/HowItWorks.tsx` -- IntersectionObserver hinzufuegen, Animations-Klassen auf alle Sektionen, dot-grid auf Hero/CTA
- `src/pages/Home.tsx` -- Kleinere Animations-Ergaenzungen (hover-lift, scroll-reveal-left/right, btn-glow)
- `src/index.css` -- 2 neue Utility-Klassen (animate-fade-in-up, hover-lift)

**Keine neuen Abhaengigkeiten.** Alle Animationen nutzen das bestehende CSS-Animations-System.

