import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useBusinessContext,
  INDUSTRY_OPTIONS,
  STAGE_OPTIONS,
  TEAM_SIZE_OPTIONS,
  REVENUE_OPTIONS,
  TARGET_MARKET_OPTIONS,
  GEOGRAPHIC_OPTIONS,
} from "@/hooks/useBusinessContext";

interface BusinessContextPanelProps {
  isPremium: boolean;
  onContextChange?: () => void;
}

export function BusinessContextPanel({ isPremium, onContextChange }: BusinessContextPanelProps) {
  const {
    context,
    isLoading,
    isSaving,
    isScanning,
    hasUnsavedChanges,
    lastScanned,
    saveContext,
    scanWebsite,
    setLocalContext,
    localContext,
    loadContext,
    scansRemaining,
    scanResetTime,
    maxScansPerDay,
  } = useBusinessContext();

  const [isOpen, setIsOpen] = useState(true);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [countdown, setCountdown] = useState<string>("");
  
  // URL validation
  const isUrlInvalid = websiteUrl.length > 0 && !websiteUrl.startsWith("https://");

  // Check if context has any data
  const hasContextData = context && (
    context.industry ||
    context.company_stage ||
    context.team_size ||
    context.revenue_range ||
    context.target_market ||
    context.geographic_focus ||
    context.website_url
  );

  // Auto-expand if context has data
  useEffect(() => {
    if (hasContextData && !isLoading) {
      setIsOpen(true);
    }
  }, [hasContextData, isLoading]);

  // Sync website URL from context
  useEffect(() => {
    if (context?.website_url) {
      setWebsiteUrl(context.website_url);
    }
  }, [context?.website_url]);

  // Countdown timer effect for scan reset
  useEffect(() => {
    if (!scanResetTime) {
      setCountdown("");
      return;
    }
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = scanResetTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown("");
        loadContext(); // Refresh to unlock scanning
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${minutes}m ${seconds}s`);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [scanResetTime, loadContext]);

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

  // Unified save handler that also scans website if needed
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

  // Handler for re-scanning an already scanned URL
  const handleRescan = async () => {
    if (!websiteUrl || !websiteUrl.startsWith("https://")) return;
    
    if (scansRemaining <= 0) {
      return; // Button should already be disabled, but extra safety
    }
    
    const success = await scanWebsite(websiteUrl);
    
    if (success && onContextChange) {
      onContextChange();
    }
  };

  const formatLastScanned = (date: Date | null): string => {
    if (!date) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card shadow-sm p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-4 w-56 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden transition-all duration-300">
        {/* Header / Trigger */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-muted/50 transition-colors group">
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-lg sm:text-xl text-foreground tracking-tight">Business Context</span>
                {hasContextData && (
                  <span className="text-xs font-medium text-primary/80">(Active)</span>
                )}
                {hasUnsavedChanges && (
                  <span className="text-xs font-medium text-amber-600">(Unsaved)</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Help AI understand your business
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              asChild
            >
              <span>
                {isOpen ? (
                  <>
                    <span className="hidden sm:inline">Close</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Edit</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </span>
            </Button>
          </button>
        </CollapsibleTrigger>

        {/* Content */}
        <CollapsibleContent>
          <div className="px-4 sm:px-5 pb-5 space-y-5 border-t border-border/40">
            {/* Helper hint for new users */}
            <p className="text-sm text-muted-foreground pt-4 pb-0 -mb-2">
              Save your context so every AI analysis is tailored to your business.
            </p>
              
              {/* Dropdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Industry */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Industry</Label>
                  <Select
                    value={localContext.industry || ""}
                    onValueChange={(value) => setLocalContext({ industry: value || null })}
                  >
                    <SelectTrigger className="h-10 text-base">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Stage */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Stage</Label>
                  <Select
                    value={localContext.company_stage || ""}
                    onValueChange={(value) => setLocalContext({ company_stage: value || null })}
                  >
                    <SelectTrigger className="h-10 text-base">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Size */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Team Size</Label>
                  <Select
                    value={localContext.team_size || ""}
                    onValueChange={(value) => setLocalContext({ team_size: value || null })}
                  >
                    <SelectTrigger className="h-10 text-base">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Revenue */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Revenue</Label>
                  <Select
                    value={localContext.revenue_range || ""}
                    onValueChange={(value) => setLocalContext({ revenue_range: value || null })}
                  >
                    <SelectTrigger className="h-10 text-base">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Market */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Target Market</Label>
                  <Select
                    value={localContext.target_market || ""}
                    onValueChange={(value) => setLocalContext({ target_market: value || null })}
                  >
                    <SelectTrigger className="h-10 text-base">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_MARKET_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Geographic Focus */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Region</Label>
                  <Select
                    value={localContext.geographic_focus || ""}
                    onValueChange={(value) => setLocalContext({ geographic_focus: value || null })}
                  >
                    <SelectTrigger className="h-10 text-base">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GEOGRAPHIC_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Premium Website Section */}
              <div className="pt-4 mt-2 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Website URL</span>
                  {!isPremium && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                      Premium
                    </span>
                  )}
                </div>

                {isPremium ? (
                  <>
                    <div className="flex-1 space-y-1.5">
                      <Input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://your-company.com"
                        className={`h-10 text-base ${isUrlInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {isUrlInvalid && (
                        <p className="text-sm text-destructive">
                          URL must start with https://
                        </p>
                      )}
                    </div>
                    
                    {/* Already scanned indicator with Rescan button */}
                    {context?.website_url === websiteUrl && context?.website_scraped_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Scanned {formatLastScanned(lastScanned)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRescan}
                          disabled={isScanning || scansRemaining <= 0}
                          className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {isScanning ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Scan Again"
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Scan Usage Indicator */}
                    {context?.scan_window_start && (
                      <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                        <span className={scansRemaining > 0 ? "text-muted-foreground" : "text-amber-600 font-medium"}>
                          {scansRemaining}/{maxScansPerDay} scans remaining today
                        </span>
                        
                        {/* Reset Timer (only when limit reached) */}
                        {scansRemaining === 0 && countdown && (
                          <div className="flex items-center gap-1.5 text-amber-600">
                            <span className="font-mono text-xs">{countdown}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {context?.website_summary && (
                      <div className="p-3 rounded-lg bg-background/80 border border-border/40">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Website Summary:</p>
                        <p className="text-base text-foreground line-clamp-3">
                          {context.website_summary}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type="url"
                        placeholder="https://"
                        disabled
                        className="h-10 text-base opacity-50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Auto-scan your website to give AI more context about your business.
                    </p>
                    <Link 
                      to="/pricing" 
                      className="inline-flex items-center text-sm font-semibold text-amber-600 hover:text-amber-500 transition-colors"
                    >
                      Upgrade to Premium →
                    </Link>
                  </div>
                )}
              </div>


              {/* Unified Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
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
                    shouldShowScanButton ? "Save Context & Scan Website" : "Save Context"
                  )}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
      </div>
    </Collapsible>
  );
}