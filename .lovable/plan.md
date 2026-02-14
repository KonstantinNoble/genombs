

## Google PageSpeed Insights Integration -- Vollstaendiger Implementierungsplan

### Vorbedingung: API-Key Secret

Das Secret `PAGESPEED_GOOGLE` ist aktuell **nicht** in der Lovable Cloud Umgebung verfuegbar, wo die Edge Functions laufen. Es muss dort als Secret hinzugefuegt werden, bevor die Integration funktioniert. Dies wird im ersten Schritt erledigt.

### Aenderungsuebersicht

| # | Datei / Aktion | Aenderung |
|---|----------------|-----------|
| 1 | Secret hinzufuegen | `PAGESPEED_GOOGLE` API-Key als Lovable Cloud Secret anlegen |
| 2 | Datenbank-Migration (externe Instanz) | `pagespeed_data jsonb` Spalte in `website_profiles` hinzufuegen |
| 3 | `supabase/functions/process-analysis-queue/index.ts` | PageSpeed API-Aufruf + Prompt-Erweiterung + Daten speichern |
| 4 | `src/types/chat.ts` | `PageSpeedData` Interface + Feld in `WebsiteProfile` |
| 5 | `src/components/dashboard/PageSpeedCard.tsx` (neu) | Score-Anzeige mit Google-Ampelsystem |
| 6 | `src/components/dashboard/AnalysisTabs.tsx` | Neuer "Technical Performance" Bereich einbauen |

---

### Schritt 1: Secret `PAGESPEED_GOOGLE`

Der API-Key wird ueber das Secret-Tool in Lovable Cloud hinterlegt, damit die Edge Function per `Deno.env.get("PAGESPEED_GOOGLE")` darauf zugreifen kann.

### Schritt 2: Datenbank-Migration

```sql
ALTER TABLE public.website_profiles
ADD COLUMN IF NOT EXISTS pagespeed_data jsonb DEFAULT NULL;
```

Diese Migration laeuft auf der externen Supabase-Instanz, auf der alle Tabellen liegen.

### Schritt 3: Edge Function `process-analysis-queue/index.ts`

**Neue Funktion `fetchPageSpeedData`** (ca. 40 Zeilen, vor der `processQueue`-Funktion):

- Liest `PAGESPEED_GOOGLE` per `Deno.env.get()`
- Ruft `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` auf mit:
  - `url` = die zu analysierende URL
  - `strategy=mobile`
  - `category=performance&category=accessibility&category=best-practices&category=seo`
  - `key={PAGESPEED_GOOGLE}`
- Extrahiert aus der Antwort:
  - 4 Kategorie-Scores (Performance, Accessibility, Best Practices, SEO) -- jeweils `* 100` gerundet
  - Core Web Vitals: LCP, CLS, FCP, TBT, Speed Index aus `lighthouseResult.audits`
- Gibt ein strukturiertes Objekt zurueck oder `null` bei Fehler (non-blocking, darf Analyse nicht abbrechen)

**Integration in den Job-Loop** (nach Firecrawl-Crawling, vor KI-Analyse, ca. Zeile 497):

1. `const pagespeedData = await fetchPageSpeedData(job.url);` aufrufen
2. Falls Daten vorhanden: dem `buildEnrichedContext`-Ergebnis einen neuen Abschnitt anhaengen:

```text
=== GOOGLE PAGESPEED DATA (objective, verified by Google) ===
Performance: 85/100
Accessibility: 92/100
Best Practices: 78/100
SEO: 95/100
Core Web Vitals: LCP=2.1s, CLS=0.05, FCP=1.2s, TBT=180ms
```

3. Damit die KI diese Daten bei der Bewertung beruecksichtigt, wird der `ANALYSIS_SYSTEM_PROMPT` um einen Absatz erweitert:

```text
If Google PageSpeed data is provided in the context, use it to anchor your scores:
- findability: Weight Google's SEO score heavily (within +/-10 points of Google's value)
- mobileUsability: Factor in Performance score and Core Web Vitals (LCP < 2.5s = good, > 4s = poor)
- Reference these objective metrics in the strengths/weaknesses where relevant
```

4. Beim Speichern der Ergebnisse (Zeile 519-528) wird `pagespeed_data` als zusaetzliches Feld mitgegeben:

```typescript
await supabaseAdmin
  .from("website_profiles")
  .update({
    status: "completed",
    profile_data: analysisResult.profileData,
    category_scores: analysisResult.categoryScores,
    overall_score: analysisResult.overallScore,
    pagespeed_data: pagespeedData,  // NEU
    error_message: null,
  })
  .eq("id", job.profile_id);
```

### Schritt 4: TypeScript-Typen (`src/types/chat.ts`)

Neues Interface:

```typescript
export interface PageSpeedData {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  coreWebVitals: {
    lcp: number | null;
    cls: number | null;
    fcp: number | null;
    tbt: number | null;
    speedIndex: number | null;
  };
}
```

`WebsiteProfile` erhaelt: `pagespeed_data?: PageSpeedData | null;`

### Schritt 5: Neue Komponente `PageSpeedCard.tsx`

Zeigt die 4 Google-Scores als Kreisdiagramme im Ampelsystem:
- Gruen: >= 90
- Orange: 50-89
- Rot: < 50

Darunter Core Web Vitals als kompakte Metriken (LCP, CLS, FCP).
Footer: "Source: Google PageSpeed Insights" fuer Glaubwuerdigkeit.
Falls `pagespeed_data` null ist: dezenter Hinweis "PageSpeed data not available".

### Schritt 6: Dashboard-Update (`AnalysisTabs.tsx`)

- Neuer Tab-Bereich "Technical Performance" wird angezeigt, wenn mindestens ein Profil `pagespeed_data` hat
- Rendert die `PageSpeedCard` fuer jedes Profil mit Daten
- Nutzt das gleiche Card-Layout wie die bestehenden Tabs (Your Site / Competitor Badges)

### Ablauf nach Implementierung

```text
User startet Analyse
       |
       v
  analyze-website (Queue Insert + Kick)
       |
       v
  process-analysis-queue startet
       |
       v
  Firecrawl Crawling (wie bisher)
       |
       v
  PageSpeed API parallel abrufen (NEU)
       |
       v
  Enriched Context bauen (Firecrawl + SEO + PageSpeed)
       |
       v
  KI-Analyse mit angereicherten Daten
       |
       v
  Ergebnis + PageSpeed-Daten in website_profiles speichern
       |
       v
  Dashboard zeigt:
  - KI-basierte Business-Scores (wie bisher)
  - Google PageSpeed Metriken (NEU)
```

