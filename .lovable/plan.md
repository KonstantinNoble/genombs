

# Plan: Scan-Zähler & Reset-Timer aus Datenbank abrufen

## Überblick

Die Scan-Informationen (`scan_count`, `scan_window_start`) werden direkt aus der Supabase-Datenbank geladen und im Frontend angezeigt.

---

## Teil 1: Hook erweitern (`src/hooks/useBusinessContext.ts`)

### 1.1 Interface erweitern

Zeile 6-20: `BusinessContext` Interface um die neuen Spalten erweitern:

```typescript
export interface BusinessContext {
  // ... existing fields ...
  website_scraped_at: string | null;
  scan_count: number | null;           // NEU
  scan_window_start: string | null;    // NEU
  created_at: string;
  updated_at: string;
}
```

### 1.2 Konstanten hinzufügen

Nach den Dropdown-Options (Zeile 87):

```typescript
// Scan limit constants (must match Edge Function)
export const MAX_SCANS_PER_DAY = 3;
export const SCAN_WINDOW_HOURS = 24;
```

### 1.3 Return-Interface erweitern

Zeile 88-101: Neue Return-Werte hinzufügen:

```typescript
interface UseBusinessContextReturn {
  // ... existing ...
  localContext: BusinessContextInput;
  scansRemaining: number;     // NEU
  scanResetTime: Date | null; // NEU
  maxScansPerDay: number;     // NEU
}
```

### 1.4 Berechnungslogik hinzufügen

Nach `lastScanned` (Zeile 323-325):

```typescript
const lastScanned = context?.website_scraped_at 
  ? new Date(context.website_scraped_at) 
  : null;

// Calculate scan status from DB values
const calculateScanStatus = (): { remaining: number; resetTime: Date | null } => {
  if (!context?.scan_window_start) {
    return { remaining: MAX_SCANS_PER_DAY, resetTime: null };
  }
  
  const windowStart = new Date(context.scan_window_start);
  const now = new Date();
  const windowEnd = new Date(windowStart.getTime() + SCAN_WINDOW_HOURS * 60 * 60 * 1000);
  
  // Check if window has expired
  if (now >= windowEnd) {
    return { remaining: MAX_SCANS_PER_DAY, resetTime: null };
  }
  
  const scanCount = context.scan_count || 0;
  const remaining = Math.max(0, MAX_SCANS_PER_DAY - scanCount);
  
  return { 
    remaining, 
    resetTime: remaining === 0 ? windowEnd : null 
  };
};

const scanStatus = calculateScanStatus();
const scansRemaining = scanStatus.remaining;
const scanResetTime = scanStatus.resetTime;
```

### 1.5 Return erweitern

Zeile 327-340:

```typescript
return {
  context,
  isLoading,
  isSaving,
  isScanning,
  hasUnsavedChanges,
  lastScanned,
  loadContext,
  saveContext,
  scanWebsite,
  clearContext,
  setLocalContext,
  localContext,
  scansRemaining,        // NEU
  scanResetTime,         // NEU
  maxScansPerDay: MAX_SCANS_PER_DAY,  // NEU
};
```

---

## Teil 2: UI-Komponente (`src/components/validation/BusinessContextPanel.tsx`)

### 2.1 Hook-Destrukturierung erweitern

Zeile ~48-58: Neue Werte aus Hook abrufen:

```typescript
const {
  context,
  isLoading,
  isSaving,
  isScanning,
  lastScanned,
  saveContext,
  scanWebsite,
  setLocalContext,
  localContext,
  loadContext,
  scansRemaining,    // NEU
  scanResetTime,     // NEU
  maxScansPerDay,    // NEU
} = useBusinessContext();
```

### 2.2 Import hinzufügen

Zeile 25-27: `Clock` Icon hinzufügen:

```typescript
import {
  // ... existing ...
  Clock,  // NEU
} from "lucide-react";
```

### 2.3 Countdown-State und Effect

Nach den anderen States (~Zeile 60):

```typescript
const [countdown, setCountdown] = useState<string>("");

// Countdown timer effect
useEffect(() => {
  if (!scanResetTime) {
    setCountdown("");
    return;
  }
  
  const updateCountdown = () => {
    const now = new Date();
    const diff = scanResetTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      setCountdown("");
      loadContext(); // Refresh to unlock scanning
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    } else {
      setCountdown(`${minutes}m ${seconds}s`);
    }
  };
  
  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
  return () => clearInterval(interval);
}, [scanResetTime, loadContext]);
```

### 2.4 UI-Anzeige hinzufügen

Nach dem "Already scanned indicator" Block (nach Zeile ~408), neue Anzeige für Scan-Limit:

```tsx
{/* Scan Usage Indicator */}
{isPremium && context?.scan_window_start && (
  <div className="flex items-center justify-between text-sm mt-2 p-2 bg-muted/50 rounded-md">
    <span className={scansRemaining > 0 ? "text-muted-foreground" : "text-amber-600 font-medium"}>
      {scansRemaining}/{maxScansPerDay} scans remaining today
    </span>
    
    {/* Reset Timer (only when limit reached) */}
    {scansRemaining === 0 && countdown && (
      <div className="flex items-center gap-1.5 text-amber-600">
        <Clock className="h-4 w-4" />
        <span className="font-mono text-xs">{countdown}</span>
      </div>
    )}
  </div>
)}
```

### 2.5 Scan-Button deaktivieren wenn Limit erreicht

In der `handleRescan` Funktion oder als Button-disabled-Prop:

```typescript
// Handler anpassen
const handleRescan = async () => {
  if (!websiteUrl || !websiteUrl.startsWith("https://")) return;
  if (scansRemaining <= 0) {
    toast({
      title: "Scan limit reached",
      description: `You've used all ${maxScansPerDay} daily scans. ${countdown ? `Resets in ${countdown}.` : ""}`,
      variant: "destructive",
    });
    return;
  }
  
  const success = await scanWebsite(websiteUrl);
  if (success && onContextChange) onContextChange();
};
```

Button disabled-Prop:
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={handleRescan}
  disabled={isScanning || scansRemaining <= 0}  // scansRemaining Prüfung hinzufügen
  // ...
>
```

---

## Zusammenfassung der Dateiänderungen

| Datei | Änderung |
|-------|----------|
| `useBusinessContext.ts` | `scan_count`, `scan_window_start` zum Interface; `scansRemaining`, `scanResetTime`, `maxScansPerDay` berechnen und exportieren |
| `BusinessContextPanel.tsx` | Import `Clock`; Countdown-State/Effect; UI für Scan-Zähler mit Timer; Button-Deaktivierung |

---

## Datenfluss

```text
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                        │
│  user_business_context:                                     │
│  - scan_count: 2                                            │
│  - scan_window_start: "2026-02-01T10:00:00Z"                │
└─────────────────────┬───────────────────────────────────────┘
                      │ SELECT * FROM user_business_context
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  useBusinessContext Hook                    │
│  - Lädt context.scan_count, context.scan_window_start       │
│  - Berechnet: scansRemaining = 3 - scan_count = 1           │
│  - Berechnet: scanResetTime = window_start + 24h            │
└─────────────────────┬───────────────────────────────────────┘
                      │ Return values
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                BusinessContextPanel.tsx                      │
│  - Zeigt: "1/3 scans remaining today"                       │
│  - Timer: "Resets in 12h 34m 56s" (wenn 0 remaining)        │
│  - Button disabled wenn scansRemaining = 0                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Erwartetes Verhalten

| Zustand | Anzeige |
|---------|---------|
| Erste Nutzung (kein Scan) | Keine Anzeige (scan_window_start = null) |
| Nach 1. Scan | "2/3 scans remaining today" |
| Nach 2. Scan | "1/3 scans remaining today" |
| Nach 3. Scan | "0/3 scans remaining today" + Timer |
| Timer läuft ab | Auto-Refresh, Anzeige verschwindet |
| Neuer Scan nach Reset | "2/3 scans remaining today" |

