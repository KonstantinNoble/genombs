
# Hero "Try It Free" Button - Direkte Weiterleitung zur Auth-Seite

## Problem

Wenn ein nicht-eingeloggter Benutzer auf "Try It Free" klickt, wird er zur `/validate` Seite weitergeleitet. Diese Seite zeigt jedoch für nicht-eingeloggte Benutzer die Pricing-Komponente an – was potenzielle Nutzer einschüchtern kann, bevor sie das Produkt überhaupt ausprobiert haben.

## Lösung

Den "Try It Free" Button so anpassen, dass nicht-eingeloggte Benutzer direkt zur `/auth` Seite weitergeleitet werden. Nach der Anmeldung/Registrierung werden sie dann automatisch zur `/validate` Seite weitergeleitet (das funktioniert bereits laut den Memory-Einträgen).

## Änderungen

### Datei: `src/components/home/Hero.tsx`

**Aktuelle Logik (Zeile 103):**
```tsx
<Link to="/validate" className="flex items-center gap-2">
  {isPremium && user ? "Back to Your Analyses" : "Try It Free"}
</Link>
```

**Neue Logik:**
```tsx
<Link to={user ? "/validate" : "/auth"} className="flex items-center gap-2">
  {isPremium && user ? "Back to Your Analyses" : "Try It Free"}
</Link>
```

## Verhalten nach der Änderung

| Benutzer-Status | Button-Text | Ziel |
|-----------------|-------------|------|
| Eingeloggt + Premium | "Back to Your Analyses" | `/validate` |
| Eingeloggt + Free | "Try It Free" | `/validate` |
| Nicht eingeloggt | "Try It Free" | `/auth` |

## Vorteile

- Benutzer sehen zuerst das einfache Auth-Formular, nicht die Pricing-Tabelle
- Nach der Registrierung landen sie direkt auf der Plattform
- Reduziert die Hürde für neue Nutzer
- Nutzt den bestehenden Auth-Flow (OAuth + Email) optimal aus
