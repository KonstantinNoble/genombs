

# Workspace-Verwaltung: Bessere Auffindbarkeit & Ladezeiten

## Identifizierte Probleme

| Problem | Auswirkung |
|---------|------------|
| **TeamMembers lädt langsam** | Nur Spinner sichtbar, keine Skeleton-Vorschau |
| **Workspace schwer zu finden** | Nur über TeamSwitcher im Dashboard erreichbar |
| **TeamSwitcher nur auf 3 Seiten** | `/validate`, `/dashboard`, `/team/members` |
| **Keine Workspace-Links im Profil** | User wissen nicht wo sie Teams verwalten |
| **Inkonsistente Navigation** | "Back to Validation" macht nicht immer Sinn |

---

## Lösungsübersicht

### Phase 1: Skeleton-Loading für TeamMembers

Statt nur Spinner zeigen wir sofort die Seitenstruktur mit Skeleton-Elementen:

```text
┌────────────────────────────────────────┐
│  [████████] Team Name                  │
│  ─────────────────────────────────────│
│  Role Permissions                      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │█████│ │█████│ │█████│ │█████│      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
│  ─────────────────────────────────────│
│  Invite Member (2/5)                   │
│  ┌────────────────────────────────┐   │
│  │ ████████████████               │   │
│  └────────────────────────────────┘   │
│  ─────────────────────────────────────│
│  Members (2)                           │
│  ┌────────────────────────────────┐   │
│  │ █████  email@████████  [Admin] │   │
│  │ █████  email@████████  [Owner] │   │
│  └────────────────────────────────┘   │
└────────────────────────────────────────┘
```

**Datei**: `src/pages/TeamMembers.tsx`

---

### Phase 2: Workspace-Link im Profil

Neue "My Teams" Section in der Profil-Seite:

```text
┌────────────────────────────────────────┐
│  My Teams                         [→]  │
│  ─────────────────────────────────────│
│  🏢 Acme Corp          Owner  Manage → │
│  🏢 Startup Team       Member Manage → │
│  ─────────────────────────────────────│
│  [+ Create Team] (Premium only)        │
└────────────────────────────────────────┘
```

**Datei**: `src/pages/Profile.tsx`

---

### Phase 3: TeamSwitcher auf mehr Seiten anzeigen

Den TeamSwitcher auch auf der Profil-Seite und im Team-Settings anzeigen:

**Datei**: `src/components/Navbar.tsx`

Zeile 18 anpassen:
```typescript
// Von:
const showTeamSwitcher = user && ["/validate", "/dashboard", "/team/members"].some(...)

// Zu:
const showTeamSwitcher = user && ["/validate", "/dashboard", "/team", "/profile"].some(...)
```

Dies zeigt den Switcher auf:
- `/validate`
- `/dashboard`
- `/team/members`
- `/team/settings`
- `/profile`

---

### Phase 4: Dedizierte "My Teams" Seite (Optional)

Eine neue `/teams` Seite die alle Teams auf einen Blick zeigt:

**Neue Datei**: `src/pages/Teams.tsx`

Features:
- Liste aller Teams mit Rolle und Mitgliederzahl
- Schnellzugriff auf Team Settings
- Schnellzugriff auf Team Members
- "Create Team" Button (Premium)
- Link zu dieser Seite in Navbar für eingeloggte User

```text
┌──────────────────────────────────────────────────┐
│  My Workspaces                                   │
│  ────────────────────────────────────────────────│
│  ┌──────────────────────────────────────────┐   │
│  │  Personal Workspace                       │   │
│  │  Your private analyses and experiments    │   │
│  │  [Open →]                                 │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  🏢 Acme Corp                  Owner      │   │
│  │  3/5 Members                              │   │
│  │  [Members] [Settings] [Open →]            │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  🏢 Startup Team               Member     │   │
│  │  2/5 Members                              │   │
│  │  [View Members] [Open →]                  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  [+ Create New Team]                             │
└──────────────────────────────────────────────────┘
```

---

### Phase 5: Navbar-Link zu Workspaces

Für eingeloggte User einen "Teams" Link in der Navbar hinzufügen:

**Datei**: `src/components/Navbar.tsx`

```typescript
{user && <NavLink to="/teams">Teams</NavLink>}
{user && <NavLink to="/dashboard">Dashboard</NavLink>}
```

---

### Phase 6: TeamMembers - Intelligentere "Back" Navigation

Statt immer "Back to Validation":
- Prüfen woher der User kam
- Dynamischen Back-Link anzeigen

**Datei**: `src/pages/TeamMembers.tsx`

```typescript
// Nutze useLocation um previous page zu ermitteln
const from = location.state?.from || "/teams";

<Button onClick={() => navigate(from)}>
  <ChevronLeft /> Back
</Button>
```

---

## Zusammenfassung der Dateien

| Datei | Änderungen |
|-------|------------|
| `src/pages/TeamMembers.tsx` | Skeleton-Loading, dynamische Back-Navigation |
| `src/pages/Profile.tsx` | "My Teams" Section mit Quick-Links |
| `src/pages/Teams.tsx` | **NEU** - Dedizierte Workspace-Übersichtsseite |
| `src/components/Navbar.tsx` | TeamSwitcher auf mehr Seiten, "Teams" NavLink |
| `src/App.tsx` | Neue Route `/teams` |

---

## Technische Details

### Skeleton-Loading Pattern

```typescript
{isLoading ? (
  <div className="space-y-4">
    {/* Header Skeleton */}
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-6 w-24" />
    </div>
    
    {/* Members List Skeleton */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    ))}
  </div>
) : (
  // Actual content
)}
```

### Vorteile der neuen Struktur

1. **Schnellere gefühlte Ladezeit**: Skeleton zeigt sofort Struktur
2. **Bessere Auffindbarkeit**: Teams über Navbar, Profil und eigene Seite erreichbar
3. **Konsistente UX**: TeamSwitcher auf allen relevanten Seiten
4. **Klare Hierarchie**: Dedizierte Teams-Seite als zentraler Einstiegspunkt

