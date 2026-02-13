

## Visual Polish: Credit Display, Scrollbar & Chat UI

### 1. Credit Display Redesign (Chat Header)

**Current state:** The credit indicator shows a Zap icon + numbers + a tiny progress bar + a clock icon with timer -- all cramped together, looking cluttered.

**Changes:**
- Remove the Zap icon from the credit display
- Add a "Credits" text label for clarity
- Style the credit section as a subtle pill/badge with a border for visual distinction
- Keep the progress bar and reset timer, but integrate them more cleanly
- Remove the Clock icon from `CreditResetTimer` component, show just the countdown text

**Files:**
- `src/pages/Chat.tsx` (lines 508-518) -- Redesign credit indicator section
- `src/components/chat/CreditResetTimer.tsx` -- Remove Clock icon, simplify display

### 2. Chat Scrollbar: White Instead of Black

**Current state:** The `ScrollArea` component uses `bg-border` for the scrollbar thumb, which resolves to a dark color (`0 0% 15%`) -- nearly invisible on the dark background.

**Changes:**
- Update `src/components/ui/scroll-area.tsx` to use a lighter scrollbar thumb color (`bg-white/40` with hover `bg-white/60`) for better contrast on the dark background

**File:**
- `src/components/ui/scroll-area.tsx` -- Change thumb color to white with opacity

### 3. General Visual Polish

**Small refinements to make the chat page feel more polished:**
- Add a subtle top border glow or accent line to the chat header
- Improve the empty state message styling ("Enter a URL or ask a question...")
- Add slight padding and spacing improvements to the chat area

**File:**
- `src/pages/Chat.tsx` -- Minor styling tweaks to header, empty state

### Summary of File Changes

| File | Change |
|------|--------|
| `src/pages/Chat.tsx` | Redesign credit indicator (remove Zap icon, add "Credits" label, pill styling); polish empty state |
| `src/components/chat/CreditResetTimer.tsx` | Remove Clock icon, show only countdown text |
| `src/components/ui/scroll-area.tsx` | Change scrollbar thumb from dark to white/semi-transparent |

