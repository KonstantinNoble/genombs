

## DSGVO-konforme Vollständige Kontolöschung

### Problem
Die aktuelle `delete-account` Edge Function ist unvollständig und nicht vollständig DSGVO-konform. Sie löscht nur 3 Tabellen, lässt aber folgende Benutzerdaten in der Datenbank:

**Fehlende Löschungen:**
- `improvement_tasks` – Verbesserungsaufgaben des Nutzers
- `website_profiles` – Analysierte Website-Profile mit allen Rohdaten
- `messages` – Chat-Nachrichten des Nutzers
- `conversations` – Chat-Konversationen
- `analysis_queue` – Analysewarteschlangen-Einträge

### Lösung
Die Edge Function `supabase/functions/delete-account/index.ts` erweitern, um **alle 8 Benutzerdatentabellen** in der korrekten relationalen Reihenfolge zu löschen. Die Reihenfolge ist wichtig, um Fremdschlüssel-Konflikte zu vermeiden.

### Technische Details

**Datei:** `supabase/functions/delete-account/index.ts`

**Korrekte Löschreihenfolge (Abhängigkeiten respektieren):**

```text
Abhängigkeitsgraph:
improvement_tasks ──┐
website_profiles ───┼──> conversations  ──> user_credits
messages ───────────┘                        user_roles
analysis_queue                               profiles
                                             auth.users (zuletzt)

Löschreihenfolge:
1. improvement_tasks    (hängt von website_profiles ab)
2. website_profiles     (hängt von conversations ab)
3. messages             (hängt von conversations ab)
4. analysis_queue       (eigenständig, aber hat user_id)
5. conversations        (jetzt keine abhängigen Daten mehr)
6. user_roles          (bereits vorhanden)
7. user_credits        (bereits vorhanden)
8. profiles            (bereits vorhanden)
9. auth.users          (zuletzt – invalidiert Login sofort)
```

**Code-Struktur:**

Nach der aktuellen `deleted_accounts` Hash-Speicherung (Zeile 59) werden folgende DELETE-Blöcke hinzugefügt, bevor die bestehenden Löschungen beginnen:

```typescript
// 1. Delete improvement_tasks
const { error: tasksError } = await adminClient
  .from('improvement_tasks')
  .delete()
  .eq('user_id', userId);

// 2. Delete website_profiles
const { error: profilesError } = await adminClient
  .from('website_profiles')
  .delete()
  .eq('user_id', userId);

// 3. Delete messages
const { error: messagesError } = await adminClient
  .from('messages')
  .delete()
  .in('conversation_id', /* conversation IDs */);

// 4. Delete analysis_queue
const { error: queueError } = await adminClient
  .from('analysis_queue')
  .delete()
  .eq('user_id', userId);

// 5. Delete conversations
const { error: conversationsError } = await adminClient
  .from('conversations')
  .delete()
  .eq('user_id', userId);
```

**Für `messages` speziell:** Da die Tabelle kein direktes `user_id`-Feld hat, müssen wir erst die Konversations-IDs des Nutzers abfragen und dann diese zum Löschen der Messages verwenden.

### Auswirkungen

| Kategorie | Details |
|-----------|---------|
| **Dateien geändert** | 1 Datei: `supabase/functions/delete-account/index.ts` |
| **Neue Datenbankmigrationen** | Keine nötig |
| **RLS-Policies** | Keine Änderung nötig (Service Role Keyüberschreibt alle Policies) |
| **Funktionen** | Keine neuen DB-Funktionen nötig |
| **Frontend-Änderungen** | Keine nötig |

### DSGVO-Konformität

✅ **Alle Datenkategorien werden gelöscht:**
- Nutzerprofil und Kreditsystem
- Alle Chat-Konversationen und Nachrichten
- Alle Website-Analysen und Profildaten
- Alle Aufgaben und Analysewarteschlangen
- Authentifizierung wird gelöscht (Login invalidiert)

✅ **24h Sperre gegen Re-Registrierung** (bereits implementiert via `deleted_accounts` Tabelle)

✅ **Audit Trail** (Logs zeigen alle gelöschten Einträge)

### Implementierungsschritte

1. Edge Function aktualisieren mit allen 5 neuen DELETE-Blöcken
2. Die bereits existierenden 4 DELETE-Blöcke bleiben unverändert
3. Fehlerbehandlung: Jeder DELETE wird geloggt, blockiert aber nicht die Gesamtlöschung
4. Rückgabe: `success: true` nur wenn `auth.users` erfolgreich gelöscht (wie bisher)

