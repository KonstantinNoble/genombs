
# Hintergrundbild auf allen Seiten sichtbar machen

## Problem
Der `BackgroundWrapper` in `App.tsx` zeigt das Wellenbild zwar global an, aber fast jede Seite hat ein eigenes `bg-background` (= undurchsichtiges Schwarz), das das Bild komplett verdeckt. Nur die Homepage funktioniert, weil dort der oberste Container keinen eigenen Hintergrund hat.

## Loesung
Alle Seiten-Container von `bg-background` auf `bg-transparent` umstellen. Fuer die Homepage bleibt die aktuelle Staerke (opacity-40), auf allen anderen Seiten wird das Bild etwas dezenter.

### Ansatz: Seitenspezifische Opazitaet
Da `BackgroundWrapper` global ist und nicht wissen kann, welche Seite gerade aktiv ist, wird stattdessen auf den Nicht-Homepage-Seiten ein halbtransparentes Overlay ergaenzt, das den Effekt daempft. Das heisst:
- Homepage: Wellen mit voller Staerke (opacity-40)
- Alle anderen Seiten: Die Seiten-Container bekommen `bg-background/80` statt `bg-background`, sodass das Bild dezent durchscheint

## Aenderungen

### Seiten mit `bg-background` -> `bg-background/80` (dezent durchscheinend)

| Datei | Zeile(n) | Aenderung |
|---|---|---|
| `src/pages/Pricing.tsx` | Z.21, Z.90 | `bg-background` -> `bg-background/80` |
| `src/pages/HowItWorks.tsx` | Z.114 | `bg-background` -> `bg-background/80` |
| `src/pages/Contact.tsx` | Container | `bg-background` -> `bg-background/80` (pruefen) |
| `src/pages/Imprint.tsx` | Z.7 | `bg-background` -> `bg-background/80` |
| `src/pages/PrivacyPolicy.tsx` | Z.7 | `bg-background` -> `bg-background/80` |
| `src/pages/TermsOfService.tsx` | Z.6 | `bg-background` -> `bg-background/80` |
| `src/pages/Achievements.tsx` | Z.91 | `bg-background` -> `bg-background/80` |
| `src/pages/Profile.tsx` | Z.135 | `bg-background` -> `bg-background/80` |
| `src/pages/Chat.tsx` | Z.213, Z.221, Z.444 | `bg-background` -> `bg-background/80` |
| `src/pages/AuthCallback.tsx` | Z.126 | `bg-background` -> `bg-background/80` |

### Seiten die bereits transparent/halbtransparent sind (keine Aenderung noetig)

| Datei | Aktueller Wert |
|---|---|
| `src/pages/Auth.tsx` | `bg-background/80` (passt bereits) |
| `src/pages/ResetPassword.tsx` | `bg-background/80` (passt bereits) |
| `src/pages/UpdatePassword.tsx` | `bg-background/80` (Hauptcontainer, passt) + Loading-State -> auch `bg-background/80` |

### Ergebnis
- Homepage: Wellen wie bisher (opacity-40, blur-lg)
- Alle anderen Seiten: Wellen scheinen sanft durch (20% sichtbar, da 80% vom Seitenhintergrund ueberlagert)
- Kein Layout-Bruch, da nur die Hintergrundfarbe transparent wird

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/pages/Pricing.tsx` | `bg-background` -> `bg-background/80` |
| `src/pages/HowItWorks.tsx` | `bg-background` -> `bg-background/80` |
| `src/pages/Imprint.tsx` | `bg-background` -> `bg-background/80` |
| `src/pages/PrivacyPolicy.tsx` | `bg-background` -> `bg-background/80` |
| `src/pages/TermsOfService.tsx` | `bg-background` -> `bg-background/80` |
| `src/pages/Achievements.tsx` | `bg-background` -> `bg-background/80` |
| `src/pages/Profile.tsx` | `bg-background` -> `bg-background/80` |
| `src/pages/Chat.tsx` | `bg-background` -> `bg-background/80` |
| `src/pages/AuthCallback.tsx` | `bg-background` -> `bg-background/80` |
| `src/pages/UpdatePassword.tsx` | Loading-State `bg-background` -> `bg-background/80` |
| `src/pages/Contact.tsx` | Pruefen und ggf. anpassen |
