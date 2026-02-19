
# Credit-Anzeige und GitHub-Dialog Anpassungen

## Zusammenfassung
Zwei Aenderungen in `src/components/chat/ChatInput.tsx`:
1. Credit-Kosten in der URL-Analyse-Dialog anzeigen (wie bei GitHub)
2. GitHub-Analyse von Popover zu Dialog umbauen (wie URL-Analyse)

## Aenderung 1: Credit-Kosten im URL-Analyse-Dialog

Im bestehenden Dialog "Add Websites to Analyze" wird unter dem Titel ein Hinweis ergaenzt, der die Kosten pro URL mit dem aktuell gewaehlten Modell anzeigt:

> Costs **X credits per URL** with [Model Name]

Dies wird direkt unter der DialogHeader-Beschreibung eingefuegt, analog zum GitHub-Popup.

## Aenderung 2: GitHub-Analyse als Dialog statt Popover

Der GitHub-Bereich wird von einem `Popover` (kleines Dropdown) zu einem vollwertigen `Dialog` umgebaut -- identisch zum URL-Analyse-Dialog:

- Gleiche Groesse und Layout (`sm:max-w-md`)
- DialogHeader mit Titel "Deep Code Analysis"
- Beschreibungstext und Credit-Kosten bleiben erhalten
- Input-Feld, Validierung und Start-Button bleiben funktional identisch
- Der GitHub-Button in der Toolbar oeffnet jetzt den Dialog statt des Popovers

## Technische Details

**Datei:** `src/components/chat/ChatInput.tsx`

- Zeilen 308-361: `Popover`/`PopoverContent`/`PopoverTrigger` durch `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` ersetzen
- State-Variable `githubPopoverOpen` wird zu `githubDialogOpen` umbenannt (oder beibehalten, nur die Komponente aendern)
- Zeilen 382-387: Unter der DialogHeader im URL-Dialog eine neue Zeile ergaenzen mit Credit-Kosten pro URL
- Der bestehende GitHub-Button (Zeile 310-318) wird zum einfachen `onClick`-Trigger statt `PopoverTrigger`

**Keine weiteren Dateien betroffen** -- die externen Dialog-Trigger (`externalGithubOpen`) funktionieren weiterhin, da sie nur den State setzen.
