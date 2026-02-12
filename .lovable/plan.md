

# Fix: Dashboard Empty After Rescan and Missing Loading Animation

## Problem

Two related bugs in `src/pages/Chat.tsx`:

1. **Dashboard shows empty after rescan**: When rescanning websites, old profiles are cleared (`setProfiles([])`), realtime is paused for 2 seconds, and the edge function inserts new profiles during that pause. The realtime listener misses those INSERT events. The `setTimeout` callback at line 336 loads fresh profiles but never updates the `profiles` state -- it only uses them for summary generation. Result: dashboard stays empty until manual page refresh.

2. **No loading animation at scan start**: The dashboard only shows loading spinners for profiles with non-completed status (line 527). But after `setProfiles([])` and before realtime delivers new rows, `profiles` is empty. The dashboard falls through to the "Start an analysis to see results here" placeholder instead of showing a loading state.

## Fix

### Change 1: Update `setProfiles` in the summary `setTimeout` callback (line 336-381)

After `loadProfiles(activeId)` returns fresh data inside the `setTimeout`, also update the state:

```typescript
const freshProfiles = await loadProfiles(activeId);
setProfiles(freshProfiles); // <-- ADD THIS LINE
```

Also update tasks from the fresh profiles:

```typescript
const completedIds = freshProfiles.filter(p => p.status === "completed").map(p => p.id);
if (completedIds.length > 0) {
  loadTasks(completedIds).then(setTasks).catch(console.error);
}
```

### Change 2: Add explicit profile reload after realtime pause ends (line 315-317)

Replace the simple `setTimeout` that just unpauses realtime with one that also reloads profiles:

```typescript
setTimeout(() => {
  realtimePausedRef.current = false;
  // Reload profiles to catch any inserts missed during the pause
  loadProfiles(activeId).then((ps) => {
    const deduped = deduplicateProfiles(ps);
    setProfiles(deduped);
    const completedIds = deduped.filter(p => p.status === "completed").map(p => p.id);
    if (completedIds.length > 0) {
      loadTasks(completedIds).then(setTasks).catch(console.error);
    }
  });
}, 2000);
```

### Change 3: Show loading state in dashboard when `isAnalyzing` is true (line 571-575)

Update the empty-state condition to also check `isAnalyzing`. When analyzing but no profiles exist yet, show a spinner instead of "Start an analysis":

```typescript
{!hasProfiles && pendingProfiles.length === 0 &&
 profiles.filter(p => p.status === "error").length === 0 && (
  isAnalyzing ? (
    <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground text-sm">
      <Loader2 className="w-4 h-4 animate-spin" />
      Preparing analysis...
    </div>
  ) : (
    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
      Start an analysis to see results here
    </div>
  )
)}
```

## Summary

| File | Lines | Change |
|---|---|---|
| `src/pages/Chat.tsx` | 315-317 | Reload profiles after realtime pause ends |
| `src/pages/Chat.tsx` | 338 | Add `setProfiles` + task reload in summary callback |
| `src/pages/Chat.tsx` | 571-575 | Show spinner when `isAnalyzing` but no profiles yet |

