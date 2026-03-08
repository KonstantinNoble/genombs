

## Plan: Overhaul Chat Modes, Post Generator & Dashboard Integration

### Problems Identified

1. **Post Generator produces poor content** — The system prompt is too generic, resulting in spammy posts with emojis and self-promotional language. The output renders in a `<pre>` tag without markdown support.
2. **Chat unavailable in Find Customers / Generate Post modes** — The ChatInput is hidden when not in "analyze" mode, so users cannot ask follow-up questions or refine results with AI.
3. **Dashboard disconnected** — The Dashboard page only shows streaks/badges/analytics but doesn't incorporate customer maps or generated posts data.
4. **Customer Map & Post results are ephemeral** — Results exist only in component state and disappear on mode switch or page reload; they aren't tied to conversations.

---

### Changes

#### 1. Enable Chat in All Modes
**File: `src/pages/Chat.tsx`**
- Move the ChatInput outside the `chatMode === "analyze"` conditional so it's always visible
- Add mode-aware placeholder text: "Ask about your analysis..." / "Ask about your customers..." / "Refine your post..."
- When in `find_customers` or `generate_post` mode, chat messages still go through `handleSend` with the relevant context injected into the system prompt

#### 2. Fix Post Generator Quality & Layout
**File: `src/components/chat/PostGeneratorCard.tsx`**
- Replace `<pre>` output with `<ReactMarkdown>` for proper rendering
- Add a "Regenerate" button

**File: `supabase/functions/generate-post/index.ts`**
- Rewrite system prompt to be drastically more specific:
  - Prohibit emojis unless platform is TikTok/Discord
  - Enforce platform character limits strictly
  - Require genuine value-first approach (no "[link_to_product]" placeholders)
  - Add instruction: "Write as if you are a real community member, not a marketer"
  - Remove self-referential phrases like "I stumbled upon"

#### 3. Persist Customer Map & Post Results in Conversations
**File: `src/pages/Chat.tsx`**
- After customer search completes, save the result as an assistant message with `metadata.type = "customer_map"` so it persists in the conversation
- After post generation completes, save the result as an assistant message with `metadata.type = "generated_post"`
- On conversation load, restore `customerMapResult` from the last `customer_map` message metadata

**File: `src/components/chat/ChatMessage.tsx`**
- Add rendering branch for `metadata.type === "customer_map"` → render `CustomerMapCard`
- Add rendering branch for `metadata.type === "generated_post"` → render post content with copy button

#### 4. Integrate Customer Maps & Posts into Dashboard
**File: `src/pages/Dashboard.tsx`**
- Add a new section "04 — Customer Maps" showing count of maps generated, recent ICP summaries
- Add a section "05 — Generated Posts" showing count and recent posts with platform badges
- Fetch data from `customer_maps` and `generated_posts` tables on load

#### 5. Fix Post Generator Card Layout
**File: `src/components/chat/PostGeneratorCard.tsx`**
- Move the card into the chat message flow instead of a fixed bottom panel
- Ensure platform/tone/goal selectors use consistent spacing
- Generated content area: use `prose` class with ReactMarkdown instead of `<pre>`

---

### Technical Details

- **Message metadata pattern** already exists for `competitor_suggestions`; we extend it for `customer_map` and `generated_post` types
- **Dashboard queries** use the existing `supabase` client from `external-client.ts` with RLS (user can only see own data)
- **Chat context injection**: When `chatMode !== "analyze"`, prepend relevant context (customer map data or post) to the system message so the AI can discuss it
- Edge function prompt changes are the most impactful fix for post quality — no schema changes needed

