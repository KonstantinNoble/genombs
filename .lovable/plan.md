
# Team-Loeschung: Alle Team-Daten mit CASCADE loeschen

## Uebersicht

Wenn ein Team/Workspace geloescht wird, sollen alle damit verbundenen Daten (Analysen, Experimente, Decision Records) ebenfalls geloescht werden. Zusaetzlich soll der Text im Delete-Account-Dialog fuer Premium-User (mit eigenen Teams) angepasst werden.

## Aktuelle Situation

| Tabelle | team_id FK | ON DELETE |
|---------|-----------|-----------|
| team_members | teams(id) | CASCADE |
| team_invitations | teams(id) | CASCADE |
| validation_analyses | teams(id) | **SET NULL** (Problem!) |
| experiments | teams(id) | **SET NULL** (Problem!) |
| decision_records | teams(id) | **SET NULL** (Problem!) |

**Problem**: Wenn ein Team geloescht wird, bleiben Analysen/Experimente erhalten, aber ohne Team-Zuordnung ("floating data").

## Loesung

### 1. Datenbank-Migration: Foreign Keys auf CASCADE aendern

Aendere die ON DELETE Regel fuer `validation_analyses`, `experiments` und `decision_records` von SET NULL auf CASCADE.

```text
SQL-Migration:

1. Loesche existierende Foreign Key Constraints
2. Erstelle neue Constraints mit ON DELETE CASCADE

-- validation_analyses
ALTER TABLE validation_analyses 
  DROP CONSTRAINT IF EXISTS validation_analyses_team_id_fkey;
ALTER TABLE validation_analyses 
  ADD CONSTRAINT validation_analyses_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- experiments
ALTER TABLE experiments 
  DROP CONSTRAINT IF EXISTS experiments_team_id_fkey;
ALTER TABLE experiments 
  ADD CONSTRAINT experiments_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- decision_records
ALTER TABLE decision_records 
  DROP CONSTRAINT IF EXISTS decision_records_team_id_fkey;
ALTER TABLE decision_records 
  ADD CONSTRAINT decision_records_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
```

---

### 2. Frontend: Profilseite anpassen

**Datei: `src/pages/Profile.tsx`**

Die Warnung fuer Team-Owner soll klar kommunizieren, dass sie entweder:
- Ownership uebertragen ODER
- Das Team loeschen muessen

#### Text-Aenderungen (Zeilen 308-336):

```text
Vorher:
- "Transfer ownership before deleting"
- "Transfer ownership to another admin before deleting your account"
- Link: "Manage"

Nachher:
- "Workspace action required"
- "You own the following workspaces. Before deleting your account, you must either transfer ownership to another member OR delete the workspace:"
- Links: "Transfer" und "Delete"
```

#### Konkrete Aenderungen:

```typescript
// Zeile 313-314: Ueberschrift aendern
<p className="text-sm font-medium text-destructive">
  Workspace action required
</p>

// Zeile 316-318: Beschreibung aendern
<p className="text-xs text-muted-foreground">
  You own the following workspaces. Before deleting your account, 
  transfer ownership to a member OR delete the workspace:
</p>

// Zeile 319-331: Links pro Team erweitern
{ownedTeams.map(team => (
  <li key={team.id} className="flex items-center gap-2 text-sm">
    <Building2 className="h-4 w-4 text-primary" />
    <span>{team.name}</span>
    <div className="ml-auto flex gap-2">
      <Link 
        to="/team/members" 
        className="text-primary text-xs hover:underline"
      >
        Transfer
      </Link>
      <span className="text-muted-foreground">|</span>
      <Link 
        to="/team/settings" 
        className="text-destructive text-xs hover:underline"
      >
        Delete
      </Link>
    </div>
  </li>
))}
```

---

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| Datenbank-Migration | FK Constraints von SET NULL auf CASCADE aendern |
| `src/pages/Profile.tsx` | Text und Links fuer Team-Owner-Warnung anpassen |

---

## Auswirkungen

### Bei Team-Loeschung werden automatisch geloescht:

1. **team_members** - Alle Mitgliedschaften (bereits CASCADE)
2. **team_invitations** - Alle Einladungen (bereits CASCADE)
3. **validation_analyses** - Alle Team-Analysen (NEU: CASCADE)
4. **experiments** - Alle Team-Experimente (NEU: CASCADE)
5. **decision_records** - Alle Team-Entscheidungen (NEU: CASCADE)

### Wichtige Hinweise:

- **Persoenliche Daten bleiben**: Analysen/Experimente ohne team_id (= persoenlich) sind nicht betroffen
- **Keine Rueckgaengig**: Sobald ein Team geloescht wird, sind alle Daten unwiderruflich weg
- **Transparenz**: Die Profilseite erklaert klar die Optionen (Transfer oder Delete)

---

## Benutzer-Flow nach Aenderung

```text
Premium-User moechte Account loeschen
         |
         v
  Hat eigene Teams? ----Nein----> Account loeschen
         |
        Ja
         |
         v
  Zeige Warnung mit Optionen:
  +----------------------------------+
  | Workspace action required        |
  |                                  |
  | "My Team"                        |
  |     [Transfer] | [Delete]        |
  +----------------------------------+
         |
         v
  User waehlt: Transfer ODER Delete
         |
         v
  Keine Teams mehr? --> Account loeschen moeglich
```
