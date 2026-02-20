
## Navbar-Design aufwerten

### Problem
Die Desktop-Navigation (Home, How It Works, Pricing, Contact) steht ohne visuellen Container, in grauer Farbe mit wenig Kontrast -- wirkt trocken und wenig professionell.

### Loesung
Die Nav-Links bekommen einen subtilen, abgerundeten Container (Pill-Form) als Gruppe, und die einzelnen Links erhalten besseren Kontrast und dynamischere Hover-/Active-Effekte.

### Aenderungen in `src/components/Navbar.tsx`

#### 1. Nav-Container als Pill
Die Links-Gruppe (Zeile 138) bekommt einen visuellen Hintergrund-Container:
- Abgerundete Pill-Form mit `rounded-full`
- Subtiler Hintergrund: `bg-white/[0.06]` mit `border border-white/[0.08]`
- Padding innen: `px-2 py-1.5`
- Das gibt den Links einen klaren, definierten Bereich

#### 2. Einzelne NavLinks aufwerten
Die NavLink-Komponente (Zeile 90-107) wird ueberarbeitet:
- Inaktive Links: Hellere Textfarbe (`text-foreground/70` statt `text-muted-foreground`) fuer besseren Kontrast
- Hover: Dezenter Hintergrund (`hover:bg-white/[0.08]`) und volle Textfarbe
- Aktiver Link: `bg-white/[0.10]` Hintergrund-Pill + Primaerfarbe (Orange)
- Jeder Link bekommt `rounded-full px-4 py-1.5` fuer klickbare Pill-Bereiche
- Die Underline-Animation wird entfernt zugunsten des Pill-Hintergrund-Effekts

#### 3. Ergebnis
- Klarer visueller Bereich fuer die Navigation
- Besserer Kontrast: Links sind heller und besser lesbar
- Dynamischer: Hover zeigt sofort einen Hintergrund-Wechsel
- Aktiver Link ist durch Farbe UND Hintergrund klar erkennbar
- Modernes SaaS-Look (aehnlich wie Linear, Vercel, etc.)

### Technische Details
- Nur eine Datei wird geaendert: `src/components/Navbar.tsx`
- NavLink-Komponente: Underline-Span entfernen, Pill-Styling hinzufuegen
- Nav-Container div (Zeile 138): Pill-Wrapper mit Hintergrund hinzufuegen
- Keine neuen Abhaengigkeiten noetig
