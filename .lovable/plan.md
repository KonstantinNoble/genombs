

## Google PageSpeed Insights Integration

### Architektur-Klarstellung

- **Lovable Cloud** = nur Frontend (React App)
- **Externe Supabase (xnkspttfhcnqzhmazggn)** = alle Tabellen, Edge Functions, Cron Jobs, Secrets
- Der API-Key `PAGESPEED_GOOGLE` liegt als Secret auf der externen Instanz und ist per `Deno.env.get("PAGESPEED_GOOGLE")` in den Edge Functions verfuegbar

### Aenderungen

| # | Wo | Datei | Aenderung |
|---|----|-------|-----------|
| 1 | Externe DB (manuell) | SQL im Supabase Dashboard | `pagespeed_data jsonb` Spalte in `website_profiles` |
| 2 | Lovable (Code) | `supabase/functions/process-analysis-queue/index.ts` | PageSpeed API-Aufruf + Prompt-Erweiterung + Daten speichern |
| 3 | Lovable (Code) | `src/types/chat.ts` | `PageSpeedData` Interface + Feld in `WebsiteProfile` |
| 4 | Lovable (Code) | `src/components/dashboard/PageSpeedCard.tsx` (neu) | Score-Anzeige mit Google-Ampelsystem |
| 5 | Lovable (Code) | `src/components/dashboard/AnalysisTabs.tsx` | Neuer "Performance" Bereich |

---

### Schritt 1: Datenbank-Migration (manuell auf externer Instanz)

Du fuehrst dieses SQL im Supabase Dashboard deiner externen Instanz aus:

```sql
ALTER TABLE public.website_profiles
ADD COLUMN IF NOT EXISTS pagespeed_data jsonb DEFAULT NULL;
```

### Schritt 2: Edge Function `process-analysis-queue/index.ts`

**Neue Funktion `fetchPageSpeedData(url: string, apiKey: string)`:**
- Ruft `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` auf
- Parameter: `url`, `strategy=mobile`, alle 4 Kategorien, `key={apiKey}`
- Extrahiert 4 Scores (Performance, Accessibility, Best Practices, SEO) je mal 100
- Extrahiert Core Web Vitals aus `lighthouseResult.audits` (LCP, CLS, FCP, TBT, Speed Index)
- Gibt strukturiertes Objekt zurueck oder `null` bei Fehler (non-blocking)

**Integration in `processQueue()` (nach Firecrawl-Crawling, vor KI-Analyse):**

1. API-Key lesen:
```text
const pagespeedApiKey = Deno.env.get("PAGESPEED_GOOGLE");
```

2. Nach dem Crawling (ca. Zeile 497):
```text
const pagespeedData = pagespeedApiKey 
  ? await fetchPageSpeedData(job.url, pagespeedApiKey) 
  : null;
```

3. Falls Daten vorhanden, dem `enrichedContent` anhaengen:
```text
=== GOOGLE PAGESPEED DATA (objective, verified by Google) ===
Performance: 85/100
Accessibility: 92/100
Best Practices: 78/100
SEO: 95/100
Core Web Vitals: LCP=2.1s, CLS=0.05, FCP=1.2s, TBT=180ms
```

4. `ANALYSIS_SYSTEM_PROMPT` erweitern:
```text
If Google PageSpeed data is provided in the context, use it to anchor your scores:
- findability: Weight Google's SEO score heavily (within +/-10 points of Google's value)
- mobileUsability: Factor in Performance score and Core Web Vitals (LCP < 2.5s = good, > 4s = poor)
- Reference these objective metrics in strengths/weaknesses where relevant
```

5. Beim Speichern (Zeile 519-528) `pagespeed_data` als Feld hinzufuegen:
```text
.update({
  status: "completed",
  profile_data: analysisResult.profileData,
  category_scores: analysisResult.categoryScores,
  overall_score: analysisResult.overallScore,
  pagespeed_data: pagespeedData,  // NEU
  error_message: null,
})
```

### Schritt 3: TypeScript-Typen (`src/types/chat.ts`)

Neues Interface:
```text
PageSpeedData {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  coreWebVitals: {
    lcp: number | null
    cls: number | null
    fcp: number | null
    tbt: number | null
    speedIndex: number | null
  }
}
```

`WebsiteProfile` erhaelt: `pagespeed_data?: PageSpeedData | null`

### Schritt 4: Neue Komponente `PageSpeedCard.tsx`

- 4 Score-Kreise im Google-Ampelsystem (gruen >= 90, orange 50-89, rot < 50)
- Core Web Vitals als kompakte Metriken (LCP, CLS, FCP, TBT)
- Footer: "Source: Google PageSpeed Insights"
- Fallback wenn `pagespeed_data` null: dezenter Hinweis

### Schritt 5: Dashboard-Update (`AnalysisTabs.tsx`)

- Neuer `tab === "performance"` Block der `PageSpeedCard` rendert
- Zeigt Daten fuer jedes Profil das `pagespeed_data` hat
- Gleiches Card-Layout wie bestehende Tabs

### Ablauf

```text
Edge Function startet (auf externer Instanz)
       |
       v
  Deno.env.get("PAGESPEED_GOOGLE") lesen
       |
       v
  Firecrawl Crawling (wie bisher)
       |
       v
  fetchPageSpeedData(url, apiKey) -- non-blocking
       |
       v
  Enriched Context = Firecrawl + SEO + PageSpeed
       |
       v
  KI-Analyse mit angereicherten Daten
       |
       v
  Ergebnis + pagespeed_data in website_profiles speichern
       |
       v
  Frontend liest pagespeed_data und zeigt PageSpeedCard
```

### Wichtig: Was DU manuell tun musst

Vor dem Testen musst du das SQL aus Schritt 1 in deinem externen Supabase Dashboard ausfuehren (SQL Editor). Alles andere wird automatisch ueber den Code hier erledigt.

