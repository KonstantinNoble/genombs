

# Frontend-Only: Chat-Seite und Dashboard-Seite (ohne Backend)

Ziel: Die zwei neuen Seiten als UI-Struktur aufbauen, damit du das Layout und die Interaktionen sehen kannst. Alles arbeitet mit Mock-Daten -- kein Backend noetig.

---

## Neue Dateien

### 1. Chat-Seite: `src/pages/Chat.tsx`
- Layout: Linke Sidebar mit Conversation-Liste + "Neue Conversation" Button
- Hauptbereich: Chat-Verlauf mit abwechselnden User/Assistant-Blasen (Markdown-Rendering via `react-markdown`)
- Eingabefeld unten mit Send-Button
- URL-Erkennung: Wenn eine URL im Text erkannt wird, zeigt der Chat eine kleine "Website analysieren?" Karte
- Mock-Daten: 2-3 Beispiel-Conversations mit Nachrichten
- Responsive: Sidebar auf Mobile als ausklappbares Panel

### 2. Dashboard-Seite: `src/pages/Dashboard.tsx`
- Oberer Bereich: Karten fuer analysierte Websites (eigene = hervorgehoben, Konkurrenz = normal)
- Vergleichstabelle: Feste Kriterien (Zielgruppe, USP, CTA, Staerken, Schwaechen) mit Spalten pro Website
- Aufgaben-Board: Liste der Verbesserungsaufgaben mit Status-Badges (todo/in_progress/done) und Klick zum Status-Wechsel
- Mock-Daten: 2-3 Beispiel-Websites und 4-5 Beispiel-Aufgaben

### 3. Chat-Komponenten: `src/components/chat/`
- `ChatSidebar.tsx` -- Conversation-Liste mit Titeln und Zeitstempel
- `ChatMessage.tsx` -- Einzelne Nachricht (User oder Assistant), mit Markdown-Rendering
- `ChatInput.tsx` -- Eingabefeld mit URL-Erkennung und Send-Button
- `WebsiteProfileCard.tsx` -- Kompakte Karte fuer ein analysiertes Website-Profil (wird im Chat und Dashboard verwendet)

### 4. Dashboard-Komponenten: `src/components/dashboard/`
- `WebsiteGrid.tsx` -- Grid der analysierten Website-Karten
- `ComparisonTable.tsx` -- Vergleichstabelle nach festen Kriterien
- `TaskBoard.tsx` -- Aufgaben-Liste mit Status-Management
- `TaskCard.tsx` -- Einzelne Aufgabe mit Titel, Beschreibung, Prioritaet, Status-Badge

### 5. Mock-Daten: `src/lib/mock-chat-data.ts`
- Beispiel-Conversations, Nachrichten, Website-Profile und Tasks

---

## Aenderungen an bestehenden Dateien

### `src/App.tsx`
- Lazy-Imports fuer `Chat` und `Dashboard` hinzufuegen
- Routen `/chat` und `/dashboard` hinzufuegen

### `src/components/Navbar.tsx`
- Desktop: Links "Chat" und "Dashboard" fuer eingeloggte User hinzufuegen
- Mobile: Entsprechende MobileNavLinks hinzufuegen

### `src/pages/Home.tsx`
- CTA-Buttons: `/dashboard` Link auf `/chat` aendern ("Scan Your Website" -> "Start Analyzing")

---

## Technische Details

- Alle Daten sind statische Mock-Daten -- kein API-Call, kein Backend
- Bestehendes Design-System wird verwendet (dark theme, orange primary, Card/Badge/Button Komponenten)
- `react-markdown` + `remark-gfm` (bereits installiert) fuer Chat-Nachrichten
- Sidebar nutzt bestehende UI-Komponenten (ScrollArea, Button, Badge)
- Dashboard-Vergleichstabelle nutzt die bestehende Table-Komponente
- Task-Status-Wechsel funktioniert nur lokal im State (useState)

