

# Fix: Customer Search ↔ Post Generator Integration + Backend Routing

## Identified Issues

1. **Wrong backend called**: Both `customerSearch()` in `chat-api.ts` and `PostGeneratorCard` call the **external Supabase** URL (`xnkspttfhcnqzhmazggn`), but the `customer-search` and `generate-post` edge functions are deployed on **Lovable Cloud** (`rrrhsbmyndgublwsirfx`). These calls will 404 or hit non-existent functions.

2. **Post Generator disconnected from Customer Search**: The flow works partially (customerMapResult is passed as props), but there's no clear UX telling users to run Customer Search first, and switching modes loses context.

3. **PostGeneratorCard imports external-client directly** instead of using the Lovable Cloud client or a centralized API function.

4. **Dashboard has no visibility** into customer maps or generated posts history.

---

## Plan

### 1. Fix backend routing for new features

**`PostGeneratorCard.tsx`**: Replace the external-client import with the Lovable Cloud client (`@/integrations/supabase/client`) for the `generate-post` edge function call. Use `VITE_SUPABASE_URL` from env or construct the URL from the Lovable Cloud project ID.

**`chat-api.ts` → `customerSearch()`**: Same fix — route to Lovable Cloud URL instead of external Supabase URL. Add a `generatePost()` API function here too, centralizing all API calls.

### 2. Connect Customer Search → Post Generator flow

- Keep `customerMapResult` state in `Chat.tsx` (already exists)
- When user switches to "Generate Post" mode and has a customerMapResult, auto-populate `productContext` and `audienceContext` from the customer map
- Add a visual indicator/button on `CustomerMapCard`: "Generate Post for this audience →" that switches to generate_post mode with context pre-filled
- If no customer map exists, show a prompt in Post Generator: "Run Customer Search first for better targeting" with a button to switch modes

### 3. PostGeneratorCard improvements

- Move the fetch call into `chat-api.ts` as `generatePost()` using Lovable Cloud URL
- Pass the full customer map (ICP + communities + product summary) as `audienceContext` so the AI knows the target communities
- Show which audience context is being used (from customer map or manual)

### 4. Dashboard: Customer Map + Post History tabs

- Add a "Customer Maps" section showing saved maps (query `customer_maps` table)
- Add a "Generated Posts" section showing post history with platform badges and copy buttons
- Both query Lovable Cloud DB via the standard client

### Technical Details

**Lovable Cloud URL construction for edge functions:**
```typescript
const LOVABLE_CLOUD_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`;
// or use the supabase client: supabase.functions.invoke('customer-search', { body: { url } })
```

Since the standard Lovable Cloud client is at `@/integrations/supabase/client`, use `supabase.functions.invoke()` for new features — this automatically targets the correct project.

**Files to modify:**
- `src/lib/api/chat-api.ts` — add `generatePost()`, fix `customerSearch()` to use Lovable Cloud
- `src/components/chat/PostGeneratorCard.tsx` — use centralized API, add audience context display
- `src/components/chat/CustomerMapCard.tsx` — add "Generate Post" CTA button
- `src/pages/Chat.tsx` — wire up the flow between modes
- `src/components/dashboard/AnalysisTabs.tsx` — add Customer Map + Post History tabs

