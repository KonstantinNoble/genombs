

# Premium-System: Credits, Modell-Zugang und URL-Limits

## Ubersicht

Dieses Feature fuehrt ein Credit-basiertes Nutzungssystem ein, das Free- und Premium-Nutzer klar unterscheidet. Credits regenerieren sich alle 24 Stunden. Verschiedene Aktionen kosten unterschiedlich viele Credits, und Premium-Nutzer erhalten Zugang zu allen Modellen und mehr URL-Feldern.

## Regeln im Detail

| Eigenschaft | Free | Premium |
|---|---|---|
| Modelle | Gemini Flash, GPT Mini | Alle 5 Modelle |
| Credits pro 24h | 20 | 100 |
| Chat-Nachricht (Gemini Flash / GPT Mini) | 1 Credit | 1 Credit |
| Chat-Nachricht (GPT / Claude / Perplexity) | -- | 3 Credits |
| URL-Analyse (Gemini Flash / GPT Mini) | 5 Credits | 5 Credits |
| URL-Analyse (GPT / Claude / Perplexity) | -- | 10 Credits |
| URL-Felder im Analyse-Dialog | 2 (eigene + 1 Konkurrent) | 4 (eigene + 3 Konkurrenten) |

## Aenderungen

### 1. Datenbank: `user_credits` Tabelle erweitern

Neue Spalten zur bestehenden `user_credits` Tabelle hinzufuegen:

```text
daily_credits_limit  INTEGER  DEFAULT 20
credits_used         INTEGER  DEFAULT 0
credits_reset_at     TIMESTAMPTZ  DEFAULT now() + interval '24 hours'
```

Ein neuer pg_cron Job setzt `credits_used` auf 0 und `credits_reset_at` auf `now() + 24h` fuer alle Nutzer, deren `credits_reset_at` in der Vergangenheit liegt.

### 2. Edge Functions: Credit-Pruefung und -Abzug

**`supabase/functions/chat/index.ts`**:
- Nach der User-Authentifizierung: `user_credits` abfragen
- Pruefen ob das gewaehlte Modell fuer den Nutzer verfuegbar ist (Free-User: nur `gemini-flash` und `gpt-mini`)
- Credits-Reset pruefen (wenn `credits_reset_at < now()`, automatisch zuruecksetzen)
- Pruefen ob genuegend Credits vorhanden sind (1 fuer guenstige Modelle, 3 fuer teure)
- Credits abziehen (`credits_used += cost`)
- Bei Fehler: 403 mit klarer Fehlermeldung zurueckgeben

**`supabase/functions/analyze-website/index.ts`**:
- Gleiche Logik: Modell-Zugang pruefen, Credits pruefen (5 fuer guenstig, 10 fuer teuer)
- Credits abziehen pro URL-Analyse

### 3. AuthContext erweitern

**`src/contexts/AuthContext.tsx`**:
- Neue Felder im Context: `creditsUsed`, `creditsLimit`, `creditsResetAt`
- Diese Werte aus `user_credits` laden und per Realtime aktualisieren
- Hilfsfunktion `remainingCredits` bereitstellen

### 4. ChatInput: Modell-Sperre und URL-Limit

**`src/components/chat/ChatInput.tsx`**:
- Premium-Modelle (GPT, Claude, Perplexity) mit Lock-Icon und "Premium"-Badge versehen
- Free-User koennen diese nicht auswaehlen; Klick zeigt Tooltip "Upgrade to Premium"
- URL-Felder: Free-User sehen nur "Your Website" + "Competitor 1"; die anderen Felder sind ausgeblendet
- Premium-User sehen alle 4 Felder

### 5. Credit-Anzeige im Chat-Header

**`src/pages/Chat.tsx`**:
- Kleine Credit-Anzeige im Chat-Header: z.B. "12/20 Credits" mit Progress-Bar
- Farbe aendert sich wenn wenig Credits uebrig sind (gelb bei < 5, rot bei 0)
- Klick auf die Anzeige oeffnet Upgrade-Hinweis fuer Free-User

### 6. Fehlerbehandlung im Frontend

**`src/pages/Chat.tsx`** und **`src/lib/api/chat-api.ts`**:
- 403-Fehler abfangen und nutzerfreundliche Toast-Meldungen anzeigen:
  - "Keine Credits mehr -- regeneriert sich in X Stunden"
  - "Dieses Modell ist nur fuer Premium-Nutzer verfuegbar"

## Technische Details

### Datenbank-Migration (SQL)

```text
ALTER TABLE public.user_credits
  ADD COLUMN daily_credits_limit INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN credits_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN credits_reset_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours');

-- Setze Premium-User auf 100 Credits Limit
UPDATE public.user_credits SET daily_credits_limit = 100 WHERE is_premium = true;

-- Trigger: Bei is_premium Aenderung -> Limit anpassen
CREATE OR REPLACE FUNCTION public.sync_credits_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.is_premium = true AND OLD.is_premium = false THEN
    NEW.daily_credits_limit := 100;
  ELSIF NEW.is_premium = false AND OLD.is_premium = true THEN
    NEW.daily_credits_limit := 20;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_premium_change
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.sync_credits_limit();
```

### Credit-Kosten-Konstanten (shared)

```text
CREDIT_COSTS = {
  chat: { cheap: 1, expensive: 3 },
  analysis: { cheap: 5, expensive: 10 }
}

EXPENSIVE_MODELS = ["gpt", "claude-sonnet", "perplexity"]
FREE_MODELS = ["gemini-flash", "gpt-mini"]
```

### Dateien die geaendert werden

| Datei | Aenderung |
|---|---|
| Datenbank-Migration | 3 neue Spalten + Trigger + pg_cron Update |
| `supabase/functions/chat/index.ts` | Credit-Check + Modell-Guard + Abzug |
| `supabase/functions/analyze-website/index.ts` | Credit-Check + Modell-Guard + Abzug |
| `src/contexts/AuthContext.tsx` | Credits-State laden + Realtime |
| `src/components/chat/ChatInput.tsx` | Modell-Lock UI + URL-Feld-Limit |
| `src/pages/Chat.tsx` | Credit-Anzeige im Header + Fehlerbehandlung |
| `src/lib/api/chat-api.ts` | 403-Fehler parsen und weiterleiten |
| `src/lib/constants.ts` | Credit-Kosten-Konstanten |

