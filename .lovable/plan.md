
# Dashboard ueberarbeiten: Buttons in Platzhalter + Emojis/Icons entfernen

## Aenderungen

### 1. `src/components/dashboard/AnalysisTabs.tsx`

**Buttons in Platzhalter-Cards:**
- `PlaceholderCard` bekommt neue optionale Props: `buttonLabel` (string) und `onAction` (callback)
- Wenn `onAction` gesetzt ist, wird ein `Button` im Platzhalter gerendert
- Website-Platzhalter: Button "Start Website Scan" -- loest `onOpenUrlDialog` aus
- Code-Platzhalter: Button "Start Code Analysis" -- loest `onOpenGithubDialog` aus
- AnalysisTabsContent bekommt zwei neue optionale Props: `onOpenUrlDialog?: () => void` und `onOpenGithubDialog?: () => void`

**Emojis/Icons aus Sektions-Headern entfernen:**
- Zeile 77: `<Globe>` Icon vor "Website Analysis" entfernen -- nur Text bleibt
- Zeile 231: `<Code2>` Icon vor "Code Analysis" entfernen -- nur Text bleibt
- Import von `Globe` und `Code2` aus lucide-react entfernen (falls nicht anderweitig genutzt)
- Auch `PlaceholderCard` bekommt kein Icon mehr -- der `icon` Prop wird entfernt, stattdessen nur Titel + Beschreibung + Button

### 2. `src/pages/Chat.tsx`

- Zwei State-Handler erstellen:
  - `handleOpenUrlDialog`: setzt den URL-Dialog-State (dieselbe Logik wie der Plus-Button in ChatInput -- muss den Dialog in ChatInput oeffnen)
  - `handleOpenGithubDialog`: oeffnet den GitHub-Popover (dieselbe Logik wie der GitHub-Button in ChatInput)
- Da die Dialoge in `ChatInput` leben, wird die einfachste Loesung sein, Refs oder Callbacks hochzureichen:
  - Neue Props an `ChatInput`: `urlDialogRef` und `githubDialogRef` (oder einfacher: `ChatInput` exportiert imperative handles)
  - Alternativ (einfacher): Zwei neue State-Variablen in Chat.tsx (`urlDialogOpen`, `githubDialogOpen`), die als Props an ChatInput durchgereicht werden und dort den Dialog/Popover steuern
- `AnalysisTabsContent` bekommt `onOpenUrlDialog` und `onOpenGithubDialog` als Props durchgereicht

### 3. `src/components/chat/ChatInput.tsx`

- Neuer optionaler Prop: `externalDialogOpen?: boolean` und `onExternalDialogChange?: (open: boolean) => void`
- Neuer optionaler Prop: `externalGithubOpen?: boolean` und `onExternalGithubChange?: (open: boolean) => void`
- Die bestehenden `dialogOpen` und `githubPopoverOpen` States werden mit den externen Props synchronisiert (controlled/uncontrolled Pattern)

### 4. `src/components/dashboard/CodeAnalysisCard.tsx`

**Icons aus Labels entfernen:**
- Zeile 137: `<CheckCircle2>` Icon vor "Strengths" entfernen
- Zeile 152: `<XCircle>` Icon vor "Weaknesses" entfernen
- Zeile 174: `<Shield>` Icon vor "Security Issues" entfernen
- Zeile 193: `<Search>` Icon vor "SEO Code Issues" entfernen
- SubScores-Row (Zeile 59-63): Die `icon` Property aus den subScores-Objekten entfernen (sie werden ohnehin nicht gerendert, nur definiert)
- Import-Zeile bereinigen: Nur `ExternalLink` behalten (wird fuer den Repo-Link benoetigt)

---

## Technische Details

### PlaceholderCard (neue Signatur)

```typescript
const PlaceholderCard = ({ 
  title, 
  description, 
  buttonLabel, 
  onAction 
}: { 
  title: string; 
  description: string; 
  buttonLabel?: string; 
  onAction?: () => void; 
}) => (
  <Card className="border-dashed border-border bg-card/50">
    <CardContent className="p-8 flex flex-col items-center text-center gap-3">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
      {onAction && buttonLabel && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {buttonLabel}
        </Button>
      )}
    </CardContent>
  </Card>
);
```

### Dialog-Steuerung (Chat.tsx -> ChatInput.tsx)

Chat.tsx haelt zwei States:
- `urlDialogOpen` / `setUrlDialogOpen`
- `githubDialogOpen` / `setGithubDialogOpen`

Diese werden als Props an ChatInput weitergegeben. ChatInput merged sie mit seinem internen State ueber `useEffect`:
```typescript
useEffect(() => {
  if (externalDialogOpen) setDialogOpen(true);
}, [externalDialogOpen]);
```
Und ruft `onExternalDialogChange(false)` auf wenn der Dialog geschlossen wird.

### Dateien
1. `src/components/dashboard/AnalysisTabs.tsx` -- Buttons + Icons entfernen
2. `src/components/dashboard/CodeAnalysisCard.tsx` -- Icons entfernen
3. `src/components/chat/ChatInput.tsx` -- Externe Dialog-Steuerung
4. `src/pages/Chat.tsx` -- State-Weiterleitung
