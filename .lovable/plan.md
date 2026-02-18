

# Website- und Code-Analyse: Immer beide Sektionen zeigen mit Hinweisen

## Konzept
Das Dashboard zeigt immer **zwei klar getrennte Bereiche** -- unabhaengig davon, ob Daten vorhanden sind oder nicht:

1. **Website Analysis** -- Zeigt die Analyse-Ergebnisse wenn eine URL gescannt wurde. Wenn nicht: Platzhalter-Hinweis "Scan your website to see results here".
2. **Code Analysis** -- Zeigt die Code-Qualitaet wenn ein GitHub-Repo gescannt wurde. Wenn nicht: Platzhalter-Hinweis "Scan your GitHub repository to see results here".

Beide Bereiche sind durch eine Trennlinie (`Separator`) visuell abgegrenzt.

---

## Aenderungen

### 1. `src/components/dashboard/AnalysisTabs.tsx`

- Die fruehe `if (!ownSite) return null` Pruefung entfernen -- stattdessen wird das Dashboard immer gerendert wenn mindestens 1 Profil existiert
- **Website Analysis Sektion**: 
  - Wenn `profile_data` vorhanden: Sektionen wie bisher (Overview, Positioning, Offers, Trust)
  - Wenn nicht vorhanden: Ein Platzhalter-Card mit Globe-Icon und Text "Scan your website to unlock this section" + kurze Beschreibung was enthalten waere
- **Code Analysis Sektion** (unterhalb, nach Separator):
  - Wenn `code_analysis` vorhanden: CodeAnalysisCard wie bisher
  - Wenn nicht vorhanden: Ein Platzhalter-Card mit Code-Icon und Text "Analyze your GitHub repository to unlock this section" + kurze Beschreibung
- Jeder Bereich bekommt einen eigenen Sektions-Header mit Icon (Globe fuer Website, Code fuer GitHub)

### 2. `src/components/dashboard/SectionNavBar.tsx`

- Beide Tab-Gruppen (Website + Code) werden **immer** angezeigt
- Visueller Trenner (duenne vertikale Linie) zwischen den Website-Tabs und dem Code-Tab
- Tabs ohne Daten werden leicht ausgegraut dargestellt (z.B. `opacity-50 pointer-events-none`) damit klar ist, dass sie noch nicht verfuegbar sind, aber existieren

### 3. `src/pages/Chat.tsx`

- `SectionNavBar` wird immer angezeigt wenn mindestens ein Profil existiert (keine Aenderung noetig, ist bereits so)
- `AnalysisTabsContent` wird immer gerendert wenn Profile existieren (keine Aenderung noetig)

---

## Visuelle Struktur

```text
+------------------------------------------+
|  Nav: Overview | Positioning | ... | Code |
|         (aktiv)              (grau wenn   |
|                               keine Daten)|
+------------------------------------------+
|                                          |
|  --- WEBSITE ANALYSIS (Globe Icon) ---   |
|                                          |
|  [Analyse-Ergebnisse]                    |
|  ODER                                    |
|  [Platzhalter: "Scan your website..."]   |
|                                          |
|  ──────── Separator ─────────            |
|                                          |
|  --- CODE ANALYSIS (Code Icon) ---       |
|                                          |
|  [Code-Analyse-Ergebnisse]               |
|  ODER                                    |
|  [Platzhalter: "Analyze your repo..."]   |
|                                          |
+------------------------------------------+
```

### Dateien
1. `src/components/dashboard/AnalysisTabs.tsx` -- Beide Sektionen immer rendern, Platzhalter bei fehlenden Daten
2. `src/components/dashboard/SectionNavBar.tsx` -- Alle Tabs immer zeigen, inaktive ausgegraut

