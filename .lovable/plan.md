

# Fix: AI Gives Generic Answers Instead of Specific Website-Based Responses

## Root Cause

The `chat` Edge Function (line 290) fetches only structured summary data for the system prompt:

```
.select("url, is_own_website, overall_score, category_scores, profile_data, status")
```

The `raw_markdown` field -- which contains the **actual crawled website content** (headings, text, links, product descriptions, etc.) -- is never included. So when a user asks "What does the homepage say about pricing?" the AI can only give a vague answer based on high-level scores and bullet points.

## Solution

### Change 1: `supabase/functions/chat/index.ts` -- Include `raw_markdown` in context

**Line 290**: Add `raw_markdown` to the select query:

```
.select("url, is_own_website, overall_score, category_scores, profile_data, raw_markdown, status")
```

**Lines 294-303**: Update the profile context builder to include the raw content (truncated to avoid exceeding token limits):

```typescript
if (profiles && profiles.length > 0) {
  profileContext = "\n\n## Available Website Profiles\n\n";
  for (const p of profiles) {
    const label = p.is_own_website ? "OWN WEBSITE" : "COMPETITOR";
    profileContext += `### [${label}] ${p.url}\n`;
    profileContext += `Overall Score: ${p.overall_score}/100\n`;
    profileContext += `Category Scores: ${JSON.stringify(p.category_scores)}\n`;
    profileContext += `Profile: ${JSON.stringify(p.profile_data)}\n`;

    // Include actual crawled content (truncated to ~6000 chars per site)
    if (p.raw_markdown) {
      const trimmed = p.raw_markdown.slice(0, 6000);
      profileContext += `\nCrawled Content:\n${trimmed}\n`;
    }
    profileContext += "\n";
  }
}
```

The 6000-character limit per site prevents token overflow while still providing enough real content for the AI to give specific, data-grounded answers.

### Change 2: `supabase/functions/chat/index.ts` -- Strengthen the system prompt

**Lines 10-18**: Update the system prompt to explicitly instruct the AI to reference the crawled content:

```typescript
const SYSTEM_PROMPT = `You are an expert website & marketing analyst at Synoptas. You help users improve their websites by analyzing their online presence and comparing it with competitors.

You have access to:
1. Structured website profiles with scores, strengths, and weaknesses.
2. The actual crawled content (text, headings, links) from each website.

IMPORTANT: When answering user questions, always reference specific details from the crawled content. Quote actual text, mention specific pages, headings, CTAs, or product descriptions you can see in the data. Never give generic advice when you have real data available.

When comparing websites, use concrete metrics and examples from the profile data. Format your responses with markdown: use headers, tables, bullet points, and bold text for clarity.

Answer in the same language as the user's message.`;
```

## Summary of Changes

| File | Lines | Change |
|---|---|---|
| `supabase/functions/chat/index.ts` | 10-18 | Strengthen system prompt to reference real content |
| `supabase/functions/chat/index.ts` | 290 | Add `raw_markdown` to SELECT query |
| `supabase/functions/chat/index.ts` | 294-303 | Include truncated crawled content in profile context |

## Why This Fixes the Problem

- The AI currently only sees: "Strengths: good design, clear CTAs" (generic summary)
- After the fix it also sees: the actual homepage text, navigation items, product descriptions, pricing info, etc.
- This enables specific answers like "Your hero section says 'We build custom software' but your competitor leads with a concrete result: 'Save 40% on IT costs'"

## No Other Files Affected

- `Chat.tsx`: The frontend sends messages correctly; the problem is purely in the Edge Function's context
- `analyze-website/index.ts`: Already saves `raw_markdown` to the database correctly
