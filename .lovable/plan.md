
# Rollen-Vereinfachung: Nur Member und Viewer als zuweisbare Rollen

## Uebersicht

Das aktuelle Rollensystem erlaubt es, Benutzer als "admin" einzuladen oder zu befoerdern. Dies widerspricht dem Konzept, dass nur "Owner" automatisch und unveraenderlich vergeben wird. Die Loesung beschraenkt die zuweisbaren Rollen auf **Member** und **Viewer**.

## Aktuelle Rollenstruktur

| Rolle | Vergabe | Zuweisbar via UI? |
|-------|---------|-------------------|
| Owner | Automatisch bei Team-Erstellung | Nein (nur Transfer) |
| Admin | Manuell | Aktuell: Ja (Problem!) |
| Member | Manuell | Ja |
| Viewer | Manuell | Ja |

## Ziel-Rollenstruktur

| Rolle | Vergabe | Zuweisbar via UI? |
|-------|---------|-------------------|
| Owner | Automatisch bei Team-Erstellung | Nein (nur Transfer) |
| Admin | Nach Owner-Transfer (ehemaliger Owner) | Nein |
| Member | Manuell durch Owner/Admin | Ja |
| Viewer | Manuell durch Owner/Admin | Ja |

---

## Aenderungen

### 1. Frontend: Role-Dropdowns einschraenken

**Datei: `src/pages/TeamMembers.tsx`**

Entferne "Admin" aus beiden Select-Dropdowns:

**Invite-Formular (Zeile 470-474):**
```text
Vorher:
<SelectItem value="admin">Admin</SelectItem>
<SelectItem value="member">Member</SelectItem>
<SelectItem value="viewer">Viewer</SelectItem>

Nachher:
<SelectItem value="member">Member</SelectItem>
<SelectItem value="viewer">Viewer</SelectItem>
```

**Role-Change Dropdown (Zeile 557-561):**
```text
Vorher:
<SelectItem value="admin">Admin</SelectItem>
<SelectItem value="member">Member</SelectItem>
<SelectItem value="viewer">Viewer</SelectItem>

Nachher:
<SelectItem value="member">Member</SelectItem>
<SelectItem value="viewer">Viewer</SelectItem>
```

**Standard-Rolle aendern (Zeile 102):**
```text
Vorher:
const [inviteRole, setInviteRole] = useState<TeamRole>("member");

Keine Aenderung noetig - "member" ist bereits Standard
```

---

### 2. Backend: Rollen-Validierung hinzufuegen

**Datei: `supabase/functions/team-management/index.ts`**

#### Invite-Handler (Zeile 247-390):

Nach der Email-Validierung (Zeile 258-264), Rollen-Validierung hinzufuegen:

```typescript
// === NACH Zeile 264 einfuegen ===

// Validate role - only member and viewer can be assigned
const ASSIGNABLE_ROLES = ['member', 'viewer'];
if (!ASSIGNABLE_ROLES.includes(role)) {
  return new Response(JSON.stringify({ 
    error: "INVALID_ROLE",
    message: "Only 'member' and 'viewer' roles can be assigned" 
  }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

#### Update-Role Handler (Zeile 567-621):

Nach der Owner-Berechtigung-Pruefung (Zeile 578-583), Rollen-Validierung hinzufuegen:

```typescript
// === NACH Zeile 583 einfuegen ===

// Validate new role - only member and viewer can be assigned
const ASSIGNABLE_ROLES = ['member', 'viewer'];
if (!ASSIGNABLE_ROLES.includes(newRole)) {
  return new Response(JSON.stringify({ 
    error: "Only 'member' and 'viewer' roles can be assigned" 
  }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

---

### 3. Role Descriptions aktualisieren (optional)

**Datei: `src/pages/TeamMembers.tsx`**

Die Admin-Beschreibung bleibt fuer bestehende Admins (nach Transfer), aber kann um einen Hinweis ergaenzt werden:

```text
Zeile 401-406:
<div>
  <p className="font-medium">Admin</p>
  <p className="text-muted-foreground">
    Invite members, change roles (assigned after ownership transfer)
  </p>
</div>
```

---

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/pages/TeamMembers.tsx` | "Admin" aus beiden Dropdowns entfernen |
| `supabase/functions/team-management/index.ts` | Rollen-Validierung bei invite und update-role |

---

## Sicherheitsaspekte

- **Backend-First**: Selbst wenn jemand die Frontend-Validierung umgeht, lehnt das Backend ungueltige Rollen ab
- **Bestehende Admins bleiben**: Bereits existierende Admins (z.B. nach ownership-transfer) behalten ihre Rolle
- **Klare Fehlermeldungen**: Bei API-Missbrauch wird eine verstaendliche Fehlermeldung zurueckgegeben

---

## Edge Cases

1. **Bestehender Admin**: Bleibt Admin, kann aber nicht zu Admin befoerdert werden
2. **Owner-Transfer**: Ehemaliger Owner wird weiterhin zum Admin (Zeile 668-672 unveraendert)
3. **API-Aufruf mit "admin"**: Wird mit 400-Fehler abgelehnt

