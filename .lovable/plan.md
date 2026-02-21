

# Fix: Analytics Dashboard aktualisiert sich nicht nach Loeschung

## Problem
Die `AnalyticsOverview`-Komponente laedt Daten nur einmalig beim Rendern. Wenn ein Benutzer eine Konversation loescht (und damit die zugehoerigen Website-Profile aus der Datenbank entfernt werden), zeigt das Dashboard weiterhin die alten, inzwischen geloeschten Daten an.

Die Daten werden korrekt aus der Datenbank geloescht -- das Problem ist rein clientseitig (kein Refetch).

## Zur Datenschutzerklaerung
Keine Aenderung noetig. Das Analytics-Dashboard zeigt nur bereits erhobene Daten an (Website-Profile, Scores aus Sektion 8.2). Es findet keine neue Datenverarbeitung oder Weitergabe statt.

## Loesung
Einen `refreshKey`-Mechanismus einfuehren: Die Achievements-Seite uebergibt einen Zaehler an `AnalyticsOverview`, der sich erh oeht, wenn die Seite fokussiert wird (z.B. nach Rueckkehr vom Chat). So werden die Daten automatisch neu geladen.

## Technische Details

### Datei 1: `src/components/gamification/AnalyticsOverview.tsx`

- Neue optionale Prop `refreshKey` zum Interface hinzufuegen
- `refreshKey` als Dependency im `useEffect` ergaenzen, damit bei Aenderung ein Refetch erfolgt

```typescript
interface AnalyticsOverviewProps {
  userId: string;
  refreshKey?: number;  // NEU
}

// Im useEffect:
useEffect(() => {
  const fetchProfiles = async () => { ... };
  fetchProfiles();
}, [userId, refreshKey]);  // refreshKey hinzugefuegt
```

### Datei 2: `src/pages/Achievements.tsx`

- `useState` fuer einen `refreshKey`-Zaehler einfuehren
- Per `useEffect` + `window.addEventListener('focus', ...)` den Zaehler bei jedem Tab-/Seitenfokus erhoehen
- `refreshKey` an `AnalyticsOverview` uebergeben

```typescript
const [refreshKey, setRefreshKey] = useState(0);

useEffect(() => {
  const onFocus = () => setRefreshKey(k => k + 1);
  window.addEventListener('focus', onFocus);
  return () => window.removeEventListener('focus', onFocus);
}, []);

// JSX:
<AnalyticsOverview userId={user.id} refreshKey={refreshKey} />
```

### Ergebnis
Wenn der Benutzer eine Analyse im Chat loescht und dann zur Achievements-Seite zurueckkehrt (oder den Tab wechselt), werden die Dashboard-Daten automatisch neu aus der Datenbank geladen und zeigen den aktuellen Stand an.

