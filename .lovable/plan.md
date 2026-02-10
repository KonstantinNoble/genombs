

# Replace Scanner Bar with "+" Button and Multi-URL Popup

## What Changes

### `src/components/chat/ChatInput.tsx` -- Redesign

Remove the entire URL scanner bar (lines 95-122) and the old single-URL dialog. Replace with:

**A "+" button** next to the Send button in the chat input row. Clicking it opens a **Dialog popup** with 3-4 input fields:

```text
+------------------------------------------+
| [Chat textarea...         ] [+] [Send]   |
+------------------------------------------+
```

**Popup layout:**

```text
+----------------------------------+
|   Add Websites to Analyze        |
|                                  |
|   Your Website                   |
|   [https://your-site.com     ]   |
|                                  |
|   Competitor 1                   |
|   [https://competitor1.com   ]   |
|                                  |
|   Competitor 2                   |
|   [https://competitor2.com   ]   |
|                                  |
|   Competitor 3                   |
|   [https://competitor3.com   ]   |
|                                  |
|          [Start Analysis]        |
+----------------------------------+
```

- Field 1: "Your Website" -- single URL input
- Fields 2-4: "Competitor 1/2/3" -- competitor URL inputs (optional, at least one required)
- "Start Analysis" button submits all URLs at once

### Props Update

Change `onScan` prop signature:

```typescript
onScan?: (ownUrl: string, competitorUrls: string[]) => void;
```

This passes the user's site URL and an array of competitor URLs in one call.

### `src/pages/Chat.tsx`

Update the `onScan` handler to match the new signature -- receives one own URL + array of competitor URLs.

### Files Modified

| File | Change |
|------|--------|
| `src/components/chat/ChatInput.tsx` | Remove scanner bar, add "+" button + multi-URL dialog |
| `src/pages/Chat.tsx` | Update onScan handler signature |

