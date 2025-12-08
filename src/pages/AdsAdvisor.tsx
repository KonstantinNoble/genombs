import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/home/Pricing";
import { User } from "@supabase/supabase-js";
import { StrategyInput, OptionalParams } from "@/components/planner/StrategyInput";
import { StrategyOutput, PlannerResult } from "@/components/planner/StrategyOutput";

interface AdsHistoryItem {
  id: string;
  target_audience: string;
  advertising_goals: string;
  advertising_budget: string;
  result: PlannerResult;
  analysis_mode: string;
  created_at: string;
}

export default function AdsAdvisor() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  
  // New input state
  const [prompt, setPrompt] = useState("");
  const [optionalParams, setOptionalParams] = useState<OptionalParams>({});
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [adsHistory, setAdsHistory] = useState<AdsHistoryItem[]>([]);
  const [analysisMode, setAnalysisMode] = useState<"standard" | "deep">("standard");
  
  const [deepAnalysisCount, setDeepAnalysisCount] = useState(0);
  const [deepAnalysisLimit, setDeepAnalysisLimit] = useState(0);
  const [standardAnalysisCount, setStandardAnalysisCount] = useState(0);
  const [standardAnalysisLimit, setStandardAnalysisLimit] = useState(2);
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [nextAnalysisTime, setNextAnalysisTime] = useState<Date | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        const element = resultRef.current;
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
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
      .order('created_at', { ascending: false })
      .limit(4);

    if (data) {
      setAdsHistory(data.map(item => ({
        ...item,
        result: item.result as unknown as PlannerResult
      })));
    }
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your advertising goals",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const body: any = {
        prompt: prompt.trim(),
        analysisMode
      };

      // Add optional params if set
      if (optionalParams.budget) body.budget = optionalParams.budget;
      if (optionalParams.industry) body.industry = optionalParams.industry;
      if (optionalParams.channels) body.channels = optionalParams.channels;
      if (optionalParams.timeline) body.timeline = optionalParams.timeline;
      if (optionalParams.geographic) body.geographic = optionalParams.geographic;

      const { data, error } = await supabase.functions.invoke('ads-advisor', { body });

      if (error) {
        console.error('Analysis error:', error);
        
        if (error.message && error.message.includes('limit reached')) {
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
      
      if (data && data.error) {
        toast({
          title: "Analysis Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setResult(data);
      await loadAdsHistory(user!.id);
      await loadPremiumStatus(user!.id);
      
      toast({
        title: "Strategy Created",
        description: `Your ${analysisMode === 'deep' ? 'comprehensive' : 'quick'} advertising strategy is ready`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate strategy. Please try again.",
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
    toast({ title: "Deleted", description: "History item removed" });
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
          <title>AI Ads Planner - Strategic Advertising Campaign Planning</title>
          <meta name="description" content="Create AI-powered advertising strategies with phased campaign planning. Get actionable strategies for Google Ads, Facebook, Instagram, LinkedIn & more." />
          <link rel="canonical" href="https://synoptas.com/ads-advisor" />
        </Helmet>
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-16">
          <article className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in">
            <header className="space-y-4 sm:space-y-6 px-2">
              <div className="h-2" />
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight tracking-tight drop-shadow-[0_0_30px_rgba(79,209,131,0.3)]">
                AI Ads Planner
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Create <span className="text-primary font-semibold">phased advertising strategies</span> tailored to your business goals
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
        <title>AI Ads Planner - Strategic Advertising Campaign Planning</title>
        <meta name="description" content="Create AI-powered advertising strategies with phased campaign planning. Get actionable strategies for Google Ads, Facebook, Instagram, LinkedIn & more." />
        <link rel="canonical" href="https://synoptas.com/ads-advisor" />
      </Helmet>
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar - History */}
          <aside className="w-full lg:w-80 shrink-0 space-y-4 animate-fade-in order-2 lg:order-1">
            <Card className="shadow-elegant hover:shadow-hover transition-all duration-300 border-primary/10 bg-gradient-to-br from-card via-card to-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Previous Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 lg:max-h-[calc(100vh-200px)] overflow-y-auto">
                {adsHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted" />
                    <p className="text-sm text-muted-foreground">No history yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Your strategies will appear here</p>
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
                          <p className="font-medium text-sm truncate group-hover:text-secondary transition-colors">
                            {item.advertising_goals?.substring(0, 50) || 'Strategy'}...
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">
                              {item.analysis_mode || 'standard'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 shrink-0 hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHistory(item.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
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
                <span className="text-xs sm:text-sm font-semibold text-foreground">AI-Powered Advertising Strategy</span>
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                    Premium
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-2 sm:mb-3 text-foreground leading-tight drop-shadow-[0_0_18px_hsl(var(--primary)/0.25)]">
                AI Ads Planner
              </h1>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Describe your advertising goals and get a phased strategy tailored to your needs
              </p>
              
              <div className="flex flex-col items-center justify-center gap-2 text-sm">
                {isPremium ? (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Deep: <span className="font-bold text-foreground">{deepAnalysisCount}/{deepAnalysisLimit}</span></span>
                      <span className="text-muted-foreground">Standard: <span className="font-bold text-foreground">{standardAnalysisCount}/{standardAnalysisLimit}</span></span>
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
                      Upgrade for more
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Input Card */}
            <Card className="border-primary/20 bg-card shadow-elegant">
              <CardHeader className="space-y-2 pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-xl">Describe Your Advertising Goals</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Tell us about your target audience, goals, and what you want to achieve. Use the + button to add optional context.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StrategyInput
                  value={prompt}
                  onChange={setPrompt}
                  optionalParams={optionalParams}
                  onOptionalParamsChange={setOptionalParams}
                  placeholder="E.g., I want to increase brand awareness for my e-commerce store selling sustainable fashion. My target audience is environmentally conscious millennials aged 25-35. I want to generate leads and drive traffic to my website..."
                  disabled={analyzing}
                />

                {/* Analysis Mode Toggle */}
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
                          <div className="text-[10px] sm:text-xs opacity-80">2-3 phases (~10s)</div>
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
                            {isPremium ? '4-6 phases (~20s)' : 'Upgrade to unlock'}
                          </div>
                        </div>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Button 
                  onClick={handleAnalyze}
                  disabled={analyzing || !canAnalyze || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Strategy...
                    </>
                  ) : !canAnalyze && nextAnalysisTime ? (
                    `Next analysis in ${getTimeUntilNextAnalysis()}`
                  ) : (
                    'Create Advertising Strategy'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            {result && (
              <div ref={resultRef} className="animate-fade-in">
                <Card className="border-primary/20 bg-card shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-xl">Your Advertising Strategy</CardTitle>
                    <CardDescription>
                      {result.strategies?.length || 0} phases planned for your campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StrategyOutput result={result} isDeepMode={analysisMode === 'deep'} />
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
