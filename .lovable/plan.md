

# Auto Competitor Search mit Perplexity

## Uebersicht
Nach dem Scan der eigenen Website kann der User optional Perplexity automatisch nach passenden Wettbewerbern suchen lassen. Die Ergebnisse erscheinen als auswahlbare Karten im Chat. Der User waehlt die gewuenschten Competitors aus und startet deren Analyse mit einem Klick.

## Benutzerfreundlichkeit
- Kein separater Toggle oder komplexe UI -- stattdessen ein einfacher **"Find Competitors" Button** der nach dem ersten Scan im Chat erscheint
- Der Button wird als spezielle Assistant-Nachricht angezeigt, wenn die eigene Website gescannt wurde aber keine Competitors vorhanden sind
- Competitor-Vorschlaege erscheinen als schlichte Karten mit Checkbox -- ein Klick auf "Analyze Selected" startet den Scan
- Kein neuer Flow, keine neuen Screens -- alles passiert inline im bestehenden Chat

## DSGVO / Account-Loeschung
- Competitor-Vorschlaege werden als normale `messages` mit `metadata.type = "competitor_suggestions"` gespeichert
- Da die bestehende Kaskade in `delete-account` bereits alle `messages` loescht, werden die Daten bei Account-Loeschung automatisch entfernt
- **Keine neue Tabelle noetig** -- alles laeuft ueber die bestehende Messages-Infrastruktur

## Ablauf

1. User scannt seine Website (mit oder ohne manuelle Competitors)
2. Wenn die eigene Website gescannt wurde und noch keine Competitors vorhanden sind, erscheint im Chat ein Button: "Find competitors automatically"
3. User klickt den Button -- Perplexity (sonar-pro) sucht 3-5 passende Competitors basierend auf dem abgeschlossenen Profil
4. Ergebnisse erscheinen als Karten mit Checkbox im Chat
5. User waehlt Competitors aus und klickt "Analyze Selected"
6. Die gewaehlten URLs werden als normale Competitor-Scans gestartet

## Technische Details

### 1. Neue Edge Function: `supabase/functions/find-competitors/index.ts`
- Empfaengt: `conversation_id` + `access_token`
- Liest das eigene Website-Profil (is_own_website = true, status = completed) aus der DB
- Baut einen gezielten Prompt fuer Perplexity sonar-pro:
  - "Find 5 direct competitors for [URL] which is [name/USP/targetAudience]. Return JSON with competitors array containing url, name, description."
- Nutzt `response_format: { type: "json_schema" }` fuer strukturierte Antwort
- Speichert das Ergebnis als Message (role: assistant, metadata: { type: "competitor_suggestions", competitors: [...] })
- Zieht 7 Credits ab (Perplexity-Kosten)
- Auth via `supabase.auth.getUser()` (bestehendes Pattern)
- Secret: `PERPLEXITY_API_KEY` (bereits auf der externen Instanz konfiguriert)

### 2. Config: `supabase/config.toml`
- Neuer Eintrag: `[functions.find-competitors]` mit `verify_jwt = false`

### 3. Neue Komponente: `src/components/chat/CompetitorSuggestions.tsx`
- Rendert Competitor-Karten (Name, URL, kurze Beschreibung)
- Checkbox pro Karte zur Auswahl
- "Analyze Selected" Button mit Credit-Kosten-Anzeige
- Props: `competitors`, `onAnalyze(selectedUrls)`, `disabled`

### 4. API-Funktion: `src/lib/api/chat-api.ts`
- Neue Funktion `findCompetitors(conversationId, accessToken)` die die Edge Function aufruft

### 5. Credit-System: `src/lib/constants.ts`
- Neuer Eintrag: `COMPETITOR_SEARCH_COST = 7`

### 6. UI-Integration

**`src/components/chat/ChatMessage.tsx`:**
- Erkennt Messages mit `metadata?.type === "competitor_suggestions"`
- Rendert `CompetitorSuggestions` statt normalem Markdown

**`src/pages/Chat.tsx`:**
- Neuer Handler `handleFindCompetitors` der die API aufruft und das Ergebnis als Message einfuegt
- Neuer Handler `handleAnalyzeSelected` der die gewaehlten URLs als Competitor-Scans startet
- Nach erfolgreichem eigenen Scan (ohne Competitors) zeigt eine spezielle Nachricht den "Find Competitors" Button an

**`src/hooks/useChatAnalysis.ts`:**
- Minimale Aenderung: nach Scan-Abschluss pruefen ob nur die eigene URL gescannt wurde, und ggf. einen Callback ausloesen der die Competitor-Suche anbietet

### Dateien (Zusammenfassung)

| Datei | Aenderung |
|---|---|
| `supabase/functions/find-competitors/index.ts` | Neu -- Edge Function |
| `supabase/config.toml` | Neuer Eintrag (automatisch) |
| `src/components/chat/CompetitorSuggestions.tsx` | Neu -- UI-Komponente |
| `src/lib/api/chat-api.ts` | Neue Funktion `findCompetitors` |
| `src/lib/constants.ts` | `COMPETITOR_SEARCH_COST = 7` |
| `src/components/chat/ChatMessage.tsx` | Metadata-Erkennung + CompetitorSuggestions rendern |
| `src/pages/Chat.tsx` | Handler fuer Find + Analyze Selected |
| `src/hooks/useChatAnalysis.ts` | Callback wenn nur eigene URL gescannt |

