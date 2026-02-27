

## 1. Falsche Informationen korrigieren

### Gefundene Fehler:

**Home.tsx - FAQ Section:**
- **AI Model-Namen falsch**: FAQ sagt "Gemini Flash (fast, great for quick questions) and GPT Mini" -- korrekt waere "Gemini Flash" und "**ChatGPT** Mini" (so heisst es in der App)
- **"GPT-4o" falsch**: FAQ nennt "GPT-4o" als Premium-Modell, aber in der App heisst es einfach "ChatGPT" (nicht GPT-4o)
- **Credit-Kosten falsch**: FAQ sagt "Each scan costs 5-10 credits" und "each chat message costs 1-5 credits". Tatsaechlich: Scans kosten 9-14 Credits, Chat kostet 3-7 Credits (laut constants.ts)
- **Code Analysis FAQ unvollstaendig**: Nennt nur 5 Kategorien ("security, performance, accessibility, maintainability, and SEO") aber es sind 6 -- "Quality" fehlt
- **SEO keyword**: Meta-Keywords enthalten "SEO audit" -- das Tool macht keine SEO-Audits. Ersetzen durch z.B. "website scoring tool"

**Pricing.tsx:**
- **Model-Name falsch**: "GPT Mini" sollte "ChatGPT Mini" heissen (Zeile 42)
- **Premium Model-Namen falsch**: "GPT-4o" sollte "ChatGPT" heissen (Zeilen 48, 55)

**HowItWorks.tsx:**
- **Model-Namen falsch**: "GPT Mini" -> "ChatGPT Mini", "GPT-4o" -> "ChatGPT" (Zeilen 49, 57)
- **Credit-Kosten falsch**: Zeigt 1 Credit fuer Gemini Flash und GPT Mini, aber tatsaechlich kosten Chat-Nachrichten 3 Credits. Scan-Kosten sind 9+ Credits.

### Alle Korrekturen:
- Model-Namen ueberall angleichen: "ChatGPT Mini" (nicht "GPT Mini"), "ChatGPT" (nicht "GPT-4o")
- Credit-Angaben korrigieren: Scans 9-14 Credits, Chat 3-7 Credits
- Code Analysis: 6 Kategorien (Quality hinzufuegen)
- SEO-Keyword entfernen aus Meta-Tags

---

## 2. Homepage dynamischer gestalten

Professionell und technisch bleibend, keine verspielten Elemente. Folgende Verbesserungen:

### CTA-Bereich (Hero) groesser und praesenter:
- Analyze-Button groesser: `h-12 px-8 text-base` statt `h-11 px-6`
- URL-Input Container etwas mehr Padding und groessere Schrift
- Mehr vertikaler Abstand unter der Subline

### Feature-Cards interaktiver:
- Subtiler Scale-Effekt beim Hover (`hover:scale-[1.02]`)
- Leichter Glow-Effekt auf der Nummer beim Hover

### Stats-Section lebendiger:
- Animierte Gradient-Linie unter der Stats-Section (horizontal, subtil, wie ein Scanner-Effekt)
- Nutzt bestehende CSS-Animationsinfrastruktur

### CTA-Section (Footer) groesser:
- Button groesser: `h-14 px-12 text-lg`
- Mehr Padding im Container

### Comparison Table:
- Subtiler Hover-Effekt auf Zeilen (`hover:bg-muted/20`)

### Use Cases Section:
- Badge-Labels mit leichtem Pulse-Punkt (wie "Live"-Indikator, bereits im CSS vorhanden)

---

## Technische Umsetzung

### Betroffene Dateien:
1. `src/pages/Home.tsx` - Textkorrekturen + dynamischere Gestaltung
2. `src/pages/Pricing.tsx` - Model-Namen korrigieren
3. `src/pages/HowItWorks.tsx` - Model-Namen und Credit-Kosten korrigieren
4. `src/index.css` - Eine neue Keyframe-Animation fuer Gradient-Scanner-Linie

### Keine strukturellen Aenderungen, nur:
- String-Korrekturen (Model-Namen, Credits, Kategorien)
- Tailwind-Klassen fuer groessere CTAs und Hover-Effekte
- Eine neue subtile CSS-Animation

