
# Fix: React Error #31 - codeQuality is an object, not a number

## Root Cause

The edge function prompt defines `codeQuality` as:
```json
{
  "codeQuality": {
    "score": 75,
    "strengths": ["..."],
    "weaknesses": ["..."]
  }
}
```

But `CodeAnalysisCard.tsx` treats it as a plain number on line 52:
```ts
const overallScore = ca.codeQuality ?? 0;  // passes {score, strengths, weaknesses} to ScoreRing!
```

And reads strengths/weaknesses from the wrong location:
```ts
const strengths = ca.strengths ?? [];     // undefined -- they're inside ca.codeQuality
const weaknesses = ca.weaknesses ?? [];   // undefined -- they're inside ca.codeQuality
```

## Fix (2 files)

### 1. `src/components/dashboard/CodeAnalysisCard.tsx`

- Extract `overallScore` safely: `typeof ca.codeQuality === "object" ? ca.codeQuality.score ?? 0 : ca.codeQuality ?? 0`
- Extract `strengths` from `ca.codeQuality.strengths` (object format) with fallback to `ca.strengths` (legacy)
- Extract `weaknesses` from `ca.codeQuality.weaknesses` (object format) with fallback to `ca.weaknesses` (legacy)

### 2. `src/types/chat.ts`

- Update `codeQuality` type from `number` to `number | { score: number; strengths: string[]; weaknesses: string[] }` for backward compatibility
