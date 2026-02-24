

# Deep Code Analysis: Ladebalken + Auto-Scroll bei Fertigstellung

## Uebersicht

Die Deep Code Analysis bekommt einen Fortschrittsbalken im Chat (analog zur URL-Analyse) und scrollt nach Abschluss automatisch zur Code-Quality-Sektion im Dashboard.

## Aktuelle Situation

- URL-Analyse: Hat Fortschrittsbalken via `AnalysisProgress`-Komponente (nutzt `profile.status` aus der Queue)
- Deep Code Analysis: Kein visueller Fortschritt -- nur eine Chat-Nachricht "Starting Deep Analysis..." und dann Warten bis fertig
- Der Deep-Code-Analysis-Aufruf ist synchron (`addGithubAnalysis` wartet auf die Edge Function Response), es gibt keine Queue-Status-Updates

## Loesung

Da die Deep Code Analysis synchron ablaeuft (kein Queue-System), wird ein **lokaler State-basierter Fortschrittsbalken** im Chat angezeigt, der die Phasen simuliert:

1. **Fetching repository** (0-33%)
2. **Analyzing code** (33-66%)  
3. **Generating results** (66-90%)
4. **Done** (100%)

### Aenderung 1: Neuer State `codeAnalysisProgress` in `useChatMessages.ts`

- Neuer State: `codeAnalysisProgress: { active: boolean; phase: string; percent: number } | null`
- Wird beim Start auf Phase 1 gesetzt und automatisch per Timer hochgestuft
- Bei Abschluss/Fehler auf `null` zurueckgesetzt
- Wird als Return-Wert des Hooks exportiert

### Aenderung 2: `handleGithubDeepAnalysis` erweitern

```text
// Vor addGithubAnalysis:
setCodeAnalysisProgress({ active: true, phase: "Fetching repository...", percent: 15 });

// Timer: nach ~3s auf "Analyzing code..." (45%), nach ~8s auf "Generating results..." (75%)

// Nach erfolgreichem Abschluss:
setCodeAnalysisProgress({ active: true, phase: "Done", percent: 100 });
// Nach 2s: setCodeAnalysisProgress(null);

// + Auto-Scroll zur Code-Quality-Sektion im Dashboard:
setTimeout(() => {
  document.getElementById("section-code-quality")?.scrollIntoView({ behavior: "smooth" });
}, 500);
```

### Aenderung 3: Fortschrittsbalken im Chat rendern (`Chat.tsx`)

Direkt unter dem bestehenden `AnalysisProgress` (fuer URL-Analysen) wird ein neuer Block fuer die Code-Analyse angezeigt, wenn `codeAnalysisProgress` aktiv ist:

```text
{codeAnalysisProgress && (
  <div className="mx-auto max-w-3xl w-full px-4 pb-3">
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        {codeAnalysisProgress.phase === "Done" ? (
          <CheckCircle2 className="w-4 h-4 text-chart-6" />
        ) : (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        )}
        Deep Code Analysis
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <Code className="w-3 h-3 text-muted-foreground" />
            GitHub Repository
          </span>
          <span className={config.color}>{codeAnalysisProgress.phase}</span>
        </div>
        <Progress value={codeAnalysisProgress.percent} className="h-1.5" />
      </div>
    </div>
  </div>
)}
```

### Aenderung 4: Erfolgs-Toast mit Hinweis

Nach Abschluss wird der bestehende Toast erweitert:

```text
toast.success("Deep Code Analysis complete!", {
  description: "Results are now available in the Code Quality section.",
});
```

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/hooks/useChatMessages.ts` | Neuer State `codeAnalysisProgress`, Timer-Logik in `handleGithubDeepAnalysis`, Auto-Scroll, Export |
| `src/pages/Chat.tsx` | `codeAnalysisProgress` aus Hook lesen, Fortschrittsbalken-UI rendern |

