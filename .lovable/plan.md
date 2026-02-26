

## PDF-Export fuer Dashboard-Ergebnisse

### Uebersicht
Ein "Download PDF"-Button wird im Dashboard-Panel (rechte Seite der Chat-Seite) hinzugefuegt. Beim Klick wird ein professionelles PDF mit allen Analyse-Ergebnissen generiert und heruntergeladen. Das Projekt hat bereits `@react-pdf/renderer` installiert.

---

### Aenderungen

#### 1. Neue Komponente: `src/components/dashboard/PdfReport.tsx`

React-PDF-Dokument, das die Analyse-Daten als gestyltes PDF rendert:

- **Titelseite**: Synvertas-Branding, Datum, analysierte URL
- **Overview-Sektion**: Overall Score, Kategorie-Scores (Findability, Mobile Usability, Offer Clarity, Trust & Proof, Conversion Readiness) als Balken/Zahlen
- **Positioning**: Target Audience, USP, Site Structure pro Website
- **Strengths & Weaknesses**: Auflistung fuer eigene Seite und Konkurrenten
- **PageSpeed**: Performance, Accessibility, Best Practices, SEO, Core Web Vitals
- **Code Analysis** (falls vorhanden): Code Quality, Security, Performance Scores + Tech Stack
- **Comparison Table** (falls Konkurrenten vorhanden): Seite-an-Seite Kategorie-Vergleich
- **Improvement Tasks** (falls vorhanden): To-Do-Liste mit Prioritaet und Status

Props: `profiles: WebsiteProfile[]`, `tasks: ImprovementTask[]`

#### 2. Neue Komponente: `src/components/dashboard/PdfDownloadButton.tsx`

Button-Komponente die:
- `@react-pdf/renderer`'s `pdf()` Funktion nutzt um das Dokument zu generieren
- Einen Blob erstellt und als `.pdf` herunterladet
- Loading-State mit Spinner waehrend der Generierung zeigt
- Den Dateinamen aus der URL ableitet (z.B. `synvertas-analysis-2026-02-26.pdf`)

#### 3. Integration in `src/pages/Chat.tsx`

Den PDF-Button im Dashboard-Panel-Header einfuegen (neben "Workspace" / "View Dashboard"):
- Nur sichtbar wenn mindestens ein abgeschlossenes Profil existiert
- Kompakter Button mit Download-Icon

```text
+------------------------------------------+
| Workspace    View Dashboard   [PDF ↓]    |
+------------------------------------------+
```

---

### Technische Details

- Nutzt `@react-pdf/renderer` (bereits installiert) fuer serverseitiges PDF-Rendering im Browser
- Kein externer Service noetig — alles client-seitig
- PDF-Styling ueber react-pdf's `StyleSheet.create()` (kein Tailwind im PDF moeglich)
- Farbschema: dunkles Theme passend zum App-Design (dunkler Hintergrund, helle Schrift) oder klassisch hell fuer Druck-Freundlichkeit

