

# Business-Oriented Dashboard Redesign

## 3 Changes

### 1. Rename Categories from Technical to Business-Oriented

Replace the generic SEO/UX/Content/Trust/Speed scores with categories that reflect real business value for small business owners.

**Old → New mapping:**

| Old | New | Key in code |
|-----|-----|-------------|
| SEO | Findability | findability |
| UX | Mobile Usability | mobileUsability |
| Content | Offer Clarity | offerClarity |
| Trust | Trust & Proof | trustProof |
| Speed | Conversion Readiness | conversionReadiness |

**Files affected:**
- `src/lib/mock-chat-data.ts` -- rename `categoryScores` keys + update `WebsiteProfile` type
- `src/components/chat/WebsiteProfileCard.tsx` -- update `CategoryBar` labels
- `src/components/dashboard/ComparisonTable.tsx` -- update category labels

### 2. Add Analysis Mode Tabs in Dashboard

Add a horizontal tab bar below the "Workspace" header with 4 analysis perspectives:

- **Overview** (default) -- shows profiles + comparison as today
- **Positioning** -- shows side-by-side positioning comparison (target audience, USP, differentiators)
- **Offer & CTAs** -- shows CTA comparison, contact flow, pricing logic
- **Trust & Proof** -- shows trust signals, reviews, certifications comparison

Each tab renders a focused card view pulling data from existing `profileData` fields. No new data needed -- just different visual groupings of strengths/weaknesses/CTAs/USP.

**Files affected:**
- `src/pages/Chat.tsx` -- add tab state + tab bar in dashboard panel
- New file: `src/components/dashboard/AnalysisTabs.tsx` -- tab content for each mode

### 3. Add Improvement Plan Section in Dashboard

Bring back a focused "Improvement Plan" section (not the old Kanban planner). This is a simple, visual card list showing actionable tasks derived from the analysis.

Each card shows:
- Task title (e.g. "Improve hero headline")
- Priority indicator (colored left border)
- Category tag matching the new business categories

This section sits below the comparison in the dashboard, always visible when profiles exist.

**Files affected:**
- `src/pages/Chat.tsx` -- add Improvement Plan section
- New file: `src/components/dashboard/ImprovementPlan.tsx` -- renders task cards from `mockTasks`
- `src/lib/mock-chat-data.ts` -- update task categories to match new business categories

---

## Technical Details

### Type Change in `mock-chat-data.ts`

```typescript
categoryScores: {
  findability: number;
  mobileUsability: number;
  offerClarity: number;
  trustProof: number;
  conversionReadiness: number;
};
```

### Analysis Tabs Component

Simple state-driven component using existing `Tabs` from shadcn. Each tab filters/groups existing profile data differently -- no new API or data structures needed.

### Improvement Plan Component

A compact vertical list of task cards (not Kanban). Each card: title, colored priority border, category badge. Uses existing `mockTasks` data with updated category names.

### Files Summary

| File | Action |
|------|--------|
| `src/lib/mock-chat-data.ts` | Update categoryScores keys + task categories |
| `src/components/chat/WebsiteProfileCard.tsx` | Update category labels |
| `src/components/dashboard/ComparisonTable.tsx` | Update category labels |
| `src/pages/Chat.tsx` | Add analysis tabs + improvement plan section |
| `src/components/dashboard/AnalysisTabs.tsx` | New -- tab content views |
| `src/components/dashboard/ImprovementPlan.tsx` | New -- task card list |

