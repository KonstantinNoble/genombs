

# InlineUrlPrompt: Website- und Code-Analyse trennen

## Problem
Aktuell werden Website-URL-Felder und GitHub-Repository-Feld in einem einzigen Formular vermischt. Der Nutzer soll sich klar fuer **einen** Modus entscheiden:
- **Website-Analyse**: URL + optionales GitHub-Repo + Competitors
- **Code-Analyse**: Nur GitHub-Repository

## Wichtig: Code-Analyse ist NICHT Premium-only
Die GitHub Code Analysis ist fuer alle Nutzer verfuegbar (Free und Premium). Im aktuellen Code ist der GitHub-only-Button faelschlicherweise auf `isPremium` beschraenkt -- das wird korrigiert.

## Aenderungen

### `src/components/chat/InlineUrlPrompt.tsx`
1. **Mode-State hinzufuegen**: `mode: "website" | "code"` (Default: `"website"`)
2. **Zwei Tab-Buttons** oben im Formular: "Website Analysis" und "Code Analysis"
3. **Website-Modus**: Zeigt die bestehenden Felder (eigene URL, optionales GitHub-Repo, Competitor-URLs, "Start Analysis"-Button)
4. **Code-Modus**: Zeigt nur das GitHub-URL-Feld und einen "Analyze Code"-Button
5. **Premium-Check entfernen**: Die Bedingung `isPremium` bei `canStartGithubOnly` (Zeile 57) wird entfernt, damit alle Nutzer die Code-Analyse nutzen koennen
6. Der Erklaerungstext oben passt sich je nach Modus an:
   - Website: "Enter your website URL and competitor URLs..."
   - Code: "Enter a GitHub repository URL to analyze the source code"

### Keine weiteren Dateien betroffen
Die Props und Callbacks (`onStartAnalysis`, `onGithubOnlyAnalysis`) bleiben identisch. Keine Aenderungen an `Chat.tsx` oder anderen Dateien noetig.

