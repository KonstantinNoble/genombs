

# Plan: Customer Search + Post Generator auf Lovable Cloud

## Klarstellung der Architektur

**Lovable Cloud** hostet alles: DB-Tabellen, Edge Functions, Auth.
**API-Keys** (Gemini, OpenAI, Anthropic, Perplexity, Firecrawl) müssen als Secrets auf Lovable Cloud hinzugefügt werden — die Werte kommen aus deinem externen Supabase-Projekt, aber die neuen Edge Functions laufen auf Lovable Cloud und brauchen die Keys dort.

```text
┌──────────── Lovable Cloud (rrrhsbmyndgublwsirfx) ────────────┐
│  DB: customer_maps, generated_posts, feature_usage            │
│      + bestehende Tabellen (conversations, messages, etc.)    │
│  Edge Fn: customer-search, generate-post (NEU)                │
│      + bestehende (chat, analyze-website, etc.)               │
│  Auth: Lovable Cloud Auth                                     │
│  Secrets: GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY,  │
│           PERPLEXITY_API_KEY, FIRECRAWL_API_KEY (von extern)  │
└───────────────────────────────────────────────────────────────┘
```

## Voraussetzung: Secrets hinzufügen

Folgende API-Keys müssen als Lovable Cloud Secrets hinzugefügt werden (Werte aus dem externen Projekt kopieren):
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `PERPLEXITY_API_KEY`
- `FIRECRAWL_API_KEY`

## Phase 1: Datenbank (Lovable Cloud Migration)

**`customer_maps`** — Customer Search Ergebnisse
- `id` uuid PK, `user_id` uuid, `url` text, `product_summary` text, `icp_data` jsonb, `communities` jsonb, `model_used` text, `created_at` timestamptz
- RLS: `auth.uid() = user_id` (SELECT, INSERT, UPDATE, DELETE)

**`generated_posts`** — Post-Historie
- `id` uuid PK, `user_id` uuid, `platform` text, `tone` text, `goal` text, `content` text, `audience_context` jsonb, `model_used` text, `created_at` timestamptz
- RLS: `auth.uid() = user_id`

**`feature_usage`** — Daily-Limit-Tracking
- `id` uuid PK, `user_id` uuid, `feature` text, `used_today` int DEFAULT 0, `reset_at` timestamptz
- UNIQUE on `(user_id, feature)`, RLS: `auth.uid() = user_id`

## Phase 2: Edge Function `customer-search`

1. Auth (JWT) + Credit-Check + Daily-Limit aus `feature_usage`
2. **Firecrawl** scrape URL → Produkt/Nische
3. **Perplexity** (`sonar-pro`) → Live-Suche nach Communities auf allen Plattformen (Reddit, YouTube, LinkedIn, X, Facebook, Discord, TikTok, Foren, Quora, etc.)
4. **Gemini/GPT** → Synthese zu Customer Map (ICP + Communities + Ansprache-Tipps)
5. Ergebnis in `customer_maps` speichern, Credits abziehen

Credit-Kosten: 10. Limits: Free 2/Tag, Premium 10/Tag.

## Phase 3: Edge Function `generate-post`

1. Auth + Credit-Check + Daily-Limit
2. Input: `platform`, `tone`, `goal`, `product_context`, optional `audience_context`
3. AI-Aufruf mit Multi-Model-Streaming (dieselbe Logik wie `chat/index.ts`)
4. Alle Plattformen für alle User
5. Ergebnis in `generated_posts` speichern

Credit-Kosten: 3-7 (modellabhängig). Limits: Free 5/Tag, Premium 25/Tag.

## Phase 4: Frontend

- **Mode-Selector** im Chat: Analyze | Find Customers | Generate Post
- **CustomerMapCard**: ICP-Profil + Community-Liste mit Plattform-Icons, Links, Ansprache-Tipps
- **PostGeneratorInput**: Plattform-Dropdown (alle), Ton-Toggle, Ziel-Auswahl
- **GeneratedPostCard**: Post-Anzeige mit Copy-Button
- API-Calls nutzen Lovable Cloud URL + Anon Key

## Phase 5: Constants + Pricing

```text
CUSTOMER_SEARCH_CREDIT_COST = 10
POST_GENERATOR_CREDIT_COST = 3-7
FREE_DAILY_CUSTOMER_SEARCHES = 2
PREMIUM_DAILY_CUSTOMER_SEARCHES = 10
FREE_DAILY_POSTS = 5
PREMIUM_DAILY_POSTS = 25
```

## Phase 6: Migration bestehender Features

Der `external-client.ts` wird durch den Standard Lovable Cloud Client ersetzt. Alle bestehenden `chat-api.ts` Calls werden auf Lovable Cloud umgestellt. Die bestehenden Edge Functions (chat, analyze-website, find-competitors, etc.) werden auf Lovable Cloud deployed statt auf dem externen Projekt.

## Implementierungsreihenfolge

1. API-Key Secrets auf Lovable Cloud hinzufügen
2. DB-Migration (3 neue Tabellen + RLS)
3. `customer-search` Edge Function
4. `generate-post` Edge Function
5. Frontend: Mode-Selector + neue Komponenten
6. `constants.ts` + Pricing-Page Update
7. Client-Migration: `external-client.ts` → Standard Lovable Cloud Client

