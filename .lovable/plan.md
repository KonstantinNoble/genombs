

# AI-Coach + Gamification: Kritisch ueberpruefter Implementierungsplan

## Kritische Analyse -- Potenzielle Probleme

Bevor wir loslegen, hier die Probleme, die ich identifiziert habe und wie wir sie loesen:

### Problem 1: Externes Supabase-Projekt
Die gesamte Infrastruktur laeuft auf dem **externen** Supabase-Projekt (xnkspttfhcnqzhmazggn), nicht auf Lovable Cloud. Das bedeutet:
- Tabellen-Migrationen muessen ueber die externe Supabase-CLI oder das Dashboard ausgefuehrt werden
- Edge Functions muessen auf die externe Instanz deployed werden
- **Loesung**: Ich erstelle die SQL-Migrationen als fertige Skripte, die du direkt auf dem externen Projekt ausfuehrst

### Problem 2: DSGVO-Kaskade unvollstaendig
Die `delete-account` Edge Function loescht aktuell 8 Tabellen in fester Reihenfolge. Drei neue Tabellen (`user_streaks`, `user_badges`, `daily_tasks`) muessen **VOR** dem Loeschen von `profiles` und `user_credits` entfernt werden.
- **Loesung**: `delete-account/index.ts` wird um 3 neue DELETE-Schritte erweitert (nach improvement_tasks, vor conversations)

### Problem 3: Re-Scan kostet Credits
Wenn ein User eine Micro-Task erledigt und "Re-Scan" klickt, kostet das erneut 9-14 Credits. Bei 3 Tasks pro Tag waeren das 27-42 Credits -- mehr als das Free-Tier-Limit von 20.
- **Loesung**: Kein automatischer Re-Scan. Stattdessen markiert der User die Task als "erledigt" (kostenlos). Der Score-Anstieg wird erst bei der naechsten regulaeren Analyse sichtbar. So bleibt das Credit-System fair.

### Problem 4: Task-Generierung verlangsamt Analyse
Wenn die `analyze-website` Edge Function zusaetzlich Tasks generiert, erhoet sich die Latenz.
- **Loesung**: Tasks werden **nach** der Analyse asynchron generiert -- entweder als separater Edge-Function-Call oder direkt im Frontend aus den `category_scores` abgeleitet (deterministisch, ohne zusaetzlichen LLM-Call).

### Problem 5: Streak-Zeitzonen
"Heute" und "Gestern" haengen von der Zeitzone des Users ab. Ein User in UTC+2 koennte seinen Streak verlieren, obwohl er nach seiner lokalen Zeit noch aktiv war.
- **Loesung**: Streak basiert auf UTC-Tagen. Das ist einfacher und konsistent. Der User sieht "Streak laeuft um Mitternacht UTC ab" -- wie es Duolingo auch handhabt.

### Problem 6: Streak-Update Race Condition
Wenn ein User mehrere Tabs oeffnet, koennte `update_user_streak` mehrfach gleichzeitig laufen.
- **Loesung**: Die DB-Funktion nutzt `ON CONFLICT ... DO UPDATE` mit einer atomaren Operation, sodass parallele Aufrufe sicher sind.

---

## Phase 1: Datenbank (3 neue Tabellen + 1 Funktion)

### Tabelle `user_streaks`
| Spalte | Typ | Default | Beschreibung |
|--------|-----|---------|-------------|
| user_id | uuid (PK) | -- | Referenz zum User |
| current_streak | integer | 0 | Aktuelle Streak-Tage |
| longest_streak | integer | 0 | Allzeit-Rekord |
| last_active_date | date | NULL | Letzter aktiver UTC-Tag |
| total_active_days | integer | 0 | Gesamte aktive Tage |

RLS: User sieht/bearbeitet nur eigene Daten (`auth.uid() = user_id`).

### Tabelle `user_badges`
| Spalte | Typ | Default | Beschreibung |
|--------|-----|---------|-------------|
| id | uuid (PK) | gen_random_uuid() | -- |
| user_id | uuid | -- | Referenz zum User |
| badge_id | text | -- | z.B. "first_scan", "streak_7" |
| unlocked_at | timestamptz | now() | Zeitpunkt der Freischaltung |

RLS: User sieht/loescht nur eigene Badges. UNIQUE constraint auf (user_id, badge_id).

### Tabelle `daily_tasks`
| Spalte | Typ | Default | Beschreibung |
|--------|-----|---------|-------------|
| id | uuid (PK) | gen_random_uuid() | -- |
| user_id | uuid | -- | -- |
| website_profile_id | uuid | -- | Bezug zur Analyse |
| task_text | text | -- | Aufgabentext |
| category | text | NULL | findability, trust, etc. |
| completed | boolean | false | Erledigt? |
| created_at | date | CURRENT_DATE | Erstellungsdatum |

RLS: User sieht/bearbeitet/loescht nur eigene Tasks.

### DB-Funktion `update_user_streak`

```text
Logik:
1. Hole last_active_date fuer user_id
2. Falls last_active_date = CURRENT_DATE (UTC) -> nichts tun (bereits aktiv heute)
3. Falls last_active_date = CURRENT_DATE - 1 -> current_streak + 1
4. Sonst -> current_streak = 1 (Streak gebrochen oder erster Tag)
5. Aktualisiere longest_streak falls current_streak > longest_streak
6. Setze last_active_date = CURRENT_DATE, total_active_days + 1
```

Implementiert als `SECURITY DEFINER` Funktion mit `INSERT ... ON CONFLICT DO UPDATE` fuer Atomaritaet.

### Erweiterung `handle_user_email_confirmed`
Bei E-Mail-Bestaetigung wird zusaetzlich ein `user_streaks`-Eintrag erstellt (wie bei `profiles` und `user_credits`).

---

## Phase 2: DSGVO-Kaskade erweitern

### `delete-account/index.ts` -- 3 neue Schritte

Aktuelle Reihenfolge (1-9) wird erweitert:

```text
1.  improvement_tasks
1a. daily_tasks        (NEU)
1b. user_badges        (NEU)
1c. user_streaks       (NEU)
2.  Conversation IDs holen
3.  messages
4.  website_profiles
5.  analysis_queue
6.  conversations
7.  user_roles
8.  user_credits
9.  profiles
10. auth.users
```

Die 3 neuen Tabellen haben keine Abhaengigkeiten untereinander und koennen in beliebiger Reihenfolge vor den bestehenden Schritten geloescht werden.

---

## Phase 3: Badge-Definitionen (Frontend)

### `src/lib/badges.ts`

Statische Badge-Definitionen mit Pruefbedingungen:

| Badge ID | Name | Bedingung | Icon |
|----------|------|-----------|------|
| first_scan | "First Scan" | 1. Analyse abgeschlossen (website_profiles count >= 1) | Zap |
| streak_3 | "3-Day Streak" | current_streak >= 3 | Flame |
| streak_7 | "Week Warrior" | current_streak >= 7 | Trophy |
| streak_30 | "Monthly Master" | current_streak >= 30 | Crown |
| score_80 | "High Performer" | overall_score >= 80 in irgendeiner Analyse | Star |
| tasks_10 | "Task Crusher" | 10 Tasks als erledigt markiert | CheckCircle |
| scans_5 | "Scanner Pro" | 5 Analysen durchgefuehrt | BarChart |

Badge-Check laeuft rein im Frontend: Nach jeder Analyse oder Task-Completion werden die Bedingungen geprueft und neue Badges per INSERT in `user_badges` geschrieben.

### `src/types/gamification.ts`

TypeScript-Typen fuer Streaks, Badges, und Tasks.

---

## Phase 4: Task-Generierung (deterministisch, ohne LLM)

Statt einen zusaetzlichen LLM-Call zu machen, leiten wir Tasks aus den bestehenden `category_scores` ab:

```text
Logik:
1. Nach abgeschlossener Analyse: Hole category_scores aus website_profiles
2. Sortiere Kategorien nach Score (aufsteigend)
3. Fuer die 2 schwaechsten Kategorien: Waehle je 1 vordefinierte Task aus einem Pool
4. Speichere in daily_tasks

Beispiel-Pool:
- findability < 60: "Optimiere deine Meta-Description auf unter 160 Zeichen"
- trust < 50: "Fuege ein SSL-Zertifikat oder Trust-Badge hinzu"
- conversion < 40: "Platziere einen klaren Call-to-Action oberhalb des Folds"
```

Vorteil: Keine zusaetzliche Latenz, keine zusaetzlichen API-Kosten, deterministisch und testbar.

Diese Logik wird in einer Hilfsfunktion `generateTasksFromScores()` in `src/lib/task-generator.ts` implementiert.

---

## Phase 5: Frontend-Komponenten

### 1. `src/components/gamification/StreakBadge.tsx`
- Position: Navbar, neben dem Credit-Counter (nur sichtbar wenn eingeloggt)
- Zeigt: Flammen-Icon + aktuelle Streak-Zahl
- Klick: Oeffnet BadgeGallery als Popover
- Streak-Update: Wird beim Laden der App getriggert (AuthContext ruft `update_user_streak` auf)

### 2. `src/components/gamification/BadgeGallery.tsx`
- Grid mit allen 7 Badges
- Freigeschaltete: Farbig mit Datum
- Gesperrte: Grau mit Bedingungstext
- Fortschrittsanzeige fuer naechstes Badge

### 3. `src/components/gamification/DailyTaskPanel.tsx`
- Position: Im Dashboard/Chat-Bereich als Sidebar-Sektion oder Tab
- Zeigt: Heutige Tasks mit Checkboxen
- "Erledigt"-Button: Markiert Task als completed, prueft Badges
- Fortschrittsbalken: "2/3 Tasks erledigt"

### 4. Badge-Unlock-Toast
- Wenn ein neues Badge freigeschaltet wird: Sonner-Toast mit Konfetti-Effekt
- "Herzlichen Glueckwunsch! Du hast 'Week Warrior' freigeschaltet!"

---

## Phase 6: Streak-Integration in AuthContext

### `src/contexts/AuthContext.tsx` Erweiterung
- Neuer State: `currentStreak`, `longestStreak`
- Bei Login/Session-Init: `update_user_streak` RPC aufrufen
- Streak-Daten werden im Context bereitgestellt fuer StreakBadge

---

## Phase 7: Streak-Warnung (optional, spaeter)

Push-Benachrichtigungen sind im Browser nur mit Service Worker moeglich und erfordern User-Permission. Als erste Version implementieren wir stattdessen:
- Beim Laden der App: Falls `last_active_date = gestern`, zeige einen Toast: "Dein X-Tage-Streak laeuft heute ab! Starte eine Analyse um ihn zu erhalten."
- Kein externer Push-Service noetig.

---

## Betroffene Dateien (Zusammenfassung)

| Datei | Aenderung |
|-------|-----------|
| SQL-Migration (extern) | 3 Tabellen + `update_user_streak` Funktion + RLS + `handle_user_email_confirmed` erweitern |
| `supabase/functions/delete-account/index.ts` | 3 neue DELETE-Schritte fuer DSGVO |
| `src/types/gamification.ts` | Neue Typen (NEU) |
| `src/lib/badges.ts` | Badge-Definitionen (NEU) |
| `src/lib/task-generator.ts` | Task-Generierung aus Scores (NEU) |
| `src/hooks/useBadgeChecker.ts` | Badge-Prueflogik (NEU) |
| `src/hooks/useStreak.ts` | Streak-Daten laden/updaten (NEU) |
| `src/components/gamification/StreakBadge.tsx` | Navbar-Widget (NEU) |
| `src/components/gamification/BadgeGallery.tsx` | Badge-Galerie (NEU) |
| `src/components/gamification/DailyTaskPanel.tsx` | Task-Panel (NEU) |
| `src/contexts/AuthContext.tsx` | Streak-State + Update-Trigger |
| `src/components/Navbar.tsx` | StreakBadge einbinden |
| `src/integrations/supabase/types.ts` | Wird automatisch aktualisiert |

---

## Wichtiger Hinweis zur Infrastruktur

Da alle Daten auf dem **externen** Supabase-Projekt liegen, muss die SQL-Migration dort ausgefuehrt werden (nicht ueber Lovable Cloud). Ich werde die Migration als fertiges SQL-Skript liefern, das du im externen Dashboard ausfuehrst. Die Edge Function (`delete-account`) und die Frontend-Aenderungen koennen hier in Lovable implementiert werden.

