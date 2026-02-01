import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Globe, 
  Loader2, 
  Check,
  Sparkles,
  ExternalLink,
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
  } = useBusinessContext();

  const [isOpen, setIsOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");

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
      <div className="relative">
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-500/20 via-teal-400/15 to-cyan-500/20 blur-sm" />
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/30 via-teal-500/20 to-cyan-600/30" />
        <div className="relative rounded-2xl border border-cyan-500/30 bg-background/95 p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-4 w-56 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative">
        {/* Cyan/Teal Glow Effect */}
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-500/25 via-teal-400/15 to-cyan-500/25 blur-sm" />
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/35 via-teal-500/25 to-cyan-600/35" />
        
        <div className="relative rounded-2xl border border-cyan-500/30 bg-background/95 overflow-hidden transition-all duration-300">
          {/* Header / Trigger */}
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-cyan-500/5 transition-colors group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base sm:text-lg text-foreground">Business Context</span>
                    {hasContextData && (
                      <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-600 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    {hasUnsavedChanges && (
                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-600 text-xs">
                        Unsaved
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Help AI understand your business
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-cyan-500/10"
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
            <div className="px-4 sm:px-5 pb-5 space-y-5 border-t border-cyan-500/20">
              {/* Dropdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {/* Industry */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Industry</Label>
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
                  <Label className="text-sm font-semibold text-foreground">Stage</Label>
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
                  <Label className="text-sm font-semibold text-foreground">Team Size</Label>
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
                  <Label className="text-sm font-semibold text-foreground">Revenue</Label>
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
                  <Label className="text-sm font-semibold text-foreground">Target Market</Label>
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
                  <Label className="text-sm font-semibold text-foreground">Region</Label>
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
              <div className={`rounded-xl border p-4 space-y-3 ${
                isPremium 
                  ? "border-primary/20 bg-primary/5" 
                  : "border-amber-500/20 bg-amber-500/5"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPremium ? (
                      <Globe className="h-5 w-5 text-primary" />
                    ) : (
                      <Lock className="h-5 w-5 text-amber-600" />
                    )}
                    <span className="font-semibold text-base">Website URL</span>
                  </div>
                  {!isPremium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                {isPremium ? (
                  <>
                    <div className="flex-1">
                      <Input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://your-company.com"
                        className="h-10 text-base"
                      />
                    </div>
                    
                    {/* Already scanned indicator */}
                    {context?.website_url === websiteUrl && context?.website_scraped_at && (
                      <div className="flex items-center gap-1.5 text-sm text-green-600">
                        <Check className="h-4 w-4" />
                        <span>Scanned {formatLastScanned(lastScanned)}</span>
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
                      Upgrade to Premium
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Unified Save Button */}
              <div className="flex items-center justify-end gap-3 pt-1">
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
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}
