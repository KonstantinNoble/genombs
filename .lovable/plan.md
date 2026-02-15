

## Mobile-Crash Fix: Fehler sichtbar machen und alle Crash-Stellen absichern

### Das eigentliche Problem

Die ErrorBoundary zeigt nur "Something went wrong" ohne jegliche Details. Auf Mobile macht sie sogar einen unsichtbaren Redirect zu `?safe=1`, der nichts bewirkt und den echten Fehler verschleiert. Ohne die Fehlermeldung zu sehen, ist es unmoeglich den genauen Crash zu identifizieren.

### Strategie: 2 Schritte

**Schritt 1: Fehler sichtbar machen** (Wichtigster Schritt)

Die ErrorBoundary wird so angepasst, dass der tatsaechliche Fehlertext angezeigt wird. Der nutzlose Safe-Mode-Redirect wird entfernt. So siehst du beim naechsten Crash sofort, welche Zeile/Komponente das Problem verursacht.

**Schritt 2: Alle bekannten Crash-Stellen absichern**

Ich habe folgende unsichere Stellen gefunden:

| Datei | Problem |
|-------|---------|
| `PageSpeedCard.tsx` Zeile 56 | `data.coreWebVitals` wird direkt auf `.lcp`, `.cls` etc. zugegriffen -- crasht wenn `coreWebVitals` null ist |
| `ComparisonTable.tsx` Zeile 49 | `category_scores!` Non-null Assertion -- unsicher |
| `ChatInput.tsx` Zeile 107 | `AI_MODELS.find(...)!` Non-null Assertion |

---

### Aenderungen im Detail

**1. `src/components/ErrorBoundary.tsx`**
- Die gesamte `componentDidCatch`-Methode wird vereinfacht: Nur noch `console.error`, kein Redirect mehr (die ca. 30 Zeilen Safe-Mode-Logik werden entfernt)
- Im Render wird `this.state.error?.message` angezeigt, damit man den Fehler diagnostizieren kann
- "Try Again" und "Reload Page" Buttons bleiben

**2. `src/components/dashboard/PageSpeedCard.tsx`**
- Zeile 56: Null-Check fuer `coreWebVitals` hinzufuegen:
```typescript
const cwv = data.coreWebVitals ?? { lcp: null, cls: null, fcp: null, tbt: null, speedIndex: null };
```

**3. `src/components/dashboard/ComparisonTable.tsx`**
- Zeile 49: Non-null Assertion entfernen:
```typescript
const ownScore = ownSite.category_scores?.[cat.key] ?? 0;
```

**4. `src/components/chat/ChatInput.tsx`**
- Zeile 107: Non-null Assertion absichern:
```typescript
const currentModel = AI_MODELS.find((m) => m.id === selectedModel) ?? AI_MODELS[0];
```

### Nach dem Fix

Falls die Seite nach diesen Aenderungen immer noch crasht, wird die ErrorBoundary jetzt den tatsaechlichen Fehlertext anzeigen. Das macht es moeglich, den genauen Fehler sofort zu identifizieren und gezielt zu beheben.

