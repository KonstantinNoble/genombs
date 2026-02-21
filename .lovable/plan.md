
# Fix: Falsche Werte und fehlende Kategorien in Analytics Overview

## Problem
Die Kategorie-Schluessel im Code stimmen nicht mit den Schluesseln in der Datenbank ueberein:

| Code (falsch, snake_case) | Datenbank (richtig, camelCase) |
|---|---|
| `findability` | `findability` (einziger Treffer) |
| `mobile_usability` | `mobileUsability` |
| `offer_clarity` | `offerClarity` |
| `trust_proof` | `trustProof` |
| `conversion_readiness` | `conversionReadiness` |

Deshalb werden nur 1 von 5 Kategorien angezeigt und die Durchschnittswerte sind dadurch verfaelscht.

## Loesung
Die Schluessel in `CATEGORY_LABELS` und `CATEGORY_COLORS` auf camelCase umstellen, sodass sie mit den tatsaechlichen Datenbank-Werten uebereinstimmen.

## Technische Details

**Datei:** `src/components/gamification/AnalyticsOverview.tsx`

Aenderung der Maps (Zeilen 20-34):

```typescript
// Vorher (falsch)
const CATEGORY_LABELS = {
  findability: 'Findability',
  mobile_usability: 'Mobile Usability',
  ...
};

// Nachher (richtig)
const CATEGORY_LABELS = {
  findability: 'Findability',
  mobileUsability: 'Mobile Usability',
  offerClarity: 'Offer Clarity',
  trustProof: 'Trust Proof',
  conversionReadiness: 'Conversion Readiness',
};
```

Gleiche Aenderung fuer `CATEGORY_COLORS`. Sonst keine weiteren Aenderungen noetig -- die Berechnungslogik ist korrekt, sie bekommt nur die falschen Schluessel nicht zugeordnet.
