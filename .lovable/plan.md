

# Unified Chat + Dynamic Dashboard (English, Visual-First)

## Core Concept

The dashboard panel is NOT a separate static view with tabs -- it dynamically updates based on what's being discussed in the chat. When a website is analyzed, its profile card appears in the dashboard. When a comparison happens, a visual comparison appears. When tasks are created, a visual planner updates. No boring text walls -- everything is visual.

---

## What Changes

### 1. `src/lib/mock-chat-data.ts` -- Rewrite in English with visual data

All mock data switches to English. Add score/metric fields to `WebsiteProfile` for visual rendering:

- `profileData` gets numeric scores: `overallScore` (0-100), `categoryScores` (object with SEO, UX, Content, Trust, Speed as 0-100 values)
- Tasks get a `category` field (for grouping in the planner)
- Conversations and messages all in English

### 2. `src/components/chat/WebsiteProfileCard.tsx` -- Visual redesign

Replace text-heavy layout with a visual card:
- Circular score indicator (overall score, color-coded)
- Small horizontal bars for category scores (SEO, UX, Content, Trust, Speed)
- Strengths/weaknesses as colored dot indicators (green/red), max 3 each, minimal text
- Badge for "Your Site" vs "Competitor"
- No long paragraphs

### 3. `src/components/dashboard/ComparisonTable.tsx` -- Visual comparison

Replace the text table with a visual comparison:
- Side-by-side bar chart comparison per category (horizontal bars, your site vs competitor)
- Color-coded: primary (orange) for your site, muted for competitors
- Category labels on the left, bars extending right
- Score numbers at the end of each bar
- No text paragraphs -- pure visual

### 4. `src/components/dashboard/TaskCard.tsx` -- Visual task card (English)

- All labels in English ("To Do", "In Progress", "Done", "Priority: High/Medium/Low")
- Add a small colored left-border (red = high, orange = medium, gray = low priority)
- Cleaner, more compact design

### 5. `src/components/dashboard/TaskBoard.tsx` -- Visual Kanban planner

- Horizontal Kanban layout with 3 columns (To Do, In Progress, Done)
- Each column has a colored header bar and count badge
- Progress bar at the top showing overall completion (X of Y tasks done)
- Column labels in English

### 6. `src/components/dashboard/WebsiteGrid.tsx` -- English labels

- "Your Website" / "Competitors (X)" as section headers
- Uses the new visual WebsiteProfileCard

### 7. `src/pages/Chat.tsx` -- Dynamic dashboard panel

Major rework of the dashboard panel:
- Remove the static Tabs. Instead, the dashboard dynamically shows content relevant to the current conversation:
  - **Website profiles** that have been discussed appear as visual cards
  - **Comparison view** appears when 2+ sites are in the conversation
  - **Planner** always visible at the bottom with associated tasks
- The dashboard header shows "Workspace" instead of "Dashboard"
- All UI labels in English ("Select a conversation", "messages", etc.)
- New conversation button: "New Conversation"
- Chat placeholder: "Enter a URL or ask a question..."
- Mock assistant response in English

### 8. `src/components/chat/ChatSidebar.tsx` -- English

- "New Conversation" button label
- Date formatting in English (en-US)

### 9. `src/components/chat/ChatInput.tsx` -- English

- Placeholder text in English

### 10. `src/components/chat/ChatMessage.tsx` -- No changes needed

Already language-neutral (renders markdown content).

---

## Visual Dashboard Behavior

The right panel is a dynamic workspace, not tabs. It renders sections based on what exists in the current conversation context:

```text
+----------------------------------+
| WORKSPACE                        |
|                                  |
| [Website Card: Your Site]  85/100|
| [Website Card: Competitor] 72/100|
|                                  |
| --- COMPARISON (if 2+ sites) ---|
| SEO    ████████░░ 80  vs ██████░ 65|
| UX     ███████░░░ 70  vs ████████ 85|
| ...                              |
|                                  |
| --- PLANNER -------------------- |
| Progress: ████████░░ 3/5 done    |
| [To Do]  [In Progress]  [Done]  |
| [card]   [card]         [card]  |
+----------------------------------+
```

---

## Files Summary

| File | Action |
|------|--------|
| `src/lib/mock-chat-data.ts` | Rewrite (English + scores) |
| `src/pages/Chat.tsx` | Rewrite dashboard panel (dynamic, English) |
| `src/components/chat/WebsiteProfileCard.tsx` | Rewrite (visual scores) |
| `src/components/chat/ChatSidebar.tsx` | Update labels to English |
| `src/components/chat/ChatInput.tsx` | Update placeholder to English |
| `src/components/dashboard/ComparisonTable.tsx` | Rewrite (visual bars) |
| `src/components/dashboard/TaskBoard.tsx` | Update to English + progress bar |
| `src/components/dashboard/TaskCard.tsx` | Update to English + colored border |
| `src/components/dashboard/WebsiteGrid.tsx` | Update labels to English |

