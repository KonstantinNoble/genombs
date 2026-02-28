

# Publish Score Button: Repositioning & UX Improvements

## Current Issues
- The "Publish Score" button is buried at the bottom of the card behind a border-t separator (line 174)
- It contains icons (Globe, Lock, Loader2) which the user doesn't want
- The free user upgrade dialog also has a Globe icon
- The button is small (`size="sm"`, `text-xs`) and not prominent enough

## Changes

### 1. Move Button to Prominent Position (WebsiteProfileCard.tsx)

Move the publish button from the bottom of the card (after strengths/weaknesses) to directly below the category bars -- between the score bars and the strengths/weaknesses section. This makes it a natural call-to-action after the user sees their scores.

Remove `publishButton` variable from line 173-202 and the `{publishButton}` render at line 279. Instead, render the button inline at line ~247 (after category bars, before the strengths grid).

### 2. Remove All Icons from Buttons

- Remove Globe, Lock, Loader2 icons from the publish/unpublish buttons
- Keep only text labels: "Publish Score", "Unpublish", "5/5 used"
- Loading state: use "Publishing..." text instead of spinner icon

### 3. Premium User: Confirmation Dialog Before Publishing

Instead of publishing immediately on click, premium users get a clean confirmation dialog:

- **Title:** "Publish Your Score Report"
- **Body:** A short professional paragraph: "Your overall score, category ratings, and key strengths will be published on a public page. A do-follow backlink to your domain will be included. This uses 1 of your 5 monthly publications."
- **Usage counter:** "X/5 publications used this month"
- **Two buttons:** "Cancel" (secondary) and "Publish Now" (primary)
- No icons or emojis anywhere in the dialog

### 4. Free User: More Attractive Upgrade Trigger

Redesign the free user experience:

- **Button style:** Use a subtle gradient or the `default` variant instead of `outline` to make it visually appealing even though it's locked
- **Button text:** "Publish Score -- Premium" (no lock icon)
- **Upgrade Dialog redesign:**
  - Remove the Globe icon from the title
  - **Title:** "Publish Your Score Report"
  - **Body:** Professional copy highlighting 3 key benefits as a clean text list (no icons):
    1. Public page with your website score visible to everyone
    2. High-quality do-follow backlink to boost your SEO
    3. 5 publications per month included with Premium
  - **CTA:** "View Premium Plans" (primary button, full width)

### 5. Unpublish State

- Simple outline button with text "Unpublish" (no Globe icon)
- No confirmation needed for unpublish (keeps current behavior)

## Files Modified

| File | Change |
|------|--------|
| `src/components/chat/WebsiteProfileCard.tsx` | Reposition button, remove icons, add confirmation dialog for premium, redesign free user dialog |

## Summary of Removals
- Remove imports: `Globe`, `Lock`, `Loader2` (if no longer used elsewhere in the file)
- Remove all icon JSX from buttons and dialog titles
- Remove `border-t` separator styling from publish section

