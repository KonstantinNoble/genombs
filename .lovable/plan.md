

## Mobile-Sperre: "Bitte Desktop verwenden" Hinweis

### Konzept

Eine fullscreen Overlay-Komponente, die auf mobilen Geraeten (Bildschirmbreite unter 768px) die gesamte App ueberdeckt und den Nutzer freundlich darauf hinweist, dass die Anwendung nur auf Desktop-Geraeten verfuegbar ist.

### Umsetzung

**1. Neue Komponente: `src/components/MobileBlocker.tsx`**

- Prueft per `useIsMobile()` Hook (bereits vorhanden) ob der Nutzer auf einem mobilen Geraet ist
- Zeigt ein zentriertes Fullscreen-Overlay mit:
  - Synvertas Logo
  - Monitor-Icon (aus lucide-react)
  - Ueberschrift: "Desktop Only"
  - Text: "Synvertas is optimized for desktop use. Please open this page on a computer for the best experience."
  - Dunkel gehaltenes Design passend zum bestehenden Theme
- Wenn der Nutzer auf Desktop ist, wird nichts gerendert (return null)
- Das Overlay hat `fixed inset-0 z-[9999]` damit es alles ueberdeckt

**2. Einbindung in `src/App.tsx`**

- `<MobileBlocker />` wird direkt innerhalb des `<BrowserRouter>` aber vor den `<Routes>` platziert
- Dadurch wird die Sperre auf allen Seiten aktiv, unabhaengig von der Route

### Ergebnis

- **Mobile**: Nutzer sieht nur den "Bitte Desktop verwenden" Hinweis, kann die App nicht bedienen
- **Desktop**: Keine Aenderung, alles funktioniert wie bisher
- **2 Dateien** werden bearbeitet: 1 neue Komponente, 1 Import in App.tsx

