
# Mobile Homepage Stabilisierung

## Problem-Zusammenfassung

Die Homepage zeigt auf mobilen Geräten folgende Probleme:
- Verzerrte Partikel-Animationen
- Instabiles Verhalten
- Ruckelnde Performance

## Ursachen-Analyse

| Problem | Ursache | Auswirkung |
|---------|---------|------------|
| Verzerrte Partikel | SVG `animateMotion` + `mpath` funktioniert nicht konsistent auf iOS Safari | Partikel bewegen sich nicht korrekt entlang der Pfade |
| Hintergrund-Ruckeln | Komplexe CSS-Animationen (blur + scale + rotate) überfordern Mobile-GPU | Seite wirkt instabil |
| Performance-Probleme | Zu viele gleichzeitige Animationen | Browser-Framerate sinkt |

---

## Lösung

### Phase 1: Partikel-Animation Mobile-Fallback

**Datei:** `src/components/home/DecisionFlowAnimation.tsx`

**Änderungen:**

1. **CSS-basierte Animation statt `animateMotion`**
   - Auf Mobile: Einfachere CSS-Keyframe-Animation für Partikel
   - Partikel pulsieren und verblassen statt komplexer Pfad-Bewegung
   - `animateMotion` nur auf Desktop verwenden

2. **Mobile-Detection Hook verwenden**
   - `useIsMobile()` Hook importieren
   - Bedingte Rendering-Logik für Mobile vs Desktop

3. **Vereinfachte Mobile-Variante**
   - Statische Verbindungslinien (keine Partikel-Animation)
   - Dezente Puls-Animation am Synthesis-Punkt
   - Deutlich weniger GPU-Last

```text
Desktop:                     Mobile (vereinfacht):
┌─────────────────┐          ┌─────────────────┐
│  [GPT] [Claude] │          │  [GPT] [Claude] │
│    ●→  ←●       │          │    |      |     │
│  [Gem] [Perp]   │          │  [Gem] [Perp]   │
│    ●→  ←●       │          │    |      |     │
│      [✓]        │          │    [●✓●]        │  ← Puls-Animation
└─────────────────┘          └─────────────────┘
```

### Phase 2: Hintergrund-Animationen reduzieren

**Datei:** `src/components/home/Hero.tsx`

**Änderungen:**

1. **Blobs auf Mobile deaktivieren**
   - Die floating blobs mit blur-Filter entfernen auf Mobile
   - Nur dezenter statischer Gradient-Hintergrund

2. **line-flow Animation entfernen auf Mobile**
   - Die animierte Linie ist auf kleinen Screens ohnehin nicht sichtbar

```tsx
// Hero.tsx - Mobile-optimierter Hintergrund
{!isMobile && (
  <div className="absolute top-1/4 left-1/6 w-[600px] h-[600px] ..." />
)}
```

### Phase 3: CSS-Animationen optimieren

**Datei:** `src/index.css`

**Änderungen:**

1. **Mobile-spezifische Animation-Reduktion**
   - `will-change: auto` auf Mobile (nicht `transform`)
   - Keine Blur-Filter in Animationen auf Mobile

2. **GPU-schonende Animationen**
   - Nur `opacity` und `transform` animieren (composited properties)
   - Keine `filter` oder `backdrop-filter` in Animationen auf Mobile

```css
@media (max-width: 767px) {
  .gradient-orb,
  .float-slow,
  .float-medium,
  .float-fast {
    animation: none !important;
    opacity: 0.3;
  }
}
```

---

## Implementierungs-Details

### DecisionFlowAnimation.tsx (Mobile-Fallback)

```tsx
// Import Hook
import { useIsMobile } from '@/hooks/use-mobile';

const DecisionFlowAnimation = () => {
  const isMobile = useIsMobile();
  
  // ... bestehende Logik ...
  
  return (
    <svg ...>
      {/* Verbindungslinien bleiben gleich */}
      
      {/* Partikel: Nur auf Desktop */}
      {!isMobile && isVisible && (
        <>
          {/* animateMotion Partikel */}
        </>
      )}
      
      {/* Mobile: Synthesis-Punkt mit stärkerer Puls-Animation */}
      {isMobile && (
        <circle 
          cx={synthesisX} 
          cy={synthesisY} 
          r="6"
          fill="hsl(142, 76%, 36%)"
          opacity="0.8"
        >
          <animate 
            attributeName="r" 
            values="6;10;6" 
            dur="2s" 
            repeatCount="indefinite" 
          />
        </circle>
      )}
    </svg>
  );
};
```

### Hero.tsx (Mobile-optimierter Hintergrund)

```tsx
import { useIsMobile } from '@/hooks/use-mobile';

const Hero = () => {
  const isMobile = useIsMobile();
  
  return (
    <section>
      {/* Hintergrund-Effekte nur auf Desktop */}
      {!isMobile && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Blobs und Linien */}
        </div>
      )}
      
      {/* Einfacher Gradient auf Mobile */}
      {isMobile && (
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      )}
      
      {/* Rest bleibt gleich */}
    </section>
  );
};
```

---

## Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `src/components/home/DecisionFlowAnimation.tsx` | Mobile-Fallback ohne animateMotion, vereinfachte Puls-Animation |
| `src/components/home/Hero.tsx` | Blobs/Linien auf Mobile deaktivieren, einfacher Gradient |
| `src/index.css` | Mobile-spezifische Animation-Reduktion |

---

## Erwartete Verbesserungen

| Metrik | Vorher | Nachher |
|--------|--------|---------|
| Partikel-Animation | Verzerrt auf Mobile | Stabile Puls-Animation oder keine Animation |
| Framerate auf Mobile | ~30fps (ruckelig) | ~60fps (flüssig) |
| GPU-Auslastung | Hoch (blur + scale + rotate) | Niedrig (nur opacity) |
| Akku-Verbrauch | Hoch | Reduziert |
| Visuelle Qualität Desktop | Unverändert | Unverändert |

---

## Zusammenfassung

Die Lösung folgt dem Prinzip "Progressive Enhancement":
- **Desktop**: Volle Animation-Erfahrung bleibt erhalten
- **Mobile**: Vereinfachte, stabile Animationen die auf allen Geräten funktionieren

Die Änderungen sind rückwärtskompatibel und verschlechtern die Desktop-Erfahrung nicht.
