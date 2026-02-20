
# GitHub-Feld aus dem Website-Modus entfernen

## Problem
Im "Website Analysis"-Tab wird das GitHub-Repository-Feld weiterhin angezeigt (Zeilen 130-167 in InlineUrlPrompt.tsx). Dadurch wirkt es so, als waeren die beiden Analysearten immer noch gemischt.

## Loesung
Den gesamten GitHub-Repository-Abschnitt (Zeilen 130-167) aus dem Website-Modus (`mode === "website"`) entfernen. Das GitHub-Feld existiert dann nur noch im Code-Modus (`mode === "code"`).

## Technische Aenderungen

### `src/components/chat/InlineUrlPrompt.tsx`
- **Entfernen**: Den Block von Zeile 130-167 (GitHub Repository im Website-Modus) komplett loeschen
- **Anpassen**: In `handleStart` die GitHub-URL-Referenz entfernen, da im Website-Modus kein GitHub-Feld mehr existiert -- `ghUrl` wird immer `undefined`
- **Anpassen**: Die `allUrlsValid`-Berechnung (Zeile 54) muss die `isValidGithubUrl(githubUrl)`-Pruefung nur im Code-Modus beruecksichtigen
- Der Erklaerungstext "The website URL is used for live performance..." (Zeile 105) wird vereinfacht, da der GitHub-Hinweis dort nicht mehr relevant ist
