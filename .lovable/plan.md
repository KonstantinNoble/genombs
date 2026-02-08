

# Inhaltliche Reste in bestehenden Dateien bereinigen

## Problem
Alle Feature-spezifischen Dateien (Seiten, Komponenten, Hooks) wurden erfolgreich geloescht. Allerdings enthalten vier verbleibende Dateien noch Referenzen auf die alten Features (Multi-AI Validation, Teams, Experiments, Dashboard).

---

## Aenderungen

### 1. `src/pages/Auth.tsx` -- Alte Feature-Referenzen entfernen
**Zeilen 238-248:** Die Funktion `getIntentMessage()` enthaelt noch:
- "Sign in to start your free AI analysis" (intent === 'free')
- "Sign in to accept your team invitation" (returnTo mit team/invite)
- "Access your AI-powered business insights" (Fallback)

**Aenderung:** Generische Texte verwenden:
- intent === 'free': "Sign in to get started"
- Team-Invite-Check komplett entfernen (Teams gibt es nicht mehr)
- Fallback: "Sign in to access your account"

### 2. `src/pages/PrivacyPolicy.tsx` -- Feature-Sektionen entfernen
Diese Datei hat 1618 Zeilen und enthaelt umfangreiche Sektionen ueber:
- "Multi-AI Validation Platform" (Sektion 5)
- "Validation Limits and Usage Tracking" (Sektion 5.2)
- "Validation History" (Sektion 5.3)
- Team Workspaces, Experiments, Decision Records

**Aenderung:**
- Sektion 5 (Multi-AI Validation Platform) komplett entfernen oder durch einen generischen Platzhalter ersetzen ("Our services are currently being updated")
- Alle Referenzen auf "validation analyses", "experiments", "teams" aus den uebrigen Sektionen (z.B. Account-Loeschung) entfernen
- Einleitung aktualisieren: "Multi-AI Validation Platform" durch generischen Plattform-Namen ersetzen

### 3. `src/pages/TermsOfService.tsx` -- Feature-Sektionen entfernen
Diese Datei hat 813 Zeilen und enthaelt:
- "Team Workspaces (Premium Feature)" (Sektion III.D)
- Referenzen auf "validation analyses", "experiments", "dashboard"
- Spezifische Feature-Beschreibungen und Limits

**Aenderung:**
- Sektion III.D (Team Workspaces) komplett entfernen
- Referenzen auf "dashboard", "validation", "experiments" durch generische Begriffe ersetzen
- Feature-Listen aktualisieren auf generische Premium-Beschreibung

### 4. `src/pages/Index.tsx` -- Ungenutzte Datei loeschen
Diese Seite wird nirgendwo in den Routes referenziert und ist nur ein Fallback-Platzhalter. Sie kann sicher entfernt werden, da `Home.tsx` bereits als `/` Route dient.

---

## Reihenfolge
1. `Auth.tsx` bereinigen (kleine Aenderung)
2. `Index.tsx` loeschen (nicht verwendet)
3. `PrivacyPolicy.tsx` bereinigen (grosse inhaltliche Aenderung)
4. `TermsOfService.tsx` bereinigen (grosse inhaltliche Aenderung)

## Technische Details

### Auth.tsx - getIntentMessage()
```text
Vorher:
  if (intent === 'free') return 'Sign in to start your free AI analysis';
  if (returnTo?.includes('/team/invite/')) return 'Sign in to accept your team invitation';
  return 'Access your AI-powered business insights';

Nachher:
  if (intent === 'free') return 'Sign in to get started';
  return 'Sign in to access your account';
```

### PrivacyPolicy.tsx
- Sektion 1: "Multi-AI Validation Platform" aus Einleitung entfernen
- Sektion 4 (Account-Loeschung): "validation analyses, experiments, tasks, and checkpoints" durch "associated data" ersetzen
- Sektion 5 (Multi-AI Validation Platform): Komplett entfernen (ca. 200+ Zeilen) und durch kurzen Platzhalter ersetzen
- Nachfolgende Sektionen: Nummerierung anpassen

### TermsOfService.tsx
- Sektion III.D (Team Workspaces): Komplett entfernen (ca. 50 Zeilen)
- "dashboard" Referenzen durch "account" ersetzen
- "validation analyses, experiments" durch "data" oder "content" ersetzen
- Nachfolgende Sektionen: Nummerierung pruefen

