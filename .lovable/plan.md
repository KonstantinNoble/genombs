
# URL-Felder basierend auf verbleibenden Credits dynamisch sperren

## Uebersicht

Die URL-Eingabefelder im Analyse-Dialog werden dynamisch basierend auf den verbleibenden Credits aktiviert/deaktiviert. Wenn ein User z.B. nur noch 5 Credits hat und ein guenstiges Modell nutzt (5 Credits pro URL), kann er nur 1 URL analysieren. Die restlichen Felder werden gesperrt mit einer englischen Hinweismeldung.

## Logik

Die Anzahl der bezahlbaren URLs wird berechnet als:

```text
affordableUrls = Math.floor(remainingCredits / analysisCostPerUrl)
```

- Guenstige Modelle: 5 Credits pro URL
- Teure Modelle: 10 Credits pro URL

Beispiele:
- 20 Credits, guenstiges Modell: 4 URLs moeglich (alle frei)
- 12 Credits, guenstiges Modell: 2 URLs moeglich
- 7 Credits, teures Modell: 0 URLs (alle gesperrt)
- 0 Credits: alle Felder gesperrt, "Start Analysis" Button deaktiviert

## Aenderungen

### `src/components/chat/ChatInput.tsx`

1. `remainingCredits` aus `useAuth()` importieren
2. `getAnalysisCreditCost` aus constants importieren
3. Berechnung der bezahlbaren URL-Anzahl:
   - `costPerUrl = getAnalysisCreditCost(selectedModel)`
   - `affordableUrls = Math.floor(remainingCredits / costPerUrl)`
   - `enabledUrlFields = Math.min(maxUrlFields, affordableUrls)`
4. URL-Eingabefelder ab Index `enabledUrlFields` deaktivieren (`disabled` Prop)
5. Deaktivierte Felder erhalten einen visuellen Hinweis (ausgegraut + Lock-Icon)
6. Unter den Feldern eine Meldung anzeigen wenn nicht alle Felder verfuegbar:
   - `"Not enough credits to analyze more URLs. You need X credits per URL."`
7. "Start Analysis" Button deaktivieren wenn `affordableUrls < 1`
8. Auch den "+" Button (der den Dialog oeffnet) deaktivieren wenn `remainingCredits < costPerUrl`
9. Alle Meldungen auf Englisch

### Felder-Reihenfolge und Sperrung

- Feld "Your Website" ist das erste Feld (Index 0)
- Competitor-Felder folgen danach (Index 1, 2, 3)
- Wenn z.B. nur 2 URLs bezahlbar sind: "Your Website" + "Competitor 1" aktiv, Rest gesperrt
- Wenn 0 URLs bezahlbar: alle Felder gesperrt

## Technische Details

### Betroffene Datei

| Datei | Aenderung |
|---|---|
| `src/components/chat/ChatInput.tsx` | Credits-basierte Feld-Sperrung, englische Hinweise, Button-Deaktivierung |

### Neue Imports in ChatInput

```text
import { isExpensiveModel, getAnalysisCreditCost, FREE_MAX_URL_FIELDS, PREMIUM_MAX_URL_FIELDS } from "@/lib/constants";
// remainingCredits aus useAuth()
const { isPremium, remainingCredits } = useAuth();
```

### Berechnungslogik

```text
const costPerUrl = getAnalysisCreditCost(selectedModel);
const affordableUrls = costPerUrl > 0 ? Math.floor(remainingCredits / costPerUrl) : 0;
const effectiveMaxFields = Math.min(maxUrlFields, affordableUrls);
const effectiveCompetitorFields = Math.max(0, effectiveMaxFields - 1);
```

### UI-Aenderungen im Dialog

- Jedes URL-Feld prueft ob sein Index innerhalb von `effectiveMaxFields` liegt
- Felder ausserhalb werden `disabled` gesetzt mit reduzierter Opazitaet
- Hinweistext unterhalb der Felder: "Not enough credits — X credits per URL analysis with [Model]"
- "Start Analysis" Button: `disabled={!canStartAnalysis || affordableUrls < 1}`
