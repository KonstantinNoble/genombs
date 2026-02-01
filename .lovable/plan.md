
# Plan: Unified "Save Context" Button with Smart Website Scanning

## Problem
Currently the user must click two separate buttons:
1. "Save Context" to save dropdown fields
2. "Scan Website" to scan the URL

This is confusing UX and requires extra clicks.

## Solution
Create a single, intelligent button that:
- Dynamically changes label based on URL state
- Automatically scans website when needed (new/changed URL)
- Skips scanning if URL unchanged (already scanned)

---

## Logic Flow

```text
User clicks Save button
        |
        v
Is there a website URL entered?
        |
   +----+----+
   |         |
   No        Yes
   |         |
   v         v
Save only   Is URL different from saved URL?
context          |
             +---+---+
             |       |
            No       Yes (or never scanned)
             |       |
             v       v
         Save only   Save context THEN
         context     scan website
```

---

## Button States

| State | Button Label | Action |
|-------|--------------|--------|
| No URL entered | "Save Context" | Save dropdowns only |
| URL entered, never scanned | "Save Context & Scan Website" | Save + Scan |
| URL entered, same as saved & already scanned | "Save Context" | Save only (no rescan) |
| URL entered, different from saved URL | "Save Context & Scan Website" | Save + Scan new URL |

---

## Technical Implementation

### File: `src/components/validation/BusinessContextPanel.tsx`

#### 1. Add URL comparison logic

```typescript
// Determine if we need to scan the website
const needsWebsiteScan = (): boolean => {
  if (!isPremium) return false;
  if (!websiteUrl || !websiteUrl.startsWith("https://")) return false;
  
  // If no context exists or URL changed, need to scan
  if (!context?.website_url) return true;
  if (context.website_url !== websiteUrl) return true;
  
  // If same URL but never scanned, need to scan
  if (!context.website_scraped_at) return true;
  
  return false;
};

const shouldShowScanButton = needsWebsiteScan();
```

#### 2. Create unified save handler

Replace the separate `handleSave` and `handleScan` with a unified function:

```typescript
const handleSaveAndScan = async () => {
  // First, save the context (including the URL)
  const saveSuccess = await saveContext({
    ...localContext,
    website_url: isPremium ? websiteUrl || null : null,
  });
  
  if (!saveSuccess) return;
  
  // If we need to scan the website, do it after save
  if (needsWebsiteScan()) {
    await scanWebsite(websiteUrl);
  }
  
  if (onContextChange) {
    onContextChange();
  }
};
```

#### 3. Update button UI

Replace the current save button with dynamic label:

```tsx
<Button
  onClick={handleSaveAndScan}
  disabled={isSaving || isScanning}
  className="px-6 h-10"
>
  {isSaving || isScanning ? (
    <>
      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      {isScanning ? "Scanning..." : "Saving..."}
    </>
  ) : (
    <>
      {shouldShowScanButton ? (
        <>
          <Globe className="h-4 w-4 mr-1.5" />
          Save Context & Scan Website
        </>
      ) : (
        <>
          <Check className="h-4 w-4 mr-1.5" />
          Save Context
        </>
      )}
    </>
  )}
</Button>
```

#### 4. Remove separate Scan Website button

The separate "Scan Website" button in the website URL section will be removed since scanning is now handled by the main save button.

#### 5. Add visual indicator for "already scanned" state

When URL is already scanned, show a checkmark next to the input:

```tsx
{isPremium && context?.website_url === websiteUrl && context?.website_scraped_at && (
  <div className="flex items-center gap-1.5 text-sm text-green-600">
    <Check className="h-4 w-4" />
    <span>Scanned {formatLastScanned(lastScanned)}</span>
  </div>
)}
```

---

## Summary of Changes

| Component | Change |
|-----------|--------|
| `BusinessContextPanel.tsx` | Add `needsWebsiteScan()` function |
| `BusinessContextPanel.tsx` | Create unified `handleSaveAndScan()` handler |
| `BusinessContextPanel.tsx` | Dynamic button label based on URL state |
| `BusinessContextPanel.tsx` | Remove separate "Scan Website" button |
| `BusinessContextPanel.tsx` | Add visual "already scanned" indicator |

---

## User Experience After Implementation

1. **User fills out dropdowns** (Industry, Stage, Team Size, etc.)
2. **User enters website URL** (Premium only)
3. **User sees button change** to "Save Context & Scan Website"
4. **User clicks once** → Context saved + Website scanned
5. **Next time with same URL** → Button shows "Save Context" (no rescan needed)
6. **User changes URL** → Button shows "Save Context & Scan Website" again

This creates a seamless, single-click experience while being smart about when to rescan.
