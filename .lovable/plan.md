

# Verbesserte Credit-Fehlermeldungen: Free vs. Premium differenzieren

## Uebersicht

Alle 5 Stellen mit `insufficient_credits`-Fehlermeldungen werden ueberarbeitet:
- **Free User**: Ueberzeugender Hinweis auf Premium-Upgrade mit Link zur Pricing-Seite + Erklaerung was die Chat/Summary-Funktion kann
- **Premium User**: Normale Fehlermeldung ohne Upgrade-Hinweis

## Betroffene Stellen

| # | Datei | Zeilen | Kontext |
|---|---|---|---|
| 1 | `src/hooks/useChatMessages.ts` | 245-259 | Auto-Summary nach Analyse (Chat-Nachricht) |
| 2 | `src/hooks/useChatMessages.ts` | 317-319 | Normale Chat-Nachricht senden (Toast) |
| 3 | `src/hooks/useChatAnalysis.ts` | 219-224 | Website-Analyse starten (Toast) |
| 4 | `src/pages/Chat.tsx` | 139-144 | Konkurrentensuche (Toast) |
| 5 | `src/pages/Chat.tsx` | 166-171 | Konkurrenten-Analyse (Toast) |

## Aenderungen

### 1. Auto-Summary (useChatMessages.ts, Zeile 245-259)

Die Chat-Nachricht wird je nach `isPremium`-Status differenziert:

**Free User** -- ausfuehrlich mit Upgrade-Pitch:
```text
"Your website analysis completed successfully and the results are available 
in the dashboard on the right.

However, the AI Chat Summary could not be generated because your daily 
credit limit has been reached. This feature provides a concise, 
AI-powered breakdown of your analysis — highlighting key strengths, 
critical weaknesses, and actionable next steps you can take right away.

Your credits will reset in X hour(s).

Upgrade to Premium to unlock 100 daily credits and never miss out on 
AI-powered insights. [View Plans](/pricing)"
```

**Premium User** -- sachlich:
```text
"Your website analysis completed successfully and the results are available 
in the dashboard on the right.

The AI-powered summary could not be generated because your daily credit 
limit has been reached. Your credits will reset in X hour(s)."
```

### 2. Chat senden (useChatMessages.ts, Zeile 317-319)

**Free User Toast:**
```text
Title: "Daily credit limit reached"
Description: "The AI chat lets you ask follow-up questions, get tailored 
recommendations, and dive deeper into your analysis. Upgrade to Premium 
for 100 daily credits. Resets in Xh."
+ Action-Button: "View Plans" -> /pricing
```

**Premium User Toast:**
```text
Title: "Daily credit limit reached" 
Description: "Your credits will reset in Xh."
```

### 3-5. Analyse/Konkurrenten (useChatAnalysis.ts + Chat.tsx)

Gleiches Muster: Free User bekommen Upgrade-Hinweis mit Link, Premium User nur Reset-Info.

## Technische Umsetzung

- `useChatMessages.ts` braucht Zugriff auf `isPremium` -- wird als neuer Parameter im Hook-Input hinzugefuegt
- `useChatAnalysis.ts` braucht ebenfalls `isPremium` als Parameter
- `Chat.tsx` hat bereits `isPremium` aus `useAuth()`
- Fuer Toast-Actions wird `sonner`'s `action`-Property mit einem Link zur Pricing-Seite genutzt

### Neue Parameter:

**useChatMessages Hook:**
```typescript
export function useChatMessages({
    activeId,
    getAccessToken,
    profiles,
    setProfiles,
    refreshCredits,
    deduplicateProfiles,
    loadProfiles,
    isPremium,  // NEU
}: {
    // ...existing types...
    isPremium: boolean;  // NEU
})
```

**useChatAnalysis Hook:**
```typescript
export function useChatAnalysis({
    // ...existing params...
    isPremium,  // NEU
}: {
    // ...existing types...
    isPremium: boolean;  // NEU
})
```

Beide werden aus `Chat.tsx` mit dem bereits vorhandenen `isPremium`-Wert aufgerufen.

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/hooks/useChatMessages.ts` | `isPremium` Parameter + differenzierte Meldungen (Summary + Chat) |
| `src/hooks/useChatAnalysis.ts` | `isPremium` Parameter + differenzierte Toast-Meldung |
| `src/pages/Chat.tsx` | `isPremium` an Hooks durchreichen + lokale Toasts differenzieren |

