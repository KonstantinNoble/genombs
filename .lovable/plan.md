

# Plan: Strip All Feature-Specific Functionality, Keep Core Infrastructure

Based on your uploaded implementation plan, here's what will be done:

## DELETE — Files & Directories

**Pages (3 files):**
- `src/pages/Chat.tsx`, `src/pages/Dashboard.tsx`, `src/pages/PublicScore.tsx`

**Component directories (4 dirs, ~40 files):**
- `src/components/chat/` (entire directory)
- `src/components/dashboard/` (entire directory)
- `src/components/gamification/` (entire directory)
- `src/components/genome/` (entire directory)

**Hooks (6 files):**
- `useChatAnalysis.ts`, `useChatMessages.ts`, `useChatConversations.ts`
- `useGamificationTrigger.ts`, `useBadgeChecker.ts`, `useStreak.ts`

**Lib files (6 files):**
- `src/lib/api/chat-api.ts` (+ `api/` folder)
- `src/lib/badges.ts`, `src/lib/demo-battlecard-data.ts`, `src/lib/demo-competitor-data.ts`, `src/lib/demo-data.ts`, `src/lib/demo-winloss-data.ts`, `src/lib/mock-chat-data.ts`

**Types (2 files):**
- `src/types/chat.ts`, `src/types/gamification.ts`

## MODIFY — Files with broken imports

1. **`App.tsx`** — Remove routes `/chat`, `/dashboard`, `/scores/:slug` and their lazy imports
2. **`Navbar.tsx`** — Remove `useStreak` import/usage, `StreakBadge` import/usage, and any links to `/chat` or `/dashboard`
3. **`Profile.tsx`** — Remove `BadgeGallery` and `CreditResetTimer` imports/usage, remove "Progress & Achievements" card
4. **`Pricing.tsx`** — Remove `FeatureComparisonTable` and `FAQSection` imports from `genome/`, replace with inline JSX or simple alternatives. Update CTA links from `/chat` to `/` or `/profile`
5. **`Home.tsx`** — Remove `FAQSection` import from `genome/`, replace with inline JSX or remove

## KEEP (unchanged)
- Auth system (`AuthContext.tsx`, `Auth.tsx`, `AuthCallback.tsx`, `ResetPassword.tsx`, `UpdatePassword.tsx`)
- Freemius payments (`useFreemiusCheckout.ts`)
- Credit system infrastructure (`constants.ts`)
- All static pages (Blog, HowItWorks, Contact, Imprint, Privacy, Terms)
- Navbar & Footer (after cleanup)
- All edge functions (backend untouched)
- All UI components (`src/components/ui/`)

## Execution order
1. Delete all files/directories listed above
2. Fix imports in the 5 modified files
3. Verify no remaining broken imports across the codebase

This is a large refactor (~50+ file deletions) but straightforward — no logic changes, just removal and import cleanup.

