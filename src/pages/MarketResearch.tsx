import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisOptions, type AnalysisOptionsType } from "@/components/market-research/AnalysisOptions";
import { MarketOverview } from "@/components/market-research/MarketOverview";
import { 
  CompetitorPieChart, 
  ChannelBarChart, 
  TrendImpactChart, 
  DemographicsDonutChart,
  GrowthProjectionChart 
} from "@/components/market-research/MarketCharts";
import { CitationsList } from "@/components/market-research/CitationsList";
import { MarketUpgradeDialog } from "@/components/market-research/MarketUpgradeDialog";

interface MarketResearchResult {
  marketSize?: {
    value: number;
    unit: string;
    tam: number;
    sam: number;
  };
  growth?: {
    cagr: number;
    yearOverYear: number;
    projection2026: number;
  };
  competitors?: Array<{
    name: string;
    marketShare: number;
    revenue?: number;
  }>;
  trends?: Array<{
    name: string;
    impact: number;
    growthPotential: number;
  }>;
  channels?: Array<{
    name: string;
    effectiveness: number;
    averageROI: number;
  }>;
  demographics?: Array<{
    segment: string;
    percentage: number;
    averageSpend?: number;
  }>;
  citations: Array<{ url: string; title: string }>;
}

interface HistoryItem {
  id: string;
  query: string;
  industry: string;
  created_at: string;
  result: MarketResearchResult;
  analysis_options: AnalysisOptionsType;
}

export default function MarketResearch() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [industry, setIndustry] = useState("");
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptionsType>({
    marketSize: true,
    competitors: true,
    trends: true,
    channels: false,
    demographics: false,
    growth: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MarketResearchResult | null>(null);
  const [usage, setUsage] = useState<{ count: number; limit: number; isPremium: boolean } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [resetTime, setResetTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchUsage();
    }
  }, [user]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("market_research_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setHistory(data as unknown as HistoryItem[]);
    }
  };

  const fetchUsage = async () => {
    const { data, error } = await supabase
      .from("user_credits")
      .select("market_research_count, market_research_window_start, is_premium")
      .eq("user_id", user?.id)
      .single();

    if (!error && data) {
      const windowStart = data.market_research_window_start 
        ? new Date(data.market_research_window_start) 
        : null;
      const now = new Date();
      const windowExpired = !windowStart || (now.getTime() - windowStart.getTime()) > 24 * 60 * 60 * 1000;
      const currentCount = windowExpired ? 0 : (data.market_research_count || 0);
      const dailyLimit = data.is_premium ? 3 : 1;
      
      setUsage({
        count: currentCount,
        limit: dailyLimit,
        isPremium: data.is_premium || false
      });

      // Set reset time if credits are exhausted
      if (currentCount >= dailyLimit && windowStart && !windowExpired) {
        setResetTime(new Date(windowStart.getTime() + 24 * 60 * 60 * 1000));
      } else {
        setResetTime(null);
        setTimeRemaining("");
      }
    }
  };

  // Live countdown timer
  useEffect(() => {
    if (!resetTime) return;
    
    const updateTimer = () => {
      const diff = resetTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining("");
        setResetTime(null);
        fetchUsage();
      } else {
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${hours}h ${mins}m ${secs}s`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [resetTime]);

  const handleAnalyze = async () => {
    if (!industry.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter an industry or market to analyze.",
        variant: "destructive"
      });
      return;
    }

    const hasSelectedOption = Object.values(analysisOptions).some(v => v);
    if (!hasSelectedOption) {
      toast({
        title: "Options Required",
        description: "Please select at least one analysis option.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const response = await supabase.functions.invoke("market-research", {
        body: { industry, analysisOptions }
      });

      if (response.error) {
        const errorData = response.error as any;
        if (errorData?.context?.status === 429) {
          // Show upgrade dialog for free users
          if (!usage?.isPremium) {
            setShowUpgradeDialog(true);
          }
          toast({
            title: "Daily Limit Reached",
            description: "You have reached your daily analysis limit.",
            variant: "destructive"
          });
          return;
        }
        throw new Error(errorData.message || "Failed to analyze market");
      }

      const data = response.data;
      setResult(data.result);
      setUsage(data.usage);
      
      // Show upgrade dialog after first analysis for free users
      if (!data.usage.isPremium && data.usage.count >= data.usage.limit) {
        setShowUpgradeDialog(true);
      }

      fetchHistory();

      toast({
        title: "Analysis Complete",
        description: "Market research data has been generated."
      });

    } catch (error) {
      console.error("Market research error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setIndustry(item.industry || item.query);
    setAnalysisOptions(item.analysis_options);
    setResult(item.result);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Market Research | Synoptas"
        description="AI-powered market research with professional charts and data visualization. Analyze competitors, trends, and demographics."
        canonical="https://synoptas.com/market-research"
      />
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Market Research
              </h1>
              {usage && (
                <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full w-fit ${
                  usage.isPremium 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {usage.count}/{usage.limit} today
                  {usage.isPremium && " ✓"}
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              AI-powered market analysis with visualizations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-8">
              {/* Input Section */}
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                    Configure Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4 space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Industry or Market
                    </label>
                    <Input
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g., Electric Vehicles, SaaS, Healthcare AI"
                      disabled={isLoading}
                      maxLength={100}
                      className="bg-background/50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {industry.length}/100 characters
                    </p>
                  </div>

                  <AnalysisOptions
                    options={analysisOptions}
                    onChange={setAnalysisOptions}
                    disabled={isLoading}
                  />

                  {(() => {
                    const creditsExhausted = usage && usage.count >= usage.limit && resetTime;
                    return (
                      <>
                        <Button
                          onClick={handleAnalyze}
                          disabled={isLoading || !industry.trim() || !!creditsExhausted}
                          className="w-full"
                        >
                          {isLoading ? "Analyzing..." : creditsExhausted ? "Limit Reached" : "Analyze Market"}
                        </Button>
                        {creditsExhausted && timeRemaining && (
                          <div className="text-center text-sm text-muted-foreground mt-3 p-3 bg-muted/50 rounded-lg">
                            <span className="block text-xs mb-1">Next credits available in:</span>
                            <span className="font-mono font-semibold text-foreground">{timeRemaining}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Loading State */}
              {isLoading && (
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-muted-foreground">Analyzing market data...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results Section */}
              {result && !isLoading && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Market Overview */}
                  {result.marketSize && (
                    <MarketOverview marketSize={result.marketSize} />
                  )}

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {result.competitors && (
                      <CompetitorPieChart data={result.competitors} />
                    )}
                    
                    {result.channels && (
                      <ChannelBarChart data={result.channels} />
                    )}
                    
                    {result.trends && (
                      <TrendImpactChart data={result.trends} />
                    )}
                    
                    {result.demographics && (
                      <DemographicsDonutChart data={result.demographics} />
                    )}
                  </div>

                  {/* Growth Projection */}
                  {result.growth && (
                    <GrowthProjectionChart 
                      data={result.growth} 
                      currentMarketSize={result.marketSize?.value}
                    />
                  )}

                  {/* Citations */}
                  {result.citations && result.citations.length > 0 && (
                    <CitationsList citations={result.citations} />
                  )}
                </div>
              )}
            </div>

            {/* History Sidebar - Hidden on mobile, shown at bottom or as collapsible */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50 lg:sticky lg:top-24">
                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="text-sm sm:text-lg font-semibold text-foreground">
                    Recent Analyses
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                  {history.length === 0 ? (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      No previous analyses yet.
                    </p>
                  ) : (
                    <ul className="flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-1 px-1">
                      {history.map((item) => (
                        <li key={item.id} className="flex-shrink-0 lg:flex-shrink">
                          <button
                            onClick={() => loadFromHistory(item)}
                            className="w-full min-w-[140px] lg:min-w-0 text-left p-2 sm:p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                          >
                            <p className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[120px] lg:max-w-full">
                              {item.industry || item.query}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <MarketUpgradeDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog} 
      />
    </>
  );
}
