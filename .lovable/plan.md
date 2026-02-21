

# Datenschutzerklaerung: Gamification-Daten ergaenzen

## Ausgangslage
Die Gamification-Funktionen (Streaks, Badges, Analytics Overview) speichern personenbezogene Daten in den Tabellen `user_badges` und `user_streaks`. Diese Daten sind in der aktuellen Datenschutzerklaerung (v8.1) **nicht erwaehnt**.

Die **technische Loeschung ist korrekt** implementiert -- beide Tabellen werden bei Account-Loeschung kaskadierend entfernt.

## Was wird ergaenzt

### 1. Neue Sektion "Gamification and Activity Tracking" (nach Sektion 8.3)
Beschreibung der erhobenen Daten:
- Streak-Daten: aktuelle Serie, laengste Serie, letzter aktiver Tag, Gesamtanzahl aktiver Tage
- Badge-Daten: freigeschaltete Abzeichen mit Zeitstempel
- Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsdurchfuehrung -- Teil des Dienstes)

### 2. Eintrag in Datenkategorien-Tabelle (Sektion 13)
Neue Zeile:
| Gamification Data | Activity streaks, unlocked badges, active day counts | User engagement tracking and achievement system |

### 3. Eintrag in Storage-Duration-Tabelle (Sektion 17)
Neue Zeile:
| Gamification data | Until account deletion | User-initiated deletion |

### 4. Versionsnummer aktualisieren
- Version 8.1 auf **Version 8.2** erhoehen
- Datum auf **February 21, 2026** setzen
- Changelog-Eintrag: "Added Gamification and Activity Tracking section (streaks, badges). Updated data categories and retention tables."

## Technische Details

**Datei:** `src/pages/PrivacyPolicy.tsx`

Aenderungen an 4 Stellen:
1. **Zeile 17**: Version und Datum aktualisieren
2. **Nach Sektion 8.3**: Neue Sektion 8.4 einfuegen mit Beschreibung der Gamification-Daten
3. **Sektion 13 Tabelle** (ca. Zeile 964): Neue Tabellenzeile fuer "Gamification Data"
4. **Sektion 17 Tabelle** (ca. Zeile 1140): Neue Tabellenzeile fuer Gamification Retention
5. **Changelog** (ca. Zeile 1268): Neuen Eintrag fuer Version 8.2

Keine weiteren Dateien betroffen. Die technische Implementierung (Loeschkaskade, RLS, Datenspeicherung) ist bereits korrekt.
