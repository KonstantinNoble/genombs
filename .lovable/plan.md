
# Team-Feature: Limits & Credit-Verifizierung

## Zusammenfassung der Änderungen

### 1. Neue Limits einführen:
| Limit | Wert | Beschreibung |
|-------|------|--------------|
| **Max Mitglieder pro Team** | **5** | Inklusive Owner (statt 10) |
| **Max Teams pro User** | 5 | Als Owner |
| **Max Einladungen pro Team/Tag** | 10 | Bereits vorhanden |
| **Max ausstehende Einladungen pro E-Mail** | 3 | Bereits vorhanden |

### 2. Credits sind GLOBAL - Verifizierung:
**Bestätigt korrekt implementiert:**
- Credits werden in der `user_credits` Tabelle pro `user_id` gespeichert
- Die `increment_validation_count` Funktion verwendet nur `user_id`, keine `team_id`
- Egal ob Personal oder Team-Modus: Credits werden vom individuellen User abgezogen
- Free User: 2 Validierungen/Tag, Premium: 10 Validierungen/Tag - unabhängig vom Workspace

---

## Phase 1: Backend-Limits im Edge Function

**Datei: `supabase/functions/team-management/index.ts`**

### 1.1 Team-Limit (max. 5 Teams als Owner)

Im `case "create"` Block nach dem Premium-Check hinzufügen:

```typescript
// Check team limit (max 5 teams as owner)
const { count: ownedTeamsCount } = await supabase
  .from("teams")
  .select("*", { count: "exact", head: true })
  .eq("owner_id", userId);

if (ownedTeamsCount && ownedTeamsCount >= 5) {
  return new Response(JSON.stringify({ error: "TEAM_LIMIT_REACHED" }), {
    status: 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

### 1.2 Mitglieder-Limit (max. 5 Mitglieder pro Team)

Im `case "invite"` Block nach den bestehenden Rate-Limit-Checks hinzufügen:

```typescript
// Check member limit (max 5 members including pending invites)
const { count: currentMemberCount } = await supabase
  .from("team_members")
  .select("*", { count: "exact", head: true })
  .eq("team_id", teamId);

const { count: pendingInviteCount } = await supabase
  .from("team_invitations")
  .select("*", { count: "exact", head: true })
  .eq("team_id", teamId)
  .gt("expires_at", new Date().toISOString());

const totalCount = (currentMemberCount || 0) + (pendingInviteCount || 0);

if (totalCount >= 5) {
  return new Response(JSON.stringify({ error: "MEMBER_LIMIT_REACHED" }), {
    status: 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

### 1.3 Member-Limit beim Annehmen prüfen

Im `case "accept-invite"` Block vor dem INSERT hinzufügen:

```typescript
// Double-check member limit before accepting
const { count: memberCount } = await supabase
  .from("team_members")
  .select("*", { count: "exact", head: true })
  .eq("team_id", invitation.team_id);

if (memberCount && memberCount >= 5) {
  // Delete expired invitation and inform user
  await supabase.from("team_invitations").delete().eq("id", invitation.id);
  return new Response(JSON.stringify({ error: "TEAM_FULL" }), {
    status: 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

---

## Phase 2: Frontend-Feedback für Team-Limit

**Datei: `src/components/team/CreateTeamDialog.tsx`**

Im `catch` Block Fehlerbehandlung erweitern:

```typescript
if (error.message === "TEAM_LIMIT_REACHED") {
  toast({
    title: "Team limit reached",
    description: "You can create a maximum of 5 teams. Delete an existing team to create a new one.",
    variant: "destructive",
  });
}
```

---

## Phase 3: Frontend-Feedback für Team-Switcher

**Datei: `src/components/team/TeamSwitcher.tsx`**

1. Owned Teams zählen und "Create Team" Button bedingt deaktivieren:

```typescript
const ownedTeamsCount = teams.filter(t => t.role === "owner").length;
const canCreateMoreTeams = ownedTeamsCount < 5;
```

2. Im JSX beim "Create Team" Button:

```tsx
{isPremium && (
  <>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      onClick={() => {
        if (canCreateMoreTeams) {
          setShowCreateDialog(true);
          setOpen(false);
        }
      }}
      disabled={!canCreateMoreTeams}
      className={cn("gap-2", canCreateMoreTeams ? "text-primary" : "opacity-50")}
    >
      <Plus className="h-4 w-4" />
      <span>Create Team</span>
      {!canCreateMoreTeams && (
        <span className="ml-auto text-xs text-muted-foreground">(5/5)</span>
      )}
    </DropdownMenuItem>
  </>
)}
```

---

## Phase 4: Frontend-Feedback für Mitglieder-Limit

**Datei: `src/pages/TeamMembers.tsx`**

### 4.1 Limit-Status berechnen und anzeigen:

```typescript
const isMemberLimitReached = members.length + invitations.length >= 5;
```

### 4.2 Im Header des Invite-Formulars:

```tsx
<CardTitle className="flex items-center gap-2">
  <UserPlus className="h-5 w-5" />
  Invite Member
  <span className="text-sm font-normal text-muted-foreground">
    ({members.length}/5)
  </span>
</CardTitle>
```

### 4.3 Warnung wenn Limit erreicht:

```tsx
{isMemberLimitReached && (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm mb-4">
    <AlertTriangle className="h-4 w-4 shrink-0" />
    <span>Member limit reached (5 max). Remove a member or cancel an invitation to add more.</span>
  </div>
)}
```

### 4.4 Invite-Button deaktivieren:

```tsx
<Button type="submit" disabled={isInviting || !inviteEmail || isMemberLimitReached}>
  ...
</Button>
```

### 4.5 Fehlerbehandlung erweitern:

```typescript
if (response.data?.error === "MEMBER_LIMIT_REACHED") {
  toast({
    title: "Member limit reached",
    description: "This team has reached the maximum of 5 members.",
    variant: "destructive",
  });
  return;
}
```

---

## Phase 5: TeamInvite-Seite - TEAM_FULL Fehler

**Datei: `src/pages/TeamInvite.tsx`**

In der `acceptInvitation` Funktion:

```typescript
if (data.error === "TEAM_FULL") {
  setState("error");
  setErrorMessage("This team has reached its member limit of 5. Contact the team admin for more information.");
  return;
}
```

---

## Zusammenfassung der Dateien

| Datei | Änderungen |
|-------|------------|
| `supabase/functions/team-management/index.ts` | Team-Limit (5 Teams) + Member-Limit (5 Mitglieder) Checks |
| `src/components/team/CreateTeamDialog.tsx` | TEAM_LIMIT_REACHED Fehlerbehandlung |
| `src/components/team/TeamSwitcher.tsx` | Create Team Button deaktivieren bei 5/5 |
| `src/pages/TeamMembers.tsx` | Member-Counter (x/5) + Limit-Warnung + Fehlerbehandlung |
| `src/pages/TeamInvite.tsx` | TEAM_FULL Fehlerbehandlung |

---

## Technische Verifizierung: Credits sind GLOBAL

### Bestätigt korrekt:

| Aspekt | Status | Nachweis |
|--------|--------|----------|
| Credits pro User, nicht pro Team | ✅ | `user_credits.user_id` ist der einzige Key |
| Keine team_id in Credit-Logik | ✅ | `multi-ai-query` prüft nur `user_credits.user_id` |
| `increment_validation_count` ohne Team | ✅ | Funktion verwendet nur `user_uuid` Parameter |
| Team-Modus beeinflusst Credits nicht | ✅ | Validation zählt immer gegen den aufrufenden User |

### Erklärung für User:
> Deine Credits werden immer von deinem persönlichen Account abgezogen, egal ob du im Personal Workspace oder in einem Team arbeitest. Das Team beeinflusst nur, wo die Analyse gespeichert und wer sie sehen kann - nicht wie viele Validierungen du durchführen kannst.

---

## Limitübersicht (Final)

| Limit | Free User | Premium User |
|-------|-----------|--------------|
| Validierungen/Tag | 2 | 10 |
| Teams erstellen | ❌ | 5 Teams |
| Mitglieder pro Team | - | 5 Mitglieder |
| Einladungen pro Team/Tag | - | 10 |
| Ausstehende Einladungen pro E-Mail | - | 3 |
