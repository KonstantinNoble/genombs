
# Fix: 4 Remaining Issues in Gamification System

## Issue 1: Streak updates on every Chat page load (BUG)

`useGamificationTrigger` (line 15) calls `useStreak(userId)` without `readOnly=true`. Since `useStreak` auto-triggers `updateStreak()` on mount when `readOnly` is false, opening the Chat page increments the streak -- even without running an analysis.

**Fix**: Change `useGamificationTrigger.ts` line 15 to use `readOnly=true`:
- `useStreak(userId)` becomes `useStreak(userId, true)` 
- The `triggerAfterAnalysis` function already calls `updateStreak()` explicitly when needed

## Issue 2: Streak updates on Achievements page load (BUG)

`Achievements.tsx` line 16 calls `useStreak(user?.id ?? null)` without `readOnly=true`, same problem as above.

**Fix**: Change to `useStreak(user?.id ?? null, true)`

## Issue 3: German error messages still in Chat.tsx

Lines 445 and 448 still contain German text:
- `"Dieses Modell ist nur fuer Premium-Nutzer verfuegbar."` 
- `"Keine Credits mehr -- regeneriert sich in ${hours}h."`

**Fix**: Translate to English:
- "This model is only available for Premium users."
- "No credits left -- resets in ${hours}h."

## Issue 4: Database tables verification

The 3 gamification tables (`user_streaks`, `user_badges`, `daily_tasks`) and the `update_user_streak` RPC function must exist on the **external** Supabase project (xnkspttfhcnqzhmazggn). Without them, all gamification features silently fail.

**Action needed from you**: Please confirm whether you have already run the SQL migration script that was provided earlier on your external Supabase dashboard. If not, I will provide it again after fixing the code issues above.

---

## Files to change

| File | Change |
|------|--------|
| `src/hooks/useGamificationTrigger.ts` | Line 15: add `readOnly=true` to `useStreak` call |
| `src/pages/Achievements.tsx` | Line 16: add `readOnly=true` to `useStreak` call |
| `src/pages/Chat.tsx` | Lines 445, 448: translate German error messages to English |
