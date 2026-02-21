

# Analytics Overview on Achievements Page

A new "Analytics Overview" section will be added to the Achievements page, giving users a quick summary of their analysis activity and website data -- all on the same page below the existing Badges section.

## What will be shown

The section will query the user's `website_profiles` and `conversations` tables to display:

**Top-level stat cards (4-column grid):**
1. **Total Analyses** -- count of all completed website profiles
2. **Websites Analyzed** -- count of distinct URLs analyzed
3. **Average Score** -- average `overall_score` across all completed profiles
4. **Best Score** -- highest `overall_score` achieved

**Category Breakdown (bar/radar or simple list):**
- Average scores per category (Findability, Mobile Usability, Offer Clarity, Trust Proof, Conversion Readiness) across all completed analyses, shown as a simple horizontal bar chart or progress bars -- no extra dependency needed.

**Recent Analyses (compact list):**
- Last 5 completed analyses showing URL, score, and date -- gives quick access to recent activity.

## Technical Details

### New component: `src/components/gamification/AnalyticsOverview.tsx`
- Accepts `userId` as prop
- On mount, fetches from `website_profiles` where `user_id = userId` and `status = 'completed'`
- Computes: total count, distinct URLs, average score, best score, per-category averages
- Renders stat cards + category progress bars + recent analyses list
- Uses existing UI components (Card, Progress) -- no new dependencies

### Changes to `src/pages/Achievements.tsx`
- Import and render `<AnalyticsOverview userId={user.id} />` as a new section between Stats Cards and Badges
- Section heading: "Analytics Overview"

### Data queries (all client-side via Supabase SDK)
```
-- All completed profiles for this user
SELECT id, url, overall_score, category_scores, created_at
FROM website_profiles
WHERE user_id = :userId AND status = 'completed'
ORDER BY created_at DESC
```
No new tables, no migrations, no edge functions needed. All data already exists and is protected by existing RLS policies.

## Files to create/modify

| File | Action |
|------|--------|
| `src/components/gamification/AnalyticsOverview.tsx` | **Create** -- new component with stat cards, category bars, recent list |
| `src/pages/Achievements.tsx` | **Edit** -- add import + render `<AnalyticsOverview />` section |

