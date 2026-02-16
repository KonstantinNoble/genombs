

## Fix: Base64-Dekodierungsfehler im Screenshot-Upload

### Problem

Der Screenshot von Firecrawl enthaelt manchmal ungueltige Base64-Zeichen (z.B. URL-safe Encoding mit `_` und `-` statt `/` und `+`, oder anderweitig fehlerhafte Daten). Der `atob()`-Aufruf in Zeile 535 wirft dann einen `InvalidCharacterError`, der den gesamten Job zum Absturz bringt -- obwohl der Screenshot gar nicht kritisch ist.

Das Problem: `atob()` wird synchron aufgerufen, **bevor** die fire-and-forget Kette startet. Der Fehler wird daher nicht abgefangen.

### Loesung

Den gesamten Screenshot-Block (inklusive `atob()`) in einen eigenen try/catch wrappen, damit ein fehlerhafter Screenshot niemals den Job abbricht.

### Technische Aenderung

**Datei: `supabase/functions/process-analysis-queue/index.ts`** (Zeilen 532-547)

Vorher:
```typescript
if (screenshotBase64) {
  const base64Data = screenshotBase64.replace(/^data:image\/\w+;base64,/, "");
  const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  
  supabaseAdmin.storage
    .from("website-screenshots")
    .upload(...)
    .then(...)
    .catch(...);
}
```

Nachher:
```typescript
if (screenshotBase64) {
  try {
    const base64Data = screenshotBase64.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    
    supabaseAdmin.storage
      .from("website-screenshots")
      .upload(...)
      .then(...)
      .catch(...);
  } catch (screenshotErr) {
    console.warn("Screenshot decode failed (non-critical):", screenshotErr);
  }
}
```

### Auswirkung

- Der Fehler wird abgefangen und geloggt, aber die Analyse laeuft weiter
- Keine Auswirkung auf die Webseite oder andere Funktionalitaet
- Nur eine Datei betroffen, minimale Aenderung (3 Zeilen hinzugefuegt)

