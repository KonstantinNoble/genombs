

# Schriftgewicht reduzieren: Duenneres, eleganteres Erscheinungsbild

## Ziel
Die gesamte Typografie der Webseite wird leichter/duenner gestaltet, damit sie weniger wie eine App und mehr wie eine professionelle SaaS-Website wirkt. Keine Funktionsaenderungen.

## Aenderungen

### 1. Homepage (src/pages/Home.tsx)

- **Hero H1**: `font-extrabold` wird zu `font-semibold`
- **Section H2s** ("What you get", "Use cases", etc.): `font-extrabold` wird zu `font-semibold`
- **Feature Card H3s**: `font-bold` wird zu `font-medium`
- **Use Case H3s**: `font-bold` wird zu `font-medium`
- **Step Titles**: `font-bold` wird zu `font-medium`
- **Stats-Zahlen**: `font-extrabold` wird zu `font-bold`
- **Feature-Nummern (01, 02, 03)**: `font-extrabold` wird zu `font-bold`
- **Comparison Table Headers**: `font-bold` wird zu `font-medium`

### 2. Button Component (src/components/ui/button.tsx)

- `font-medium` wird zu `font-normal` -- CTAs wirken dadurch leichter und eleganter

### 3. Navbar (src/components/Navbar.tsx)

- Logo "Synvertas": `font-semibold` wird zu `font-medium`
- Desktop NavLinks: `font-medium` bleibt (ist bereits duenn genug)
- CTA Buttons: `font-medium` wird zu `font-normal`
- Mobile Menu Links: `font-medium` wird zu `font-normal`

### 4. CSS Typografie (src/index.css)

- H1-H6 Basis-Styles: `font-sans` bleibt, aber der negative letter-spacing wird leicht reduziert (von -0.035em auf -0.02em bei H1) fuer ein luftigeres Gefuehl

## Technische Details

```text
+----------------------------------+------------------------------------------+
| Datei                            | Aenderung                                |
+----------------------------------+------------------------------------------+
| src/pages/Home.tsx               | font-extrabold -> font-semibold,         |
|                                  | font-bold -> font-medium an diversen     |
|                                  | Stellen                                  |
+----------------------------------+------------------------------------------+
| src/components/ui/button.tsx     | font-medium -> font-normal               |
+----------------------------------+------------------------------------------+
| src/components/Navbar.tsx        | font-semibold/medium -> font-medium/     |
|                                  | font-normal an Logo + CTAs               |
+----------------------------------+------------------------------------------+
| src/index.css                    | Letter-spacing H1 anpassen               |
+----------------------------------+------------------------------------------+
```

## Was sich NICHT aendert
- Farben, Layout, Animationen bleiben identisch
- Alle Funktionen bleiben unberuehrt
- Schriftart (font-family) bleibt gleich
- Nur das Gewicht (weight) wird reduziert

