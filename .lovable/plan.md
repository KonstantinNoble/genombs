
# Mobile-Optimierung für Team- und Workspace-Seiten

## Überblick
Die Team- und Workspace-Seiten (Teams, TeamMembers, TeamSettings, TeamInvite, Profile, Dashboard) werden für mobile Nutzer optimiert. Der Fokus liegt auf Touch-freundlichen Elementen, besseren Layouts für kleine Bildschirme und verbesserter Lesbarkeit.

---

## Detaillierte Änderungen

### 1. Teams-Seite (`/teams`)

**Aktuelle Probleme:**
- Button-Gruppen (Members, Settings, Open) können auf kleinen Bildschirmen überlaufen
- Team-Cards haben zu wenig vertikalen Abstand auf Mobile

**Optimierungen:**
- Team-Cards: Vollständig gestapeltes Layout auf Mobile (Buttons unter den Team-Infos)
- Buttons in voller Breite auf Mobile für bessere Touch-Ziele
- Größere Touch-Bereiche (min-height 44px für alle interaktiven Elemente)
- Team-Icon und Name links, Aktionen darunter in einer Reihe

### 2. TeamMembers-Seite (`/team/members`)

**Aktuelle Probleme:**
- Invite-Formular: Email-Input und Role-Select können auf kleinen Bildschirmen eng werden
- Mitglieder-Liste: Email kann abgeschnitten werden, Aktionen können überlaufen
- Role-Permissions-Grid braucht besseres Mobile-Layout

**Optimierungen:**
- Invite-Formular: Bereits `flex-col sm:flex-row` vorhanden - gut
- Mitglieder-Karten: Gestapeltes Layout auf Mobile
  - Avatar + Email oben
  - Role-Badge + Aktionen darunter
- Pending Invitations: Gleiches gestapeltes Muster
- Header mit Team-Name und Settings-Button besser stacken

### 3. TeamSettings-Seite (`/team/settings`)

**Aktuelle Probleme:**
- "Save"-Button neben Input kann eng werden
- AlertDialog für Team-Löschung braucht mobile-freundliche Buttons

**Optimierungen:**
- Team-Name Eingabe: Button unter dem Input auf Mobile statt daneben
- Delete-Dialog: Buttons gestapelt auf Mobile
- Zeichenzähler besser positioniert

### 4. TeamInvite-Seite (`/team/invite/:token`)

**Status:** Bereits gut optimiert - Card-basiertes zentriertes Layout funktioniert auf allen Bildschirmgrößen.

### 5. Profile-Seite (`/profile`)

**Aktuelle Probleme:**
- Team-Liste kann bei vielen Teams unübersichtlich werden
- Premium-Status-Box könnte besser strukturiert sein

**Optimierungen:**
- Team-Einträge: Kompakteres Layout auf Mobile
- "Manage"-Link größerer Touch-Bereich
- Premium-Status: Bessere vertikale Struktur auf Mobile

### 6. Dashboard-Seite (`/dashboard`)

**Status:** Bereits responsive mit `grid-cols-2 lg:grid-cols-4` und `md:grid-cols-2` - gut optimiert.

### 7. TeamSwitcher-Komponente

**Aktuelle Probleme:**
- Dropdown-Menü kann auf kleinen Bildschirmen eng werden
- "Manage"-Button-Overlay könnte schwer zu treffen sein

**Optimierungen:**
- Dropdown-Breite auf Mobile anpassen
- Manage-Button größerer Touch-Bereich
- Team-Namen mit besserer Truncation

### 8. Navbar Mobile-Menü

**Status:** Bereits gut implementiert mit funktionalem Mobile-Menü.

---

## Technische Implementierung

### Utility-Klassen-Muster
```text
- Stack auf Mobile: flex flex-col sm:flex-row
- Volle Breite auf Mobile: w-full sm:w-auto
- Touch-Ziele: min-h-[44px] für alle Buttons
- Padding für Touch: py-3 px-4 auf Mobile
```

### Betroffene Dateien
1. `src/pages/Teams.tsx` - Team-Card-Layout
2. `src/pages/TeamMembers.tsx` - Member-List und Invite-Form
3. `src/pages/TeamSettings.tsx` - Form-Layout
4. `src/pages/Profile.tsx` - Team-Liste und Premium-Box
5. `src/components/team/TeamSwitcher.tsx` - Dropdown-Optimierung

### Nicht betroffen (bereits optimiert)
- `src/pages/TeamInvite.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/Navbar.tsx`

---

## Zusammenfassung der Änderungen

| Seite | Hauptänderung |
|-------|---------------|
| Teams | Cards: Gestapeltes Layout, Buttons in voller Breite auf Mobile |
| TeamMembers | Mitglieder-Karten gestapelt, größere Touch-Ziele |
| TeamSettings | Form-Buttons gestapelt auf Mobile |
| Profile | Team-Liste kompakter, bessere Touch-Bereiche |
| TeamSwitcher | Größere Touch-Ziele, angepasste Dropdown-Breite |

---

## Erwartetes Ergebnis
- Alle Team-/Workspace-Seiten sind auf Smartphones (320px+) vollständig nutzbar
- Touch-Ziele mindestens 44x44px für bessere Bedienbarkeit
- Keine horizontalen Scrollbars oder abgeschnittenen Inhalte
- Konsistentes, professionelles Erscheinungsbild auf allen Gerätegrößen
