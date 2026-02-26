
## PDF-Report an Dashboard angleichen

### Problem
Der PDF-Report zeigt Sektionen und Werte, die im Dashboard gar nicht existieren oder anders strukturiert sind. Zum Beispiel:
- **PageSpeed mit "SEO"**: Das PDF rendert eine PageSpeed-Sektion mit Performance/Accessibility/Best Practices/SEO-Werten, aber das Dashboard zeigt diese Daten gar nicht im Workspace-Panel (PageSpeedCard wird importiert aber nicht gerendert)
- **Code Analysis**: Wird im PDF immer gerendert, auch wenn keine GitHub-Analyse durchgefuehrt wurde
- **Daten ohne Null-Checks**: Felder wie `pagespeed_data.seo` oder `code_analysis.codeQuality` werden ohne ausreichende Pruefung angezeigt und koennen falsche/leere Werte darstellen

### Loesung
Den PDF-Report so umbauen, dass er **exakt die gleichen Sektionen** wie das Dashboard (`AnalysisTabs.tsx`) widerspiegelt:

### Aenderungen in `src/components/dashboard/PdfReport.tsx`

1. **Sektionen 1:1 ans Dashboard anpassen:**
   - **Overview**: Overall Score + Category Scores (Findability, Mobile Usability, Offer Clarity, Trust and Proof, Conversion Readiness) — bleibt wie es ist
   - **Positioning**: Target Audience, USP, Site Structure pro Website — CTAs hinzufuegen (fehlt aktuell im PDF)
   - **Strengths und Weaknesses**: Bereits vorhanden, beibehalten
   - **Comparison Table**: Bereits vorhanden, beibehalten

2. **PageSpeed-Sektion entfernen:**
   - Das Dashboard-Panel rendert PageSpeedCard nicht im Workspace, also soll es auch nicht im PDF erscheinen
   - Falls `pagespeed_data` in Zukunft wieder angezeigt wird, kann es spaeter ergaenzt werden

3. **Code Analysis nur anzeigen wenn tatsaechlich vorhanden:**
   - Strenge Pruefung: Nur rendern wenn `profile.code_analysis` nicht null ist UND mindestens ein Score darin numerisch ist
   - Alle Score-Werte durch den bestehenden `extractScore()` Helper mit Null-Fallback absichern

4. **CTAs und Site Structure ergaenzen:**
   - Das Dashboard zeigt "Offer und CTAs" mit Call-to-Actions — dies im PDF ergaenzen
   - Site Structure Tags aus dem Positioning-Bereich ebenfalls aufnehmen

5. **Improvement Tasks beibehalten:**
   - Bleibt wie bisher, wird nur gerendert wenn Tasks vorhanden sind

### Technischer Ansatz
- Kein neues Package noetig
- Nur `PdfReport.tsx` wird geaendert
- Alle Daten kommen aus den bestehenden `WebsiteProfile` und `ImprovementTask` Types
- Sichere Property-Zugriffe mit `?.` und `?? []` Fallbacks fuer alle Array- und Optional-Felder
