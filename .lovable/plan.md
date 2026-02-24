
# Problem 4: Pre-Validierung in handleAnalyzeSelectedCompetitors + Modell weiterreichen

## Problem

In `src/pages/Chat.tsx` (Zeile 168-200) gibt es zwei Fehler:

1. **Keine Vorab-Pruefung der Credits**: Wenn ein Premium-User 3 Konkurrenten auswaehlt, werden alle 3 Scans gleichzeitig per `Promise.all` gestartet. Reichen die Credits nur fuer 1-2 Scans, scheitern die restlichen erst waehrend der Ausfuehrung.

2. **Kein Modell wird uebergeben**: `analyzeWebsite(url, activeId, false, token)` wird ohne `model`-Parameter aufgerufen. Dadurch wird immer der Backend-Default ("gemini-flash") verwendet, egal welches Modell der User in der Chat-Eingabe gewaehlt hat.

## Loesung

### 1. `selectedModel`-State in Chat.tsx verfuegbar machen

Aktuell lebt `selectedModel` nur im lokalen State von `ChatInput`. Ein neuer State `selectedModel` wird in `Chat.tsx` eingefuehrt und per Callback (`onModelChange`) von `ChatInput` aktualisiert.

### 2. Vorab-Pruefung vor Promise.all

Vor dem Start der Scans wird geprueft:

```typescript
const costPerUrl = getAnalysisCreditCost(selectedModel);
const totalCost = limitedUrls.length * costPerUrl;

if (remainingCredits < totalCost) {
  const affordable = Math.floor(remainingCredits / costPerUrl);
  toast.error(`Not enough credits`, {
    description: `You need ${totalCost} credits for ${limitedUrls.length} scans, but only have ${remainingCredits}. You can afford ${affordable} scan${affordable !== 1 ? 's' : ''}.`,
    duration: 6000,
  });
  return;
}
```

### 3. Modell an analyzeWebsite weiterreichen

```typescript
limitedUrls.map((url) => analyzeWebsite(url, activeId, false, token, selectedModel))
```

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/pages/Chat.tsx` | Neuer State `selectedModel`, Vorab-Credit-Pruefung, Modell an `analyzeWebsite` uebergeben |
| `src/components/chat/ChatInput.tsx` | Neue Prop `onModelChange` aufrufen bei Modellwechsel |
