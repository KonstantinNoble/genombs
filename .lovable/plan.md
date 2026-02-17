
# Fix: GitHub-Analyse Verbesserungen

## Probleme (3 Stück)

1. Das GitHub-Eingabefeld ist nur im initialen Analyse-Formular sichtbar, nicht bei erneuten Analysen oder im Chat
2. Es ist unlogisch, dass Website-URL UND GitHub-URL gleichzeitig erforderlich sind
3. Wenn ein GitHub-Link im Chat gesendet wird, wird er ignoriert

## Loesung

### 1. GitHub-Link im Chat erkennen und verarbeiten
- In der `handleSend`-Funktion (Chat.tsx) pruefen, ob die Nachricht einen GitHub-Link enthaelt (z.B. `https://github.com/user/repo`)
- Wenn ja UND bereits ein Website-Profil existiert: Automatisch eine Deep Analysis mit dem GitHub-Repo nachtraeglich starten
- Der Chat zeigt eine Bestaetigung: "Deep Analysis mit GitHub-Repo gestartet..."

### 2. GitHub-Eingabefeld immer sichtbar machen
- Wenn der User eine neue Analyse startet (InlineUrlPrompt), bleibt das GitHub-Feld wie bisher
- Zusaetzlich: Im ChatInput-Bereich einen kleinen GitHub-Button hinzufuegen, der ein Eingabefeld oeffnet, um nachtraeglich ein Repo zu einer bestehenden Analyse hinzuzufuegen

### 3. Website-URL weiterhin erforderlich lassen (mit Erklaerung)
- Die Website-URL bleibt erforderlich, da die Analyse die LIVE-Website crawlt (Firecrawl + PageSpeed)
- Der GitHub-Code ergaenzt diese Analyse um Source-Code-Insights
- Einen kurzen Hilfetext hinzufuegen, der erklaert: "Die Website-URL wird fuer die Live-Analyse benoetigt, der GitHub-Link ergaenzt diese um Code-Qualitaet"

---

## Technische Aenderungen

### Chat.tsx
- Neue Funktion `handleGithubDeepAnalysis(githubUrl: string)` die:
  - Das bestehende eigene Website-Profil findet
  - Die `fetch-github-repo` Edge Function aufruft
  - Die Code-Analyse-Ergebnisse ins Profil schreibt
  - Einen Summary-Chat generiert
- In `handleSend`: Regex-Check auf GitHub-URLs, bei Match `handleGithubDeepAnalysis` aufrufen

### ChatInput.tsx
- Kleiner GitHub-Button neben dem Send-Button (nur fuer Premium-User sichtbar)
- Bei Klick: Popover mit Input-Feld fuer GitHub-URL
- Bei Submit: Ruft die neue `handleGithubDeepAnalysis` Funktion auf

### InlineUrlPrompt.tsx
- Hilfetext ergaenzen: "Website-URL = Live-Analyse, GitHub = Code-Qualitaet (ergaenzend)"
- Keine strukturellen Aenderungen noetig, das Feld existiert bereits

### Neue Edge Function oder bestehende erweitern
- Option A: Eine neue "add-github-analysis" Edge Function erstellen
  - Nimmt `profileId` + `githubRepoUrl`
  - Ruft `fetch-github-repo` auf
  - Fuehrt AI-Analyse nur auf den Code durch
  - Speichert `code_analysis` im bestehenden Profil
- Option B: Die bestehende `analyze-website` erweitern mit einem `githubOnly`-Modus

Option A ist sauberer und wird bevorzugt.

### Zusammenfassung der Dateien
- `src/pages/Chat.tsx` - GitHub-Link-Erkennung im Chat + Deep Analysis Handler
- `src/components/chat/ChatInput.tsx` - GitHub-Button fuer nachtraegliche Analyse
- `src/components/chat/InlineUrlPrompt.tsx` - Hilfetext ergaenzen
- `supabase/functions/add-github-analysis/index.ts` - Neue Edge Function fuer nachtraegliche Code-Analyse
