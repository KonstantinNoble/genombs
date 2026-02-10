

# URL Scanner Bar Below Chat Input

## What Changes

### `src/components/chat/ChatInput.tsx`

Add a new section **below** the chat input area -- a "URL Scanner" bar. It contains:

- An input field with a Globe icon and placeholder "Enter website URL..."
- A "Scan" button next to it
- When the user clicks "Scan", a **Dialog popup** appears with two options:
  - **"Scan Your Site"** -- marks the URL as the user's own website
  - **"Scan Competitor"** -- marks the URL as a competitor
  - Both buttons close the dialog and trigger `onScan(url, type)` callback
- The scanner bar is visually distinct from the chat input (subtle background, separator)

### Props Update

- Add new prop: `onScan: (url: string, type: 'own' | 'competitor') => void`
- The scan bar manages its own URL state, separate from the chat message input

### Visual Layout

```text
+------------------------------------------+
| [Chat textarea...              ] [Send]  |
+------------------------------------------+
| [Globe icon] [Enter website URL...] [Scan]|
+------------------------------------------+
```

Dialog popup on Scan click:

```text
+---------------------------+
|   Scan Website            |
|   example.com             |
|                           |
|  [Scan Your Site]         |
|  [Scan Competitor]        |
|                           |
|  [Cancel]                 |
+---------------------------+
```

### `src/pages/Chat.tsx`

- Pass the new `onScan` prop to `ChatInput`
- For now (frontend-only), the handler logs the scan and could add a mock message to the chat like "Scanning example.com..."

### Components Used

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from existing UI components
- `Input` for the URL field
- `Button` for Scan, Scan Your Site, Scan Competitor

### Files Modified

| File | Change |
|------|--------|
| `src/components/chat/ChatInput.tsx` | Add URL scanner bar + scan dialog |
| `src/pages/Chat.tsx` | Pass `onScan` handler to ChatInput |

