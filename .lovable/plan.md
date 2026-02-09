
# Frontend-Aenderungen: Dashboard Scan History + Competitor Suggest-Button

Nur Frontend-Aenderungen -- keine Edge Function, kein Backend.

---

## 1. Dashboard: Tabs ersetzen durch Newest / Oldest / Favorites

### Was sich aendert

Die Tabs "All / Completed / In Progress / Failed" werden entfernt und durch drei Toggle-Buttons ersetzt:

```text
Vorher:  [All]  [Completed]  [In Progress]  [Failed]
Nachher: [Newest]  [Oldest]  [Favorites]
```

### Favoriten-System

- Jede ScanCard bekommt einen klickbaren Stern (oben rechts, neben dem Status-Badge)
- Ausgefuellter Stern = Favorit, Outline = kein Favorit
- Favoriten-State wird lokal mit `useState<Set<string>>` verwaltet
- 2 Demo-Scans werden als Favoriten vormarkiert

### Technische Aenderungen

**`src/lib/demo-data.ts`**
- `demoScans` Mapping erhaelt ein neues Feld `isFavorite?: boolean`
- Die ersten 2 Demo-Scans (Stripe, Notion) bekommen `isFavorite: true`

**`src/components/genome/ScanCard.tsx`**
- Neue Props: `isFavorite: boolean` und `onToggleFavorite?: (id: string) => void`
- Stern-Icon (lucide `Star`) neben dem Status-Badge
- Klick-Handler mit `e.preventDefault()` und `e.stopPropagation()` (damit der Link nicht ausgeloest wird)
- Stern-Styling: Favorit = `fill-primary text-primary`, Nicht-Favorit = `text-muted-foreground`

**`src/pages/Dashboard.tsx`**
- `Tabs/TabsList/TabsTrigger/TabsContent` komplett entfernen
- Neuer State: `activeFilter: "newest" | "oldest" | "favorites"` (Standard: "newest")
- Neuer State: `favorites: Set<string>` (initialisiert aus Demo-Daten mit `isFavorite: true`)
- Der bestehende `sortOrder`-Toggle-Button wird entfernt (durch die neuen Filter-Buttons ersetzt)
- 3 Filter-Buttons im gleichen Bereich wie vorher die Tabs:
  - Aktiver Button: `bg-primary text-primary-foreground`
  - Inaktiver Button: `variant="outline"`
- Filter-Logik:
  - "newest": alle Scans, neueste zuerst
  - "oldest": alle Scans, aelteste zuerst
  - "favorites": nur `favorites.has(id)`, neueste zuerst
- `completedScans`, `analyzingScans`, `failedScans` Variablen werden entfernt
- `renderScanList` gibt `isFavorite` und `onToggleFavorite` an jede ScanCard weiter

---

## 2. Competitor Analysis: "Suggest Competitors" Button (nur UI)

### Was sich aendert

Ein "Suggest Competitors" Button wird neben der "Competitors (up to 3)" Ueberschrift eingefuegt. Da wir nur Frontend machen, zeigt der Button vorerst einen Toast "Coming soon" an.

### Technische Aenderungen

**`src/pages/CompetitorAnalysis.tsx`**
- Button "Suggest Competitors" neben dem Label "Competitors (up to 3)"
- `variant="outline" size="sm"`
- Disabled wenn `yourUrl` leer ist
- onClick: Toast mit "AI competitor suggestions coming soon"
- Spaeter wird hier die Edge Function angebunden

