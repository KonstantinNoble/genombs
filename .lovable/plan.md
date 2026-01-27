
# Plan: Gemini API 404 und "Invalid JSON" Fehler beheben

## Zusammenfassung

Die Gemini-Modelle schlagen mit 404 und "Invalid JSON from request" Fehlern fehl. Die Ursachen liegen in:
1. Fehlerhafter `responseMimeType` Konfiguration ohne Schema
2. Unzureichender Fehlerdiagnose (Google-Fehlermeldungen werden nicht propagiert)
3. Möglicherweise falschen Model-IDs für deine spezifische API-Key-Konfiguration
4. Externes Backend erfordert manuelles Deployment

---

## Geplante Änderungen

### 1. Gemini API-Aufruf stabilisieren (multi-ai-query)

**Problem:** `responseMimeType: "application/json"` kann bei manchen Modellen/Konfigurationen zu Fehlern führen, wenn kein `responseSchema` angegeben ist.

**Lösung:**
- `responseMimeType` entfernen und stattdessen im Prompt auf JSON-Ausgabe bestehen
- JSON-Parsing robust gestalten (Markdown Code-Blocks, Plain JSON, etc.)
- Fallback auf Text-Parsing wenn JSON fehlschlägt

### 2. Bessere Fehlerdiagnose implementieren

**Problem:** Bei Fehlern wird nur `API error: 404` angezeigt, nicht die genaue Google-Fehlermeldung.

**Lösung:**
- Google API Error-Body parsen und `message`-Feld extrahieren
- Vollständige Fehlermeldung im Response zurückgeben
- Logging verbessern für Debugging

### 3. Model-ID Kandidaten mit Fallback

**Problem:** Manche Modell-IDs sind für bestimmte API-Keys/Regionen nicht verfügbar.

**Lösung:**
- Kandidaten-Liste pro Modell definieren
- Bei 404/Fehler automatisch nächsten Kandidaten versuchen
- Erfolgreiche Model-ID im Response melden

### 4. API-Key Header hinzufügen

**Problem:** Query-Parameter `?key=` kann bei manchen Setups Probleme machen.

**Lösung:**
- Zusätzlich `x-goog-api-key` Header setzen (wie in offizieller Google REST-Doku empfohlen)

---

## Technische Details

### multi-ai-query/index.ts Änderungen

```text
1. GEMINI_MODEL_CANDIDATES definieren:
   - geminiPro: ["gemini-2.5-pro", "gemini-2.0-flash"]
   - geminiFlash: ["gemini-2.5-flash", "gemini-2.0-flash"]

2. queryGoogleModel() überarbeiten:
   - x-goog-api-key Header hinzufügen
   - responseMimeType entfernen
   - Kandidaten-Schleife: bei 404 nächsten Kandidaten versuchen
   - Google Error-Body parsen und message extrahieren
   - Robustes JSON-Parsing (Code-Blocks, Plain JSON)

3. Fehlerformat verbessern:
   - Statt "API error: 404" → "Gemini 404: Model not found. Tried: [gemini-2.5-pro]. Message: [Google Error]"
```

### Beispiel verbesserter API-Aufruf

```typescript
// Kandidaten für Fallback
const candidates = GEMINI_MODEL_CANDIDATES[modelKey] || ['gemini-2.5-flash'];

for (const candidateId of candidates) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${candidateId}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey  // Zusätzlicher Header
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096
          // KEIN responseMimeType - im Prompt stattdessen
        }
      })
    }
  );
  
  if (response.ok) {
    // Erfolg - diesen Kandidaten verwenden
    break;
  }
  
  if (response.status === 404) {
    // Nächsten Kandidaten versuchen
    continue;
  }
  
  // Andere Fehler: Error-Body parsen
  const errorBody = await response.text();
  let errorMessage = `API error: ${response.status}`;
  try {
    const parsed = JSON.parse(errorBody);
    errorMessage = parsed.error?.message || errorMessage;
  } catch {}
  throw new Error(errorMessage);
}
```

---

## Deployment-Hinweis (Kritisch!)

Da deine App das **externe Supabase-Projekt** (fhzqngbbvwpfdmhjfnvk) verwendet:

1. Ich werde den Code in Lovable aktualisieren
2. Du musst den aktualisierten Code in dein externes Supabase-Projekt kopieren
3. Die Funktion dort manuell deployen (via Supabase CLI oder Dashboard)

Ohne manuelles Deployment bleiben die 404-Fehler bestehen!

---

## Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `supabase/functions/multi-ai-query/index.ts` | Gemini API-Aufruf stabilisieren, Fallback-Kandidaten, bessere Fehlerdiagnose |

---

## Erwartetes Ergebnis

Nach der Implementierung:
- Gemini-Modelle funktionieren zuverlässig (mit Fallback auf alternative IDs)
- Bei Fehlern siehst du die genaue Google-Fehlermeldung
- Du weißt genau welche Model-ID erfolgreich war
- Keine "Invalid JSON" Fehler mehr durch `responseMimeType` Problem
