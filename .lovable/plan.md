
# Fix: sessionStorage zu localStorage migrieren

## Problem

Wenn ein nicht-registrierter User eine Team-Einladung erhält:
1. User klickt auf Einladungslink → Token wird in `sessionStorage` gespeichert
2. User klickt "Sign In to Accept" → wird zu `/auth` weitergeleitet
3. User registriert sich → erhält Bestätigungs-Email
4. User klickt Email-Link → **öffnet neuen Tab**
5. `sessionStorage` ist tab-spezifisch → **Token verloren**
6. User landet auf Dashboard statt auf der Einladungsseite

## Lösung

`sessionStorage` durch `localStorage` ersetzen - dieser ist tab-übergreifend persistent.

## Änderungen

### 1. TeamInvite.tsx - Token speichern

**Zeile 121:**

```typescript
// Vorher:
sessionStorage.setItem("pending_team_invite", token || "");

// Nachher:
localStorage.setItem("pending_team_invite", token || "");
```

---

### 2. AuthCallback.tsx - Token lesen und löschen

**Zeilen 94-96:**

```typescript
// Vorher:
const pendingInviteToken = sessionStorage.getItem('pending_team_invite');
if (pendingInviteToken) {
  sessionStorage.removeItem('pending_team_invite');

// Nachher:
const pendingInviteToken = localStorage.getItem('pending_team_invite');
if (pendingInviteToken) {
  localStorage.removeItem('pending_team_invite');
```

---

## Zusammenfassung

| Datei | Zeile | Änderung |
|-------|-------|----------|
| `TeamInvite.tsx` | 121 | `sessionStorage` → `localStorage` |
| `AuthCallback.tsx` | 94 | `sessionStorage.getItem` → `localStorage.getItem` |
| `AuthCallback.tsx` | 96 | `sessionStorage.removeItem` → `localStorage.removeItem` |

---

## Ergebnis

Nach dieser Änderung:
- User klickt Einladungslink → Token in `localStorage` gespeichert
- User registriert sich und bestätigt Email (egal welcher Tab)
- AuthCallback findet Token in `localStorage`
- User wird zur Einladungsseite weitergeleitet
- Token wird gelöscht

Der Token bleibt 7 Tage gültig (laut `team_invitations` Tabelle), was mit `localStorage` Persistenz übereinstimmt.
