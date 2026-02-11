

# Fix: Duplicate Website Profiles in Dashboard

## Root Cause

When the user clicks "Start Analysis", each URL creates a **new** `website_profiles` row (line 281-291 in `analyze-website/index.ts`). Old profiles for the same conversation are **never deleted or replaced**. So re-analyzing the same or different URLs causes:

1. Duplicate entries in WebsiteGrid (e.g. two "Synoptas" cards)
2. Conflicting bars in ComparisonTable (old vs new scores shown together)
3. The legend shows all profiles including stale ones

## Solution

**Before starting a new analysis batch**, delete all existing `website_profiles` for the active conversation. This ensures only the latest analysis results are shown.

### Change 1: `src/pages/Chat.tsx` -- `handleScan` function

Add a cleanup step at the beginning of `handleScan` (before firing `analyzeWebsite` calls):

- Delete all existing `website_profiles` where `conversation_id = activeId`
- Also delete related `improvement_tasks` for those profiles
- Clear the local `profiles` and `tasks` state immediately so the UI resets

```
// Before line 214 (the allUrls block):
// 1. Delete old profiles and tasks for this conversation
const oldProfileIds = profiles.map(p => p.id);
if (oldProfileIds.length > 0) {
  await supabase.from("improvement_tasks").delete().in("website_profile_id", oldProfileIds);
}
await supabase.from("website_profiles").delete().eq("conversation_id", activeId);
setProfiles([]);
setTasks([]);
```

### Change 2: `src/lib/api/chat-api.ts` -- Add `deleteProfilesForConversation` helper

Export a new function to cleanly delete old profiles:

```typescript
export async function deleteProfilesForConversation(conversationId: string): Promise<void> {
  // First get profile IDs to delete related tasks
  const { data: oldProfiles } = await supabase
    .from("website_profiles")
    .select("id")
    .eq("conversation_id", conversationId);

  if (oldProfiles && oldProfiles.length > 0) {
    const ids = oldProfiles.map((p) => p.id);
    await supabase.from("improvement_tasks").delete().in("website_profile_id", ids);
  }

  await supabase.from("website_profiles").delete().eq("conversation_id", conversationId);
}
```

### Change 3: Database -- Add DELETE RLS policy for `website_profiles`

Currently, users **cannot delete** website_profiles (no DELETE policy exists). We need to add one:

```sql
CREATE POLICY "Users can delete own profiles"
  ON public.website_profiles FOR DELETE
  USING (auth.uid() = user_id);
```

### Change 4: `src/pages/Chat.tsx` -- Use the new helper

Import and call `deleteProfilesForConversation` at the start of `handleScan`:

```typescript
import { deleteProfilesForConversation } from "@/lib/api/chat-api";

// Inside handleScan, before allUrls:
await deleteProfilesForConversation(activeId);
setProfiles([]);
setTasks([]);
```

## Summary of Changes

| File / Resource | Change |
|---|---|
| Database (migration) | Add DELETE RLS policy on `website_profiles` |
| `src/lib/api/chat-api.ts` | New `deleteProfilesForConversation()` function |
| `src/pages/Chat.tsx` | Call cleanup before starting new analysis |

## Why This Fixes the Issues

- **No more duplicates**: Old profiles are removed before new ones are inserted
- **No contradicting bars**: Only the latest analysis results exist
- **Clean re-analysis**: Changing URLs or models and re-running gives fresh results
- **Tasks stay in sync**: Old improvement tasks are cleaned up with their profiles

