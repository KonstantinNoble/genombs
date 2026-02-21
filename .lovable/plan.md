

# 1. Remove "Task Crusher" Badge

The `tasks_10` badge definition and its check logic will be removed from three files:

| File | Change |
|------|--------|
| `src/lib/badges.ts` | Remove the `tasks_10` entry from `BADGE_DEFINITIONS` |
| `src/hooks/useBadgeChecker.ts` | Remove the `case 'tasks_10'` block and `completedTasksCount` from the context type |

---

# 2. Credits: Deduct Only on Success

Currently credits are deducted upfront in `analyze-website` and refunded on error in `process-analysis-queue`. This creates a window where credits appear used even though the analysis hasn't finished, and refunds can fail silently.

The new approach: **check** credit availability in `analyze-website` (to block requests when credits are insufficient) but **deduct** only in `process-analysis-queue` when the analysis completes successfully.

### Changes to `analyze-website` Edge Function

- `checkAndDeductAnalysisCredits` becomes `checkAnalysisCredits` -- it still validates premium status, checks remaining credits, but **no longer calls** the `credits_used` update
- Remove the `creditsDeducted` / refund logic in the outer catch block (no longer needed)
- Remove the `refundCredits` calls for profile insert and queue insert failures
- Keep the `refundCredits` function definition (still used by process-analysis-queue via its own copy)

### Changes to `process-analysis-queue` Edge Function

- After the successful `website_profiles` update (line 837-840, status = "completed"), add a credit deduction step that increments `credits_used` by the job's cost
- Remove the `refundCredits` calls on error paths (lines 716, 878) since credits were never deducted
- Remove the timeout refund logic (lines 584-587) since credits were never deducted
- Keep the `refundCredits` function for safety but it won't be called in normal flow

### Flow Summary

```text
Before:
  analyze-website: CHECK + DEDUCT -> queue job
  process-analysis-queue: on error -> REFUND

After:
  analyze-website: CHECK only (reserve nothing) -> queue job
  process-analysis-queue: on success -> DEDUCT
                          on error -> nothing (no credits were taken)
```

This ensures users are never charged for failed analyses -- no reliance on refund logic.

