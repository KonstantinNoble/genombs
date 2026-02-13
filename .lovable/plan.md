

## Mobile und Desktop Stabilisierung und Optimierung

### Identifizierte Probleme

**Mobile Probleme:**
1. Chat-Seite: Credit-Anzeige im Header ist auf kleinen Bildschirmen zu breit und wird abgeschnitten (Progress-Bar + Timer + Text quetschen sich)
2. Chat-Input: Model-Selector, Textarea und 2 Buttons sind auf Mobile eng gedrängt - die untere Leiste hat wenig Platz
3. Dashboard-Tabs auf Mobile: Die 4 Tab-Trigger ("Overview", "Positioning", "Offer & CTAs", "Trust & Proof") sind auf kleinen Screens nicht scrollbar und werden abgeschnitten
4. Navbar: `h-18` ist keine Standard-Tailwind-Klasse und der `pt-4` springt beim Scrollen zu `pt-0`
5. Home-Seite: Comparison-Table ist auf kleinen Screens schwer lesbar (3 Spalten auf 320px)
6. Profile-Seite: Container hat falsches Nesting (`</div>` Einrückung ist fehlerhaft auf Zeile 120-254)

**Desktop Probleme:**
1. Chat-Seite: ResizablePanel hat keine Mindestbreiten-Sicherung bei extremen Resize-Aktionen
2. Home-Seite: Hero-Section nutzt `flex-1` was zu übermäßiger vertikaler Dehnung auf großen Screens führt
3. Pricing-Seite: "Go to Dashboard"-Button verlinkt auf `/dashboard` (existiert nicht - sollte `/chat` sein)

**Allgemeine Stabilitätsprobleme:**
1. `overflow-hidden` auf Home-Root-Element kann Footer-Scroll-Probleme verursachen
2. Fehlende `overflow-x-hidden` auf Body/Root kann horizontalen Scroll auf Mobile auslösen
3. Kein `viewport-fit=cover` für iPhone-Notch-Unterstützung im HTML

### Technische Umsetzung

**1. Chat-Header Credit-Anzeige (Mobile-optimiert)**
- Datei: `src/pages/Chat.tsx`
- Credits-Bereich auf Mobile kompakter gestalten: Progress-Bar auf Mobile ausblenden, nur Zahl + Timer zeigen
- Responsive Klassen: `hidden sm:block` für Progress-Bar

**2. Chat-Input Mobile-Optimierung**
- Datei: `src/components/chat/ChatInput.tsx`
- Model-Label bereits korrekt mit `hidden sm:inline` - okay
- Textarea `min-h` beibehalten, aber `gap-2` zu `gap-1.5` auf Mobile

**3. Dashboard-Tabs scrollbar machen**
- Datei: `src/pages/Chat.tsx`
- `overflow-x-auto` und `scrollbar-hide` auf TabsList hinzufügen
- `flex-nowrap` und `w-max` auf die Tab-Trigger-Container

**4. Navbar Scroll-Sprung beheben**
- Datei: `src/components/Navbar.tsx`
- `pt-4` durch konsistentes Padding ersetzen, das beim Scrollen nicht springt
- `h-18` zu einer validen Höhe ändern (z.B. `h-16`)

**5. Home Comparison-Table Mobile**
- Datei: `src/pages/Home.tsx`
- Tabelle horizontal scrollbar machen mit kleinerer Schrift auf Mobile

**6. Pricing "/dashboard" Fix**
- Datei: `src/pages/Pricing.tsx`
- Alle `/dashboard` Links auf `/chat` ändern (Zeilen 151, 249)

**7. Globale Stabilität**
- Datei: `src/index.css`
- `overflow-x: hidden` auf `html` und `body` hinzufügen um horizontalen Scroll zu verhindern
- Datei: `index.html`
- `viewport-fit=cover` zum Viewport-Meta-Tag hinzufügen

**8. Profile-Seite Layout-Fix**
- Datei: `src/pages/Profile.tsx`
- Einrückung korrigieren (kosmetisch, kein funktionaler Bug)

### Zusammenfassung der Änderungen

| Datei | Änderung |
|-------|----------|
| `src/pages/Chat.tsx` | Credit-Header responsive, Tabs scrollbar |
| `src/components/chat/ChatInput.tsx` | Kompakteres Mobile-Layout |
| `src/components/Navbar.tsx` | Konsistentes Padding, kein Sprung |
| `src/pages/Home.tsx` | Comparison-Table Mobile-Scroll |
| `src/pages/Pricing.tsx` | /dashboard zu /chat Fix |
| `src/index.css` | overflow-x hidden global |
| `index.html` | viewport-fit=cover |
| `src/pages/Profile.tsx` | Layout-Einrückung korrigieren |

