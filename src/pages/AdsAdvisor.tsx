import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/home/Pricing";
import { User } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AdCampaignRecommendation {
  name: string;
  category: "google-ads" | "facebook-ads" | "instagram-ads" | "linkedin-ads" | "tiktok-ads" | "youtube-ads" | "display-ads";
  implementation: "immediate" | "short-term" | "long-term";
  estimatedCost: string;
  rationale: string;
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
  industry: string;
  target_audience: string;
  advertising_budget: string;
  advertising_goals: string;
  current_channels?: string;
  geographic_target?: string;
  competitor_strategy?: string;
  specific_requirements?: string;
  result: AdsAdvisorResult;
  analysis_mode: string;
  created_at: string;
}

function normalizeMarkdown(md?: string) {
  if (!md) return "";
  let s = md.replace(/\r\n?/g, "\n").trim();
  s = s.replace(/^(#{1,6}\s[^\n]+)\n([A-Za-z])\s*$/gm, "$1$2");
  s = s.replace(/[★✓→•✨💡📊⚡♦►]/g, '');
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  return s;
}

const mdComponents = {
  h1: ({ children }: any) => <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-4 text-foreground">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl sm:text-2xl font-bold mt-5 mb-3 text-foreground">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-base sm:text-lg font-semibold mt-3 mb-2 text-foreground">{children}</h4>,
  p: ({ children }: any) => <p className="text-sm sm:text-base leading-relaxed mb-3 text-foreground">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside space-y-2 mb-4 text-foreground/90">{children}</ol>,
  li: ({ children }: any) => <li className="ml-4">{children}</li>,
  strong: ({ children }: any) => <span className="font-semibold text-foreground">{children}</span>,
  em: ({ children }: any) => <span className="italic">{children}</span>,
  code: ({ children }: any) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
};

export default function AdsAdvisor() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [advertisingBudget, setAdvertisingBudget] = useState("");
  const [advertisingGoals, setAdvertisingGoals] = useState("");
  
  const [currentChannels, setCurrentChannels] = useState("");
  const [geographicTarget, setGeographicTarget] = useState("");
  const [competitorStrategy, setCompetitorStrategy] = useState("");
  const [specificRequirements, setSpecificRequirements] = useState("");
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AdsAdvisorResult | null>(null);
  const [adsHistory, setAdsHistory] = useState<AdsHistoryItem[]>([]);
  const [analysisMode, setAnalysisMode] = useState<"standard" | "deep">("standard");
  
  const [deepAnalysisCount, setDeepAnalysisCount] = useState(0);
  const [deepAnalysisLimit, setDeepAnalysisLimit] = useState(0);
  const [standardAnalysisCount, setStandardAnalysisCount] = useState(0);
  const [standardAnalysisLimit, setStandardAnalysisLimit] = useState(2);
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [nextAnalysisTime, setNextAnalysisTime] = useState<Date | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to results after analysis with offset for mobile
  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        const element = resultRef.current;
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
  }, [result]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadPremiumStatus(user.id);
    }
  }, [analysisMode, user]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadPremiumStatus(session.user.id);
        await loadAdsHistory(session.user.id);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
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

  const loadPremiumStatus = async (userId: string) => {
    const { data } = await supabase
      .from('user_credits')
      .select('is_premium, ads_deep_analysis_count, ads_deep_analysis_window_start, ads_standard_analysis_count, ads_standard_analysis_window_start')
      .eq('user_id', userId)
      .single();

    if (data) {
      setIsPremium(data.is_premium);
      
      const deepLimit = data.is_premium ? 2 : 0;
      const standardLimit = data.is_premium ? 6 : 2;
      
      setDeepAnalysisLimit(deepLimit);
      setStandardAnalysisLimit(standardLimit);
      
      const deepCount = data.ads_deep_analysis_count || 0;
      const deepWindowStart = data.ads_deep_analysis_window_start;
      const standardCount = data.ads_standard_analysis_count || 0;
      const standardWindowStart = data.ads_standard_analysis_window_start;
      
      setDeepAnalysisCount(deepCount);
      setStandardAnalysisCount(standardCount);
      
      // Check if user can analyze based on selected mode
      if (analysisMode === 'deep') {
        setCanAnalyze(checkCanAnalyze(deepCount, deepWindowStart, deepLimit));
      } else {
        setCanAnalyze(checkCanAnalyze(standardCount, standardWindowStart, standardLimit));
      }
    }
  };

  const loadAdsHistory = async (userId: string) => {
    const { data } = await supabase
      .from('ads_advisor_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setAdsHistory(data.map(item => ({
        ...item,
        result: item.result as unknown as AdsAdvisorResult
      })));
    }
  };

  const handleAnalyze = async () => {
    if (!industry || !targetAudience || !advertisingBudget || !advertisingGoals) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (advertisingGoals.length > 100) {
      toast({
        title: "Text Too Long",
        description: "Advertising goals must be 100 characters or less",
        variant: "destructive",
      });
      return;
    }

    if (specificRequirements && specificRequirements.length > 100) {
      toast({
        title: "Text Too Long",
        description: "Specific requirements must be 100 characters or less",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const body: any = {
        industry,
        targetAudience,
        advertisingBudget,
        advertisingGoals,
        analysisMode
      };

      if (analysisMode === "deep" && isPremium) {
        if (currentChannels) body.currentChannels = currentChannels;
        if (geographicTarget) body.geographicTarget = geographicTarget;
        if (competitorStrategy) body.competitorStrategy = competitorStrategy;
        if (specificRequirements) body.specificRequirements = specificRequirements;
      }

      const { data, error } = await supabase.functions.invoke('ads-advisor', { body });

      if (error) {
        console.error('Analysis error:', error);
        
        // Check if it's a limit reached error (429)
        if (error.message && typeof error.message === 'string' && error.message.includes('limit reached')) {
          toast({
            title: "Analysis Limit Reached",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Analysis Error",
            description: error.message || "An error occurred. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      // Also check if data contains an error (for 429 responses)
      if (data && data.error === 'LIMIT_REACHED') {
        toast({
          title: "Analysis Limit Reached",
          description: data.message || "Analysis limit reached. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      setResult(data);
      await loadAdsHistory(user!.id);
      await loadPremiumStatus(user!.id);
      
      toast({
        title: "Analysis Complete",
        description: `${analysisMode === 'deep' ? 'Detailed' : 'Quick'} campaign recommendations provided`,
      });
    } catch (error) {
      console.error('Error:', error);
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

    setAdsHistory(adsHistory.filter(item => item.id !== id));
    toast({
      title: "Deleted",
      description: "History item removed",
    });
  };

  const getImplementationColor = (implementation: string) => {
    const colors: Record<string, string> = {
      "immediate": "text-green-600 bg-green-50 border-green-200",
      "short-term": "text-yellow-600 bg-yellow-50 border-yellow-200",
      "long-term": "text-blue-600 bg-blue-50 border-blue-200",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Helmet>
          <title>AI Ads Campaign Advisor - Advertising Strategy Recommendations</title>
          <meta 
            name="description" 
            content="Get AI-powered advertising campaign recommendations. Tailored strategies for Google Ads, Facebook, Instagram, LinkedIn & more. Free daily analysis with detailed ROI insights." 
          />
          <meta name="keywords" content="advertising advisor, AI ads strategy, campaign planning, ad recommendations, marketing strategy, Google Ads, Facebook Ads, ROI optimization" />
          <link rel="canonical" href="https://synoptas.com/ads-advisor" />
          
          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://synoptas.com/ads-advisor" />
          <meta property="og:title" content="AI Ads Campaign Advisor - Advertising Strategy Recommendations" />
          <meta property="og:description" content="Get AI-powered advertising campaign recommendations. Tailored strategies for Google Ads, Facebook, Instagram, LinkedIn & more." />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="AI Ads Campaign Advisor - Advertising Strategy Recommendations" />
          <meta name="twitter:description" content="Get AI-powered advertising campaign recommendations. Tailored strategies for Google Ads, Facebook, Instagram, LinkedIn & more." />
        </Helmet>
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-16">
          <article className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in">
            <header className="space-y-4 sm:space-y-6 px-2">
              <div className="h-2" />
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight tracking-tight drop-shadow-[0_0_30px_rgba(79,209,131,0.3)]">
                AI Ads Campaign Advisor
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get AI-powered <span className="text-primary font-semibold">advertising campaign recommendations</span> tailored to your business needs
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>AI Ads Campaign Advisor - Advertising Strategy Recommendations</title>
        <meta 
          name="description" 
          content="Get AI-powered advertising campaign recommendations. Tailored strategies for Google Ads, Facebook, Instagram, LinkedIn & more. Free daily analysis with detailed ROI insights." 
        />
        <meta name="keywords" content="advertising advisor, AI ads strategy, campaign planning, ad recommendations, marketing strategy, Google Ads, Facebook Ads, ROI optimization" />
        <link rel="canonical" href="https://synoptas.com/ads-advisor" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://synoptas.com/ads-advisor" />
        <meta property="og:title" content="AI Ads Campaign Advisor - Advertising Strategy Recommendations" />
        <meta property="og:description" content="Get AI-powered advertising campaign recommendations. Tailored strategies for Google Ads, Facebook, Instagram, LinkedIn & more." />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Ads Campaign Advisor - Advertising Strategy Recommendations" />
        <meta name="twitter:description" content="Get AI-powered advertising campaign recommendations. Tailored strategies for Google Ads, Facebook, Instagram, LinkedIn & more." />
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
                {adsHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted" />
                    <p className="text-sm text-muted-foreground">No history yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Your analyses will appear here</p>
                  </div>
                ) : (
                  adsHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-border rounded-lg hover:bg-accent/50 hover:border-secondary/30 cursor-pointer group relative transition-all duration-300"
                      onClick={() => setResult(item.result)}
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
                            handleDeleteHistory(item.id);
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
                <span className="text-xs sm:text-sm font-semibold text-foreground">AI-Powered Advertising Intelligence</span>
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                    Premium
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-2 sm:mb-3 text-foreground leading-tight drop-shadow-[0_0_18px_hsl(var(--primary)/0.25)]">
                AI Ads Advisor
              </h1>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get AI-powered advertising campaign recommendations tailored to your business needs
              </p>
              
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

            <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <Card className="border-primary/20 bg-card sm:shadow-elegant sm:hover:shadow-hover sm:transition-all sm:duration-300 sm:bg-gradient-to-br sm:from-card sm:to-primary/5">
                <CardHeader className="space-y-2 pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-xl">Tell us about your advertising needs</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Provide details to get tailored advertising campaign recommendations powered by AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Industry</label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="E-commerce">E-commerce</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Real Estate">Real Estate</SelectItem>
                          <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                          <SelectItem value="Fashion">Fashion</SelectItem>
                          <SelectItem value="Professional Services">Professional Services</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Target Audience</label>
                      <Select value={targetAudience} onValueChange={setTargetAudience}>
                        <SelectTrigger><SelectValue placeholder="Select target audience" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="B2B">B2B</SelectItem>
                          <SelectItem value="B2C">B2C</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                          <SelectItem value="Niche Market">Niche Market</SelectItem>
                          <SelectItem value="Mass Market">Mass Market</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Monthly Advertising Budget</label>
                    <Select value={advertisingBudget} onValueChange={setAdvertisingBudget}>
                      <SelectTrigger><SelectValue placeholder="Select your budget range" /></SelectTrigger>
                      <SelectContent className="max-h-[200px]">
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

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Advertising Goals</label>
                    <Textarea
                      placeholder="E.g., Increase brand awareness, generate leads, drive sales..."
                      value={advertisingGoals}
                      onChange={(e) => setAdvertisingGoals(e.target.value)}
                      maxLength={100}
                      rows={3}
                      className="resize-none text-sm sm:text-base"
                    />
                    <p className="text-xs text-muted-foreground text-right">{advertisingGoals.length}/100 characters</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs sm:text-sm font-medium">Analysis Mode</label>
                    <Tabs value={analysisMode} onValueChange={(v) => setAnalysisMode(v as "standard" | "deep")}>
                      <TabsList className="grid grid-cols-2 gap-0 p-0 h-auto bg-transparent border-0">
                        <TabsTrigger 
                          value="standard"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border border-border first:rounded-l-lg data-[state=inactive]:bg-muted/30"
                        >
                          <div className="text-center py-2">
                            <div className="text-xs sm:text-sm font-semibold">Standard</div>
                            <div className="text-[10px] sm:text-xs opacity-80">Quick recommendations ({standardAnalysisCount}/{standardAnalysisLimit} used) in ~10s</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="deep"
                          disabled={!isPremium}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border border-l-0 border-border last:rounded-r-lg data-[state=inactive]:bg-muted/30"
                        >
                          <div className="text-center py-2">
                            <div className="text-xs sm:text-sm font-semibold flex items-center justify-center gap-1">
                              Deep Analysis
                              {!isPremium && <span className="text-[10px]">(Premium)</span>}
                            </div>
                            <div className="text-[10px] sm:text-xs opacity-80">
                              {isPremium ? `Detailed analysis (${deepAnalysisCount}/${deepAnalysisLimit} used) with ROI, roadmap & risk assessment (~20-30s)` : 'Upgrade to unlock'}
                            </div>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {analysisMode === "deep" && isPremium && (
                    <div className="space-y-3 sm:space-y-4 pt-2 border-t border-border/50">
                      <p className="text-xs sm:text-sm text-muted-foreground">Deep Analysis Options</p>
                      
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Current Advertising Channels</label>
                        <Select value={currentChannels} onValueChange={setCurrentChannels}>
                          <SelectTrigger><SelectValue placeholder="Select current channels" /></SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="Google Ads">Google Ads</SelectItem>
                            <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                            <SelectItem value="Instagram Ads">Instagram Ads</SelectItem>
                            <SelectItem value="LinkedIn Ads">LinkedIn Ads</SelectItem>
                            <SelectItem value="TikTok Ads">TikTok Ads</SelectItem>
                            <SelectItem value="YouTube Ads">YouTube Ads</SelectItem>
                            <SelectItem value="Display Ads">Display Ads</SelectItem>
                            <SelectItem value="Multiple Channels">Multiple Channels</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Geographic Target</label>
                        <Select value={geographicTarget} onValueChange={setGeographicTarget}>
                          <SelectTrigger><SelectValue placeholder="Select geographic target" /></SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <SelectItem value="Local (City/Region)">Local (City/Region)</SelectItem>
                            <SelectItem value="National">National</SelectItem>
                            <SelectItem value="International">International</SelectItem>
                            <SelectItem value="Global">Global</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Competitor Strategy</label>
                        <Select value={competitorStrategy} onValueChange={setCompetitorStrategy}>
                          <SelectTrigger><SelectValue placeholder="Select competitor strategy" /></SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <SelectItem value="Not using ads">Not using ads</SelectItem>
                            <SelectItem value="Similar budget">Similar budget</SelectItem>
                            <SelectItem value="Higher budget">Higher budget</SelectItem>
                            <SelectItem value="Lower budget">Lower budget</SelectItem>
                            <SelectItem value="Unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Specific Requirements (Optional)</label>
                        <Textarea
                          placeholder="E.g., Must comply with GDPR, need mobile app support..."
                          value={specificRequirements}
                          onChange={(e) => setSpecificRequirements(e.target.value)}
                          maxLength={100}
                          rows={3}
                          className="resize-none text-sm sm:text-base"
                        />
                        <p className="text-xs text-muted-foreground text-right">{specificRequirements.length}/100 characters</p>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleAnalyze}
                    disabled={analyzing || !canAnalyze || !industry || !targetAudience || !advertisingBudget || !advertisingGoals}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {analysisMode === "deep" ? "Deep Analysis Running..." : "Analyzing..."}
                      </>
                    ) : !canAnalyze && nextAnalysisTime ? (
                      `Next analysis in ${getTimeUntilNextAnalysis()}`
                    ) : (
                      'Get Campaign Recommendations'
                    )}
                  </Button>

                  {!canAnalyze && nextAnalysisTime && (
                    <p className="text-sm text-center text-muted-foreground">
                      Next analysis in: {getTimeUntilNextAnalysis()}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Results Section */}
              {result && result.recommendations && Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
                <Card ref={resultRef} className="scroll-mt-20 border-primary/20 bg-card sm:shadow-elegant sm:hover:shadow-hover sm:transition-all sm:duration-300 sm:bg-gradient-to-br sm:from-card sm:to-primary/5">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl">Campaign Recommendations</CardTitle>
                    <CardDescription className="text-sm sm:text-base">AI-powered advertising strategy tailored to your business</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    {analysisMode === 'deep' && result.recommendations.length === 3 && (
                      <div className="mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">3-Phase Implementation Strategy</h3>
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                          <div className="text-center p-2 sm:p-3 border rounded-lg bg-primary/5">
                            <div className="text-xs sm:text-sm font-semibold text-primary">Phase 1</div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">Foundation</div>
                            <div className="text-[10px] sm:text-xs">Month 1-2</div>
                          </div>
                          <div className="text-center p-2 sm:p-3 border rounded-lg bg-primary/5">
                            <div className="text-xs sm:text-sm font-semibold text-primary">Phase 2</div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">Expansion</div>
                            <div className="text-[10px] sm:text-xs">Month 3-4</div>
                          </div>
                          <div className="text-center p-2 sm:p-3 border rounded-lg bg-primary/5">
                            <div className="text-xs sm:text-sm font-semibold text-primary">Phase 3</div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">Optimization</div>
                            <div className="text-[10px] sm:text-xs">Month 5-6</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {result.recommendations.map((campaign, index) => (
                      <Card key={index} className="border-border">
                        <CardHeader className="pb-3 sm:pb-4">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base sm:text-lg">
                              {analysisMode === 'deep' && result.recommendations.length === 3 
                                ? `Phase ${index + 1}: ${campaign.name}`
                                : index === 0 && analysisMode === 'standard'
                                  ? `Primary: ${campaign.name}`
                                  : analysisMode === 'standard'
                                    ? `Supporting: ${campaign.name}`
                                    : campaign.name
                              }
                            </CardTitle>
                            <Badge variant="outline" className={getImplementationColor(campaign.implementation)}>
                              {campaign.implementation}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <span className="font-medium">Est. Cost:</span>
                            <span>{campaign.estimatedCost}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                          <div>
                            <h4 className="text-sm sm:text-base font-semibold mb-2">Rationale</h4>
                            <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
                              {normalizeMarkdown(campaign.rationale)}
                            </ReactMarkdown>
                          </div>

                          {campaign.detailedSteps && campaign.detailedSteps.length > 0 && (
                            <div>
                              <h4 className="text-sm sm:text-base font-semibold mb-2">Implementation Steps</h4>
                              <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
                                {campaign.detailedSteps.map((step, i) => (
                                  <li key={i} className="ml-1">{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {campaign.expectedROI && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="font-medium">Expected ROI:</span>
                              <span>{campaign.expectedROI}</span>
                            </div>
                          )}

                          {campaign.riskLevel && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="font-medium">Risk Level:</span>
                              <Badge variant={
                                campaign.riskLevel === 'low' ? 'default' : 
                                campaign.riskLevel === 'medium' ? 'secondary' : 
                                'destructive'
                              } className="text-xs">
                                {campaign.riskLevel}
                              </Badge>
                            </div>
                          )}

                          {campaign.metrics && campaign.metrics.length > 0 && (
                            <div>
                              <h4 className="text-sm sm:text-base font-semibold mb-2">Key Metrics</h4>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {campaign.metrics.map((metric, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{metric}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {result.generalAdvice && (
                      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardHeader className="pb-3 sm:pb-4">
                          <CardTitle className="text-base sm:text-lg">
                            {analysisMode === 'deep' 
                              ? 'Strategic Roadmap Overview'
                              : 'Campaign Strategy Overview'
                            }
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            {analysisMode === 'deep'
                              ? 'How these phases work together to achieve your advertising goals'
                              : 'How these campaigns complement each other'
                            }
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
                            {normalizeMarkdown(result.generalAdvice)}
                          </ReactMarkdown>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
