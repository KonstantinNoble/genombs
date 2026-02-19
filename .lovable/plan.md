
# Datenschutzerklaerung Update: GitHub Code Analysis

## Zusammenfassung
Die neue "Deep Code Analysis"-Funktion (GitHub-Repository-Analyse) muss in der Datenschutzerklaerung dokumentiert werden. Dabei werden drei Stellen im Dokument angepasst und die Version auf 8.0 hochgesetzt.

## Aenderung 1: Neuer Abschnitt 8.3 - GitHub Code Analysis

Nach dem bestehenden Abschnitt 8.2 (Data Stored from Analysis) wird ein neuer Unterabschnitt eingefuegt:

**8.3 GitHub Repository Code Analysis**

Inhalt:
- Beschreibung: Nutzer koennen eine oeffentliche GitHub-Repository-URL einreichen, um eine KI-gestuetzte Code-Analyse durchzufuehren
- **Daten an GitHub uebermittelt:** Die Repository-URL (Zugriff ueber die oeffentliche GitHub API ohne Authentifizierung)
- **Daten von GitHub empfangen:** Dateibaum (bis zu 100 Dateien), Quellcode ausgewaehlter Dateien (bis zu 15 Dateien, max. 30.000 Zeichen)
- **Daten an KI-Provider uebermittelt:** Repository-Name, zugehoerige Website-URL, Dateibaum, Quellcode-Ausschnitte (gleiche Provider wie in Abschnitt 9)
- **Gespeicherte Daten:** KI-generierte Code-Analyse (Scores fuer Code-Qualitaet, Sicherheit, Performance, Barrierefreiheit, Wartbarkeit, SEO; erkannte Technologien, Staerken, Schwaechen, Empfehlungen)
- **Hinweis:** Es werden nur oeffentlich zugaengliche Repository-Daten abgerufen. Private Repositories koennen nicht analysiert werden.
- **Rechtsgrundlage:** Art. 6(1)(b) DSGVO (Vertragsdurchfuehrung)
- **Provider:** GitHub, Inc. (Microsoft), USA, DPF (Art. 45 DSGVO)
- Link zur GitHub Privacy Policy

## Aenderung 2: GitHub in Empfaengertabelle (Abschnitt 14)

Neue Zeile in der Tabelle "Recipients of Personal Data":

| GitHub, Inc. (Microsoft) | Code repository access for analysis | Repository URLs | DPF (Art. 45) |

## Aenderung 3: Analyse-Daten-Kategorie aktualisieren (Abschnitt 13)

In der Zeile "Analysis Data" die Beispiele ergaenzen um: "GitHub repository source code, AI-generated code analysis scores"

## Aenderung 4: Version und Datum

- Version: 7.0 -> 8.0
- Effective Date: February 19, 2026
- "Last updated" Datum anpassen
- Version History Eintrag: "Version 8.0 (February 19, 2026): Added GitHub Repository Code Analysis (Deep Code Analysis) feature documentation. Added GitHub, Inc. as data recipient. Updated analysis data categories."

## Betroffene Datei
`src/pages/PrivacyPolicy.tsx` -- nur diese eine Datei wird geaendert.
