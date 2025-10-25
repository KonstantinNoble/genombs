import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, TrendingUp, Shield, DollarSign, AlertTriangle, Trash2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface StockSuggestion {
  name: string;
  ticker: string;
  sector: string;
  assessment: "growth-oriented" | "defensive" | "dividend-strong" | "balanced" | "speculative";
  rationale: string;
}

interface AnalysisResult {
  stocks: StockSuggestion[];
  generalAnalysis: string;
}

interface HistoryItem {
  id: string;
  created_at: string;
  asset_class: string;
  risk_tolerance: string;
  time_horizon: string;
  result: AnalysisResult;
}

const StockAnalysis = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastAnalysisAt, setLastAnalysisAt] = useState<string | null>(null);
  const [canAnalyze, setCanAnalyze] = useState<boolean>(true);

  const [riskTolerance, setRiskTolerance] = useState<string>("medium");
  const [timeHorizon, setTimeHorizon] = useState<string>("medium");
  const [age, setAge] = useState<string>("");
  const [assetClass, setAssetClass] = useState<string>("");
  const [marketEvents, setMarketEvents] = useState<string>("");
  const [wealthClass, setWealthClass] = useState<string>("");

  const checkCanAnalyze = (lastAnalysis: string | null) => {
    if (!lastAnalysis) {
      setCanAnalyze(true);
      return;
    }
    
    const lastAnalysisDate = new Date(lastAnalysis);
    const now = new Date();
    const hoursSince = (now.getTime() - lastAnalysisDate.getTime()) / (1000 * 60 * 60);
    
    setCanAnalyze(hoursSince >= 24);
  };

  const loadAnalysisLimit = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('last_analysis_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No analysis limit entry found, creating one...');
          const { error: insertError } = await supabase
            .from('user_credits')
            .insert({
              user_id: userId,
              last_analysis_at: null
            });
          
          if (insertError) throw insertError;
          setLastAnalysisAt(null);
          setCanAnalyze(true);
        } else {
          throw error;
        }
      } else {
        setLastAnalysisAt(data?.last_analysis_at || null);
        checkCanAnalyze(data?.last_analysis_at || null);
      }
    } catch (error) {
      console.error('Error loading analysis limit:', error);
      setCanAnalyze(false);
    }
  };

  useEffect(() => {
    let analysisChannel: any = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadHistory(session.user.id);
        loadAnalysisLimit(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        analysisChannel?.unsubscribe();
        analysisChannel = null;
      } else {
        setUser(session.user);
        loadHistory(session.user.id);
        loadAnalysisLimit(session.user.id);

        // Recreate realtime subscription for this user
        analysisChannel?.unsubscribe();
        analysisChannel = supabase
          .channel('user_analysis_limit_updates')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'user_credits', filter: `user_id=eq.${session.user.id}` },
            (payload) => {
              const lastAnalysis = (payload as any)?.new?.last_analysis_at ?? (payload as any)?.old?.last_analysis_at;
              if (lastAnalysis !== undefined) {
                setLastAnalysisAt(lastAnalysis);
                checkCanAnalyze(lastAnalysis);
              }
            }
          )
          .subscribe();
      }
    });

    return () => {
      subscription.unsubscribe();
      analysisChannel?.unsubscribe();
    };
  }, [navigate]);

  const loadHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_analysis_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const typedHistory: HistoryItem[] = (data || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        asset_class: item.asset_class,
        risk_tolerance: item.risk_tolerance,
        time_horizon: item.time_horizon,
        result: item.result as unknown as AnalysisResult
      }));
      
      setHistory(typedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!assetClass) {
      toast.error("Please select an asset class");
      return;
    }

    if (!canAnalyze) {
      const nextAnalysisTime = lastAnalysisAt 
        ? new Date(new Date(lastAnalysisAt).getTime() + 24 * 60 * 60 * 1000)
        : new Date();
      
      toast.error(
        `You can only perform one analysis per day. Next analysis available at ${nextAnalysisTime.toLocaleString()}`,
        { duration: 5000 }
      );
      return;
    }

    if (marketEvents.length > 250) {
      toast.error(`Market context too long (${marketEvents.length} characters). Please limit to 250 characters.`);
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('stock-analysis', {
        body: {
          riskTolerance,
          timeHorizon,
          age: age ? parseInt(age) : undefined,
          assetClass,
          marketEvents,
          wealthClass
        }
      });

      if (error) throw error;

      setResult(data);

      // Save to history and reload analysis limit
      if (user) {
        await supabase.from('stock_analysis_history').insert({
          user_id: user.id,
          risk_tolerance: riskTolerance,
          time_horizon: timeHorizon,
          age: age ? parseInt(age) : null,
          asset_class: assetClass,
          market_events: marketEvents,
          wealth_class: wealthClass,
          result: data
        });
        loadHistory(user.id);
        loadAnalysisLimit(user.id);
      }

      toast.success("Analysis generated successfully!");
    } catch (error: any) {
      console.error('Analysis error:', error);
      
      // Handle rate limit error
      if (error?.status === 429 || error?.message?.includes('rate limit') || error?.message?.includes('one analysis per day')) {
        toast.error(
          "You can only perform one analysis per day. Please try again tomorrow.",
          { duration: 5000 }
        );
      } else {
        toast.error("Failed to generate analysis. Please try again.");
      }
      
      // Reload analysis limit after error
      if (user) loadAnalysisLimit(user.id);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stock_analysis_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHistory(prev => prev.filter(item => item.id !== id));
      toast.success("Analysis deleted from history");
    } catch (error) {
      console.error('Error deleting history:', error);
      toast.error("Failed to delete analysis");
    }
  };

  const getAssessmentIcon = (assessment: string) => {
    switch (assessment) {
      case "growth-oriented":
        return <TrendingUp className="h-4 w-4" />;
      case "defensive":
        return <Shield className="h-4 w-4" />;
      case "dividend-strong":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case "growth-oriented":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "defensive":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "dividend-strong":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "balanced":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "speculative":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const getTimeUntilNextAnalysis = () => {
    if (!lastAnalysisAt) return null;
    
    const lastAnalysisDate = new Date(lastAnalysisAt);
    const nextAnalysisDate = new Date(lastAnalysisDate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const hoursLeft = Math.max(0, Math.ceil((nextAnalysisDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    return hoursLeft;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Preview mode for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
              </div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                AI Stock Analysis
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get personalized stock suggestions based on your investment profile
              </p>
            </div>

            {/* Preview Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-primary/20 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Personalized Recommendations</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Our AI analyzes your risk tolerance, time horizon, and investment goals to suggest stocks tailored specifically for you.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-primary/20 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Market Context Analysis</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Get insights that consider current market events, economic conditions, and sector trends for more informed decisions.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-primary/20 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Diversified Strategies</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Receive a balanced portfolio of growth, defensive, and dividend stocks aligned with your wealth class and goals.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-primary/20 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Daily Free Analysis</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Get one comprehensive AI-powered stock analysis every day, completely free after signing up.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Sample Analysis Preview */}
            <Card className="mb-8 shadow-xl border-primary/20 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
              <CardHeader className="relative">
                <CardTitle className="text-2xl mb-2">Sample Analysis Output</CardTitle>
                <CardDescription className="text-base">Here's what you'll receive:</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="p-4 bg-card/50 border border-border rounded-lg backdrop-blur-sm">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Stock Suggestions
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Badge className="mt-1 bg-green-500/10 text-green-700 dark:text-green-400">Growth</Badge>
                      <span>Technology sector recommendations with detailed rationale</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="mt-1 bg-blue-500/10 text-blue-700 dark:text-blue-400">Defensive</Badge>
                      <span>Stable companies for risk mitigation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="mt-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Dividend</Badge>
                      <span>Income-generating stocks for steady returns</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-card/50 border border-border rounded-lg backdrop-blur-sm">
                  <h3 className="font-semibold text-lg mb-2">General Market Analysis</h3>
                  <p className="text-muted-foreground">
                    Comprehensive overview of market conditions, sector trends, and strategic recommendations tailored to your profile.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="shadow-2xl border-primary/30 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
              <CardContent className="p-8 text-center">
                <div className="max-w-2xl mx-auto space-y-6">
                  <h2 className="text-3xl font-bold">Ready to Get Your Personalized Analysis?</h2>
                  <p className="text-lg text-muted-foreground">
                    Sign up now to receive your first AI-powered stock analysis for free. No credit card required.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/auth")}
                      className="bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg px-8"
                    >
                      Sign Up Free
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate("/auth")}
                      className="text-lg px-8 border-primary/30 hover:bg-primary/5"
                    >
                      Sign In
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Join thousands of investors making smarter decisions with AI
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* History Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-8 border-primary/20 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Analysis History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No history yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group relative"
                    >
                      <div 
                        className="cursor-pointer"
                        onClick={() => setResult(item.result)}
                      >
                        <div className="font-semibold text-sm text-foreground">{item.asset_class}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(item.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex gap-1 mt-2">
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {item.risk_tolerance}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {item.time_horizon}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(item.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
                </div>
                {!canAnalyze && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-orange-500/20 border-orange-500/30">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                    <span className="text-sm font-semibold">Next in {getTimeUntilNextAnalysis()}h</span>
                  </div>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                AI Stock Analysis
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get personalized stock suggestions based on your investment profile
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                One free analysis per day • Powered by Gemini 2.5 Flash
              </p>
            </div>

            <Card className="mb-6 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <CardTitle className="text-lg">Important Disclaimer</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  These suggestions are purely informational and do NOT constitute financial advice.
                  Always conduct your own research and consult with a qualified financial advisor
                  before making investment decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 shadow-xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-6">
                <CardTitle className="text-2xl">Investment Profile</CardTitle>
                <CardDescription className="text-base">Tell us about your investment preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="riskTolerance" className="text-base font-semibold">Risk Tolerance</Label>
                  <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                    <SelectTrigger id="riskTolerance" className="h-12">
                      <SelectValue placeholder="Select risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Prefer stable investments</SelectItem>
                      <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                      <SelectItem value="high">High - Willing to take risks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeHorizon" className="text-base font-semibold">Investment Time Horizon</Label>
                  <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                    <SelectTrigger id="timeHorizon" className="h-12">
                      <SelectValue placeholder="Select time horizon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 years)</SelectItem>
                      <SelectItem value="medium">Medium (3-5 years)</SelectItem>
                      <SelectItem value="long">Long (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base font-semibold">Age (Optional)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g., 35"
                      value={age}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 3) {
                          setAge(value);
                        }
                      }}
                      min="18"
                      max="100"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wealthClass" className="text-base font-semibold">Wealth Class (Optional)</Label>
                    <Select value={wealthClass} onValueChange={setWealthClass}>
                      <SelectTrigger id="wealthClass" className="h-12">
                        <SelectValue placeholder="Select wealth class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (up to €50,000)</SelectItem>
                        <SelectItem value="middle">Middle (€50,000 - €250,000)</SelectItem>
                        <SelectItem value="upper-middle">Upper Middle (€250,000 - €1M)</SelectItem>
                        <SelectItem value="high">High (over €1M)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetClass" className="text-base font-semibold">Asset Class</Label>
                  <Select value={assetClass} onValueChange={setAssetClass}>
                    <SelectTrigger id="assetClass" className="h-12">
                      <SelectValue placeholder="Select asset class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stocks">General Stocks</SelectItem>
                      <SelectItem value="etfs">ETFs</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="dividends">Dividend Stocks</SelectItem>
                      <SelectItem value="energy">Energy</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="consumer">Consumer Goods</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketEvents" className="text-base font-semibold">
                    Market Context (Optional)
                    {marketEvents && (
                      <span className={`ml-2 text-xs font-normal ${marketEvents.length > 250 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        ({marketEvents.length}/250 characters)
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id="marketEvents"
                    placeholder="e.g., ECB interest rate cut, Strong AI rally in tech sector, Upcoming earnings season"
                    value={marketEvents}
                    onChange={(e) => setMarketEvents(e.target.value)}
                    rows={4}
                    maxLength={250}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || !assetClass || !canAnalyze}
                  className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : !canAnalyze ? (
                    <>
                      <Clock className="mr-2 h-5 w-5" />
                      Available in {getTimeUntilNextAnalysis()}h
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Generate AI Analysis (1x/day)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {result && (
              <div className="space-y-6 animate-in fade-in duration-700">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-12 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                    <h2 className="text-3xl font-bold">AI-Generated Investment Inspiration</h2>
                  </div>
                  <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg">
                    <CardContent className="pt-6">
                      <p className="text-base leading-relaxed">{result.generalAnalysis}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4">
                  {result.stocks.map((stock, index) => (
                    <Card 
                      key={index} 
                      className="group hover:shadow-2xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                              {stock.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="font-mono font-semibold">
                                {stock.ticker}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{stock.sector}</span>
                            </div>
                          </div>
                          <Badge className={`${getAssessmentColor(stock.assessment)} px-3 py-1.5`}>
                            <span className="flex items-center gap-1.5">
                              {getAssessmentIcon(stock.assessment)}
                              <span className="capitalize">{stock.assessment}</span>
                            </span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {stock.rationale}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                      </div>
                      <p className="text-sm leading-relaxed">
                        <strong>Reminder:</strong> These suggestions are purely informational and do NOT constitute
                        financial advice. Always conduct your own research and consult with a qualified financial
                        advisor before making investment decisions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StockAnalysis;
