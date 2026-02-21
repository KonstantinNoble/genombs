

# Remove Daily Tasks Feature

The Daily Tasks system (generation, display, toggling) will be completely removed. The AI analysis summary and other gamification features (streaks, badges) remain untouched.

## What gets removed

- **DailyTaskPanel component** -- the "Today's Tasks" card shown on the Achievements page
- **Task generator** -- the deterministic task generation from category scores
- **Task generation in useGamificationTrigger** -- the daily_tasks insert logic (steps 2 of the hook)
- **Daily Tasks section on Achievements page** -- the entire section including the "Tasks Completed" stat card
- **DailyTask type** -- the TypeScript interface
- **Badge check for completedTasksCount** -- references to daily_tasks count in badge checking

## What stays

- AI analysis summary (generateSummary) -- this is unrelated to daily tasks
- Streaks, badges, and all other gamification
- Improvement tasks (improvement_tasks table) shown in the analysis tabs -- these are different from daily tasks
- loadTasks in Chat.tsx -- this loads improvement_tasks, not daily_tasks

## Files to change

| File | Action |
|------|--------|
| `src/components/gamification/DailyTaskPanel.tsx` | **Delete** entire file |
| `src/lib/task-generator.ts` | **Delete** entire file |
| `src/hooks/useGamificationTrigger.ts` | Remove daily_tasks generation logic (keep streak update + badge check), remove completedTasksCount query |
| `src/pages/Achievements.tsx` | Remove DailyTaskPanel import, remove "Today's Tasks" section, remove completedTasks state + fetch, remove "Tasks Completed" stat card |
| `src/types/gamification.ts` | Remove `DailyTask` interface |

## Technical Details

### useGamificationTrigger.ts changes
- Remove import of `generateTasksFromScores`
- Remove step 2 entirely (lines 25-58: daily task generation)
- Remove `completedTasksCount` query (lines 75-79)
- Pass `completedTasksCount: 0` to `checkAndUnlockBadges` (or remove it from the call)

### Achievements.tsx changes
- Remove `DailyTaskPanel` import
- Remove `completedTasks` state and `fetchCompletedCount` effect
- Remove the "Tasks Completed" stat card (third card in the grid)
- Change grid from `grid-cols-3` to `grid-cols-2`
- Remove the "Today's Tasks" section at the bottom

