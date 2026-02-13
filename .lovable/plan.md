
## Fix Plan: Queue-Funktion - Kritische Fehler beheben

### 🔴 Fehler #1: Double Response Body Consumption (process-analysis-queue/index.ts)

**Problembeschreibung:**
In den AI-Provider-Funktionen werden die HTTP-Response-Bodies doppelt gelesen:
- **Zeile 228 (OpenAI)**: `await resp.text()` liest Body
- **Zeile 229**: `const data = await resp.json()` versucht zu lesen → **FEHLSCHLAG** (Body bereits empty)
- **Zeile 257 (Anthropic)**: Gleiches Problem
- **Zeile 286 (Perplexity)**: Gleiches Problem

Dies verursacht, dass **ALLE Analysen über die Queue fehlschlagen**, weil die KI-Antwort nicht geparst werden kann.

**Lösung:**
Die `await resp.text()` Zeilen sind sinnlos und müssen entfernt werden. Nur `await resp.json()` wird benötigt.

**Zu ändern:**
| Funktion | Zeilen | Fix |
|----------|--------|-----|
| `analyzeWithOpenAI` | 228-229 | Zeile 228 entfernen: `await resp.text();` |
| `analyzeWithAnthropic` | 257-258 | Zeile 257 entfernen: `await resp.text();` |
| `analyzeWithPerplexity` | 286-287 | Zeile 286 entfernen: `await resp.text();` |

---

### 🔴 Fehler #2: Broken Job Counting mit `head: true` (2 Dateien)

**Problembeschreibung:**
Beide Edge Functions verwenden `.select("*", { count: "exact", head: true })`:

```typescript
// Zeile 370 in process-analysis-queue/index.ts
const { data: processingJobs, error: countError } = await supabaseAdmin
  .from("analysis_queue")
  .select("*", { count: "exact", head: true })  // ← head: true gibt NULL zurück!
  .eq("status", "processing");

const processingCount = processingJobs?.length || 0; // Immer 0! ❌
```

**Das Problem:**
- `head: true` bedeutet: "Gib mir nur Headers zurück, nicht die Daten"
- Deshalb ist `data` immer `null`
- `processingJobs?.length` ist immer `undefined`
- `processingCount` ist immer `0`
- **Die Concurrency-Limitierung funktioniert nicht** → zu viele parallele Jobs
- **Queue-Position wird falsch berechnet** (zeigt immer Position 1)

**Lösung:**
`head: true` entfernen und die count aus dem Response-Header lesen:

```typescript
// RICHTIG:
const { count, error } = await supabaseAdmin
  .from("analysis_queue")
  .select("*", { count: "exact" })  // head: true entfernen!
  .eq("status", "processing");

const processingCount = count || 0; // Verwendet den Count aus dem Header
```

**Zu ändern:**

| Datei | Zeilen | Fix |
|-------|--------|-----|
| `process-analysis-queue/index.ts` | 368-378 | `head: true` entfernen, `count` aus Response nutzen |
| `analyze-website/index.ts` | 553-560 | `head: true` entfernen, `count` aus Response nutzen |
| `check-email-availability/index.ts` | 83-86 | `head: true` entfernen (ähnliches Problem) |

---

### 📋 Zusammenfassung der Änderungen

**Datei 1: `supabase/functions/process-analysis-queue/index.ts`**
- Zeile 228: Entfernen `await resp.text();` aus `analyzeWithOpenAI`
- Zeile 257: Entfernen `await resp.text();` aus `analyzeWithAnthropic`  
- Zeile 286: Entfernen `await resp.text();` aus `analyzeWithPerplexity`
- Zeilen 368-378: Fix für Job-Counting:
  ```typescript
  // BEFORE:
  const { data: processingJobs, error: countError } = await supabaseAdmin
    .from("analysis_queue")
    .select("*", { count: "exact", head: true })
    .eq("status", "processing");
  
  const processingCount = processingJobs?.length || 0;
  
  // AFTER:
  const { count: processingCount, error: countError } = await supabaseAdmin
    .from("analysis_queue")
    .select("*", { count: "exact" })
    .eq("status", "processing");
  ```

**Datei 2: `supabase/functions/analyze-website/index.ts`**
- Zeilen 553-560: Fix für Queue-Position:
  ```typescript
  // BEFORE:
  const { data: queuePosition, error: positionError } = await supabaseAdmin
    .from("analysis_queue")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .eq("user_id", user.id)
    .lt("created_at", new Date().toISOString());
  
  const position = (positionError ? 0 : (queuePosition?.length || 0)) + 1;
  
  // AFTER:
  const { count: userQueueCount, error: positionError } = await supabaseAdmin
    .from("analysis_queue")
    .select("*", { count: "exact" })
    .eq("status", "pending")
    .eq("user_id", user.id)
    .lt("created_at", new Date().toISOString());
  
  const position = (positionError ? 0 : (userQueueCount || 0)) + 1;
  ```

**Datei 3: `supabase/functions/check-email-availability/index.ts`** (optional, ähnliches Pattern)
- Zeilen 83-86: `head: true` entfernen und `count` nutzen

---

### ✅ Nach diesen Fixes sollte:

1. ✅ **OpenAI/Anthropic/Perplexity Analysen funktionieren** (kein "doppelter Body" Fehler)
2. ✅ **Concurrency-Limit funktionieren** (max 3 parallele Jobs)
3. ✅ **Queue-Position korrekt angezeigt werden** (statt immer "Position 1")
4. ✅ **Alle Analysen erfolgreich verarbeitet werden**

---

### 🚀 Implementierung

Diese Änderungen sind alle in den Edge Functions - nach dem Fix werden die Functions automatisch zu deinem externen Supabase deployed.

