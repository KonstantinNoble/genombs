
# Business Context AI - Frontend Implementierung

## Uebersicht

Erstellung der Frontend-Komponenten fuer das Business Context Feature. Das Backend (Datenbank-Tabelle, Edge Functions) wird im naechsten Schritt separat implementiert.

---

## Architektur

```text
ValidationPlatform.tsx
        |
        v
+------------------------+
| BusinessContextPanel   |  <-- Neues ausklappbares Panel
+------------------------+
        |
        v
+------------------------+
| useBusinessContext     |  <-- Neuer React Hook
| (CRUD + Scrape)        |
+------------------------+
        |
        v (externe Supabase)
+------------------------+
| user_business_context  |  <-- Tabelle (spaeter)
| scrape-business-website|  <-- Edge Function (spaeter)
+------------------------+
```

---

## Neue Dateien

### 1. `src/hooks/useBusinessContext.ts`

React Hook fuer die Business Context Verwaltung:

**Funktionen:**
- `loadContext()` - Laedt bestehenden Context aus Supabase
- `saveContext(data)` - Speichert/aktualisiert Context (upsert)
- `scanWebsite(url)` - Ruft `scrape-business-website` Edge Function auf
- `clearContext()` - Loescht den Context

**States:**
- `context: BusinessContext | null` - Aktueller Context
- `isLoading: boolean` - Lade-Status
- `isSaving: boolean` - Speicher-Status
- `isScanning: boolean` - Website-Scan laeuft
- `lastScanned: Date | null` - Zeitpunkt des letzten Scans

**Interface:**
```typescript
interface BusinessContext {
  id: string;
  user_id: string;
  industry: string | null;
  company_stage: string | null;
  team_size: string | null;
  revenue_range: string | null;
  target_market: string | null;
  geographic_focus: string | null;
  main_challenge: string | null;
  website_url: string | null;        // Premium only
  website_summary: string | null;    // Premium only
  website_scraped_at: string | null; // Premium only
}
```

**Wichtig:** Der Hook verwendet den externen Supabase Client (`@/lib/supabase/external-client`).

---

### 2. `src/components/validation/BusinessContextPanel.tsx`

Ausklappbares Panel-UI oberhalb des Validation-Inputs:

**Struktur:**
```text
+------------------------------------------------------------------+
|  [Briefcase Icon] Business Context          [Collapse/Expand] [v]|
+------------------------------------------------------------------+
|  Context helps AI understand your specific situation             |
|                                                                  |
|  [Industry     v] [Stage        v] [Team Size    v]             |
|  [Revenue      v] [Target Market v] [Region      v]             |
|                                                                  |
|  Main Challenge (optional):                                      |
|  +------------------------------------------------------------+  |
|  | What's your biggest obstacle right now?                    |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  +-------------------- PREMIUM SECTION -----------------------+  |
|  |  [Lock] Website URL                           PREMIUM       |  |
|  |  +------------------------------------------------------+   |  |
|  |  | https://                          [Scan Website]     |   |  |
|  |  +------------------------------------------------------+   |  |
|  |  (Upgrade to auto-scan your website for context)           |  |
|  +-------------------------------------------------------------+  |
|                                                                  |
|  [Save Context]              Status: Saved / Unsaved / Saving   |
+------------------------------------------------------------------+
```

**Dropdown-Optionen:**

| Feld | Optionen |
|------|----------|
| Industry | SaaS, E-Commerce, FinTech, HealthTech, EdTech, Marketplace, Agency, Consulting, Manufacturing, Other |
| Company Stage | Idea, Pre-Seed, Seed, Series A, Series B+, Growth, Established |
| Team Size | Solo, 2-5, 6-15, 16-50, 50+ |
| Revenue Range | Pre-revenue, <$10k/mo, $10k-50k/mo, $50k-100k/mo, $100k+/mo |
| Target Market | B2B, B2C, B2B2C, D2C |
| Geographic Focus | Local, National, EU, US, Global |

**Premium-Gating fuer URL-Feld:**
- Free User: Deaktiviertes Feld mit Lock-Icon und "Premium Feature" Badge
- Premium User: Aktives Feld mit "Scan Website" Button

**Collapsible-Verhalten:**
- Initial eingeklappt wenn leer, ausgeklappt wenn Daten vorhanden
- Badge zeigt "Context Active" wenn mindestens ein Feld ausgefuellt
- Smooth Animation beim Ein-/Ausklappen

---

## Bearbeitete Dateien

### 3. `src/pages/ValidationPlatform.tsx`

Aenderungen:
1. Import des neuen `useBusinessContext` Hooks
2. Import der neuen `BusinessContextPanel` Komponente
3. Platzierung des Panels zwischen Header und ValidationInput Card
4. Weitergabe von `isPremium` an das Panel

**Einbindung (nach Zeile 545, vor der Card):**
```tsx
{/* Business Context Panel */}
<BusinessContextPanel 
  isPremium={isPremium}
  onContextChange={() => {
    // Optional: Toast wenn Context gespeichert
  }}
/>

<Card className="border-primary/20 shadow-elegant">
  ...
```

---

## UI/UX Details

### Collapsed State (Badge-Anzeige)
```text
+------------------------------------------------------------------+
|  [Briefcase] Business Context  [Context Active ✓]      [Expand v]|
+------------------------------------------------------------------+
```

### Expanded State (vollstaendig)
- 6 Dropdowns in 2 Reihen (responsive: 3 pro Reihe auf Desktop, 2 auf Tablet, 1 auf Mobile)
- Main Challenge Textarea (max 300 Zeichen)
- Premium Website URL Section mit visueller Trennung
- Save Button mit Lade-Status

### Premium Teaser (fuer Free User)
```text
+------------------------------------------------------------+
|  [Lock Icon] Website URL                      PREMIUM       |
|  +--------------------------------------------------------+ |
|  | https://                                [Deaktiviert]  | |
|  +--------------------------------------------------------+ |
|  Auto-scan your website to give AI more context            |
|  [Upgrade to Premium ->]                                    |
+------------------------------------------------------------+
```

### Nach erfolgreichem Scan
```text
|  Website: https://example.com       [Re-scan] Last: 2d ago  |
|  +--------------------------------------------------------+ |
|  | "B2B SaaS platform for project management..."          | |
|  +--------------------------------------------------------+ |
```

---

## Styling-Richtlinien

- Verwendet bestehende Tailwind-Klassen und UI-Komponenten
- Collapsible verwendet `@radix-ui/react-collapsible`
- Dropdowns verwenden `Select` aus `@/components/ui/select`
- Konsistentes Design mit ValidationInput (rounded-2xl, Glow-Effekte)
- Badge fuer "Premium Feature" nutzt Amber-Farbschema (wie bestehende Premium-Badges)
- Panel-Hintergrund: `bg-muted/30` mit `border border-border/60`

---

## Technische Hinweise

### Supabase Client
Der Hook verwendet den **externen Supabase Client**:
```typescript
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/external-client';
```

### Vorbereitung fuer Backend
Der Hook ist so strukturiert, dass er mit der geplanten Tabelle `user_business_context` und Edge Function `scrape-business-website` funktioniert. Bis das Backend existiert:
- `loadContext()` gibt `null` zurueck (Tabelle existiert noch nicht)
- `saveContext()` zeigt temporaer einen Toast mit Info
- `scanWebsite()` zeigt Fehlermeldung (Edge Function existiert noch nicht)

### TypeScript Types
Da die Tabelle noch nicht existiert, werden die Types manuell im Hook definiert. Nach der Backend-Migration werden sie automatisch in `types.ts` generiert.

---

## Implementierungs-Reihenfolge

1. **`useBusinessContext.ts`** - Hook mit Interface und Supabase-Calls (prepared)
2. **`BusinessContextPanel.tsx`** - UI-Komponente mit allen Feldern
3. **`ValidationPlatform.tsx`** - Integration des Panels
4. **Testen** - UI-Funktionalitaet pruefen (Saves werden erst nach Backend funktionieren)

---

## Naechster Schritt (Backend)

Nach dieser Frontend-Implementierung:
1. SQL Migration im externen Supabase ausfuehren
2. Edge Function `scrape-business-website` erstellen
3. `multi-ai-query` erweitern um Context-Injection
4. Edge Functions manuell deployen
