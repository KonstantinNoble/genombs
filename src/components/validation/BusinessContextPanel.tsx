import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
    context.main_challenge ||
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

  const handleSave = async () => {
    const success = await saveContext({
      ...localContext,
      website_url: isPremium ? websiteUrl || null : null,
    });
    if (success && onContextChange) {
      onContextChange();
    }
  };

  const handleScan = async () => {
    if (!websiteUrl.startsWith("https://")) {
      return;
    }
    await scanWebsite(websiteUrl);
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
      <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-muted" />
          <div className="h-5 w-32 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-2xl border border-border/60 bg-muted/30 overflow-hidden transition-all duration-300">
        {/* Header / Trigger */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-sm sm:text-base">Business Context</span>
              {hasContextData && (
                <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-xs">
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline group-hover:text-foreground transition-colors">
                {isOpen ? "Collapse" : "Expand"}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border/40">
            {/* Description */}
            <p className="text-sm text-muted-foreground pt-3">
              Add context about your business to get more personalized AI recommendations.
            </p>

            {/* Dropdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Industry */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Industry</Label>
                <Select
                  value={localContext.industry || ""}
                  onValueChange={(value) => setLocalContext({ industry: value || null })}
                >
                  <SelectTrigger className="h-9">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Stage</Label>
                <Select
                  value={localContext.company_stage || ""}
                  onValueChange={(value) => setLocalContext({ company_stage: value || null })}
                >
                  <SelectTrigger className="h-9">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Team Size</Label>
                <Select
                  value={localContext.team_size || ""}
                  onValueChange={(value) => setLocalContext({ team_size: value || null })}
                >
                  <SelectTrigger className="h-9">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Revenue</Label>
                <Select
                  value={localContext.revenue_range || ""}
                  onValueChange={(value) => setLocalContext({ revenue_range: value || null })}
                >
                  <SelectTrigger className="h-9">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Target Market</Label>
                <Select
                  value={localContext.target_market || ""}
                  onValueChange={(value) => setLocalContext({ target_market: value || null })}
                >
                  <SelectTrigger className="h-9">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Region</Label>
                <Select
                  value={localContext.geographic_focus || ""}
                  onValueChange={(value) => setLocalContext({ geographic_focus: value || null })}
                >
                  <SelectTrigger className="h-9">
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

            {/* Main Challenge */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Main Challenge <span className="text-muted-foreground/60">(optional)</span>
              </Label>
              <Textarea
                value={localContext.main_challenge || ""}
                onChange={(e) => setLocalContext({ main_challenge: e.target.value || null })}
                placeholder="What's your biggest obstacle right now?"
                className="min-h-[60px] resize-none text-sm"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">
                {(localContext.main_challenge?.length || 0)}/300
              </p>
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
                    <Globe className="h-4 w-4 text-primary" />
                  ) : (
                    <Lock className="h-4 w-4 text-amber-600" />
                  )}
                  <span className="font-medium text-sm">Website URL</span>
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
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <Input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://your-company.com"
                        className="h-9 text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleScan}
                      disabled={isScanning || !websiteUrl.startsWith("https://")}
                      size="sm"
                      className="h-9 px-4"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-1.5" />
                          Scan Website
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {lastScanned && (
                    <p className="text-xs text-muted-foreground">
                      Last scanned: {formatLastScanned(lastScanned)}
                    </p>
                  )}

                  {context?.website_summary && (
                    <div className="p-3 rounded-lg bg-background/80 border border-border/40">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Website Summary:</p>
                      <p className="text-sm text-foreground line-clamp-3">
                        {context.website_summary}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="url"
                      placeholder="https://"
                      disabled
                      className="h-9 text-sm opacity-50 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-scan your website to give AI more context about your business.
                  </p>
                  <Link 
                    to="/pricing" 
                    className="inline-flex items-center text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors"
                  >
                    Upgrade to Premium
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1.5" />
                    Save Context
                  </>
                )}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
