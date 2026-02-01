
# Plan: Rate-Limit auf 3/24h erhöhen + "Scan Again" Button

## Überblick
1. **Backend:** Rate-Limit von 1 auf 3 Scans pro 24 Stunden erhöhen
2. **Frontend:** "Scan Again" Button hinzufügen für bereits gescannte URLs

---

## Teil 1: Edge Function `scrape-business-website` (Supabase)

### Änderungen am Rate-Limit

Zeile 73-94 in der Edge Function ändern:

**Vorher:**
```typescript
if (existingContext?.website_scraped_at) {
  const lastScan = new Date(existingContext.website_scraped_at);
  const hoursSinceLastScan = (now.getTime() - lastScan.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastScan < 24) {
    const hoursRemaining = Math.ceil(24 - hoursSinceLastScan);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Rate limit: You can scan your website once per 24 hours. Please try again in ${hoursRemaining} hour(s).`
      }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
```

**Nachher:**
```typescript
// Check scan count in last 24 hours
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

const { data: recentScans, error: scanCountError } = await adminClient
  .from('user_business_context_scan_log')
  .select('scanned_at')
  .eq('user_id', user.id)
  .gte('scanned_at', oneDayAgo);

const scanCount = recentScans?.length || 0;
const MAX_SCANS_PER_DAY = 3;

if (scanCount >= MAX_SCANS_PER_DAY) {
  // Find oldest scan to calculate when limit resets
  const oldestScan = recentScans?.[0]?.scanned_at;
  const resetTime = oldestScan 
    ? new Date(new Date(oldestScan).getTime() + 24 * 60 * 60 * 1000)
    : null;
  
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: `Rate limit reached: Maximum ${MAX_SCANS_PER_DAY} scans per 24 hours. ${resetTime ? `Resets at ${resetTime.toLocaleTimeString()}.` : ''}`
    }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### Alternative ohne neue Tabelle (einfacher)

Falls du keine neue Tabelle für Scan-Logs erstellen möchtest, kann das Rate-Limit einfach auf "1 Scan pro 8 Stunden" gesetzt werden (effektiv ~3/Tag):

```typescript
const HOURS_BETWEEN_SCANS = 8; // ~3 scans per day

if (existingContext?.website_scraped_at) {
  const lastScan = new Date(existingContext.website_scraped_at);
  const hoursSinceLastScan = (now.getTime() - lastScan.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastScan < HOURS_BETWEEN_SCANS) {
    const hoursRemaining = Math.ceil(HOURS_BETWEEN_SCANS - hoursSinceLastScan);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Rate limit: Please wait ${hoursRemaining} hour(s) before scanning again. (Max 3 scans per 24 hours)`
      }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
```

---

## Teil 2: Frontend - "Scan Again" Button

### Datei: `src/components/validation/BusinessContextPanel.tsx`

### Änderung 1: Neuen State für Force-Scan hinzufügen

Bei den anderen States (Zeile ~59-60):
```typescript
const [websiteUrl, setWebsiteUrl] = useState("");
const [forceScan, setForceScan] = useState(false);
```

### Änderung 2: needsWebsiteScan anpassen

Zeile 88-100:
```typescript
const needsWebsiteScan = (): boolean => {
  if (!isPremium) return false;
  if (!websiteUrl || !websiteUrl.startsWith("https://")) return false;
  
  // Force scan requested by user
  if (forceScan) return true;
  
  // If no context exists or URL changed, need to scan
  if (!context?.website_url) return true;
  if (context.website_url !== websiteUrl) return true;
  
  // If same URL but never scanned, need to scan
  if (!context.website_scraped_at) return true;
  
  return false;
};
```

### Änderung 3: Separate "Scan Again" Handler

Neue Funktion nach handleSaveAndScan:
```typescript
const handleRescan = async () => {
  if (!websiteUrl || !websiteUrl.startsWith("https://")) return;
  
  // Trigger the scan directly
  const success = await scanWebsite(websiteUrl);
  
  if (success && onContextChange) {
    onContextChange();
  }
};
```

### Änderung 4: UI für "Already Scanned" mit Rescan Button

Zeile 371-377 ersetzen:
```tsx
{/* Already scanned indicator with Rescan button */}
{isPremium && context?.website_url === websiteUrl && context?.website_scraped_at && (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-1.5 text-sm text-green-600">
      <Check className="h-4 w-4" />
      <span>Scanned {formatLastScanned(lastScanned)}</span>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRescan}
      disabled={isScanning}
      className="text-muted-foreground hover:text-foreground"
    >
      {isScanning ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Globe className="h-4 w-4 mr-1.5" />
          Scan Again
        </>
      )}
    </Button>
  </div>
)}
```

---

## Zusammenfassung der Änderungen

| Komponente | Änderung |
|------------|----------|
| **Edge Function** | Rate-Limit von 1 auf 3 Scans pro 24h (8h Cooldown) |
| **BusinessContextPanel** | "Scan Again" Button bei bereits gescannten URLs |
| **BusinessContextPanel** | `handleRescan()` Funktion für direkten Rescan |

---

## Erwartetes Verhalten

1. **URL eingeben** -> Button zeigt "Save Context & Scan Website"
2. **Speichern & Scannen** -> Website wird gescannt, grüner Haken erscheint
3. **"Scan Again" Button** erscheint rechts neben dem Haken
4. **Klick auf "Scan Again"** -> Neuer Scan wird durchgeführt (max 3x/24h)
5. **Bei Limit erreicht** -> Toast-Fehler: "Max 3 scans per 24 hours"

---

## Vollständiger Edge Function Code

Hier der komplette korrigierte Code für `scrape-business-website`:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!firecrawlApiKey) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Website scanning is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for DB operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth error:", userError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { url } = await req.json();

    if (!url || !url.startsWith("https://")) {
      return new Response(
        JSON.stringify({ success: false, error: "Valid HTTPS URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`User ${user.id} requesting scan for: ${url}`);

    // Check existing context and rate limit
    const { data: existingContext } = await adminClient
      .from("user_business_context")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const now = new Date();
    const HOURS_BETWEEN_SCANS = 8; // ~3 scans per 24 hours

    if (existingContext?.website_scraped_at) {
      const lastScan = new Date(existingContext.website_scraped_at);
      const hoursSinceLastScan = (now.getTime() - lastScan.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastScan < HOURS_BETWEEN_SCANS) {
        const hoursRemaining = Math.ceil(HOURS_BETWEEN_SCANS - hoursSinceLastScan);
        const minutesRemaining = Math.ceil((HOURS_BETWEEN_SCANS - hoursSinceLastScan) * 60);
        
        const timeMessage = hoursRemaining > 1 
          ? `${hoursRemaining} hour(s)` 
          : `${minutesRemaining} minute(s)`;
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Rate limit: Please wait ${timeMessage} before scanning again. (Max 3 scans per 24 hours)`
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Call Firecrawl API to scrape the website
    console.log("Calling Firecrawl API for:", url);
    
    const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    const firecrawlData = await firecrawlResponse.json();

    if (!firecrawlResponse.ok || !firecrawlData.success) {
      console.error("Firecrawl error:", firecrawlData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: firecrawlData.error || "Failed to scrape website" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract markdown content
    const markdown = firecrawlData.data?.markdown || "";
    
    // Create a summary (first 1000 chars, cleaned up)
    const summary = markdown
      .replace(/\[.*?\]\(.*?\)/g, "") // Remove markdown links
      .replace(/#{1,6}\s/g, "") // Remove headers
      .replace(/\*\*/g, "") // Remove bold
      .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines
      .trim()
      .slice(0, 1000);

    console.log("Scraped content length:", markdown.length, "Summary length:", summary.length);

    // Update user_business_context with scraped data
    const { error: updateError } = await adminClient
      .from("user_business_context")
      .upsert({
        user_id: user.id,
        website_url: url,
        website_summary: summary,
        website_scraped_at: now.toISOString(),
        updated_at: now.toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save website data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully saved website summary for user:", user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Website scanned successfully",
        summary_length: summary.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

Die Änderungen sind:
- **Zeile 70:** `HOURS_BETWEEN_SCANS = 8` (statt 24)
- **Zeile 78-80:** Verbesserte Zeitmeldung (Minuten wenn < 1 Stunde)
- **Zeile 82:** Klarere Fehlermeldung: "Max 3 scans per 24 hours"
