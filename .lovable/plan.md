
# Fix: React Error #31 - Object rendered as React child in CodeAnalysisCard

## Problem
The AI prompt in `add-github-analysis/index.ts` returns sub-categories like this:
```json
{
  "security": { "score": 75, "issues": [...], "recommendations": [...] },
  "performance": { "score": 80, "issues": [...], "recommendations": [...] }
}
```

But `CodeAnalysisCard.tsx` treats these as plain numbers:
```ts
{ label: "Security", score: ca.security ?? 0 }  // ca.security is an OBJECT, not a number
```

This object gets passed to `ScoreRing` which renders `{score}` inside a `<span>`, causing React error #31.

Additionally, the `seo` field from the prompt uses `codeIssues` as the key, but the card reads `ca.seo?.issues`.

## Solution

Update `CodeAnalysisCard.tsx` to safely extract `.score` from each sub-category, handling both object and number formats for backward compatibility.

### Changes to `src/components/dashboard/CodeAnalysisCard.tsx`

- Extract scores safely: `typeof ca.security === "object" ? ca.security?.score ?? 0 : ca.security ?? 0` for each sub-category
- Extract issues/recommendations from each sub-category object for display
- Fix SEO issues key: read both `ca.seo?.issues` and `ca.seo?.codeIssues`
- Aggregate security issues from `ca.security.issues` (object format) and `ca.securityIssues` (legacy flat format)
- Aggregate recommendations from all sub-category `.recommendations` arrays

### Changes to `src/types/chat.ts`

- Update `CodeAnalysis` interface to reflect the actual data shape from the AI:
  - `security`, `performance`, `accessibility`, `maintainability` become `number | { score: number; issues: string[]; recommendations: string[] }`
  - `seo` field adds optional `codeIssues` key

No backend or edge function changes needed -- the fix is purely defensive rendering on the frontend.
