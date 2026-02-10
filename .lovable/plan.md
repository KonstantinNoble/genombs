

# Chat und Dashboard zu einer Seite zusammenfuehren

## Konzept

Statt zwei getrennter Seiten (`/chat` und `/dashboard`) wird alles zu einer einzigen Seite zusammengefuehrt. Das Layout ist ein Side-by-Side-Split:

```text
+------------------+------------------------------------------+
| Conversation-    |                                          |
| Sidebar          |   Chat-Bereich (links)  | Dashboard-     |
| (schmal)         |   Nachrichten +         | Panel (rechts) |
|                  |   Eingabefeld           | Tabs: Websites |
|                  |                         | Vergleich      |
|                  |                         | Aufgaben       |
+------------------+------------------------------------------+
```

Auf Mobile wird das Dashboard unter dem Chat als ausklappbares Panel angezeigt.

---

## Aenderungen

### 1. `src/pages/Dashboard.tsx` -- loeschen
Diese separate Seite wird nicht mehr gebraucht.

### 2. `src/pages/Chat.tsx` -- komplett umbauen
Die Chat-Seite wird zur Hauptarbeitsflaeche mit zwei Panels:
- **Linkes Panel**: Conversation-Sidebar (bleibt wie bisher)
- **Mitte**: Chat-Bereich (Nachrichten + Eingabefeld)
- **Rechtes Panel**: Dashboard-Inhalte (Website-Grid, Vergleichstabelle, Aufgaben-Board) als Tabs

Verwendet `react-resizable-panels` (bereits installiert) fuer ein flexibles, vom Nutzer anpassbares Split-Layout.

Auf Mobile: Ein Toggle-Button wechselt zwischen Chat-Ansicht und Dashboard-Ansicht.

### 3. `src/App.tsx`
- Dashboard lazy-import und Route `/dashboard` entfernen
- Route `/chat` bleibt als einzige Arbeitsseite

### 4. `src/components/Navbar.tsx`
- "Dashboard"-Link entfernen
- "Chat"-Link bleibt (ggf. umbenennen zu "Analyse" o.ae.)

### 5. `src/pages/Home.tsx`
- CTA-Link zeigt weiterhin auf `/chat`

---

## Technische Details

- `ResizablePanelGroup` mit `ResizablePanel` + `ResizableHandle` aus `react-resizable-panels` fuer das Split-Layout
- Chat-Panel bekommt `defaultSize={55}`, Dashboard-Panel `defaultSize={45}`
- Dashboard-Panel zeigt die Tabs (Websites, Vergleich, Aufgaben) direkt inline
- Auf Mobile (`useIsMobile` Hook): Nur ein Panel sichtbar, Toggle-Button zum Wechseln
- Bestehende Komponenten (`WebsiteGrid`, `ComparisonTable`, `TaskBoard`, `ChatSidebar`, `ChatMessage`, `ChatInput`) werden alle wiederverwendet

