

# Fix: GitHub Deep Analysis - Kritische Probleme beheben

## Gefundene Probleme

### 1. Falsches KI-Modell (Bug)
Die `add-github-analysis` Edge Function ruft **immer** `gemini-2.0-flash` direkt ueber die Google API auf (Zeile 169). Das vom User ausgewaehlte Modell wird komplett ignoriert. Im Gegensatz dazu hat `process-analysis-queue` einen vollstaendigen Model-Router, der alle Provider (Gemini, OpenAI, Anthropic, Perplexity) unterstuetzt.

### 2. Fehlender Model-Parameter im Frontend
Die `handleGithubDeepAnalysis` Funktion in `Chat.tsx` uebergibt kein `model` an die Edge Function. Auch `addGithubAnalysis` in `chat-api.ts` akzeptiert keinen Model-Parameter.

### 3. Prompt koennte detaillierter sein
Der aktuelle Prompt ist funktional, aber relativ generisch. Er koennte staerker auf Website-spezifische Code-Muster eingehen.

---

## Loesung

### Schritt 1: Model-Router in `add-github-analysis` einbauen
Die Edge Function (`supabase/functions/add-github-analysis/index.ts`) wird umgebaut:
- Einen `model`-Parameter aus dem Request-Body akzeptieren
- Den gleichen Model-Router wie in `process-analysis-queue` verwenden (Gemini, OpenAI, Anthropic, Perplexity)
- Fallback auf `gemini-flash` wenn kein Modell angegeben

### Schritt 2: Model-Parameter durchreichen (Frontend)
- `chat-api.ts`: `addGithubAnalysis` bekommt einen optionalen `model`-Parameter
- `Chat.tsx`: `handleGithubDeepAnalysis` uebergibt das aktuell ausgewaehlte Modell
- `ChatInput.tsx`: Der GitHub-Popover uebergibt das Modell beim Submit

### Schritt 3: Prompt verbessern
Der AI-Prompt wird erweitert um:
- Explizite Anweisung, den Code im Kontext der analysierten Website zu bewerten
- Framework-spezifische Checks (React, Next.js, Vue, etc.)
- Bewertung von Accessibility-Patterns im Code
- Erkennung von Sicherheitsluecken (z.B. exposed API keys, XSS-Anfaelligkeiten)

---

## Technische Details

### `supabase/functions/add-github-analysis/index.ts`
- Model-Parameter aus Request-Body lesen: `const { profileId, githubRepoUrl, model } = await req.json()`
- Neue Funktion `callAI(prompt, model)` die je nach Modell den richtigen Provider aufruft
- Analyse-Funktionen fuer jeden Provider: `analyzeWithGemini()`, `analyzeWithOpenAI()`, `analyzeWithAnthropic()`, `analyzeWithPerplexity()`
- Jeder Provider bekommt denselben verbesserten Prompt, nur das API-Format unterscheidet sich
- Fallback: Wenn kein Model angegeben, wird `gemini-flash` verwendet

### `src/lib/api/chat-api.ts`
- `addGithubAnalysis(profileId, githubRepoUrl, token, model?)` - neuer optionaler Parameter

### `src/pages/Chat.tsx`
- `handleGithubDeepAnalysis(githubUrl, model?)` - Model-Parameter hinzufuegen
- Im `handleSend`: Model aus dem aktuellen State an `handleGithubDeepAnalysis` weiterleiten
- Im ChatInput `onGithubAnalysis` Callback: Model mitgeben

### `src/components/chat/ChatInput.tsx`
- `onGithubAnalysis` Signatur aendern zu `(url: string, model?: string) => void`
- Beim Submit aus dem GitHub-Popover das aktuelle Model mitsenden

### Verbesserter AI-Prompt (Auszug)
```text
You are a senior full-stack developer and code auditor.
Analyze the source code from "{repo}" which powers the website {url}.

Evaluate the code in the context of the LIVE website it serves.
Pay special attention to:
- Framework best practices (React, Next.js, Vue, etc.)
- Security vulnerabilities (exposed secrets, XSS, CSRF, SQL injection)
- Performance anti-patterns (unnecessary re-renders, missing lazy loading)
- Accessibility compliance (ARIA attributes, semantic HTML usage)
- SEO implementation quality (meta tags, structured data, SSR/SSG)
- Code maintainability (component structure, type safety, error handling)
- Dependency health (outdated packages, known vulnerabilities)

Return a structured JSON analysis...
```

### Zusammenfassung der geaenderten Dateien
1. `supabase/functions/add-github-analysis/index.ts` - Model-Router + verbesserter Prompt
2. `src/lib/api/chat-api.ts` - Model-Parameter hinzufuegen
3. `src/pages/Chat.tsx` - Model durchreichen
4. `src/components/chat/ChatInput.tsx` - Model beim GitHub-Submit mitsenden

