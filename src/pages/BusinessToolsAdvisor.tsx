import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, History, Trash2, Loader2, TrendingUp, Lightbulb, Star, Download, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
// Lazy-load PDF generator when exporting to reduce bundle size on mobile
// (imports moved into handleExportPDF)

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/home/Pricing";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ToolRecommendation {
  name: string;
  category: "productivity" | "marketing" | "sales" | "finance" | "hr" | "operations" | "strategy";
  implementation: "quick-win" | "medium-term" | "strategic";
  estimatedCost: string;
  rationale: string;
  // Deep analysis fields
  detailedSteps?: string[];
  expectedROI?: string;
  riskLevel?: "low" | "medium" | "high";
  prerequisites?: string[];
  metrics?: string[];
  implementationTimeline?: string;
}

interface ToolAdvisorResult {
  recommendations: ToolRecommendation[];
  generalAdvice: string;
}

interface ToolHistoryItem {
  id: string;
  industry: string;
  team_size: string;
  budget_range: string;
  business_goals: string;
  screenshot_urls?: string[];
  result: ToolAdvisorResult;
  created_at: string;
}


// Minimal Markdown normalization - only fix broken headings
function normalizeMarkdown(md?: string) {
  if (!md) return "";
  // Nur EOL normalisieren und trimmen – keine Umstrukturierungen!
  let s = md.replace(/\r\n?/g, "\n").trim();

  // Spezifische Reparatur:
  // Falls direkt NACH einer Überschrift eine einzelne Buchstaben-Zeile steht,
  // diese wieder an die Überschrift anhängen.
  s = s.replace(/^(#{1,6}\s[^\n]+)\n([A-Za-zÄÖÜäöüß])\s*$/gm, "$1$2");

  return s;
}

// Strip markdown formatting for plain text display
function stripMarkdown(md: string): string {
  if (!md) return '';
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\((.*?)\)/g, '$1')
    .replace(/^>+\s?/gm, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^-{3,}$/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Markdown components for better readability
const mdComponents = {
  h1: ({ children }: any) => <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-4 text-foreground">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl sm:text-2xl font-bold mt-5 mb-3 text-foreground">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-base sm:text-lg font-semibold mt-3 mb-2 text-foreground">{children}</h4>,
  p: ({ children }: any) => <p className="text-sm sm:text-base leading-relaxed mb-3 text-foreground">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-foreground text-sm sm:text-base">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-foreground text-sm sm:text-base">{children}</ol>,
  li: ({ children }: any) => <li className="text-sm sm:text-base leading-relaxed">{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-foreground">{children}</em>,
};

const BusinessToolsAdvisor = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"tools" | "ads">("tools");
  const [isPlainMode, setIsPlainMode] = useState(false);
  
  const [toolResult, setToolResult] = useState<ToolAdvisorResult | null>(null);
  const [toolHistory, setToolHistory] = useState<ToolHistoryItem[]>([]);
  
  // Ads-specific state
  const [adsResult, setAdsResult] = useState<ToolAdvisorResult | null>(null);
  const [adsHistory, setAdsHistory] = useState<any[]>([]);
  const [targetAudienceAds, setTargetAudienceAds] = useState("");
  const [advertisingGoals, setAdvertisingGoals] = useState("");
  const [advertisingBudget, setAdvertisingBudget] = useState("");
  const [currentChannels, setCurrentChannels] = useState("");
  const [geographicTarget, setGeographicTarget] = useState("");
  const [industry, setIndustry] = useState("");
  const [competitorAds, setCompetitorAds] = useState("");
  const [specificRequirementsAds, setSpecificRequirementsAds] = useState("");
  
  const [deepAnalysisCount, setDeepAnalysisCount] = useState(0);
  const [standardAnalysisCount, setStandardAnalysisCount] = useState(0);
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [nextAnalysisTime, setNextAnalysisTime] = useState<Date | null>(null);
  const [deepAnalysisLimit, setDeepAnalysisLimit] = useState(0);
  const [standardAnalysisLimit, setStandardAnalysisLimit] = useState(2);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const [websiteType, setWebsiteType] = useState("");
  const [websiteStatus, setWebsiteStatus] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [websiteGoals, setWebsiteGoals] = useState("");
  const [businessContext, setBusinessContext] = useState("");
  
  // Premium-only state
  const [isPremium, setIsPremium] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<"standard" | "deep">("standard");
  const [customRequirements, setCustomRequirements] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [competitionLevel, setCompetitionLevel] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const toolResultsRef = useRef<HTMLDivElement | null>(null);

  const { toast } = useToast();
  
  // Image upload validation constants
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

  // Auto-scroll to results after analysis completes with offset + iOS repaint fix
  useEffect(() => {
    if (toolResult && toolResultsRef.current) {
      setTimeout(() => {
        const element = toolResultsRef.current;
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
          // iOS repaint fix
          const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (isiOS && element) {
            element.style.transform = 'translateZ(0)';
            requestAnimationFrame(() => { element.style.transform = ''; });
          }
        }
      }, 100);
    }
  }, [toolResult]);


  useEffect(() => {
    // Check for safe mode from URL or localStorage (guard for Safari private mode)
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('');
    const safeModeParam = params.get('safe');

    let safeModeStorage = 'false';
    try {
      safeModeStorage = localStorage.getItem('safe-mode') || 'false';
    } catch (e) {
      // localStorage may be blocked (Safari private mode)
      console.warn('Safe mode storage not accessible:', e);
      safeModeStorage = 'false';
    }

    setIsPlainMode(safeModeParam === '1' || safeModeStorage === 'true');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Sync credits on initial load to fix any discrepancies
      syncCredits();
      
      checkPremiumStatus();
      loadToolHistory();
      loadAdsHistory();
      loadAnalysisLimit();

      const channel = supabase
        .channel('user_credits_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_credits',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadAnalysisLimit();
            checkPremiumStatus();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Re-check limits when analysis mode changes
  useEffect(() => {
    if (user) {
      loadAnalysisLimit();
    }
  }, [activeTab, analysisMode]);

  const syncCredits = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase.functions.invoke('sync-credits');
      if (error) {
        console.error('Error syncing credits:', error);
      } else {
        console.log('Credits synced successfully');
        // Reload analysis limit after sync
        await loadAnalysisLimit();
      }
    } catch (error) {
      console.error('Error calling sync-credits:', error);
    }
  };

  const checkPremiumStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('is_premium')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      const premium = data?.is_premium ?? false;
      setIsPremium(premium);
      
      // Set mode-specific limits
      setDeepAnalysisLimit(premium ? 2 : 0);
      setStandardAnalysisLimit(premium ? 6 : 2);
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const checkCanAnalyze = (analysisCount: number | null, windowStart: string | null, limit: number): boolean => {
    const now = new Date();
    if (!windowStart) {
      setNextAnalysisTime(null);
      return true;
    }

    const windowStartDate = new Date(windowStart);
    const windowEndsAt = new Date(windowStartDate.getTime() + 24 * 60 * 60 * 1000);

    // If window already expired, allow analysis
    if (now >= windowEndsAt) {
      setNextAnalysisTime(null);
      return true;
    }

    // Within window: allow if fewer than limit analyses used
    if ((analysisCount ?? 0) < limit) {
      setNextAnalysisTime(null);
      return true;
    }

    // Limit reached: show remaining time
    setNextAnalysisTime(windowEndsAt);
    return false;
  };

  const loadAnalysisLimit = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('deep_analysis_count, deep_analysis_window_start, standard_analysis_count, standard_analysis_window_start, is_premium')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading analysis limit:', error);
        return;
      }

      const deepCount = data?.deep_analysis_count ?? 0;
      const deepWindowStart = data?.deep_analysis_window_start ?? null;
      const standardCount = data?.standard_analysis_count ?? 0;
      const standardWindowStart = data?.standard_analysis_window_start ?? null;
      const premium = data?.is_premium ?? false;
      
      setDeepAnalysisCount(deepCount);
      setStandardAnalysisCount(standardCount);
      setIsPremium(premium);
      
      const deepLimit = premium ? 2 : 0;
      const standardLimit = premium ? 6 : 2;
      
      setDeepAnalysisLimit(deepLimit);
      setStandardAnalysisLimit(standardLimit);
      
      // Check if user can analyze based on selected mode
      if (analysisMode === 'deep') {
        setCanAnalyze(checkCanAnalyze(deepCount, deepWindowStart, deepLimit));
      } else {
        setCanAnalyze(checkCanAnalyze(standardCount, standardWindowStart, standardLimit));
      }
    } catch (error) {
      console.error('Error in loadAnalysisLimit:', error);
    }
  };

  const loadToolHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('business_tools_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading tool history:', error);
      return;
    }

    setToolHistory((data || []) as unknown as ToolHistoryItem[]);
  };

  const loadAdsHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ads_advisor_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading ads history:', error);
      return;
    }

    setAdsHistory(data || []);
  };


  const handleAnalyze = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to get recommendations",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "tools") {
      return await handleToolsAnalyze();
    } else {
      return await handleAdsAnalyze();
    }
  };

  const handleToolsAnalyze = async () => {
    const inputText = websiteGoals.trim();

    if (!websiteType || !websiteStatus || !budgetRange || !inputText) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setToolResult(null);
    
    let imageUrl: string | null = null;

    try {
      const functionName = 'business-tools-advisor';
      const body: any = { 
        websiteType, 
        websiteStatus, 
        budgetRange, 
        websiteGoals: inputText 
      };
      
      if (targetAudience) body.targetAudience = targetAudience;
      if (competitionLevel) body.competitionLevel = competitionLevel;
      if (growthStage) body.growthStage = growthStage;

      if (isPremium) {
        body.analysisMode = analysisMode;
        
        if (analysisMode === "deep" && customRequirements.trim()) {
          body.customRequirements = customRequirements.trim();
        }
        
        if (imageUrl) {
          body.imageUrl = imageUrl;
        }
      }

      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) {
        console.error('Analysis error:', error);
        
        if (error.message?.includes('Daily limit reached') || error.message?.includes('429')) {
          toast({
            title: "Tageslimit erreicht",
            description: "Bitte warten Sie 24 Stunden oder upgraden Sie auf Premium für mehr Analysen.",
            variant: "destructive",
          });
          await syncCredits();
        } else if (error.message?.includes('Rate limit exceeded')) {
          toast({
            title: "Rate Limit überschritten",
            description: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.",
            variant: "destructive",
          });
        } else if (error.message?.includes('AI service quota exceeded') || error.message?.includes('402')) {
          toast({
            title: "Service vorübergehend nicht verfügbar",
            description: "Das AI-Kontingent wurde überschritten. Bitte kontaktieren Sie den Support.",
            variant: "destructive",
          });
        } else if (error.message?.includes('timed out')) {
          toast({
            title: "Timeout",
            description: "Analysis is taking too long. Please try again without screenshots.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Analysis Error",
            description: error.message || "An unknown error occurred. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      setToolResult(data);
      await loadToolHistory();
      await loadAnalysisLimit();
      
      toast({
        title: "Analysis complete",
        description: `${analysisMode === 'deep' ? 'Detailed' : 'Quick'} tool recommendations provided`,
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAdsAnalyze = async () => {
    const inputText = advertisingGoals.trim();

    if (!targetAudienceAds || !advertisingBudget || !inputText) {
      toast({
        title: "Missing information",
        description: "Please fill in target audience, budget, and advertising goals",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setAdsResult(null);

    try {
      const functionName = 'ads-advisor';
      const body: any = { 
        targetAudience: targetAudienceAds,
        advertisingGoals: inputText,
        advertisingBudget
      };
      
      if (currentChannels) body.currentChannels = currentChannels;
      if (geographicTarget) body.geographicTarget = geographicTarget;
      if (industry) body.industry = industry;
      if (competitorAds) body.competitorAds = competitorAds;

      if (isPremium) {
        body.analysisMode = analysisMode;
        
        if (analysisMode === "deep" && specificRequirementsAds.trim()) {
          body.specificRequirements = specificRequirementsAds.trim();
        }
      }

      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) {
        console.error('Analysis error:', error);
        
        if (error.message?.includes('limit reached') || error.message?.includes('429')) {
          toast({
            title: "Tageslimit erreicht",
            description: "Bitte warten Sie 24 Stunden oder upgraden Sie auf Premium für mehr Analysen.",
            variant: "destructive",
          });
          await syncCredits();
        } else if (error.message?.includes('Rate limit exceeded')) {
          toast({
            title: "Rate Limit überschritten",
            description: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.",
            variant: "destructive",
          });
        } else if (error.message?.includes('AI service quota exceeded') || error.message?.includes('402')) {
          toast({
            title: "Service vorübergehend nicht verfügbar",
            description: "Das AI-Kontingent wurde überschritten. Bitte kontaktieren Sie den Support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Analysis Error",
            description: error.message || "An unknown error occurred. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      setAdsResult(data);
      await loadAdsHistory();
      await loadAnalysisLimit();
      
      toast({
        title: "Analysis complete",
        description: `${analysisMode === 'deep' ? 'Detailed' : 'Quick'} campaign recommendations provided`,
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  const handleDeleteToolHistory = async (id: string) => {
    const { error } = await supabase
      .from('business_tools_history')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete history item",
        variant: "destructive",
      });
      return;
    }

    setToolHistory(toolHistory.filter(item => item.id !== id));
    toast({
      title: "Deleted",
      description: "History item removed",
    });
  };

  const handleDeleteAdsHistory = async (id: string) => {
    const { error } = await supabase
      .from('ads_advisor_history')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete history item",
        variant: "destructive",
      });
      return;
    }

    setAdsHistory(adsHistory.filter((item: any) => item.id !== id));
    toast({
      title: "Deleted",
      description: "History item removed",
    });
  };


  const getImplementationColor = (implementation: string) => {
    const colors: Record<string, string> = {
      "quick-win": "text-green-600 bg-green-50 border-green-200",
      "medium-term": "text-yellow-600 bg-yellow-50 border-yellow-200",
      "strategic": "text-blue-600 bg-blue-50 border-blue-200",
      "quick-launch": "text-green-600 bg-green-50 border-green-200",
      "long-term": "text-blue-600 bg-blue-50 border-blue-200"
    };
    return colors[implementation] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getTimeUntilNextAnalysis = (): string => {
    if (!nextAnalysisTime) return "";
    
    const now = new Date();
    const diff = nextAnalysisTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleExportPDF = async () => {
    const result = activeTab === "tools" ? toolResult : adsResult;
    if (!result) return;

    const metadata = activeTab === "tools" ? {
      websiteType,
      websiteStatus,
      budgetRange,
      date: new Date().toLocaleDateString('de-DE', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      }),
      analysisMode
    } : {
      targetAudience: targetAudienceAds,
      advertisingBudget,
      date: new Date().toLocaleDateString('de-DE', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      }),
      analysisMode
    };

    try {
      const [{ pdf }, { ReportPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/ReportPDF'),
      ]);

      const blob = await pdf(
        <ReportPDF type={activeTab} result={result} metadata={metadata} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTab}-report-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "PDF exported",
        description: "Your report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export failed",
        description: "PDF export failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen isolate bg-background sm:bg-background/80 sm:backdrop-blur-[8px] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen isolate bg-background sm:bg-background/80 sm:backdrop-blur-[8px] flex flex-col">
        {/* Upgrade Dialog for Free Users at Limit */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Daily Limit Reached</DialogTitle>
              <DialogDescription>
                You've used all {standardAnalysisLimit} free analyses for today. Upgrade to Premium to get more analyses and unlock advanced features.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid md:grid-cols-2 gap-6 my-6">
              <Card className="relative flex flex-col border border-border shadow-md opacity-60">
                <CardHeader>
                  <CardTitle className="text-2xl">Free Plan</CardTitle>
                  <CardDescription>Perfect for getting started</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">2 AI Analyses per day</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Standard Analysis Mode</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Website Tool Recommendations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Website Optimization Tips</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Basic Analysis Report</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button disabled variant="outline" className="w-full">
                    Current Plan
                  </Button>
                </CardFooter>
              </Card>

              <Card className="relative flex flex-col border-2 border-primary shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Recommended
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Premium Plan</CardTitle>
                  <CardDescription>For serious website optimization</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$17.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold">6 Standard Analyses per day</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold">2 Deep Analyses per day</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Advanced Analysis with detailed steps</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">ROI & Risk Assessment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Implementation Timeline</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">PDF Export</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">All Free Plan features included</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      const checkoutUrl = `https://checkout.freemius.com/product/21730/plan/36437/?user_email=${user?.email}&readonly_user=true`;
                      window.open(checkoutUrl, '_blank');
                      setShowUpgradeDialog(false);
                    }}
                  >
                    Upgrade to Premium
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowUpgradeDialog(false)}>
                Maybe Later
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Helmet>
          <title>AI Website Advisor - Get Website Tool Recommendations | Synoptas</title>
          <meta 
            name="description" 
            content="Get AI-powered website tool recommendations tailored to your website type, status, and budget. Free website analysis with screenshot support." 
          />
          <meta name="keywords" content="website advisor, AI website tools, website optimization, website analysis, screenshot analysis, website monetization, online business growth" />
          <link rel="canonical" href="https://synoptas.com/business-tools" />
        </Helmet>
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-16">
          <article className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in">
            <header className="space-y-4 sm:space-y-6 px-2">
              <div className="h-2" />
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight tracking-tight drop-shadow-[0_0_30px_rgba(79,209,131,0.3)]">
                Business Tools Advisor
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get AI-powered <span className="text-primary font-semibold">personalized tool recommendations</span> tailored to your business needs
              </p>
            </header>

            <section className="py-12">
              <Pricing compact={true} />
            </section>
          </article>
        </main>
        <Footer />
      </div>
    );
  }

  const currentHistory = activeTab === "tools" ? toolHistory : adsHistory;
  const currentResult = activeTab === "tools" ? toolResult : adsResult;
  const handleDelete = activeTab === "tools" ? handleDeleteToolHistory : handleDeleteAdsHistory;
  const setCurrentResult = activeTab === "tools" ? setToolResult : setAdsResult;

  return (
    <div className="min-h-screen isolate bg-background sm:bg-background/80 sm:backdrop-blur-[8px] flex flex-col">
      <Helmet>
        <title>AI Advisor - Personalized Tools & Strategy Recommendations | Synoptas</title>
        <meta 
          name="description" 
          content="Get AI-powered business tool recommendations and strategic insights. Personalized analysis based on your industry, team size, and budget. 2 free analyses per day." 
        />
        <meta name="keywords" content="business advisor, AI business tools, business strategy, tool recommendations, startup advice, business growth" />
        <link rel="canonical" href="https://synoptas.com/business-tools-advisor" />
      </Helmet>
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Sidebar - History */}
        <aside className="w-full lg:w-80 shrink-0 space-y-4 animate-fade-in order-2 lg:order-1">
          <Card className="shadow-elegant hover:shadow-hover transition-all duration-300 border-primary/10 bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Previous Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 lg:max-h-[calc(100vh-200px)] overflow-y-auto">
              {currentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted" />
                  <p className="text-sm text-muted-foreground">No history yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Your analyses will appear here</p>
                </div>
              ) : (
                currentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-border rounded-lg hover:bg-accent/50 hover:border-secondary/30 cursor-pointer group relative transition-all duration-300"
                    onClick={() => setCurrentResult(item.result)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-secondary transition-colors">{item.industry}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-auto px-2 shrink-0 hover:bg-destructive/10 hover:text-destructive transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0 space-y-4 sm:space-y-6 animate-fade-in order-1 lg:order-2" style={{ animationDelay: '0.1s' }}>
          <div className="text-center px-2 space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 mb-2">
              <span className="text-xs sm:text-sm font-semibold text-foreground">AI-Powered Business Intelligence</span>
              {isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                  Premium
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-2 sm:mb-3 text-foreground leading-tight drop-shadow-[0_0_18px_hsl(var(--primary)/0.25)]">
              AI Advisor
            </h1>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get personalized AI-powered recommendations to grow your business with data-driven insights
            </p>
            {/* Usage Indicator */}
            <div className="flex flex-col items-center justify-center gap-2 text-sm">
              {isPremium ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Deep Analysis:</span>
                    <span className="font-bold text-foreground">{deepAnalysisCount} / {deepAnalysisLimit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Standard Analysis:</span>
                    <span className="font-bold text-foreground">{standardAnalysisCount} / {standardAnalysisLimit}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Standard Analysis:</span>
                  <span className="font-bold text-foreground">{standardAnalysisCount} / {standardAnalysisLimit}</span>
                  <Button 
                    variant="link" 
                    className="text-xs p-0 h-auto"
                    onClick={() => window.open('https://synoptas.com/pricing', '_blank')}
                  >
                    Upgrade for 6 standard + 2 deep
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Selector */}
          <Card className="border-primary/20 bg-card sm:shadow-elegant">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "tools" | "ads")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tools">Business Tools</TabsTrigger>
                  <TabsTrigger value="ads">Ad Campaigns</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {activeTab === "tools" && (
              <Card className="border-primary/20 bg-card sm:shadow-elegant sm:hover:shadow-hover sm:transition-all sm:duration-300 sm:bg-gradient-to-br sm:from-card sm:to-primary/5">
              <CardHeader className="space-y-2 pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-xl">Tell us about your website</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Provide details to get tailored website tool recommendations powered by AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Website Type</label>
                      <Select value={websiteType} onValueChange={setWebsiteType}>
                        <SelectTrigger><SelectValue placeholder="Select website type" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="business-website">Business Website</SelectItem>
                          <SelectItem value="online-shop">Online Shop</SelectItem>
                          <SelectItem value="blog">Blog / Content Site</SelectItem>
                          <SelectItem value="portfolio">Portfolio</SelectItem>
                          <SelectItem value="landing-page">Landing Page</SelectItem>
                          <SelectItem value="saas-platform">SaaS Platform</SelectItem>
                          <SelectItem value="community">Community / Forum</SelectItem>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="educational">Learning Platform</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Website Status</label>
                      <Select value={websiteStatus} onValueChange={setWebsiteStatus}>
                        <SelectTrigger><SelectValue placeholder="Select current status" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="development">In Development</SelectItem>
                          <SelectItem value="new">Live (0-6 months)</SelectItem>
                          <SelectItem value="established">Established (6-24 months)</SelectItem>
                          <SelectItem value="mature">Mature (2+ years)</SelectItem>
                          <SelectItem value="redesign">Being Redesigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                      <label className="text-xs sm:text-sm font-medium">Monthly Budget for Website Tools</label>
                      <Select value={budgetRange} onValueChange={setBudgetRange}>
                        <SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="minimal">Minimal ($0-$50/month)</SelectItem>
                          <SelectItem value="low">Low ($50-$200/month)</SelectItem>
                          <SelectItem value="medium">Medium ($200-$1,000/month)</SelectItem>
                          <SelectItem value="high">High ($1,000-$5,000/month)</SelectItem>
                          <SelectItem value="enterprise">Enterprise ($5,000+/month)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Website Goals</label>
                    <Textarea
                      placeholder="E.g., Generate more visitors, increase conversion rate, improve SEO ranking, faster load times..."
                      value={websiteGoals}
                      onChange={(e) => setWebsiteGoals(e.target.value)}
                      rows={3}
                      className="text-sm sm:text-base resize-none"
                      maxLength={100}
                    />
                  </div>

                  {/* Premium-only fields */}
                  {isPremium && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                        <div className="space-y-1.5 sm:space-y-2">
                          <label className="text-xs sm:text-sm font-medium">
                            Target Audience
                          </label>
                          <Select value={targetAudience} onValueChange={setTargetAudience}>
                            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="b2b">B2B</SelectItem>
                              <SelectItem value="b2c">B2C</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <label className="text-xs sm:text-sm font-medium">
                            Competition
                          </label>
                          <Select value={competitionLevel} onValueChange={setCompetitionLevel}>
                            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <label className="text-xs sm:text-sm font-medium">
                            Growth Stage
                          </label>
                          <Select value={growthStage} onValueChange={setGrowthStage}>
                            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="startup">Startup (0-2y)</SelectItem>
                              <SelectItem value="growth">Growth (2-5y)</SelectItem>
                              <SelectItem value="mature">Mature (5y+)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Analysis Mode Toggle */}
                      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardContent className="pt-6">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold mb-2">Premium Analysis Mode</p>
                            <div className="flex gap-3">
                              <Button
                                variant={analysisMode === "standard" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setAnalysisMode("standard")}
                                className="flex-1"
                              >
                                Standard
                              </Button>
                              <Button
                                variant={analysisMode === "deep" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setAnalysisMode("deep")}
                                className="flex-1"
                              >
                                Deep Analysis
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {analysisMode === "standard" 
                                ? `Quick recommendations (${standardAnalysisCount}/${standardAnalysisLimit} used) in ~10s` 
                                : `Detailed analysis (${deepAnalysisCount}/${deepAnalysisLimit} used) with ROI, roadmap & risk assessment (~20-30s)`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Custom Requirements - Deep Mode + Premium Only */}
                  {isPremium && analysisMode === "deep" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Specific Requirements (Optional)
                      </label>
                      <Input
                        placeholder="E.g., Must be GDPR compliant, need mobile app support..."
                        value={customRequirements}
                        onChange={(e) => setCustomRequirements(e.target.value.slice(0, 100))}
                        maxLength={100}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        {customRequirements.length}/100 characters
                      </p>
                    </div>
                  )}

                  {isPremium && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium">Deep Analysis:</span> {deepAnalysisCount}/{deepAnalysisLimit} used today
                          {deepAnalysisCount >= deepAnalysisLimit && nextAnalysisTime && analysisMode === 'deep' && (
                            <span className="text-destructive ml-2">• Next in {getTimeUntilNextAnalysis()}</span>
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Standard Analysis:</span> {standardAnalysisCount}/{standardAnalysisLimit} used today
                          {standardAnalysisCount >= standardAnalysisLimit && nextAnalysisTime && analysisMode === 'standard' && (
                            <span className="text-destructive ml-2">• Next in {getTimeUntilNextAnalysis()}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isPremium && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Standard Analysis:</span> {standardAnalysisCount}/{standardAnalysisLimit} used today
                        {standardAnalysisCount >= standardAnalysisLimit && nextAnalysisTime && (
                          <span className="text-destructive ml-2">• Next in {getTimeUntilNextAnalysis()}</span>
                        )}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing || !canAnalyze || !websiteType || !websiteStatus || !budgetRange || !websiteGoals.trim()}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {analysisMode === "deep" ? "Deep Analysis Running..." : "Analyzing..."}
                      </>
                    ) : (
                      "Start Analysis"
                    )}
                  </Button>

                  {!canAnalyze && nextAnalysisTime && (
                    <p className="text-sm text-center text-muted-foreground">
                      Next analysis in: {getTimeUntilNextAnalysis()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "ads" && (
              <Card className="border-primary/20 bg-card sm:shadow-elegant sm:hover:shadow-hover sm:transition-all sm:duration-300 sm:bg-gradient-to-br sm:from-card sm:to-primary/5">
                <CardHeader className="space-y-2 pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-xl">Advertising Campaign Details</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Get AI-powered ad campaign recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Industry</label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent className="max-h-[200px] bg-background z-50">
                          <SelectItem value="e-commerce">E-Commerce</SelectItem>
                          <SelectItem value="saas">SaaS / Software</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance / Banking</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="real-estate">Real Estate</SelectItem>
                          <SelectItem value="travel">Travel / Hospitality</SelectItem>
                          <SelectItem value="food">Food / Beverage</SelectItem>
                          <SelectItem value="fashion">Fashion / Retail</SelectItem>
                          <SelectItem value="fitness">Fitness / Wellness</SelectItem>
                          <SelectItem value="consulting">Consulting / Services</SelectItem>
                          <SelectItem value="automotive">Automotive</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Target Audience</label>
                      <Select value={targetAudienceAds} onValueChange={setTargetAudienceAds}>
                        <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                        <SelectContent className="max-h-[200px] bg-background z-50">
                          <SelectItem value="small-business">Small Business Owners</SelectItem>
                          <SelectItem value="enterprise">Enterprise Decision Makers</SelectItem>
                          <SelectItem value="consumers-18-24">Consumers (18-24)</SelectItem>
                          <SelectItem value="consumers-25-34">Consumers (25-34)</SelectItem>
                          <SelectItem value="consumers-35-44">Consumers (35-44)</SelectItem>
                          <SelectItem value="consumers-45-plus">Consumers (45+)</SelectItem>
                          <SelectItem value="students">Students</SelectItem>
                          <SelectItem value="professionals">Young Professionals</SelectItem>
                          <SelectItem value="parents">Parents</SelectItem>
                          <SelectItem value="retirees">Retirees</SelectItem>
                          <SelectItem value="other">Other / Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Advertising Budget</label>
                      <Select value={advertisingBudget} onValueChange={setAdvertisingBudget}>
                        <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="minimal">$0-$500/month</SelectItem>
                          <SelectItem value="low">$500-$2,000/month</SelectItem>
                          <SelectItem value="medium">$2,000-$10,000/month</SelectItem>
                          <SelectItem value="high">$10,000+/month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Geographic Target</label>
                      <Select value={geographicTarget} onValueChange={setGeographicTarget}>
                        <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                        <SelectContent className="max-h-[200px] bg-background z-50">
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="north-america">North America</SelectItem>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="asia">Asia</SelectItem>
                          <SelectItem value="latin-america">Latin America</SelectItem>
                          <SelectItem value="middle-east">Middle East</SelectItem>
                          <SelectItem value="africa">Africa</SelectItem>
                          <SelectItem value="oceania">Oceania</SelectItem>
                          <SelectItem value="usa">USA</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="germany">Germany</SelectItem>
                          <SelectItem value="france">France</SelectItem>
                          <SelectItem value="canada">Canada</SelectItem>
                          <SelectItem value="australia">Australia</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Advertising Goals</label>
                    <Textarea
                      placeholder="E.g., Increase brand awareness, generate qualified leads, boost online sales by 30%..."
                      value={advertisingGoals}
                      onChange={(e) => setAdvertisingGoals(e.target.value.slice(0, 200))}
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                      {advertisingGoals.length}/200 characters
                    </p>
                  </div>

                  {isPremium && (
                    <>
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Current Advertising Channels (Optional)</label>
                        <Select value={currentChannels} onValueChange={setCurrentChannels}>
                          <SelectTrigger><SelectValue placeholder="Select current channels" /></SelectTrigger>
                          <SelectContent className="max-h-[200px] bg-background z-50">
                            <SelectItem value="none">None / Just Starting</SelectItem>
                            <SelectItem value="google-ads">Google Ads</SelectItem>
                            <SelectItem value="facebook-ads">Facebook Ads</SelectItem>
                            <SelectItem value="instagram-ads">Instagram Ads</SelectItem>
                            <SelectItem value="linkedin-ads">LinkedIn Ads</SelectItem>
                            <SelectItem value="tiktok-ads">TikTok Ads</SelectItem>
                            <SelectItem value="youtube-ads">YouTube Ads</SelectItem>
                            <SelectItem value="display-ads">Display Advertising</SelectItem>
                            <SelectItem value="multiple">Multiple Channels</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>


                      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardContent className="pt-6">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold mb-2">Premium Analysis Mode</p>
                            <div className="flex gap-3">
                              <Button
                                variant={analysisMode === "standard" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setAnalysisMode("standard")}
                                className="flex-1"
                              >
                                Standard
                              </Button>
                              <Button
                                variant={analysisMode === "deep" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setAnalysisMode("deep")}
                                className="flex-1"
                              >
                                Deep Analysis
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {analysisMode === "standard" 
                                ? `Quick recommendations (${standardAnalysisCount}/${standardAnalysisLimit} used)` 
                                : `Detailed analysis (${deepAnalysisCount}/${deepAnalysisLimit} used) with ROI & metrics`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {analysisMode === "deep" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Specific Requirements (Optional)</label>
                          <Input
                            placeholder="E.g., Must comply with GDPR, focus on mobile users..."
                            value={specificRequirementsAds}
                            onChange={(e) => setSpecificRequirementsAds(e.target.value.slice(0, 100))}
                            maxLength={100}
                          />
                          <p className="text-xs text-muted-foreground">
                            {specificRequirementsAds.length}/100 characters
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {isPremium && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium">Deep Analysis:</span> {deepAnalysisCount}/{deepAnalysisLimit} used today
                          {deepAnalysisCount >= deepAnalysisLimit && nextAnalysisTime && analysisMode === 'deep' && (
                            <span className="text-destructive ml-2">• Next in {getTimeUntilNextAnalysis()}</span>
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Standard Analysis:</span> {standardAnalysisCount}/{standardAnalysisLimit} used today
                          {standardAnalysisCount >= standardAnalysisLimit && nextAnalysisTime && analysisMode === 'standard' && (
                            <span className="text-destructive ml-2">• Next in {getTimeUntilNextAnalysis()}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isPremium && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Standard Analysis:</span> {standardAnalysisCount}/{standardAnalysisLimit} used today
                        {standardAnalysisCount >= standardAnalysisLimit && nextAnalysisTime && (
                          <span className="text-destructive ml-2">• Next in {getTimeUntilNextAnalysis()}</span>
                        )}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing || !canAnalyze || !targetAudienceAds || !advertisingBudget || !advertisingGoals.trim()}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {analysisMode === "deep" ? "Deep Analysis Running..." : "Analyzing..."}
                      </>
                    ) : (
                      "Start Analysis"
                    )}
                  </Button>

                  {!canAnalyze && nextAnalysisTime && (
                    <p className="text-sm text-center text-muted-foreground">
                      Next analysis in: {getTimeUntilNextAnalysis()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

              {/* Results */}
              {currentResult && !isPlainMode && (
                <Card ref={toolResultsRef} className="scroll-mt-20 border-primary/20 bg-card sm:shadow-elegant sm:hover:shadow-hover sm:transition-all sm:duration-300 sm:bg-gradient-to-br sm:from-card sm:to-primary/5">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">
                        {activeTab === "tools" ? "Website Tools Recommendations" : "Ad Campaign Recommendations"}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {currentResult.recommendations.length} personalized recommendations
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleExportPDF}
                      variant="outline"
                      size="sm"
                      className="gap-2 flex-shrink-0"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-base sm:text-lg">Strategic Overview</h3>
                      <div className="max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {normalizeMarkdown(currentResult.generalAdvice)}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3 text-base sm:text-lg">Recommendations</h3>
                      <div className="space-y-3">{currentResult.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-4 bg-muted/30 rounded-lg border">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-sm sm:text-base">{rec.name}</h4>
                              <Badge className={getImplementationColor(rec.implementation)} variant="outline">
                                {rec.implementation}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mb-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">{rec.category}</Badge>
                              <Badge variant="outline" className="text-xs">{rec.estimatedCost}</Badge>
                              {rec.riskLevel && (
                                <Badge variant={rec.riskLevel === 'low' ? 'default' : rec.riskLevel === 'medium' ? 'secondary' : 'destructive'} className="text-xs">
                                  Risk: {rec.riskLevel}
                                </Badge>
                              )}
                            </div>
                            <div className="max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                {normalizeMarkdown(rec.rationale)}
                              </ReactMarkdown>
                            </div>
                            {rec.expectedROI && (
                              <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-sm font-semibold text-green-800 dark:text-green-400 flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  Expected ROI: {rec.expectedROI}
                                </p>
                              </div>
                            )}
                            {rec.detailedSteps && rec.detailedSteps.length > 0 && (
                              <details className="mt-3">
                                <summary className="cursor-pointer text-sm font-semibold">Implementation Steps</summary>
                                <ol className="list-decimal list-inside mt-2 space-y-1 text-xs sm:text-sm text-muted-foreground">
                                  {rec.detailedSteps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                </CardContent>
              </Card>
            )}
            
            {/* Plain Mode Results */}
            {currentResult && isPlainMode && (
              <div ref={toolResultsRef} className="scroll-mt-20 space-y-4 p-4 border rounded-lg bg-card">
                <h2 className="text-2xl font-bold">
                  {activeTab === "tools" ? "Tool Recommendations" : "Campaign Recommendations"}
                </h2>
                {currentResult.recommendations.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category} • {item.implementation} • {item.estimatedCost}</p>
                    <p className="mt-2">{item.rationale}</p>
                  </div>
                ))}
                {currentResult.generalAdvice && (
                  <div className="mt-6 p-4 border rounded bg-muted/50">
                    <h3 className="font-semibold mb-2">General Advice</h3>
                    <p className="whitespace-pre-wrap">{stripMarkdown(currentResult.generalAdvice)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessToolsAdvisor;
