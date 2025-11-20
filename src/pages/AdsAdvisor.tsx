import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, History, Trash2, Loader2, TrendingUp, Lightbulb, Star, DollarSign, Clock, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/home/Pricing";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdCampaignRecommendation {
  name: string;
  category: "google-ads" | "facebook-ads" | "instagram-ads" | "linkedin-ads" | "tiktok-ads" | "youtube-ads" | "display-ads";
  implementation: "immediate" | "short-term" | "long-term";
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

interface AdsAdvisorResult {
  recommendations: AdCampaignRecommendation[];
  generalAdvice: string;
}

interface AdsHistoryItem {
  id: string;
  website_url: string;
  target_audience: string;
  advertising_budget: string;
  advertising_goals: string;
  current_channels?: string;
  competitor_ads?: string;
  geographic_target?: string;
  result: AdsAdvisorResult;
  analysis_mode: string;
  created_at: string;
}

// Normalize markdown and remove special characters
function normalizeMarkdown(md?: string) {
  if (!md) return "";
  let s = md.replace(/\r\n?/g, "\n").trim();
  // Remove special characters
  s = s.replace(/[★✓→•✨💡📊⚡♦►]/g, '');
  // Remove markdown bold
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  // Fix heading issues
  s = s.replace(/^(#{1,6}\s[^\n]+)\n([A-Za-z])\s*$/gm, "$1$2");
  return s;
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

const AdsAdvisor = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [result, setResult] = useState<AdsAdvisorResult | null>(null);
  const [history, setHistory] = useState<AdsHistoryItem[]>([]);
  
  const [adsDeepAnalysisCount, setAdsDeepAnalysisCount] = useState(0);
  const [adsStandardAnalysisCount, setAdsStandardAnalysisCount] = useState(0);
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [nextAnalysisTime, setNextAnalysisTime] = useState<Date | null>(null);
  const [deepAnalysisLimit, setDeepAnalysisLimit] = useState(0);
  const [standardAnalysisLimit, setStandardAnalysisLimit] = useState(2);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Form state
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [advertisingBudget, setAdvertisingBudget] = useState("");
  const [advertisingGoals, setAdvertisingGoals] = useState("");
  
  // Premium state
  const [isPremium, setIsPremium] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<"standard" | "deep">("standard");
  const [currentChannels, setCurrentChannels] = useState("");
  const [competitorAds, setCompetitorAds] = useState("");
  const [geographicTarget, setGeographicTarget] = useState("");
  
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Auto-scroll to results after analysis completes
  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        const element = resultsRef.current;
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [result]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        } else {
          // Store intent to return after auth
          try {
            localStorage.setItem('auth_intent', 'ads-advisor');
          } catch (e) {
            console.warn('localStorage not accessible:', e);
          }
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error getting session:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      loadHistory();
      loadAnalysisLimit();

      const channel = supabase
        .channel('user_credits_changes_ads')
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

  useEffect(() => {
    if (user) {
      loadAnalysisLimit();
    }
  }, [analysisMode]);

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

    if (now >= windowEndsAt) {
      setNextAnalysisTime(null);
      return true;
    }

    if ((analysisCount ?? 0) < limit) {
      setNextAnalysisTime(null);
      return true;
    }

    setNextAnalysisTime(windowEndsAt);
    return false;
  };

  const loadAnalysisLimit = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('ads_deep_analysis_count, ads_deep_analysis_window_start, ads_standard_analysis_count, ads_standard_analysis_window_start, is_premium')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading analysis limit:', error);
        return;
      }

      const deepCount = data?.ads_deep_analysis_count ?? 0;
      const deepWindowStart = data?.ads_deep_analysis_window_start ?? null;
      const standardCount = data?.ads_standard_analysis_count ?? 0;
      const standardWindowStart = data?.ads_standard_analysis_window_start ?? null;
      const premium = data?.is_premium ?? false;
      
      setAdsDeepAnalysisCount(deepCount);
      setAdsStandardAnalysisCount(standardCount);
      setIsPremium(premium);
      
      setDeepAnalysisLimit(premium ? 2 : 0);
      setStandardAnalysisLimit(premium ? 6 : 2);
      
      const isDeep = analysisMode === "deep";
      const canDoAnalysis = checkCanAnalyze(
        isDeep ? deepCount : standardCount,
        isDeep ? deepWindowStart : standardWindowStart,
        isDeep ? (premium ? 2 : 0) : (premium ? 6 : 2)
      );
      
      setCanAnalyze(canDoAnalysis);
    } catch (error) {
      console.error('Error loading analysis limit:', error);
    }
  };

  const loadHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ads_advisor_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory((data || []) as unknown as AdsHistoryItem[]);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!websiteUrl || !targetAudience || !advertisingBudget || !advertisingGoals) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!canAnalyze) {
      toast({
        title: "Analysis Limit Reached",
        description: `Next analysis available at ${nextAnalysisTime?.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);

    try {
      const body: any = {
        websiteUrl,
        targetAudience,
        advertisingBudget,
        advertisingGoals
      };
      
      if (isPremium) {
        body.analysisMode = analysisMode;
        
        if (analysisMode === "deep") {
          if (currentChannels) body.currentChannels = currentChannels;
          if (competitorAds) body.competitorAds = competitorAds;
          if (geographicTarget) body.geographicTarget = geographicTarget;
        }
      }

      const { data, error } = await supabase.functions.invoke('ads-advisor', { body });

      if (error) {
        console.error('Analysis error:', error);
        
        if (error.message?.includes('limit reached') || error.message?.includes('429')) {
          toast({
            title: "Daily Limit Reached",
            description: "Please wait 24 hours or upgrade to Premium for more analyses.",
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

      setResult(data);
      await loadHistory();
      await loadAnalysisLimit();
      
      toast({
        title: "Analysis Complete",
        description: `${analysisMode === 'deep' ? 'Detailed' : 'Quick'} advertising strategy provided`,
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

  const handleDeleteHistory = async (id: string) => {
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

    setHistory(history.filter(item => item.id !== id));
    toast({
      title: "Deleted",
      description: "History item removed",
    });
  };

  const getImplementationBadge = (implementation: string) => {
    const styles: Record<string, string> = {
      "immediate": "bg-green-100 text-green-800 border-green-200",
      "short-term": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "long-term": "bg-blue-100 text-blue-800 border-blue-200",
    };
    
    const labels: Record<string, string> = {
      "immediate": "Start Immediately",
      "short-term": "Short-term (1-3 months)",
      "long-term": "Long-term (3+ months)",
    };
    
    return (
      <Badge variant="outline" className={styles[implementation] || ""}>
        {labels[implementation] || implementation}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const styles: Record<string, string> = {
      "low": "bg-green-100 text-green-800",
      "medium": "bg-yellow-100 text-yellow-800",
      "high": "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={styles[risk] || ""}>
        {risk.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Ads Advisor - Smart Advertising Strategies | Synoptas</title>
        <meta name="description" content="Get AI-powered advertising recommendations tailored to your website. Plan campaigns, optimize budgets, and maximize ROI with intelligent ad strategy analysis." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              AI Ads Advisor
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Get personalized advertising campaign recommendations powered by AI
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Advertising Strategy Analysis
                  </CardTitle>
                  <CardDescription>
                    Provide details about your website and advertising goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Analysis Mode Toggle */}
                  <Tabs 
                    value={analysisMode} 
                    onValueChange={(v) => setAnalysisMode(v as "standard" | "deep")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="standard">
                        Standard Analysis
                      </TabsTrigger>
                      <TabsTrigger value="deep" disabled={!isPremium}>
                        <Star className="w-4 h-4 mr-2" />
                        Deep Analysis (Premium)
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="standard" className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Get 3-5 advertising campaign recommendations with cost estimates and implementation timelines.
                      </p>
                    </TabsContent>
                    
                    <TabsContent value="deep" className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Detailed campaign strategies with step-by-step implementation guides, ROI projections, risk assessments, and KPI metrics.
                      </p>
                    </TabsContent>
                  </Tabs>

                  {/* Basic Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="websiteUrl">Website URL *</Label>
                      <Input
                        id="websiteUrl"
                        type="url"
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="targetAudience">Target Audience *</Label>
                      <Input
                        id="targetAudience"
                        placeholder="e.g., Young professionals aged 25-35 in technology"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        maxLength={200}
                      />
                    </div>

                    <div>
                      <Label htmlFor="advertisingBudget">Monthly Advertising Budget *</Label>
                      <Select value={advertisingBudget} onValueChange={setAdvertisingBudget}>
                        <SelectTrigger id="advertisingBudget">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Less than $500">Less than $500</SelectItem>
                          <SelectItem value="$500 - $1,000">$500 - $1,000</SelectItem>
                          <SelectItem value="$1,000 - $2,500">$1,000 - $2,500</SelectItem>
                          <SelectItem value="$2,500 - $5,000">$2,500 - $5,000</SelectItem>
                          <SelectItem value="$5,000 - $10,000">$5,000 - $10,000</SelectItem>
                          <SelectItem value="$10,000 - $25,000">$10,000 - $25,000</SelectItem>
                          <SelectItem value="More than $25,000">More than $25,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="advertisingGoals">Advertising Goals *</Label>
                      <Textarea
                        id="advertisingGoals"
                        placeholder="Describe your primary advertising objectives, target KPIs, and desired outcomes..."
                        value={advertisingGoals}
                        onChange={(e) => setAdvertisingGoals(e.target.value)}
                        rows={5}
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {advertisingGoals.length}/1000 characters
                      </p>
                    </div>
                  </div>

                  {/* Premium/Deep Mode Fields */}
                  {isPremium && analysisMode === "deep" && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-primary">Deep Analysis Options</p>
                      
                      <div>
                        <Label htmlFor="currentChannels">Current Advertising Channels (Optional)</Label>
                        <Input
                          id="currentChannels"
                          placeholder="e.g., Google Ads, Facebook, Instagram Stories"
                          value={currentChannels}
                          onChange={(e) => setCurrentChannels(e.target.value)}
                          maxLength={200}
                        />
                      </div>

                      <div>
                        <Label htmlFor="competitorAds">Competitor Advertising Analysis (Optional)</Label>
                        <Input
                          id="competitorAds"
                          placeholder="e.g., Competitor X runs YouTube pre-roll ads targeting similar audience"
                          value={competitorAds}
                          onChange={(e) => setCompetitorAds(e.target.value)}
                          maxLength={300}
                        />
                      </div>

                      <div>
                        <Label htmlFor="geographicTarget">Geographic Target</Label>
                        <Select value={geographicTarget} onValueChange={setGeographicTarget}>
                          <SelectTrigger id="geographicTarget">
                            <SelectValue placeholder="Select geographic target" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Local (City/Region)">Local (City/Region)</SelectItem>
                            <SelectItem value="National">National</SelectItem>
                            <SelectItem value="International">International</SelectItem>
                            <SelectItem value="Global">Global</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Credit Counter */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Analysis Credits</p>
                    <div className="text-sm text-muted-foreground">
                      {isPremium ? (
                        <>
                          <div>Deep Analyses: {adsDeepAnalysisCount}/{deepAnalysisLimit} used today</div>
                          <div>Standard Analyses: {adsStandardAnalysisCount}/{standardAnalysisLimit} used today</div>
                        </>
                      ) : (
                        <div>Standard Analyses: {adsStandardAnalysisCount}/{standardAnalysisLimit} used today</div>
                      )}
                    </div>
                    {!canAnalyze && nextAnalysisTime && (
                      <p className="text-xs text-red-600 mt-2">
                        Next analysis available: {nextAnalysisTime.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing || !canAnalyze}
                    className="w-full"
                    size="lg"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Advertising Strategy
                      </>
                    )}
                  </Button>

                  {!isPremium && (
                    <div className="text-center text-sm text-muted-foreground">
                      <Link to="/pricing" className="text-primary hover:underline">
                        Upgrade to Premium
                      </Link>
                      {" "}for deep analysis and more daily analyses
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <div ref={resultsRef} className="mt-6 space-y-6">
                  <h2 className="text-2xl font-bold">Campaign Recommendations</h2>
                  
                  {result.recommendations.map((campaign, index) => (
                    <Card key={index} className="border-border hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-xl">{campaign.name}</CardTitle>
                          <Badge variant="outline" className="bg-primary/10 text-primary shrink-0">
                            {campaign.category.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {getImplementationBadge(campaign.implementation)}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="font-medium">Estimated Cost:</span>
                          <span>{campaign.estimatedCost}</span>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Why This Campaign?</h4>
                          <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
                            {normalizeMarkdown(campaign.rationale)}
                          </ReactMarkdown>
                        </div>
                        
                        {campaign.detailedSteps && (
                          <Collapsible>
                            <CollapsibleTrigger className="flex items-center gap-2 text-primary hover:underline">
                              <TrendingUp className="w-4 h-4" />
                              View Detailed Implementation Plan
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4 space-y-4">
                              {campaign.detailedSteps && (
                                <div>
                                  <h4 className="font-semibold mb-2">Implementation Steps:</h4>
                                  <ol className="list-decimal list-inside space-y-1">
                                    {campaign.detailedSteps.map((step, i) => (
                                      <li key={i} className="text-sm">{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              
                              {campaign.expectedROI && (
                                <div className="flex items-center gap-2 text-sm">
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                  <span className="font-medium">Expected ROI:</span>
                                  <span>{campaign.expectedROI}</span>
                                </div>
                              )}
                              
                              {campaign.riskLevel && (
                                <div className="flex items-center gap-2 text-sm">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="font-medium">Risk Level:</span>
                                  {getRiskBadge(campaign.riskLevel)}
                                </div>
                              )}
                              
                              {campaign.prerequisites && campaign.prerequisites.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Prerequisites:</h4>
                                  <ul className="list-disc list-inside space-y-1 text-sm">
                                    {campaign.prerequisites.map((prereq, i) => (
                                      <li key={i}>{prereq}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {campaign.metrics && campaign.metrics.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Key Metrics to Track:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {campaign.metrics.map((metric, i) => (
                                      <Badge key={i} variant="outline">{metric}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {campaign.implementationTimeline && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium">Timeline:</span>
                                  <span>{campaign.implementationTimeline}</span>
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {result.generalAdvice && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-primary" />
                          Strategic Advertising Advice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
                          {normalizeMarkdown(result.generalAdvice)}
                        </ReactMarkdown>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* History Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-border shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Analysis History
                  </CardTitle>
                  <CardDescription>
                    Your previous advertising analyses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No history yet. Create your first analysis!
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {history.map((item) => (
                        <Card key={item.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                          <div 
                            onClick={() => setResult(item.result)}
                            className="space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium line-clamp-2">{item.website_url}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteHistory(item.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {item.analysis_mode}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {!isPremium && (
            <div className="mt-12">
              <Pricing />
            </div>
          )}
        </main>

        <Footer />
      </div>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Premium</DialogTitle>
            <DialogDescription>
              Get more analysis credits and unlock deep analysis mode with detailed insights.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => navigate('/pricing')}>
              View Pricing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdsAdvisor;
