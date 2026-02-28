
# Public Score Pages: GDPR Deletion, Privacy Policy Update & Marketing Integration

## Analysis Summary

### 1. GDPR Account Deletion -- Current Gap

The `delete-account` edge function already deletes `website_profiles` (line 129-136), which cascade-deletes `publish_usage` entries (via `ON DELETE CASCADE` on `website_profile_id`). When `website_profiles` rows are deleted, `is_public` and `public_slug` are removed too -- so the public score page will automatically return a 404.

**However**, the deletion function does NOT explicitly delete `publish_usage` entries. While the foreign key CASCADE should handle it, we should add an explicit deletion step for safety (belt-and-suspenders approach), since the table also has a `user_id` column that isn't part of the FK cascade.

**Action needed:** Add `publish_usage` deletion to `delete-account/index.ts` (before `website_profiles` deletion).

### 2. Privacy Policy Update Required -- Yes

The privacy policy (currently v8.2) needs a new subsection under Section 8 covering:
- What data is published (score, categories, strengths, URL)
- Opt-in nature (user explicitly chooses)
- What is NOT published (weaknesses, raw data)
- Deletion behavior (unpublish anytime, full removal on account deletion)
- Legal basis: Art. 6(1)(a) GDPR (consent via opt-in) and Art. 6(1)(b) (contract performance)
- `publish_usage` tracking in the Storage Duration table

New section: **8.5 Public Score Pages (Opt-in)**

Also update the Storage Duration table (Section 17) with `publish_usage` data.

### 3. Marketing: Backlink Mentions on Homepage, Pricing, How It Works

#### Homepage (`Home.tsx`)
- Add a 4th feature card: "Public Score Pages" highlighting the do-follow backlink benefit
- Add a new FAQ entry explaining the backlink feature
- Add "Do-Follow Backlinks" to the comparison table row

#### Pricing Page (`Pricing.tsx`)
- Add "Public Score Pages (5/mo)" to `premiumFeatures` list
- Add "Public Score Pages" row to `FeatureComparisonTable.tsx` (Free: locked, Premium: "5/month")

#### How It Works (`HowItWorks.tsx`)
- Add a new section between "AI Chat" and "CTA" explaining how Public Score Pages work and the SEO benefit

---

## Technical Details

### File Changes

| Action | File | What |
|--------|------|------|
| Modify | `supabase/functions/delete-account/index.ts` | Add `publish_usage` deletion step |
| Modify | `src/pages/PrivacyPolicy.tsx` | Add Section 8.5 + Storage Duration row |
| Modify | `src/pages/Home.tsx` | 4th feature card, FAQ entry, comparison row |
| Modify | `src/pages/Pricing.tsx` | Add to premiumFeatures list |
| Modify | `src/components/genome/FeatureComparisonTable.tsx` | Add "Public Score Pages" row |
| Modify | `src/pages/HowItWorks.tsx` | Add Public Score Pages section |

### Delete-Account Change (Edge Function)

Insert before the `website_profiles` deletion (around line 128):

```text
// Delete publish_usage (GDPR - public score tracking)
await adminClient.from('publish_usage').delete().eq('user_id', userId);
```

This ensures `publish_usage` records are cleaned up even if the FK cascade doesn't fire (e.g. if the table structure changes later).

### Privacy Policy Section 8.5

New subsection covering:
- Feature description (opt-in publication of website scores)
- Data published: URL, overall score, category scores, strengths
- Data NOT published: weaknesses, code analysis, raw markdown
- User control: can unpublish at any time (immediate removal)
- Account deletion: all published pages are removed automatically
- `publish_usage` tracking: monthly counter, deleted with account
- Legal basis: Art. 6(1)(a) GDPR (explicit consent via opt-in toggle)

### Marketing Copy (English)

**Homepage feature card:**
- Title: "Public Score Pages"
- Description: "Publish your analysis as a public page and earn a high-quality do-follow backlink from Synvertas to boost your SEO. Premium members get 5 publications per month."

**Homepage comparison table new row:**
- Feature: "Do-Follow Backlinks"
- Synvertas: "5/month (Premium)"
- Consultant: "Not included"

**Homepage FAQ addition:**
- Q: "What are Public Score Pages?"
- A: Explanation of opt-in publishing, backlink benefit, privacy controls, monthly limit

**Pricing premiumFeatures addition:**
- "Public Score Pages -- earn do-follow backlinks (5/month)"

**FeatureComparisonTable row:**
- "Public Score Pages (Do-Follow Backlinks)" | Free: locked | Premium: "5/month"

**HowItWorks section:**
- New section with title "Public Score Pages" explaining the publish flow, backlink value, and privacy safeguards
