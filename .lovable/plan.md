
# Fix für verzerrte Partikel-Animation auf Mobile

## Problem-Analyse

Die `DecisionFlowAnimation`-Komponente zeigt auf mobilen Geräten verzerrte Partikel-Bewegungen. Die Ursache liegt in mehreren Faktoren:

### Identifizierte Probleme

1. **CSS `transform-origin` mit Pixel-Werten in SVG**
   - Die Modell-Nodes verwenden `transformOrigin: \`${model.x}px ${model.y}px\``
   - In SVG funktioniert `transform-origin` mit Pixel-Werten nicht zuverlässig, besonders wenn das SVG skaliert wird (auf Mobile)

2. **`animateMotion` und Skalierung**
   - Die SVG-Partikel verwenden `<animateMotion>` mit `<mpath>`, was auf verschiedenen Browser-Engines unterschiedlich gerendert wird
   - Safari/iOS hat bekannte Probleme mit `animateMotion` bei skalierten SVGs

3. **Fehlende `rotate` Eigenschaft**
   - `animateMotion` benötigt `rotate="auto"` oder `rotate="0"` für konsistentes Verhalten

---

## Lösung

### Datei: `src/components/home/DecisionFlowAnimation.tsx`

**Änderungen:**

1. **`transform-origin` auf SVG-Attribute umstellen**
   - Anstelle von CSS `transform-origin` mit Pixeln: SVG `transform` mit `translate`-Trick verwenden
   - Für Scale-Animationen: Element zum Ursprung bewegen, skalieren, zurückbewegen

2. **`rotate="0"` zu allen `animateMotion`-Elementen hinzufügen**
   - Verhindert ungewollte Rotation der Partikel während der Bewegung

3. **Kleinere Partikel-Größe auf Mobile**
   - Partikelradius von `r="5"` auf responsive Wert anpassen

4. **CSS-basierte Animation als Fallback**
   - Für Browser die `animateMotion` nicht gut unterstützen: CSS-Keyframe-Alternative

### Technische Implementierung

```text
Vorher (problematisch):
┌─────────────────────────────────────────┐
│  style={{                               │
│    transformOrigin: `${model.x}px ...`  │  ← Pixel in SVG = Verzerrung
│  }}                                     │
└─────────────────────────────────────────┘

Nachher (stabil):
┌─────────────────────────────────────────┐
│  transform={`translate(${x}, ${y})     │
│              scale(${isVisible ? 1 : 0.8})  │  ← SVG-native Transformation
│              translate(${-x}, ${-y})`}  │
└─────────────────────────────────────────┘
```

### Partikel-Animation Fix

```text
Vorher:
<animateMotion dur="2.5s" repeatCount="indefinite">

Nachher:
<animateMotion dur="2.5s" repeatCount="indefinite" rotate="0" calcMode="spline" keySplines="0.4 0 0.2 1">
```

---

## Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `src/components/home/DecisionFlowAnimation.tsx` | SVG-Transformationen korrigieren, `rotate="0"` hinzufügen, Mobile-optimierte Partikelgröße |

---

## Erwartetes Ergebnis

| Gerät | Vorher | Nachher |
|-------|--------|---------|
| Desktop | Funktioniert | Funktioniert |
| Mobile (iOS Safari) | Verzerrte Partikel | Flüssige Animation |
| Mobile (Android Chrome) | Verzerrte Partikel | Flüssige Animation |

Die Animation wird auf allen Geräten konsistent und ohne Verzerrung dargestellt.
