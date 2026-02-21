

# Fix: Gamification-Logik -- 3 kritische Integrationsfehler

## Problem 1: Badges werden nie freigeschaltet

`useBadgeChecker.checkAndUnlockBadges()` wird nirgends im Code aufgerufen. Die Funktion existiert, aber kein Event triggert sie.

### Loesung

Badge-Checks muessen an zwei Stellen getriggert werden:

**A) Nach abgeschlossener Analyse (Chat-Seite)**
In der Chat-Seite (oder dem Komponenten-Code, der Analyse-Ergebnisse empfaengt) muss nach Abschluss einer Analyse `checkAndUnlockBadges()` aufgerufen werden mit dem aktuellen Kontext (Scan-Count, hoechster Score, Streak).

**B) Nach Task-Completion (DailyTaskPanel)**
Wenn ein User eine Task als erledigt markiert, muss geprueft werden ob das "tasks_10" Badge verdient wurde.

### Betroffene Dateien
- `src/components/gamification/DailyTaskPanel.tsx` -- Badge-Check nach Task-Toggle
- `src/pages/Chat.tsx` -- Badge-Check nach Analyse-Abschluss (muss Chat.tsx lesen um den richtigen Hook-In-Punkt zu finden)

---

## Problem 2: Daily Tasks werden nie erstellt

`generateTasksFromScores()` existiert in `src/lib/task-generator.ts`, wird aber nirgends aufgerufen. Die Tabelle `daily_tasks` bleibt immer leer, und die Achievements-Seite zeigt immer "No tasks yet".

### Loesung

Nach Abschluss einer Analyse muessen Tasks generiert und in die DB geschrieben werden:

1. Wenn eine Analyse abgeschlossen ist und `category_scores` vorliegen
2. `generateTasksFromScores(category_scores)` aufrufen
3. Ergebnis in `daily_tasks` inserieren (mit `user_id` und `website_profile_id`)
4. Nur Tasks fuer den aktuellen Tag generieren (Duplikate vermeiden mit Check auf `created_at = today`)

### Betroffene Dateien
- Neuer Hook oder Integration in die bestehende Analyse-Completion-Logik
- `src/pages/Chat.tsx` oder die Komponente die Analyse-Ergebnisse verarbeitet

---

## Problem 3: Streak zaehlt bei jedem Seitenaufruf

`useStreak` wird in `src/components/Navbar.tsx` aufgerufen. Da die Navbar auf jeder Seite geladen wird, wird `update_user_streak` bei jedem Besuch getriggert -- nicht nur bei Analysen.

### Loesung

Streak-Update und Streak-Anzeige trennen:

- **Navbar (`StreakBadge`)**: Nur Streak-Daten LESEN (`fetchStreak`), nicht updaten
- **Analyse-Abschluss**: Streak nur hier UPDATEN (`updateStreak`) -- wenn eine Analyse tatsaechlich abgeschlossen wird

### Betroffene Dateien
- `src/components/Navbar.tsx` -- `useStreak` durch reinen Lese-Hook ersetzen
- `src/hooks/useStreak.ts` -- `fetchStreak` als separate Funktion exponieren (existiert bereits)
- Analyse-Completion-Code -- `updateStreak` hier aufrufen

---

## Implementierungsschritte

### Schritt 1: useStreak in Navbar auf Read-Only umstellen
In `Navbar.tsx` den Hook so anpassen, dass nur `fetchStreak` aufgerufen wird (nicht `updateStreak`). Dafuer einen neuen Parameter oder separaten Hook nutzen.

### Schritt 2: Chat.tsx analysieren und Integrationspunkte finden
Die Chat-Seite lesen um zu verstehen wo Analysen abgeschlossen werden und category_scores verfuegbar sind.

### Schritt 3: Analyse-Completion-Hook erstellen
Ein neuer Hook `useAnalysisCompletion` oder direkte Integration in die bestehende Logik:
- `updateStreak()` aufrufen
- `generateTasksFromScores()` aufrufen und Tasks in DB schreiben
- `checkAndUnlockBadges()` mit aktuellem Kontext aufrufen

### Schritt 4: DailyTaskPanel Badge-Integration
Nach Task-Toggle in `DailyTaskPanel` den Badge-Checker aufrufen mit der aktuellen Anzahl erledigter Tasks.

---

## Technische Details

### useStreak Anpassung
```text
Aktuell: useStreak() ruft immer updateStreak() im useEffect auf
Neu: useStreak(readOnly: boolean) -- wenn readOnly=true, nur fetchStreak()
Navbar nutzt readOnly=true, Analyse-Code nutzt readOnly=false
```

### Task-Generierung Flow
```text
Analyse abgeschlossen
  -> category_scores aus website_profiles lesen
  -> pruefen ob heute bereits Tasks generiert wurden
  -> falls nein: generateTasksFromScores() aufrufen
  -> Tasks in daily_tasks inserieren
```

### Badge-Check Kontext zusammenbauen
```text
Nach Analyse:
  - scanCount: COUNT website_profiles WHERE user_id = X
  - highestScore: MAX overall_score WHERE user_id = X
  - streak: aus useStreak()
  - completedTasksCount: COUNT daily_tasks WHERE completed = true AND user_id = X
```

