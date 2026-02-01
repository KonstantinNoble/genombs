import { useState, useEffect, useCallback } from "react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/external-client";
import { useToast } from "@/hooks/use-toast";

// Interface for business context data
export interface BusinessContext {
  id: string;
  user_id: string;
  industry: string | null;
  company_stage: string | null;
  team_size: string | null;
  revenue_range: string | null;
  target_market: string | null;
  geographic_focus: string | null;
  website_url: string | null;
  website_summary: string | null;
  website_scraped_at: string | null;
  scan_count: number | null;
  scan_window_start: string | null;
  created_at: string;
  updated_at: string;
}

// Interface for editable context fields (without DB-generated fields)
export interface BusinessContextInput {
  industry?: string | null;
  company_stage?: string | null;
  team_size?: string | null;
  revenue_range?: string | null;
  target_market?: string | null;
  geographic_focus?: string | null;
  website_url?: string | null;
}

// Dropdown options for the form
export const INDUSTRY_OPTIONS = [
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "fintech", label: "FinTech" },
  { value: "healthtech", label: "HealthTech" },
  { value: "edtech", label: "EdTech" },
  { value: "marketplace", label: "Marketplace" },
  { value: "agency", label: "Agency" },
  { value: "consulting", label: "Consulting" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" },
];

export const STAGE_OPTIONS = [
  { value: "idea", label: "Idea" },
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b-plus", label: "Series B+" },
  { value: "growth", label: "Growth" },
  { value: "established", label: "Established" },
];

export const TEAM_SIZE_OPTIONS = [
  { value: "solo", label: "Solo" },
  { value: "2-5", label: "2-5" },
  { value: "6-15", label: "6-15" },
  { value: "16-50", label: "16-50" },
  { value: "50+", label: "50+" },
];

export const REVENUE_OPTIONS = [
  { value: "pre-revenue", label: "Pre-revenue" },
  { value: "less-10k", label: "<$10k/mo" },
  { value: "10k-50k", label: "$10k-50k/mo" },
  { value: "50k-100k", label: "$50k-100k/mo" },
  { value: "100k-plus", label: "$100k+/mo" },
];

export const TARGET_MARKET_OPTIONS = [
  { value: "b2b", label: "B2B" },
  { value: "b2c", label: "B2C" },
  { value: "b2b2c", label: "B2B2C" },
  { value: "d2c", label: "D2C" },
];

export const GEOGRAPHIC_OPTIONS = [
  { value: "local", label: "Local" },
  { value: "national", label: "National" },
  { value: "eu", label: "EU" },
  { value: "us", label: "US" },
  { value: "global", label: "Global" },
];

// Scan limit constants (must match Edge Function)
export const MAX_SCANS_PER_DAY = 3;
export const SCAN_WINDOW_HOURS = 24;

interface UseBusinessContextReturn {
  context: BusinessContext | null;
  isLoading: boolean;
  isSaving: boolean;
  isScanning: boolean;
  hasUnsavedChanges: boolean;
  lastScanned: Date | null;
  loadContext: () => Promise<void>;
  saveContext: (data: BusinessContextInput) => Promise<boolean>;
  scanWebsite: (url: string) => Promise<boolean>;
  clearContext: () => Promise<boolean>;
  setLocalContext: (data: Partial<BusinessContextInput>) => void;
  localContext: BusinessContextInput;
  scansRemaining: number;
  scanResetTime: Date | null;
  maxScansPerDay: number;
}

export function useBusinessContext(): UseBusinessContextReturn {
  const { toast } = useToast();
  
  const [context, setContext] = useState<BusinessContext | null>(null);
  const [localContext, setLocalContextState] = useState<BusinessContextInput>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync local context when DB context loads
  useEffect(() => {
    if (context) {
      setLocalContextState({
        industry: context.industry,
        company_stage: context.company_stage,
        team_size: context.team_size,
        revenue_range: context.revenue_range,
        target_market: context.target_market,
        geographic_focus: context.geographic_focus,
        website_url: context.website_url,
      });
    }
  }, [context]);

  const loadContext = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      // Use type assertion since table doesn't exist in types yet
      const { data, error } = await (supabase as any)
        .from("user_business_context")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        // Table might not exist yet - that's expected before backend migration
        console.log("Business context not available yet:", error.message);
        setContext(null);
      } else {
        setContext(data as BusinessContext | null);
      }
    } catch (err) {
      console.error("Error loading business context:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  const setLocalContext = useCallback((data: Partial<BusinessContextInput>) => {
    setLocalContextState(prev => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
  }, []);

  const saveContext = useCallback(async (data: BusinessContextInput): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to save your business context.",
          variant: "destructive",
        });
        return false;
      }

      const userId = session.user.id;

      // Upsert: insert or update (use type assertion since table doesn't exist in types yet)
      const { error } = await (supabase as any)
        .from("user_business_context")
        .upsert({
          user_id: userId,
          ...data,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (error) {
        // Check if table doesn't exist yet
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          toast({
            title: "Backend not ready",
            description: "The business context feature is being set up. Please try again later.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Save failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return false;
      }

      setHasUnsavedChanges(false);
      toast({
        title: "Context saved",
        description: "Your business context will be used in future validations.",
      });
      
      // Reload to get updated data
      await loadContext();
      return true;
    } catch (err) {
      console.error("Error saving context:", err);
      toast({
        title: "Error",
        description: "Failed to save business context.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [toast, loadContext]);

  const scanWebsite = useCallback(async (url: string): Promise<boolean> => {
    setIsScanning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to scan your website.",
          variant: "destructive",
        });
        return false;
      }

      // Call the edge function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/scrape-business-website`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast({
          title: "Scan failed",
          description: result.error || "Could not scan website. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Website scanned",
        description: "Your website information has been extracted and saved.",
      });

      // Reload to get the updated summary
      await loadContext();
      return true;
    } catch (err) {
      console.error("Error scanning website:", err);
      toast({
        title: "Scan error",
        description: "The website scanning feature is not available yet.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsScanning(false);
    }
  }, [toast, loadContext]);

  const clearContext = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      // Use type assertion since table doesn't exist in types yet
      const { error } = await (supabase as any)
        .from("user_business_context")
        .delete()
        .eq("user_id", session.user.id);

      if (error) {
        toast({
          title: "Delete failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      setContext(null);
      setLocalContextState({});
      setHasUnsavedChanges(false);
      toast({
        title: "Context cleared",
        description: "Your business context has been removed.",
      });
      return true;
    } catch (err) {
      console.error("Error clearing context:", err);
      return false;
    }
  }, [toast]);

  const lastScanned = context?.website_scraped_at 
    ? new Date(context.website_scraped_at) 
    : null;

  // Calculate scan status from DB values
  const calculateScanStatus = (): { remaining: number; resetTime: Date | null } => {
    if (!context?.scan_window_start) {
      return { remaining: MAX_SCANS_PER_DAY, resetTime: null };
    }
    
    const windowStart = new Date(context.scan_window_start);
    const now = new Date();
    const windowEnd = new Date(windowStart.getTime() + SCAN_WINDOW_HOURS * 60 * 60 * 1000);
    
    // Check if window has expired
    if (now >= windowEnd) {
      return { remaining: MAX_SCANS_PER_DAY, resetTime: null };
    }
    
    const scanCount = context.scan_count || 0;
    const remaining = Math.max(0, MAX_SCANS_PER_DAY - scanCount);
    
    return { 
      remaining, 
      resetTime: remaining === 0 ? windowEnd : null 
    };
  };

  const scanStatus = calculateScanStatus();
  const scansRemaining = scanStatus.remaining;
  const scanResetTime = scanStatus.resetTime;

  return {
    context,
    isLoading,
    isSaving,
    isScanning,
    hasUnsavedChanges,
    lastScanned,
    loadContext,
    saveContext,
    scanWebsite,
    clearContext,
    setLocalContext,
    localContext,
    scansRemaining,
    scanResetTime,
    maxScansPerDay: MAX_SCANS_PER_DAY,
  };
}
