
# Team-Feature Überarbeitung: Vollständige Implementierung

## Status-Analyse: Was ist bereits vorhanden?

### ✅ Bereits implementiert:

| Komponente | Status | Beschreibung |
|------------|--------|--------------|
| Datenbank-Tabellen | ✅ | `teams`, `team_members`, `team_invitations` mit RLS-Policies |
| Edge Function | ✅ | `team-management` mit allen Aktionen (create, invite, accept, remove, update-role, transfer-ownership, delete, list) |
| TeamContext | ✅ | Kontextprovider für Team-State |
| TeamSwitcher | ✅ | Dropdown in Navbar zum Wechseln zwischen Personal/Team |
| CreateTeamDialog | ✅ | Dialog zur Team-Erstellung (nur Premium) |
| TeamMembers-Seite | ✅ | `/team/members` mit Einladungs-Formular und Mitgliederliste |
| TeamInvite-Seite | ✅ | `/team/invite/:token` zum Annehmen von Einladungen |
| E-Mail-Einladungen | ✅ | Via Resend mit Rate-Limiting (10/Team/Tag, 3/E-Mail global) |
| Account-Löschung-Check | ✅ | Ownership-Transfer erforderlich vor Löschung |
| ValidationPlatform Integration | ✅ | Team-History laden wenn im Team-Modus |

---

## 🚨 Identifizierte Probleme & Lücken

### 1. **Zugang zur Team-Mitgliederverwaltung nicht sichtbar**
- Der Link zu `/team/members` ist nur im TeamSwitcher sichtbar, wenn man bereits ein Team ausgewählt hat
- **Problem:** Neue Premium-User wissen nicht, wo sie ihr Team verwalten können
- **Lösung:** Direkten Link im TeamSwitcher-Dropdown hinzufügen für jedes Team

### 2. **Fehlende Team-Settings-Seite**
- Es gibt keine dedizierte Seite für Team-Einstellungen
- **Fehlende Features:**
  - Ownership-Transfer UI
  - Team löschen
  - Team umbenennen
- **Lösung:** Neue `/team/settings` Seite erstellen

### 3. **Rollen nicht klar erklärt für User**
- In `TeamMembers.tsx` werden Rollen als Badges angezeigt, aber es gibt keine Erklärung was jede Rolle bedeutet
- **Lösung:** Tooltip oder Info-Section mit Rollen-Beschreibungen hinzufügen

### 4. **Team-Modus nicht klar kommuniziert in der UI**
- Wenn man im Team-Modus ist, sieht man die Team-History, aber es gibt keinen klaren visuellen Hinweis
- **Lösung:** Banner/Indicator in ValidationPlatform zeigen wenn Team-Modus aktiv

### 5. **Analysen werden nicht mit team_id gespeichert**
- Die `multi-ai-query` Edge Function speichert keine `team_id` 
- **Problem:** Neue Analysen im Team-Modus werden nicht dem Team zugeordnet
- **Lösung:** `team_id` Parameter zur Validation-Funktion hinzufügen

### 6. **Einladungs-Workflow nach Login unvollständig**
- Token wird in `sessionStorage` gespeichert, aber nach Login nicht automatisch verarbeitet
- **Lösung:** Auth-Callback prüft und verarbeitet pending invites

---

## Implementierungsplan

### Phase 1: UI-Verbesserungen für TeamSwitcher

**Änderungen in `src/components/team/TeamSwitcher.tsx`:**

1. Für jedes Team einen "Manage"-Link hinzufügen
2. Klare visuelle Unterscheidung zwischen Personal und Team

```text
┌──────────────────────────────┐
│  👤 Personal Workspace    ✓  │
├──────────────────────────────┤
│  Teams                       │
│  ┌────────────────────────┐  │
│  │ 🏢 Acme Corp           │  │
│  │    Member · Manage →   │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 🏢 Startup Team     ✓  │  │
│  │    Owner · Manage →    │  │
│  └────────────────────────┘  │
├──────────────────────────────┤
│  ➕ Create Team              │
└──────────────────────────────┘
```

---

### Phase 2: Neue Team-Settings-Seite

**Neue Datei: `src/pages/TeamSettings.tsx`**

Features:
- Team umbenennen (nur Owner/Admin)
- Ownership übertragen (nur Owner)
- Team löschen (nur Owner, mit Bestätigung)
- Link zurück zu Team-Members

**Neue Route in App.tsx:**
```typescript
<Route path="/team/settings" element={<TeamSettings />} />
```

---

### Phase 3: Rollen-Dokumentation

**Erweiterung von `TeamMembers.tsx`:**

Neue Info-Card mit Rollen-Übersicht:

| Rolle | Beschreibung |
|-------|--------------|
| **Owner** | Vollzugriff, kann Team löschen und Ownership übertragen |
| **Admin** | Kann Mitglieder einladen/entfernen, Rollen ändern |
| **Member** | Kann Analysen im Team-Kontext speichern und sehen |
| **Viewer** | Kann nur Team-Analysen ansehen, keine eigenen erstellen |

---

### Phase 4: Team-Modus-Indicator in ValidationPlatform

**Änderung in `src/pages/ValidationPlatform.tsx`:**

Wenn `isInTeamMode === true`, zeige Banner:

```text
┌──────────────────────────────────────────────────┐
│  🏢 Team: Acme Corp                              │
│  Analyses saved here are visible to all members  │
│  [Switch to Personal]                            │
└──────────────────────────────────────────────────┘
```

---

### Phase 5: Analysen mit team_id speichern

**Änderungen in `src/hooks/useMultiAIValidation.ts`:**

1. `team_id` als optionalen Parameter akzeptieren
2. An `multi-ai-query` Edge Function weiterleiten

**Änderungen in `supabase/functions/multi-ai-query/index.ts`:**

1. `team_id` aus Body lesen
2. Beim INSERT in `validation_analyses` setzen:
```typescript
await supabase.from('validation_analyses').insert({
  // ... bestehende Felder
  team_id: teamId || null,
});
```

---

### Phase 6: Einladungs-Workflow vervollständigen

**Änderung in `src/pages/AuthCallback.tsx`:**

Nach erfolgreichem Login prüfen:
```typescript
const pendingInvite = sessionStorage.getItem("pending_team_invite");
if (pendingInvite) {
  sessionStorage.removeItem("pending_team_invite");
  navigate(`/team/invite/${pendingInvite}`);
  return;
}
```

---

## Technische Details

### Neue Dateien:
- `src/pages/TeamSettings.tsx` - Team-Einstellungen (umbenennen, löschen, Transfer)

### Zu bearbeitende Dateien:
- `src/components/team/TeamSwitcher.tsx` - "Manage"-Links hinzufügen
- `src/pages/TeamMembers.tsx` - Rollen-Info-Section hinzufügen
- `src/pages/ValidationPlatform.tsx` - Team-Modus-Banner + team_id beim Validieren senden
- `src/hooks/useMultiAIValidation.ts` - team_id Parameter hinzufügen
- `supabase/functions/multi-ai-query/index.ts` - team_id speichern
- `src/pages/AuthCallback.tsx` - Pending invite nach Login verarbeiten
- `src/App.tsx` - Neue Route `/team/settings`

### Sicherheits-Aspekte (bereits vorhanden):
- ✅ Rate-Limiting für Einladungen (10/Team/Tag, 3/E-Mail global)
- ✅ Nur Premium-User können Teams erstellen
- ✅ RLS-Policies für alle Team-Tabellen
- ✅ Ownership-Transfer erforderlich vor Account-Löschung
- ✅ E-Mail-Mismatch-Prüfung bei Einladungsannahme

### E-Mail-Versand (Resend):
- ✅ Bereits konfiguriert und funktional
- Domain: `noreply@wealthconomy.com`
- Template: Professionelles HTML-Design mit Einladungslink

---

## Zeitaufwand: ~3-4 Arbeitstage

| Phase | Aufwand | Beschreibung |
|-------|---------|--------------|
| 1 | 0.5 Tage | TeamSwitcher UI-Verbesserungen |
| 2 | 1 Tag | Team-Settings-Seite erstellen |
| 3 | 0.5 Tage | Rollen-Dokumentation in UI |
| 4 | 0.5 Tage | Team-Modus-Indicator |
| 5 | 1 Tag | team_id in Analysen speichern |
| 6 | 0.5 Tage | Einladungs-Workflow vervollständigen |

---

## Zusammenfassung

Die Grundfunktionalität ist bereits **vollständig implementiert**:
- Teams erstellen ✅
- Mitglieder einladen (mit E-Mail) ✅
- Einladungen annehmen ✅
- Rollen verwalten ✅
- Team wechseln ✅
- Rate-Limiting ✅

Was fehlt sind **UX-Verbesserungen und Vervollständigungen**:
1. Bessere Navigation zu Team-Management
2. Team-Settings-Seite (umbenennen, löschen, Transfer)
3. Rollen-Erklärungen in der UI
4. Visueller Hinweis wenn im Team-Modus
5. Analysen werden dem Team zugeordnet
6. Einladungen nach Login automatisch verarbeiten
