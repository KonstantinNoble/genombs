

# Auto Competitor Search: Vorab-Entscheidung statt Nachher-Button

## Problem
Aktuell erscheint der "Find Competitors" Button erst NACH dem Scan -- das ist unlogisch, weil man fuer die Website-Analyse sowieso mindestens eine Competitor-URL eingeben muss. Der Auto-Search sollte VORHER entschieden werden, damit man die Competitor-Felder ueberspringen kann.

## Neuer Flow

1. User gibt seine eigene URL ein
2. Unter den Competitor-Feldern erscheint ein Toggle: **"Find competitors automatically with AI"**
3. Wenn aktiviert: Competitor-Felder werden ausgeblendet, der "Start Analysis" Button ist nur mit der eigenen URL aktivierbar
4. Nach dem Scan der eigenen Website startet automatisch die Perplexity-Suche
5. Ergebnisse erscheinen als auswahlbare Karten im Chat
6. User waehlt Competitors und klickt "Analyze Selected"

## Was sich aendert

### 1. `src/components/chat/InlineUrlPrompt.tsx`
- Neuer State `autoFind` (boolean, default false)
- Neuer Toggle-Button unter den Competitor-Feldern: "Find competitors automatically with AI (+7 Credits)"
- Wenn `autoFind === true`: Competitor-Felder werden komplett ausgeblendet
- Validierung aendern: `canStartAnalysis` erfordert KEINE Competitors mehr wenn `autoFind` aktiv
- `onStartAnalysis` Callback bekommt einen neuen Parameter `autoFindCompetitors: boolean`
- Button-Text aendert sich zu "Scan & Find Competitors"

### 2. `src/components/chat/ChatInput.tsx`
- Gleiche Aenderung im Dialog: `autoFind` Toggle, Competitor-Felder ausblenden wenn aktiv
- `onScan` Callback bekommt neuen Parameter `autoFindCompetitors?: boolean`
- Validierung anpassen: ohne Competitors starten wenn `autoFind` aktiv

### 3. `src/hooks/useChatAnalysis.ts`
- `handleScan` bekommt neuen Parameter `autoFindCompetitors?: boolean`
- Wenn `autoFindCompetitors === true` und alle Scans abgeschlossen: automatisch `findCompetitors` aufrufen
- Neuer Callback `onCompetitorSearchRequired` der nach Scan-Abschluss getriggert wird

### 4. `src/pages/Chat.tsx`
- `onStartScan` leitet `autoFindCompetitors` an `handleScan` weiter
- Neuer Callback: wenn `useChatAnalysis` signalisiert dass die Competitor-Suche starten soll, wird `handleFindCompetitors` automatisch aufgerufen
- Der bisherige "Find competitors automatically" Button im Chat-Bereich wird entfernt
- Die User-Message wird angepasst: "Analyze my site [URL] (auto-finding competitors)" statt "vs competitors: ..."

### 5. `src/components/chat/CompetitorSuggestions.tsx`
- Bleibt wie implementiert -- zeigt die Ergebnisse als Karten mit Checkboxen

### 6. `supabase/functions/find-competitors/index.ts`
- Bleibt wie implementiert -- keine Aenderung noetig

## Dateien-Uebersicht

| Datei | Aenderung |
|---|---|
| `src/components/chat/InlineUrlPrompt.tsx` | Toggle + Competitor-Felder ausblenden + Validierung |
| `src/components/chat/ChatInput.tsx` | Toggle + Competitor-Felder ausblenden + neuer onScan-Parameter |
| `src/hooks/useChatAnalysis.ts` | `autoFindCompetitors` Parameter + auto-trigger nach Scan |
| `src/pages/Chat.tsx` | Parameter weiterleiten + alten Button entfernen + auto-trigger Handler |

