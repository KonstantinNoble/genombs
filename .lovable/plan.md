

# Fix: Credit-Vorabpruefung fuer "Find Competitors with AI"

## Problem

Wenn "Find competitors automatically with AI" aktiviert ist, zeigt das UI korrekt "+7 Credits" an. Allerdings prueft die `canStartAnalysis`-Logik nur, ob genug Credits fuer den Website-Scan vorhanden sind (`affordableUrls >= 1`). Die 7 zusaetzlichen Credits fuer die Konkurrentensuche werden ignoriert.

**Beispiel:** User hat 8 Credits, Scan kostet 7 Credits (Gemini Flash).
- `affordableUrls = 1` -- Button ist aktiviert
- Eigener Scan startet (7 Credits) -- Erfolg, 1 Credit uebrig
- Automatische Konkurrentensuche (7 Credits) -- **Fehlermeldung**, nur 1 Credit

## Loesung

Wenn `autoFind` aktiviert ist, muss geprueft werden ob `remainingCredits >= costPerUrl + COMPETITOR_SEARCH_COST` (z.B. 7 + 7 = 14 Credits bei Gemini Flash).

## Technische Aenderungen

### 1. `src/components/chat/ChatInput.tsx` (Zeile 164)

```text
// Vorher:
const canStartAnalysis = affordableUrls >= 1 && ownUrl.trim() && (autoFind || competitorUrls.length > 0) && allUrlsValid;

// Nachher:
const canAffordAutoFind = autoFind ? remainingCredits >= (costPerUrl + COMPETITOR_SEARCH_COST) : true;
const canStartAnalysis = affordableUrls >= 1 && canAffordAutoFind && ownUrl.trim() && (autoFind || competitorUrls.length > 0) && allUrlsValid;
```

`COMPETITOR_SEARCH_COST` ist bereits importiert (Zeile 30).

### 2. `src/components/chat/InlineUrlPrompt.tsx` (Zeile 57)

Identische Aenderung:

```text
// Vorher:
const canStartAnalysis = affordableUrls >= 1 && ownUrl.trim() && (autoFind || competitorUrls.length > 0) && allUrlsValid;

// Nachher:
const canAffordAutoFind = autoFind ? remainingCredits >= (costPerUrl + COMPETITOR_SEARCH_COST) : true;
const canStartAnalysis = affordableUrls >= 1 && canAffordAutoFind && ownUrl.trim() && (autoFind || competitorUrls.length > 0) && allUrlsValid;
```

`COMPETITOR_SEARCH_COST` ist bereits importiert (Zeile 10).

## Ergebnis

- `autoFind` aus: Verhalten bleibt identisch
- `autoFind` an: Button wird erst aktiviert, wenn Credits fuer Scan + Konkurrentensuche reichen
- Kein abgebrochener Flow mehr

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/components/chat/ChatInput.tsx` | `canStartAnalysis` um `canAffordAutoFind`-Check erweitern |
| `src/components/chat/InlineUrlPrompt.tsx` | Identische Aenderung |

