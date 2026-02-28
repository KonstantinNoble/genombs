

# Public Score Pages -- Opt-in SEO Flywheel (Final Plan)

All code and comments will be written in English. The three refinements (canonical link, robust slug generation, premium psychology) are fully integrated.

---

## 1. Database Migration (External Supabase)

Run the following SQL on the external Supabase project (`xnkspttfhcnqzhmazggn`):

### 1a. New columns on `website_profiles`

```sql
ALTER TABLE public.website_profiles
  ADD COLUMN is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN public_slug text UNIQUE,
  ADD COLUMN published_at timestamptz;
```

### 1b. New table `publish_usage`

```sql
CREATE TABLE public.publish_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  website_profile_id uuid NOT NULL REFERENCES public.website_profiles(id) ON DELETE CASCADE,
  action text NOT NULL DEFAULT 'publish',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.publish_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own publish usage"
  ON public.publish_usage FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own publish usage"
  ON public.publish_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 1c. RLS policy for public profile viewing

```sql
CREATE POLICY "Anyone can view public profiles"
  ON public.website_profiles FOR SELECT USING (is_public = true);
```

### 1d. Helper function for monthly usage count

```sql
CREATE OR REPLACE FUNCTION public.get_monthly_publish_count(_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*)::integer
  FROM public.publish_usage
  WHERE user_id = _user_id
    AND created_at >= date_trunc('month', now())
$$;
```

---

## 2. Robust Slug Generation (`src/lib/utils.ts`)

Add a `generateSlug` utility:

```text
Input:  "https://sub.example.com/path?ref=twitter"
Output: "sub-example-com-path"
```

Logic:
- Strip protocol (`https://`, `http://`)
- Strip query params and fragments
- Replace all non-alphanumeric characters with `-`
- Lowercase
- Collapse consecutive dashes, trim leading/trailing dashes

**Collision handling**: When saving to DB, catch the unique constraint error. If slug exists, append `-1`, `-2`, etc. and retry (up to 5 attempts). Show a toast error if all retries fail.

---

## 3. Publish Button in `WebsiteProfileCard.tsx`

Add a publish/unpublish toggle below the existing card content. Three visual states:

### State A: Free User (not premium)
- Button visible with a **Lock icon** and label "Publish Score"
- On click: opens a **Dialog** (using existing `Dialog` component) with messaging:
  - Title: "Get a Do-Follow Backlink for Your SEO"
  - Body: "Upgrade to Premium to publish this report as a public page. You get 5 publications per month, each with a high-quality backlink to your domain."
  - CTA button: "View Plans" linking to `/pricing`

### State B: Premium User (limit NOT reached)
- Button with **Globe icon** and label "Publish Score" (or "Unpublish" if already public)
- Shows usage counter: "2/5 used this month"
- On publish: generates slug, updates `website_profiles`, inserts `publish_usage`, copies link to clipboard, shows success toast with the public URL
- On unpublish: sets `is_public = false` (does NOT consume a publish credit, no `publish_usage` entry)

### State C: Premium User (limit reached, 5/5)
- Button shows "5/5 used" in muted style
- On click: shows a toast/info: "You've reached your monthly limit. Your 5 publications reset on [first day of next month]."

---

## 4. New Page: `src/pages/PublicScore.tsx`

- Route: `/scores/:slug` (added in `App.tsx`, lazy-loaded)
- Fetches `website_profiles` from the **external Supabase client** where `public_slug = :slug` and `is_public = true`
- No authentication required (RLS allows anon SELECT on public rows)

### Content displayed:
- SEOHead with dynamic title, description, and **canonical link** (`/scores/:slug`)
- JSON-LD structured data (SoftwareApplication/Review schema)
- Score ring (overall score)
- 5 category bars (Findability, Mobile, Offer, Trust, Conversion)
- Strengths list (from `profile_data.strengths`)
- Do-follow backlink to the analyzed domain
- CTA: "Analyze your website" linking to `/chat`

### Content NOT displayed:
- Weaknesses, raw markdown, code analysis, error messages

### Canonical Link (SEO Best Practice):
- Uses the existing `SEOHead` component which already supports `canonical` prop
- Passes `canonical={"/scores/" + slug}` which renders `<link rel="canonical" href="https://synvertas.com/scores/example-com" />`
- This prevents duplicate content issues from social media referral parameters

---

## 5. Route & SEO Files

### `src/App.tsx`
- Add lazy import for `PublicScore`
- Add route: `<Route path="/scores/:slug" element={<PublicScore />} />`

### `public/robots.txt`
- Add `Allow: /scores/` under each user-agent block (already allowed by default `Allow: /`, but explicit is better for clarity)

### `public/sitemap.xml`
- Add a comment placeholder for `/scores/` pages. Dynamic sitemap generation could be a future enhancement via an edge function, but for now the individual score pages will be discovered through crawling and internal links.

---

## 6. Type Updates (`src/types/chat.ts`)

Add three optional fields to the `WebsiteProfile` interface:

```typescript
is_public?: boolean;
public_slug?: string | null;
published_at?: string | null;
```

---

## 7. Files Overview

| Action | File |
|--------|------|
| New | `src/pages/PublicScore.tsx` |
| Migration SQL | Run on external Supabase |
| Modify | `src/App.tsx` (new route) |
| Modify | `src/components/chat/WebsiteProfileCard.tsx` (publish button + dialog) |
| Modify | `src/types/chat.ts` (new fields) |
| Modify | `src/lib/utils.ts` (slug utility) |
| Modify | `public/robots.txt` (explicit allow) |
| Modify | `public/sitemap.xml` (comment/placeholder) |

---

## 8. Security Summary

- Public pages expose ONLY: name, URL, overall score, category scores, strengths
- Weaknesses, code analysis, and raw data remain private (frontend filtering)
- Slug uniqueness enforced at DB level with collision fallback
- Monthly limit of 5 publish actions prevents spam
- Unpublish is instant and free (no credit consumed)
- RLS policy scoped to `is_public = true` only

