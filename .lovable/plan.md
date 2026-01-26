

# Option A: Ex-Premium-Owner behalten Teams, aber Einladungen werden blockiert

## Uebersicht

Wenn ein Premium-User seinen Premium-Status verliert (Kuendigung, Refund), behaelt er seine bestehenden Teams und Mitgliedschaften. Jedoch wird das Einladen neuer Mitglieder blockiert, bis der Premium-Status wiederhergestellt wird.

## Aenderungen

### 1. Backend: Premium-Check beim Invite hinzufuegen

**Datei: `supabase/functions/team-management/index.ts`**

Im `invite` case (nach Zeile 291, nach dem Admin/Owner Check):

```text
Neuer Code nach der Berechtigungspruefung:

// Check if team owner is still premium
const { data: team } = await supabase
  .from("teams")
  .select("owner_id")
  .eq("id", teamId)
  .single();

if (team) {
  const { data: ownerCredits } = await supabase
    .from("user_credits")
    .select("is_premium")
    .eq("user_id", team.owner_id)
    .single();

  if (!ownerCredits?.is_premium) {
    return new Response(JSON.stringify({ 
      error: "OWNER_NOT_PREMIUM",
      message: "Team invitations require the team owner to have an active Premium subscription"
    }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
```

---

### 2. Frontend: Fehlerbehandlung und UI-Warnung

**Datei: `src/pages/TeamMembers.tsx`**

#### A) Neuen Fehler-Code behandeln (handleInvite Funktion, ca. Zeile 196-218):

```typescript
// Neuer else if Block nach MEMBER_LIMIT_REACHED:
} else if (response.data.error === "OWNER_NOT_PREMIUM") {
  toast({
    title: "Premium subscription required",
    description: "The workspace owner needs an active Premium subscription to invite new members.",
    variant: "destructive",
  });
}
```

#### B) Premium-Status fuer UI-Warnung holen:

```typescript
// Neuer State (oben bei den anderen States):
const [ownerIsPremium, setOwnerIsPremium] = useState<boolean | null>(null);

// In fetchMembersWithSession erweitern:
// Nach dem response.data check:
setOwnerIsPremium(response.data.ownerIsPremium ?? true);
```

#### C) Warnung im Invite-Formular anzeigen:

```typescript
// Vor dem Invite-Formular, nach isAdmin Check:
{isAdmin && ownerIsPremium === false && (
  <Card className="mb-4 border-amber-500/30 bg-amber-500/5">
    <CardContent className="pt-4">
      <div className="flex items-center gap-3 text-amber-500">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium text-sm">Invitations disabled</p>
          <p className="text-xs text-muted-foreground">
            The workspace owner's Premium subscription has expired. 
            New member invitations are blocked until the subscription is renewed.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

#### D) Invite-Button deaktivieren:

```typescript
// Button disabled Bedingung erweitern:
disabled={isInviting || !inviteEmail || isMemberLimitReached || ownerIsPremium === false}
```

---

### 3. Backend: ownerIsPremium im members-Response zurueckgeben

**Datei: `supabase/functions/team-management/index.ts`**

Im `members` case: Premium-Status des Owners abfragen und mit zurueckgeben.

```typescript
// Nach dem Abrufen der Members:
const { data: teamInfo } = await supabase
  .from("teams")
  .select("owner_id")
  .eq("id", teamId)
  .single();

let ownerIsPremium = true;
if (teamInfo) {
  const { data: ownerCredits } = await supabase
    .from("user_credits")
    .select("is_premium")
    .eq("user_id", teamInfo.owner_id)
    .single();
  ownerIsPremium = ownerCredits?.is_premium ?? false;
}

// Im Response-Objekt hinzufuegen:
return new Response(JSON.stringify({ 
  members,
  invitations,
  userRole: membership?.role,
  ownerIsPremium  // NEU
}), ...);
```

---

### 4. Role Permissions Text korrigieren

**Datei: `src/pages/TeamMembers.tsx`**

Der Admin-Beschreibungstext erwaehnt noch "transfer ownership". Dies muss entfernt werden.

```text
Zeile 405-406:

Vorher:
<p className="text-muted-foreground">Invite members, change roles (after ownership transfer)</p>

Nachher:
<p className="text-muted-foreground">Invite members, manage roles</p>
```

---

## Zusammenfassung der Aenderungen

| Datei | Aenderung |
|-------|-----------|
| `team-management/index.ts` | Premium-Check beim `invite` + `ownerIsPremium` im `members` Response |
| `TeamMembers.tsx` | Fehlerbehandlung, State, Warnung-Card, Button disabled, Text-Korrektur |

---

## Benutzer-Flow

```text
Ex-Premium Owner oeffnet Team Members
         |
         v
  API gibt ownerIsPremium: false zurueck
         |
         v
  Warnung wird angezeigt:
  +------------------------------------------+
  | [!] Invitations disabled                 |
  | The workspace owner's Premium            |
  | subscription has expired...              |
  +------------------------------------------+
         |
         v
  Invite-Button ist deaktiviert
         |
         v
  Falls trotzdem API-Aufruf (z.B. alter Tab):
  -> Fehler "OWNER_NOT_PREMIUM" zurueck
```

---

## Bestehende Funktionalitaet bleibt erhalten

- Bestehende Teammitglieder bleiben aktiv
- Team-Analysen und Experimente bleiben erhalten
- Member/Viewer koennen weiterhin auf Team-Daten zugreifen
- Owner kann weiterhin Members entfernen oder Rollen aendern
- Nur neue Einladungen sind blockiert

