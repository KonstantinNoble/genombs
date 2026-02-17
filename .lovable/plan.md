

# Homepage Redesign: Dynamischer, mit URL-Vorschau

## Uebersicht
Die Homepage wird dynamischer und interaktiver gestaltet. Das Herzstück: Ein URL-Eingabefeld direkt im Hero-Bereich, das wie ein echtes Analyse-Tool aussieht. Dazu kommen professionelle Animationen und ein verbessertes visuelles Layout.

## 1. Hero-Bereich: URL-Eingabe mit "Analyze"-Button

Der aktuelle Hero mit zwei generischen Buttons wird ersetzt durch ein prominentes URL-Eingabefeld:

- Grosses, zentriertes Eingabefeld mit Placeholder "https://yourwebsite.com"
- Daneben ein "Analyze" Button in Primary-Farbe
- Das Ganze in einem dezenten Card-Container mit Border, der wie ein Terminal/Tool aussieht
- Klick auf "Analyze":
  - Eingeloggte User werden zu `/chat` weitergeleitet (URL wird als Query-Parameter mitgegeben)
  - Nicht eingeloggte User werden zu `/auth` weitergeleitet (URL wird in Query-Parameter gespeichert)
- Darunter bleibt der "View Pricing" Link als Text-Link erhalten
- Der Subtitle-Text "20 free credits per day" bleibt

## 2. Professionelle Animationen (CSS + Tailwind)

Neue Animationen, die dem technischen SaaS-Stil entsprechen:

- **Counter-Animation**: Zahlen in der Stats-Sektion zaehlen von 0 hoch (z.B. "5" AI Models zaehlt von 0 auf 5)
- **Staggered Fade-In**: Feature-Cards und Use-Case-Zeilen erscheinen nacheinander mit leichtem Versatz
- **Typing-Effekt**: Im URL-Eingabefeld wird ein Beispiel-URL animiert eingetippt als Placeholder-Animation (z.B. "synvertas.com" wird Buchstabe fuer Buchstabe getippt)
- **Border-Glow-Pulse**: Das URL-Eingabefeld hat einen subtilen, pulsierenden Border-Effekt in Primary-Farbe, der Aufmerksamkeit zieht
- **Smooth Scroll-Reveal**: Die bestehenden scroll-reveal Animationen werden beibehalten und leicht verfeinert

## 3. Visuelles Layout-Update

- **Hero**: Mehr vertikaler Whitespace, groesserer Kontrast zwischen Headline und Sub-Copy
- **Stats-Sektion**: Dezenter Hintergrund-Shift (leicht hellere Card-Farbe) fuer visuelle Trennung
- **Feature Cards**: Subtiler Top-Accent-Stripe in Primary-Farbe (2px Linie oben an der Card)
- **How it Works**: Die Step-Circles bekommen einen dezenten Puls-Effekt wenn sie in den Viewport scrollen
- **Comparison Table**: Alternating Row-Tints fuer bessere Lesbarkeit

## Technische Details

### Geaenderte Dateien

```text
+----------------------------------+------------------------------------------+
| Datei                            | Aenderung                                |
+----------------------------------+------------------------------------------+
| src/pages/Home.tsx               | URL-Input im Hero, Counter-Animation,    |
|                                  | Typing-Effekt, Layout-Refinements        |
+----------------------------------+------------------------------------------+
| src/index.css                    | Neue Keyframes: typing, counter-up,      |
|                                  | border-pulse. Accent-stripe Utility.     |
+----------------------------------+------------------------------------------+
| tailwind.config.ts               | Neue Animation-Definitionen              |
+----------------------------------+------------------------------------------+
```

### URL-Input Logik (Home.tsx)

- Neuer State: `const [urlInput, setUrlInput] = useState("")`
- Submit-Handler prueft ob User eingeloggt ist:
  - Eingeloggt: `navigate("/chat?url=" + encodeURIComponent(urlInput))`
  - Nicht eingeloggt: `navigate("/auth?redirect=" + encodeURIComponent("/chat?url=" + encodeURIComponent(urlInput)))`
- Einfache URL-Validierung (muss mindestens einen Punkt enthalten)
- Enter-Key triggert ebenfalls den Submit

### Neue CSS-Animationen (index.css)

- `@keyframes typing-cursor` - Blinkender Cursor im Eingabefeld
- `@keyframes border-pulse` - Subtiles Pulsieren der Border-Farbe am URL-Input
- `@keyframes count-up` - Wird via JS gesteuert (requestAnimationFrame) fuer die Zahlen-Animation
- Accent-stripe Utility-Klasse fuer Feature-Cards

### Counter-Animation (Home.tsx)

- Custom Hook oder useEffect mit requestAnimationFrame
- Zaehlt Zahlen in der Stats-Sektion von 0 zum Zielwert hoch
- Startet erst wenn die Sektion in den Viewport scrollt (IntersectionObserver)
- Dauer: ca. 1.5 Sekunden

## Was sich NICHT aendert

- Farben (Orange/Schwarz) bleiben identisch
- Alle bestehenden Funktionen bleiben unberuehrt
- Footer, Navbar, Chat, Dashboard - keine Aenderungen
- Mobile-Verhalten bleibt erhalten
- FAQ-Sektion bleibt unveraendert
- Die bestehende Chat-Seite muss den `url` Query-Parameter auslesen (wird geprueft und ggf. angepasst)

