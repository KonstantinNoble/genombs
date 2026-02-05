

# Fix: Alte URL wird verwendet statt neuer URL

## Problem-Diagnose

Das Problem liegt in der **doppelten Hook-Instanziierung** und einem **leeren Callback**:

| Komponente | Hook-Instanz | Problem |
|------------|--------------|---------|
| `ValidationPlatform.tsx` (Zeile 61) | `useBusinessContext()` #1 | Verwendet alten `businessContext` bei `validate()` |
| `BusinessContextPanel.tsx` (Zeile 42-57) | `useBusinessContext()` #2 | Aktualisiert nur eigenen State |

Wenn du im Panel die URL änderst:
1. Panel-Instanz speichert neue URL in DB ✅
2. Panel-Instanz aktualisiert eigenen `context` State ✅
3. ValidationPlatform-Instanz behält **alten** `context` ❌
4. `handleValidate()` sendet **alte** URL an die KI ❌

Zusätzlich: `onContextChange` (Zeile 553-555) ist leer und lädt nichts neu.

## Lösung

### Änderung 1: `useBusinessContext.ts` - `loadContext()` gibt Context zurück

**Datei:** `src/hooks/useBusinessContext.ts`

Die `loadContext()` Funktion muss den geladenen Context **zurückgeben**, damit `ValidationPlatform` ihn direkt vor der Validierung abrufen kann.

**Änderungen:**
- Signatur ändern: `loadContext: () => Promise<BusinessContext | null>`
- Nach erfolgreichem Select: `return data as BusinessContext | null`
- Bei Fehler/nicht eingeloggt: `return null`

### Änderung 2: `ValidationPlatform.tsx` - Frischen Context vor Validierung laden

**Datei:** `src/pages/ValidationPlatform.tsx`

1. `loadContext` aus dem Hook destrukturieren (zusätzlich zu `context`)
2. In `handleValidate()` vor `validate()` aufrufen: `const freshContext = await loadContext()`
3. `freshContext` an `validate()` übergeben statt `businessContext`
4. `onContextChange` Callback nutzen um `loadContext()` aufzurufen

### Änderung 3: Optional - Warnung wenn URL ohne Scan

Falls eine URL eingegeben aber nicht gescannt wurde, könnte ein Hinweis angezeigt werden. (Optional, nicht kritisch)

## Datei-Änderungen

| Datei | Zeilen | Änderung |
|-------|--------|----------|
| `src/hooks/useBusinessContext.ts` | 100, 136-164 | `loadContext()` gibt `BusinessContext \| null` zurück |
| `src/pages/ValidationPlatform.tsx` | 61 | `loadContext` destrukturieren |
| `src/pages/ValidationPlatform.tsx` | 254-257 | Frischen Context laden vor `validate()` |
| `src/pages/ValidationPlatform.tsx` | 553-555 | `onContextChange` callback implementieren |

## Erwartetes Ergebnis

Nach dieser Änderung:
1. Jede URL-Änderung wird sofort in DB gespeichert (Auto-Save) ✅
2. Vor jeder Validierung wird der **aktuelle** Context aus der DB geladen ✅
3. Die KI erhält immer die **neueste** URL und alle Felder ✅

## Kein Edge Function Deployment nötig

Da dies nur Frontend-Änderungen sind, muss keine Edge Function deployed werden.

