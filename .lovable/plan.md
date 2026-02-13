

## Fix: Entfernung der `fetch("about:blank")` Zeilen aus process-analysis-queue

### Problem
Die Edge Function `process-analysis-queue` enthält zwei invalid `fetch("about:blank")` Aufrufe:
- **Zeile 584**: Im success-Pfad (try-block)
- **Zeile 596**: Im error-Pfad (catch-block)

Diese verursachen `TypeError: Url scheme 'about' not supported` weil Deno nur `http:` und `https:` Schemes akzeptiert.

### Lösung
Beide Zeilen müssen komplett entfernt werden. Die Logik wird vereinfacht:

**Vorher (lines 581-599):**
```typescript
try {
  await processQueue();
  const responseBody = JSON.stringify({ success: true });
  await (await fetch("about:blank")).text(); // ❌ ENTFERNEN
  return new Response(responseBody, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
} catch (err) {
  console.error("Queue processor error:", err);
  const responseBody = JSON.stringify({
    error: err instanceof Error ? err.message : "Unknown error",
  });
  await (await fetch("about:blank")).text(); // ❌ ENTFERNEN
  return new Response(responseBody, {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
```

**Nachher:**
```typescript
try {
  await processQueue();
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
} catch (err) {
  console.error("Queue processor error:", err);
  return new Response(
    JSON.stringify({
      error: err instanceof Error ? err.message : "Unknown error",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}
```

### Änderungen
| Datei | Aktion |
|-------|--------|
| `supabase/functions/process-analysis-queue/index.ts` | Zeilen 584 und 596 entfernen (`await (await fetch("about:blank")).text()`) |

### Nach der Änderung
**Folgende Kommandos ausführen in deinem Terminal:**

```bash
# 1. Stelle sicher, dass die Datei gespeichert ist
# 2. Deploy zu externem Supabase
supabase functions deploy process-analysis-queue --project-ref xnkspttfhcnqzhmazggn

# 3. Verifiziere den Deploy
supabase functions list --project-ref xnkspttfhcnqzhmazggn
```

### Verifikation
Nach dem Deploy sollte:
- ✅ Der `TypeError: Url scheme 'about' not supported` Fehler verschwindet
- ✅ Der Cron Job die Edge Function erfolgreich aufrufen
- ✅ Jobs in `analysis_queue` von `pending` → `processing` → `completed` fortschreiten

