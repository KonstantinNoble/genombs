
# Loesung: Team-Analyse Premium-Status Handling

## Problem

Wenn ein Premium-User eine Analyse eines Free-Users im Team-Workspace anklickt:
- Wird "Upgrade to Premium" angezeigt (obwohl der User bereits Premium ist)
- Klick auf "Upgrade" fuehrt zur Pricing-Seite (verwirrend)

**Ursache:** Die Analyse speichert `is_premium: false` (Status des Erstellers). Beim Anzeigen wird dieser Wert verwendet, nicht der Status des Betrachters.

---

## Loesung

Unterscheidung zwischen zwei Szenarien:

| Betrachter | Analyse-Ersteller | Ergebnis |
|------------|-------------------|----------|
| Free | Free | "Upgrade to Premium" Button (aktuelles Verhalten) |
| Free | Premium | Premium-Inhalte sichtbar (funktioniert bereits) |
| Premium | Premium | Premium-Inhalte sichtbar (funktioniert bereits) |
| Premium | Free | **NEU:** Info-Meldung "Dein Teammitglied ist kein Premium-User" |

---

## Technische Umsetzung

### 1. Neue Komponente: `TeammatePremiumNotice.tsx`

Erstellt eine Info-Box die erklaert, warum Premium-Funktionen fehlen:

```text
Datei: src/components/validation/TeammatePremiumNotice.tsx

Inhalt:
- Alert-Box mit Info-Icon
- Titel: "Created by Free User"
- Text erklaert, dass der Ersteller kein Premium hat
- Keine Upgrade-Buttons (da der Betrachter bereits Premium ist)
```

### 2. Aenderungen in `ValidationOutput.tsx`

Neue Props hinzufuegen:
- `viewerIsPremium` - Premium-Status des Betrachters
- `isTeamAnalysis` - Ob die Analyse aus einem Team stammt

Logik aendern:
- Wenn `viewerIsPremium` UND `!isPremium` (Analyse) UND `isTeamAnalysis`:
  - Zeige `TeammatePremiumNotice` statt Premium-Inhalte
  - PDFExportButton und DecisionConfirmation sind nicht verfuegbar (aber keine Upgrade-Meldung)

### 3. Aenderungen in `PDFExportButton.tsx`

Neue Props:
- `viewerIsPremium`
- `isTeamAnalysis`

Angepasste Logik:
```text
Wenn isPremium = false (Analyse ist von Free User):
  Wenn viewerIsPremium UND isTeamAnalysis:
    -> Tooltip: "PDF nicht verfuegbar - Ersteller ist kein Premium-User"
    -> KEIN Link zur Pricing-Seite
  Sonst (normaler Free-User):
    -> Bestehendes Verhalten (Upgrade-Link)
```

### 4. Aenderungen in `ValidationPlatform.tsx`

`handleHistoryClick` anpassen:
- Speichern ob Analyse aus Team stammt: `setIsTeamAnalysis(!!item.team_id)`
- Props an `ValidationOutput` weitergeben:
  - `viewerIsPremium={isPremium}` (Status des eingeloggten Users)
  - `isTeamAnalysis={isTeamAnalysis}`

Upgrade-Banner in Zeilen 562-572:
- Keine Aenderung noetig (zeigt nur fuer den aktuellen User-Status)

---

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/validation/TeammatePremiumNotice.tsx` | Neu erstellt |
| `src/components/validation/ValidationOutput.tsx` | Neue Props, Logik fuer Team-Analyse |
| `src/components/validation/PDFExportButton.tsx` | Neue Props, angepasste Meldung |
| `src/pages/ValidationPlatform.tsx` | State fuer Team-Analyse, Props weitergeben |

---

## Vorteile

- Premium-User sehen keine verwirrenden "Upgrade"-Meldungen
- Klare Kommunikation warum Premium-Features fehlen
- Free-User behalten den Upgrade-Pfad
- Konsistentes Erlebnis im Team-Kontext
