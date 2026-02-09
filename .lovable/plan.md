
# Battle Cards + Win/Loss Tracking fuer Competitor Analysis

## Uebersicht

Zwei neue Features die die Competitor Analysis Seite von einer reinen Analyse zu einem aktiven Sales- und Strategy-Tool machen. Beide werden als neue Tabs auf der bestehenden `/competitor-analysis` Seite integriert.

```text
Aktuelle Seite:
  [URL-Eingabe + Demo-Report (alles auf einer Seite)]

Neue Seite mit Tabs:
  [Analysis]  [Battle Cards]  [Win/Loss]
```

---

## Feature 1: AI-generierte Battle Cards

### Was sind Battle Cards?

Battle Cards sind kompakte "Spickzettel" fuer Verkaufsgespraeche. Wenn ein Kunde sagt "Warum soll ich euch nehmen statt PayPal?", hat der User sofort die passenden Argumente parat.

### User Flow

```text
1. User fuehrt Competitor-Analyse durch (oder nutzt Demo)
2. Klickt auf Tab "Battle Cards"
3. Sieht pro Wettbewerber eine fertige Battle Card mit:
   - "How We Win" -- 3-4 Argumente warum man besser ist
   - "Their Pitch" -- Was der Wettbewerber typischerweise sagt
   - "Counter Arguments" -- Wie man auf deren Staerken reagiert
   - "Trigger Phrases" -- Saetze die der User im Gespraech nutzen kann
   - "When We Lose" -- Ehrliche Einschaetzung wann der Wettbewerber gewinnt
4. Cards sind exportierbar (Copy-to-Clipboard pro Card)
```

### Inhalt pro Battle Card

Jede Card hat 5 Abschnitte:

**How We Win (3-4 Punkte)**
Konkrete Vorteile gegenueber diesem spezifischen Wettbewerber. Nicht generisch, sondern auf Basis der SWOT-Analyse und Score-Vergleiche abgeleitet.

**Their Pitch (2-3 Punkte)**
Was dieser Wettbewerber typischerweise als Argument bringt. Damit ist der User vorbereitet.

**Counter Arguments (2-3 Punkte)**
Direkte Antworten auf die Staerken des Wettbewerbers. Format: "Wenn sie sagen X, antworte mit Y".

**Trigger Phrases (2-3 Saetze)**
Fertige Saetze die der User copy-pasten oder im Gespraech nutzen kann. Z.B. "Unlike [Competitor], we offer X which means Y for your team."

**When We Lose (1-2 Punkte)**
Ehrliche Einschaetzung: In welchen Situationen ist der Wettbewerber tatsaechlich die bessere Wahl? Das schafft Vertrauen und hilft dem User, seine Zeit auf die richtigen Deals zu fokussieren.

### Premium-Gating

- Komplett Premium-gated (PremiumLock um den gesamten Tab-Inhalt)
- Free User sieht den Tab, klickt drauf, sieht eine geblurrte Vorschau mit Upgrade-CTA

---

## Feature 2: Win/Loss Tracking

### Konzept

Der User kann gewonnene und verlorene Deals gegen Wettbewerber erfassen. Ueber Zeit entsteht ein Muster-Dashboard das zeigt: Gegen wen gewinnt man? Warum verliert man? Wo sollte man investieren?

### User Flow

```text
1. User navigiert zum "Win/Loss" Tab
2. Sieht Dashboard mit aktuellen Statistiken
3. Klickt "Log Deal" -- Sheet oeffnet sich von rechts
4. Fuellt aus: Deal-Name, Won/Lost, Wettbewerber, Grund, optionaler Wert + Notizen
5. Deal wird gespeichert und Dashboard aktualisiert
6. Ueber Zeit erkennt der User Muster (z.B. "Gegen PayPal verlieren wir meistens wegen Preis")
```

### Dashboard-Bereich

**Zusammenfassungs-Karten (oben)**
- Win Rate als grosse Zahl (z.B. "68%")
- Total Deals (z.B. "18 Deals logged")
- Total Won / Total Lost
- Gesamt-Dealwert (wenn erfasst)

**Win/Loss nach Wettbewerber (horizontale Balken)**
```text
vs PayPal:   ████████░░░░  5W / 3L  (63%)
vs Square:   ██████████░░  7W / 2L  (78%)
vs Adyen:    ████░░░░░░░░  2W / 4L  (33%)
```

**Haeufigste Gruende (zwei Spalten)**
- Top Win-Gruende: Sortierte Liste der meistgenannten Gewinn-Gruende
- Top Loss-Gruende: Sortierte Liste der meistgenannten Verlust-Gruende

**Deal-Historie Tabelle**
- Alle Deals sortiert nach Datum
- Spalten: Datum, Deal-Name, Ergebnis (Won/Lost Badge), Wettbewerber, Grund, Wert
- Filterbar nach Won/Lost und nach Wettbewerber

### Deal-Erfassungs-Formular (Sheet von rechts)

Felder:
- Deal Name (Pflicht, z.B. "Enterprise Kunde ABC")
- Ergebnis: Won / Lost (Toggle-Buttons)
- Wettbewerber (Dropdown mit Freitextoption)
- Hauptgrund (Auswahlliste, je nach Won/Lost unterschiedlich):
  - Won-Gruende: "Better product fit", "Price advantage", "Stronger relationship", "Technical superiority", "Better support", "Other"
  - Lost-Gruende: "Price too high", "Missing feature", "Competitor relationship", "Slow sales process", "Technical limitations", "Other"
- Deal-Wert (optional, Zahl)
- Notizen (optional, Freitext)
- Datum (Date-Picker, Standard: heute)

### Premium-Gating

- Komplett Premium-gated (PremiumLock um den gesamten Tab-Inhalt)
- Demo-Daten werden im geblurrten Zustand angezeigt, damit der Free-User sieht was moeglich waere

### Daten-Handling

Aktuell nur mit Demo-Daten und lokalem State (useState). In Zukunft kann dies an die Datenbank angebunden werden. Neue Deals werden zur lokalen Liste hinzugefuegt und das Dashboard berechnet sich daraus.

---

## Technische Umsetzung

### Neue Dateien

**`src/lib/demo-battlecard-data.ts`**
- Interface `BattleCard`: `{ competitor: string; domain: string; howWeWin: string[]; theirPitch: string[]; counterArguments: string[]; triggerPhrases: string[]; whenWeLose: string[] }`
- Demo-Daten: 3 Battle Cards fuer Stripe vs PayPal, Square, Adyen (abgeleitet aus den bestehenden SWOT-Daten)

**`src/lib/demo-winloss-data.ts`**
- Interface `Deal`: `{ id: string; name: string; outcome: "won" | "lost"; competitor: string; value?: number; reason: string; notes?: string; date: string }`
- `winReasonOptions` und `lossReasonOptions` als vordefinierte Auswahllisten
- Demo-Daten: 18 Deals ueber 6 Monate verteilt

**`src/components/genome/BattleCardView.tsx`**
- Rendert alle Battle Cards in einer Liste
- Pro Card eine GenomeCard mit den 5 Abschnitten
- Copy-to-Clipboard Button pro Card (kopiert den Text als formatierten String)
- Abschnitte nutzen `border-l-2` Markierungen:
  - How We Win: `border-chart-4` (gruen)
  - Their Pitch: `border-muted-foreground`
  - Counter Arguments: `border-primary` (orange)
  - Trigger Phrases: `border-primary` mit `font-mono bg-muted/50` Styling
  - When We Lose: `border-destructive` (rot)

**`src/components/genome/WinLossChart.tsx`**
- Dashboard-Bereich: Summary Cards + horizontale Balken pro Wettbewerber + Gruende-Listen
- Nutzt Recharts BarChart fuer die horizontalen Win/Loss Balken
- Win-Farbe: `bg-chart-4` / Recharts `hsl(142, 71%, 45%)`
- Loss-Farbe: `bg-destructive` / Recharts `hsl(0, 84%, 60%)`

**`src/components/genome/DealForm.tsx`**
- Sheet-Komponente (von rechts) mit React Hook Form
- Conditional: Won zeigt winReasonOptions, Lost zeigt lossReasonOptions
- Zod-Validierung fuer Pflichtfelder
- onSubmit Callback der den neuen Deal zurueckgibt

**`src/components/genome/DealHistoryTable.tsx`**
- Tabelle mit Sortierung nach Datum
- Filter-Dropdown fuer Won/Lost und Wettbewerber
- Won = gruener Badge, Lost = roter Badge
- Wert wird als formatierte Zahl angezeigt

### Geaenderte Dateien

**`src/pages/CompetitorAnalysis.tsx`**
- Umstrukturierung zu 3 Tabs: "Analysis", "Battle Cards", "Win/Loss"
- Tab "Analysis" = bisheriger Seiteninhalt (URL-Eingabe + Demo-Report)
- Tab "Battle Cards" = BattleCardView, umgeben von PremiumLock
- Tab "Win/Loss" = WinLossChart + DealForm + DealHistoryTable, umgeben von PremiumLock
- Lokaler State fuer Deals (useState, initialisiert mit Demo-Daten)
- "Log Deal" Button oeffnet DealForm Sheet

### Design-Regeln

- Keine neuen Icons oder Emojis
- Schwarz-Orange Farbschema beibehalten
- Alle neuen Abschnitte nutzen GenomeCard als Container
- Typographie: `text-[10px] uppercase tracking-wide` fuer Labels
- Nummerierte Listen fuer Argumente, `font-mono` fuer Trigger Phrases
- Tabs nutzen die bestehende `Tabs/TabsList/TabsTrigger` UI-Komponente

### Reihenfolge

1. Demo-Daten erstellen (Battle Cards + Win/Loss)
2. BattleCardView Komponente
3. WinLossChart + DealForm + DealHistoryTable Komponenten
4. CompetitorAnalysis.tsx zu Tabs umbauen und alles integrieren
5. PremiumLock auf Battle Cards und Win/Loss Tabs anwenden
