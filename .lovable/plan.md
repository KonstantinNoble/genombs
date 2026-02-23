
# Hintergrundbild fuer die gesamte Webseite

## Was passiert
Das hochgeladene Bild (orangefarbene Wellenlinien auf schwarzem Hintergrund) wird als dezentes, verschwommenes Hintergrundbild auf allen Seiten eingesetzt. Das Gemini-Symbol unten rechts ist Teil des Originalbilds -- da wir das Bild per CSS stark weichzeichnen und mit niedriger Deckkraft anzeigen, wird es praktisch unsichtbar. Zusaetzlich wird das Bild so positioniert, dass die untere rechte Ecke abgeschnitten wird.

## Aenderungen

### 1. Bild in das Projekt kopieren
- `user-uploads://image-2.png` nach `public/images/bg-waves.png` kopieren (public-Ordner, da es per CSS als `background-image` referenziert wird)

### 2. `src/App.tsx` - BackgroundWrapper erweitern
Die `BackgroundWrapper`-Komponente bekommt ein zusaetzliches `div` mit dem Hintergrundbild:

```tsx
const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 z-0 opacity-20 blur-xl"
        style={{
          backgroundImage: 'url(/images/bg-waves.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
```

- `fixed inset-0` -- das Bild bleibt beim Scrollen fixiert und bedeckt den gesamten Viewport
- `opacity-20` -- sehr dezent (20% Deckkraft)
- `blur-xl` -- starker Weichzeichner, damit es nur als subtiler Farbverlauf wirkt
- `backgroundPosition: 'center top'` -- schneidet die untere rechte Ecke (mit dem Gemini-Symbol) ab
- `aria-hidden="true"` -- fuer Screenreader unsichtbar

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `public/images/bg-waves.png` | Neues Bild (kopiert aus Upload) |
| `src/App.tsx` | BackgroundWrapper mit Hintergrundbild-Layer |
