
# Achievements zu Dashboard umwandeln

## Aenderungen

### 1. Route umbenennen: `/achievements` wird zu `/dashboard`

In `src/App.tsx` wird die Route von `/achievements` auf `/dashboard` geaendert. Der Import bleibt auf die gleiche Datei (die wird umbenannt).

### 2. Seiten-Datei umbenennen

`src/pages/Achievements.tsx` wird zu `src/pages/Dashboard.tsx` (neue Datei erstellen, alte loeschen). Inhalt bleibt identisch, nur:
- Page Header: "Achievements" wird zu "Dashboard"
- Beschreibungstext: "Track your progress and milestones." wird zu "Your performance at a glance."
- Back-Link zu `/chat` bleibt bestehen

### 3. Navbar: "Dashboard" Link hinzufuegen

In `src/components/Navbar.tsx` wird ein neuer NavLink fuer eingeloggte User hinzugefuegt:
- Desktop: `<NavLink to="/dashboard">Dashboard</NavLink>` neben "Analyze"
- Mobile: `<MobileNavLink to="/dashboard">Dashboard</MobileNavLink>` neben "Analyze"
- Nur sichtbar wenn `user` eingeloggt ist (gleiche Bedingung wie "Analyze")

### 4. Link in der Analyse-Seite (Chat)

Im Dashboard-Panel der Chat-Seite (`src/pages/Chat.tsx`) wird im Header-Bereich ("Workspace") ein dezenter Link zum Dashboard eingefuegt. Konkret neben dem bestehenden "Workspace"-Label ein kleiner Link-Text "View Dashboard" der auf `/dashboard` verweist.

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/App.tsx` | Route `/achievements` zu `/dashboard`, Import anpassen |
| `src/pages/Achievements.tsx` | Wird geloescht |
| `src/pages/Dashboard.tsx` | Neue Datei (Kopie von Achievements mit angepasstem Titel) |
| `src/components/Navbar.tsx` | "Dashboard" NavLink hinzufuegen (Desktop + Mobile, nur eingeloggt) |
| `src/pages/Chat.tsx` | Link zum Dashboard im Workspace-Header |

## Technische Details

- Der lazy import in `App.tsx` aendert sich zu `lazy(() => import("./pages/Dashboard"))`
- In `Navbar.tsx` wird der Dashboard-Link direkt nach dem "Analyze"-Link platziert, innerhalb des gleichen `{user && ...}` Blocks
- In `Chat.tsx` wird im `dashboardPanel`-Header (Zeile ~381) ein `Link to="/dashboard"` als kleiner Text-Link eingefuegt
- Alle bestehenden Links die auf `/achievements` verweisen (z.B. in `StreakBadge`) muessen auf `/dashboard` aktualisiert werden
