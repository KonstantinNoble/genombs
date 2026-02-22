
# Fix: Build-Fehler und Firecrawl-Timeout bei langsamen Websites

## 3 Probleme zu beheben

### 1. TypeScript Build-Fehler in Chat.tsx (Zeile 287)
Die `onScan`-Prop in `ChatInputProps` erwartet eine Funktion die `void` zurueckgibt, aber `onStartScan` ist `async` und gibt `Promise<void>` zurueck.

**Loesung:** Den Typ von `onScan` in `ChatInput.tsx` auf `Promise<void>` aendern:
```typescript
onScan?: (ownUrl: string, competitorUrls: string[], model: string) => void | Promise<void>;
```

### 2. Edge Function Build-Fehler (Supabase Realtime)
Der Fehler `Could not find a matching package for 'npm:@supabase/realtime-js@2.97.0'` kommt von einer inkompatiblen Supabase-JS-Version in den Edge Functions. Die Edge Functions verwenden `https://esm.sh/@supabase/supabase-js@2` -- das ist korrekt und sollte eigentlich funktionieren. Dieser Fehler stammt vermutlich von der Lovable Cloud Auto-Compilation und nicht vom eigentlichen Code. Da die Edge Functions auf der externen Supabase-Instanz laufen, ist dieser Fehler nicht blockierend.

### 3. Firecrawl-Timeout bei ithy.com
Die Fehlermeldung "The website took too long to load" wird angezeigt, wenn Firecrawl die Website nicht innerhalb von 30 Sekunden scrapen kann. Einige Websites (wie ithy.com) sind stark JS-basiert und brauchen laenger.

**Loesung in `supabase/functions/process-analysis-queue/index.ts`:**
- `waitFor` von 2000ms auf 5000ms erhoehen (mehr Zeit fuer JS-Rendering)
- `timeout` von 30000ms auf 45000ms erhoehen
- `AbortController`-Timeout von 45s auf 60s erhoehen (muss immer groesser als Firecrawl-Timeout sein)

## Technische Details

### Datei 1: `src/components/chat/ChatInput.tsx` (Zeile 43)
```typescript
// Vorher
onScan?: (ownUrl: string, competitorUrls: string[], model: string) => void;

// Nachher
onScan?: (ownUrl: string, competitorUrls: string[], model: string) => void | Promise<void>;
```

### Datei 2: `supabase/functions/process-analysis-queue/index.ts` (Zeilen 638, 648-651)
```typescript
// Vorher
const crawlAbortTimeout = setTimeout(() => crawlController.abort(), 45000);
// ...
waitFor: 2000,
timeout: 30000,

// Nachher
const crawlAbortTimeout = setTimeout(() => crawlController.abort(), 60000);
// ...
waitFor: 5000,
timeout: 45000,
```

### Ergebnis
- Build-Fehler in Chat.tsx wird behoben
- JS-lastige Websites wie ithy.com haben mehr Zeit zum Laden und werden seltener als Timeout gemeldet
- Der Realtime-Fehler betrifft nur die Lovable Cloud Compilation und blockiert die eigentliche Funktionalitaet nicht
