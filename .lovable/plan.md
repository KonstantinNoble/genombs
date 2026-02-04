

# Mobile Partikel-Animation: Gleich wie Desktop, aber stabiler

## Aktuelle Situation

| Version | Animation |
|---------|-----------|
| Desktop | Partikel bewegen sich entlang der Pfade (mit `animateMotion`) |
| Mobile | Nur pulsierende Punkte an festen Positionen (keine Bewegung) |

## Lösung

Die Partikel auf Mobile werden sich genauso bewegen wie auf Desktop, aber mit einer stabileren Technik:

**Anstatt `animateMotion` (instabil auf iOS):**
- Verwende `<animate>` auf `cx` und `cy` Attributen
- Definiere Start- und Endpunkte für jede Partikel
- Gleiche Timing und Verzögerungen wie Desktop

## Technische Umsetzung

```text
Desktop (animateMotion):           Mobile (animate cx/cy):
┌─────────────────────────┐        ┌─────────────────────────┐
│  <animateMotion>        │        │  <animate               │
│    <mpath href="#path"> │   →    │    attributeName="cx"   │
│  </animateMotion>       │        │    values="80;200"      │
│                         │        │  />                     │
│  (folgt komplexem Pfad) │        │  (lineare Bewegung)     │
└─────────────────────────┘        └─────────────────────────┘
```

### Partikel-Bewegungen

| Partikel | Start (x, y) | Ende (x, y) | Verzögerung |
|----------|--------------|-------------|-------------|
| GPT | 80, 60 | 200, 260 | 0s |
| Claude | 320, 60 | 200, 260 | 0.6s |
| Gemini | 80, 150 | 200, 260 | 1.2s |
| Perplexity | 320, 150 | 200, 260 | 1.8s |

### Änderungen an der Datei

**Datei:** `src/components/home/DecisionFlowAnimation.tsx`

Die Mobile-Animation wird ersetzt durch:

```tsx
{/* Mobile: Partikel mit animate statt animateMotion für Stabilität */}
{isMobile && isVisible && (
  <>
    {models.map((model, index) => (
      <circle 
        key={`mobile-particle-${model.name}`}
        r="4" 
        fill={model.color} 
        opacity="0.9"
      >
        {/* Bewegung auf X-Achse */}
        <animate 
          attributeName="cx" 
          values={`${model.x};${synthesisX};${model.x}`}
          dur="2.5s" 
          begin={`${index * 0.6}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
        {/* Bewegung auf Y-Achse */}
        <animate 
          attributeName="cy" 
          values={`${model.y};${synthesisY};${model.y}`}
          dur="2.5s" 
          begin={`${index * 0.6}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
        {/* Fade am Zielpunkt */}
        <animate 
          attributeName="opacity" 
          values="0.9;0.9;0.3;0.9"
          keyTimes="0;0.4;0.5;1"
          dur="2.5s" 
          begin={`${index * 0.6}s`}
          repeatCount="indefinite"
        />
      </circle>
    ))}
  </>
)}
```

## Vorteile dieser Lösung

| Aspekt | Desktop | Mobile (neu) |
|--------|---------|--------------|
| Bewegungsart | Kurven entlang Pfaden | Direkte Linie zum Ziel |
| Stabilität | Gut | Sehr gut (kein animateMotion) |
| Browser-Support | Standard | Exzellent |
| Visueller Effekt | Identisch | Sehr ähnlich |
| Performance | Gut | Sehr gut |

## Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `src/components/home/DecisionFlowAnimation.tsx` | Mobile-Partikel mit `animate cx/cy` statt statischer Punkte |

## Erwartetes Ergebnis

Die Partikel auf Mobile bewegen sich nun von den Model-Nodes zum Synthesis-Punkt und zurück – genau wie auf Desktop, aber mit einer Technik die auf allen mobilen Browsern stabil funktioniert.

