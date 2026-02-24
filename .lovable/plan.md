
# Dynamische Gesamtkosten-Anzeige fuer "Find Competitors with AI"

## Problem

Die UI zeigt statisch "+7 Credits" neben dem Auto-Find-Toggle an. Das ist nur der Aufpreis fuer die Konkurrentensuche -- der User sieht nicht die tatsaechlichen Gesamtkosten (Scan + Suche), die je nach Modell variieren.

## Loesung

Die Anzeige wird von `(+7 Credits)` auf die dynamischen Gesamtkosten geaendert: `costPerUrl + COMPETITOR_SEARCH_COST`.

**Beispiele je Modell:**
- Gemini Flash / GPT Mini: 9 + 7 = **16 Credits**
- GPT / Claude Sonnet: 12 + 7 = **19 Credits**
- Perplexity: 14 + 7 = **21 Credits**

## Technische Aenderungen

### 1. `src/components/chat/ChatInput.tsx` (Zeile 431)

```text
// Vorher:
<span className="text-[10px] text-muted-foreground shrink-0">(+{COMPETITOR_SEARCH_COST} Credits)</span>

// Nachher:
<span className="text-[10px] text-muted-foreground shrink-0">({costPerUrl + COMPETITOR_SEARCH_COST} Credits total)</span>
```

### 2. `src/components/chat/InlineUrlPrompt.tsx` (Zeile 141)

```text
// Vorher:
<span className="text-[10px] text-muted-foreground shrink-0">(+{COMPETITOR_SEARCH_COST} Credits)</span>

// Nachher:
<span className="text-[10px] text-muted-foreground shrink-0">({costPerUrl + COMPETITOR_SEARCH_COST} Credits total)</span>
```

`costPerUrl` ist in beiden Dateien bereits berechnet (Zeile 110 bzw. 43).

## Ergebnis

- User sieht die echten Gesamtkosten, die tatsaechlich abgezogen werden
- Kosten passen sich dynamisch an das gewaehlte Modell an
- Keine Ueberraschungen mehr bei der Credit-Abbuchung

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/components/chat/ChatInput.tsx` | Credit-Anzeige auf dynamische Gesamtkosten aendern |
| `src/components/chat/InlineUrlPrompt.tsx` | Identische Aenderung |
