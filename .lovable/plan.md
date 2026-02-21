

# Fix: Daily Tasks not generated + AI Summary not appearing

## Root Cause Analysis

### Bug 1: Task categories don't match actual analysis scores (CRITICAL)

The `TASK_POOL` in `src/lib/task-generator.ts` uses these keys:
- `findability`, `trust`, `conversion`, `design`, `performance`, `content`

But the actual `category_scores` from the analysis pipeline (defined in `supabase/functions/process-analysis-queue/index.ts`) use:
- `findability`, `mobileUsability`, `offerClarity`, `trustProof`, `conversionReadiness`

Only `findability` matches. When `generateTasksFromScores()` picks the 2 lowest-scoring categories and looks them up in `TASK_POOL`, it finds no matching pool for keys like `mobileUsability` or `trustProof` -- so zero tasks are generated.

**Fix**: Rewrite `TASK_POOL` to use the actual category score keys: `findability`, `mobileUsability`, `offerClarity`, `trustProof`, `conversionReadiness`.

### Bug 2: AI Summary -- realtime race condition

The summary generation depends on the realtime subscription detecting when all profiles are done. The flow is:

1. `handleScan` pauses realtime (`realtimePausedRef = true`)
2. After 2 seconds, realtime resumes (`realtimePausedRef = false`)
3. The resume callback loads profiles, but does NOT check `expectedProfileCountRef` to trigger summary
4. Only subsequent realtime events (profile status changes) trigger the summary check

If all profiles complete DURING the 2-second pause window, the realtime events are missed. When realtime resumes at line 553, it loads profiles but never checks if `doneCount >= expected` -- so `generateSummary` is never called.

**Fix**: Add the same summary-trigger check in the 2-second resume callback (lines 553-562), identical to the one in the realtime handler (lines 178-191).

---

## Implementation Steps

### Step 1: Fix task-generator.ts category keys

Update `TASK_POOL` keys from `trust`/`conversion`/`design`/`performance`/`content` to `trustProof`/`conversionReadiness`/`mobileUsability`/`offerClarity` with appropriate task suggestions for each real category.

**File:** `src/lib/task-generator.ts`

| Old Key | New Key | Task Focus |
|---------|---------|------------|
| findability | findability (keep) | SEO, meta tags |
| trust | trustProof | Reviews, trust signals |
| conversion | conversionReadiness | CTAs, forms |
| design | mobileUsability | Mobile layout, responsive |
| performance | (remove - not a category) | -- |
| content | offerClarity | Headlines, value propositions |

### Step 2: Add summary-trigger check in realtime resume callback

In `src/pages/Chat.tsx`, lines 553-562: after loading profiles in the setTimeout resume block, add the same logic that checks `expectedProfileCountRef.current > 0` and `doneCount >= expected`, then calls `generateSummary()` and `triggerAfterAnalysis()`.

**File:** `src/pages/Chat.tsx`

This ensures that even if all analysis results arrive during the 2-second pause, the summary and gamification triggers still fire.

---

## Technical Details

### task-generator.ts new TASK_POOL structure:
```text
TASK_POOL keys:
  findability -> SEO tasks (keep existing)
  mobileUsability -> Mobile/responsive tasks (replaces "design")
  offerClarity -> Clarity of value proposition tasks (replaces "content")
  trustProof -> Trust signals tasks (replaces "trust")
  conversionReadiness -> CTA/conversion tasks (replaces "conversion")
```

### Chat.tsx resume callback addition:
```text
Current (line 553-562):
  loadProfiles -> dedup -> setProfiles -> loadTasks

New:
  loadProfiles -> dedup -> setProfiles -> loadTasks
  THEN check if expectedProfileCountRef > 0
    AND doneCount >= expected
    -> call generateSummary(completed, summaryTokenRef, summaryModelRef)
    -> call triggerAfterAnalysis(completed)
    -> reset expectedProfileCountRef to 0
```
