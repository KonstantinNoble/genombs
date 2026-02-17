
# GitHub Deep Analysis - 3 Verbesserungen

## Problem 1: Fehlende Fehlerbehandlung bei ungueltiger GitHub-URL

Aktuell wird sofort "Starting Deep Analysis..." im Chat angezeigt, bevor ueberprueft wird, ob das Repository ueberhaupt existiert. Wenn die URL falsch ist, erscheint danach ein Fehler-Toast, aber die Bestaetigungsnachricht bleibt im Chat stehen.

### Loesung
- **URL-Validierung vor dem Start**: In `handleGithubDeepAnalysis` (Chat.tsx) wird zunaechst ein Validierungs-Regex geprueft (`github.com/owner/repo` Format).
- **Fruehe Fehlermeldung**: Wenn die Edge Function mit einem Fehler antwortet ("Repository not found"), wird eine klare Fehlernachricht im Chat angezeigt statt nur ein Toast.
- **Keine "Starting..."-Nachricht vor der Validierung**: Die Bestaetigungsnachricht wird erst nach erfolgreicher Validierung angezeigt.

## Problem 2: Kein Dashboard fuer Code-Analyse-Ergebnisse

Die `code_analysis`-Daten (codeQuality, security, performance, accessibility, maintainability, seo) werden in der Datenbank gespeichert, aber im Dashboard (`AnalysisTabs.tsx`) nicht angezeigt. Der User sieht die Ergebnisse nur als Chat-Zusammenfassung.

### Loesung
- **Neue Dashboard-Sektion "Code Quality"**: Ein neuer Abschnitt im Dashboard mit der ID `section-code-quality`, der nur angezeigt wird, wenn `code_analysis`-Daten vorhanden sind.
- **Darstellung**:
  - Gesamtscore (Score-Ring) fuer Code Quality
  - Sub-Scores als kleinere Ringe: Security, Performance, Accessibility, Maintainability
  - Staerken/Schwaechen-Liste aus `codeQuality.strengths` und `codeQuality.weaknesses`
  - Security-Issues und Empfehlungen
  - SEO-Code-Issues
  - Tech-Stack als Badge-Liste
- **SectionNavBar aktualisieren**: Neuen Eintrag "Code Quality" hinzufuegen (nur wenn code_analysis vorhanden).

## Problem 3: Bessere GitHub-URL-Eingabe (Validierung statt OAuth)

Eine volle GitHub-OAuth-Integration waere ideal, erfordert aber einen OAuth-Flow und Scopes-Management. Als pragmatische Zwischenloesung wird eine robuste URL-Validierung implementiert.

### Loesung
- **Live-URL-Validierung im Input**: Wenn der User eine GitHub-URL eingibt (im Popover oder InlineUrlPrompt), wird die URL geprueft:
  - Format-Check: Muss `github.com/{owner}/{repo}` sein
  - Existenz-Check: Ein schneller HEAD-Request an `api.github.com/repos/{owner}/{repo}` prueft, ob das Repo existiert und oeffentlich ist
  - Visuelles Feedback: Gruener Haken wenn gueltig, roter Fehler wenn ungueltig
- **Fehlermeldungen**: Klare Meldungen wie "Repository nicht gefunden", "Nur oeffentliche Repositories werden unterstuetzt", "Ungueltiges URL-Format"

---

## Technische Details

### Neue Datei: `src/components/dashboard/CodeAnalysisCard.tsx`
- Nimmt `codeAnalysis` als Prop (aus `WebsiteProfile.code_analysis`)
- Rendert Score-Ringe fuer: Code Quality, Security, Performance, Accessibility, Maintainability
- Zeigt Strengths/Weaknesses, Issues und Recommendations
- Tech-Stack als Badge-Liste
- GitHub-Repo-URL als Link

### Aenderung: `src/components/dashboard/AnalysisTabs.tsx`
- Importiert `CodeAnalysisCard`
- Neue Section `section-code-quality` nach "Trust & Proof"
- Wird nur gerendert, wenn `ownSite.code_analysis` vorhanden ist

### Aenderung: `src/components/dashboard/SectionNavBar.tsx`
- Neuer bedingter Eintrag: `{ id: "section-code-quality", label: "Code Quality" }`
- Das Array `SECTIONS` wird dynamisch, abhaengig davon ob `code_analysis` existiert
- SectionNavBar bekommt ein optionales Prop `hasCodeAnalysis?: boolean`

### Aenderung: `src/pages/Chat.tsx`
- `handleGithubDeepAnalysis`:
  - URL-Format-Validierung vor dem Start
  - Bestaetigungsnachricht erst nach erfolgreichem API-Call
  - Klare Fehlernachricht im Chat bei Fehler (nicht nur Toast)
- `SectionNavBar` bekommt `hasCodeAnalysis` Prop basierend auf `profiles`

### Aenderung: `src/components/chat/ChatInput.tsx`
- GitHub-Popover: Validierung der URL vor Submit
  - Format-Check mit Regex
  - Visuelles Feedback (Haken/Fehler-Icon)
  - Submit-Button disabled wenn URL ungueltig

### Aenderung: `src/components/chat/InlineUrlPrompt.tsx`
- GitHub-URL-Feld: Gleiches Validierungs-Feedback wie im ChatInput-Popover

### Zusammenfassung der Dateien
1. `src/components/dashboard/CodeAnalysisCard.tsx` - NEU: Dashboard-Karte fuer Code-Analyse
2. `src/components/dashboard/AnalysisTabs.tsx` - Neue Code Quality Section
3. `src/components/dashboard/SectionNavBar.tsx` - Dynamischer Nav-Eintrag
4. `src/pages/Chat.tsx` - Verbesserte Fehlerbehandlung + SectionNavBar Prop
5. `src/components/chat/ChatInput.tsx` - URL-Validierung im Popover
6. `src/components/chat/InlineUrlPrompt.tsx` - URL-Validierung im Formular
