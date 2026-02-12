

# Loading Indicator for AI Chat Responses

## Problem

When the AI is generating a chat message (`isStreaming = true`), there is no visual loading indicator shown to the user. A loading indicator only appears during website analysis (the `AnalysisProgress` component). The screenshot confirms this: after sending a message, the user sees an empty assistant bubble with just the timestamp "15:24" and no indication that the AI is working.

## Solution

Add a typing/loading indicator in the chat area that appears while `isStreaming` is true. This will be shown as a small animated dots indicator below the last message (or inside the empty assistant message bubble).

### Change 1: `src/pages/Chat.tsx` -- Add streaming indicator in chat panel

After the messages list (line 468) and before the `scrollRef` div (line 469), add a conditional loading indicator that shows when `isStreaming` is true:

- Display a "thinking" bubble styled like an assistant message (left-aligned, card background)
- Contains three animated bouncing dots to indicate the AI is typing
- Only visible when `isStreaming` is true

### Change 2: `src/pages/Chat.tsx` -- Auto-scroll when streaming starts

Scroll to the bottom when `isStreaming` changes to true, so the user can see the loading indicator.

## Summary

| File | Change |
|---|---|
| `src/pages/Chat.tsx` | Add animated typing indicator bubble when `isStreaming` is true, auto-scroll to show it |

