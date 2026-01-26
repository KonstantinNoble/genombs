

# Transfer-Ownership komplett entfernen

## Uebersicht

Die Transfer-Ownership Funktion wird vollstaendig aus dem System entfernt. Ein Owner kann sein Team nur noch loeschen, nicht mehr uebertragen. Dies vereinfacht das Rollensystem und macht den Owner-Status wirklich statisch.

## Betroffene Bereiche

| Bereich | Datei | Aenderung |
|---------|-------|-----------|
| Profil-Seite | `src/pages/Profile.tsx` | Nur "Delete workspace" zeigen |
| Team-Settings | `src/pages/TeamSettings.tsx` | Transfer-UI komplett entfernen |
| Backend | `supabase/functions/team-management/index.ts` | transfer-ownership Handler entfernen |

---

## 1. Profile.tsx - Nur "Delete workspace" Option

**Zeilen 307-345**

Die Warnung fuer Team-Owner wird vereinfacht:
- Entferne "Transfer" Link
- Aendere Text zu "delete the workspace"
- Nur noch "Delete" Button pro Team

```text
Vorher:
- "transfer ownership to a member OR delete the workspace"
- [Transfer] | [Delete]

Nachher:
- "You must delete the workspace first"
- [Delete Workspace]
```

**Konkrete Aenderung:**

```typescript
<p className="text-xs text-muted-foreground">
  You own the following workspaces. Before deleting your account, 
  you must delete them first:
</p>
<ul className="space-y-2">
  {ownedTeams.map(team => (
    <li key={team.id} className="flex items-center gap-2 text-sm">
      <Building2 className="h-4 w-4 text-primary" />
      <span className="font-medium">{team.name}</span>
      <Link 
        to="/team/settings" 
        className="ml-auto text-destructive text-xs hover:underline"
      >
        Delete Workspace
      </Link>
    </li>
  ))}
</ul>
```

---

## 2. TeamSettings.tsx - Transfer-UI entfernen

### State-Variablen entfernen (Zeilen 68-71):

```text
Entfernen:
- const [newOwnerId, setNewOwnerId] = useState("");
- const [isTransferring, setIsTransferring] = useState(false);
- const [showTransferDialog, setShowTransferDialog] = useState(false);
```

### Transfer-Funktion entfernen (Zeilen 163-199):

```text
Entfernen:
- const handleTransferOwnership = async () => { ... }
```

### eligibleOwners entfernen (Zeilen 224-226):

```text
Entfernen:
- const eligibleOwners = members.filter(...)
```

### Skeleton fuer Transfer-Card entfernen (Zeilen 273-286):

```text
Entfernen:
- {/* Transfer Ownership Card Skeleton */}
- <Card className="border-amber-500/30">...
```

### Transfer-Ownership Card entfernen (Zeilen 342-389):

```text
Entfernen:
- {/* Transfer Ownership - Owner only */}
- {isOwner && ( <Card className="border-amber-500/30">... )}
```

### Transfer-Dialog entfernen (Zeilen 431-458):

```text
Entfernen:
- {/* Transfer Ownership Confirmation */}
- <AlertDialog open={showTransferDialog}...
```

### Imports aufraeumen:

```text
Entfernen:
- Crown (nicht mehr benoetigt)
- UserCog (nicht mehr benoetigt)
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue (nicht mehr benoetigt)
```

### Non-Owner Card Text anpassen (Zeile 420-421):

```text
Vorher:
"Only the team owner can transfer ownership or delete the team."

Nachher:
"Only the team owner can delete the team."
```

---

## 3. Backend: transfer-ownership Handler entfernen

**Datei: `supabase/functions/team-management/index.ts`**

**Zeilen 646-703 entfernen:**

```text
case "transfer-ownership": {
  ... (gesamter Handler)
}
```

Nach Entfernung: Ein API-Aufruf mit `action: "transfer-ownership"` wird als "Unknown action" mit 400-Fehler zurueckgegeben.

---

## Zusammenfassung der Aenderungen

| Datei | Entfernte Elemente |
|-------|-------------------|
| `Profile.tsx` | "Transfer" Link, doppelte Option |
| `TeamSettings.tsx` | 3 State-Variablen, 1 Funktion, 1 Variable, 1 Skeleton, 1 Card, 1 Dialog, mehrere Imports |
| `team-management/index.ts` | `transfer-ownership` case (57 Zeilen) |

---

## Benutzer-Flow nach Aenderung

```text
Owner moechte Account loeschen
         |
         v
  Hat eigene Teams? ----Nein----> Account loeschen
         |
        Ja
         |
         v
  Zeige Warnung:
  +----------------------------------+
  | Workspace action required        |
  |                                  |
  | "You must delete them first:"   |
  | "My Team"  [Delete Workspace]    |
  +----------------------------------+
         |
         v
  User klickt "Delete Workspace"
         |
         v
  Wird zu /team/settings geleitet
         |
         v
  Loescht Team -> Kann Account loeschen
```

