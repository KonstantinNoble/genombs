import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lightbulb, TrendingUp, Clock, DollarSign, Trash2, LogIn, ExternalLink, Sparkles, BookOpen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopifyAffiliateBanner from "@/components/ShopifyAffiliateBanner";
import { User } from "@supabase/supabase-js";

interface ToolRecommendation {
  name: string;
  category: "productivity" | "marketing" | "sales" | "finance" | "hr" | "operations" | "strategy";
  implementation: "quick-win" | "medium-term" | "strategic";
  estimatedCost: string;
  rationale: string;
}

interface IdeaRecommendation {
  name: string;
  category: "product" | "service" | "saas" | "marketplace" | "content" | "consulting" | "ecommerce";
  viability: "quick-launch" | "medium-term" | "long-term";
  estimatedInvestment: string;
  rationale: string;
}

interface ToolAdvisorResult {
  recommendations: ToolRecommendation[];
  generalAdvice: string;
}

interface IdeaAdvisorResult {
  recommendations: IdeaRecommendation[];
  generalAdvice: string;
}

interface ToolHistoryItem {
  id: string;
  industry: string;
  team_size: string;
  budget_range: string;
  business_goals: string;
  result: ToolAdvisorResult;
  created_at: string;
}

interface IdeaHistoryItem {
  id: string;
  industry: string;
  team_size: string;
  budget_range: string;
  business_context: string;
  result: IdeaAdvisorResult;
  created_at: string;
}

const BusinessToolsAdvisor = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"tools" | "ideas">("tools");
  
  const [toolResult, setToolResult] = useState<ToolAdvisorResult | null>(null);
  const [toolHistory, setToolHistory] = useState<ToolHistoryItem[]>([]);
  
  const [ideaResult, setIdeaResult] = useState<IdeaAdvisorResult | null>(null);
  const [ideaHistory, setIdeaHistory] = useState<IdeaHistoryItem[]>([]);
  
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [nextAnalysisTime, setNextAnalysisTime] = useState<Date | null>(null);

  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [businessGoals, setBusinessGoals] = useState("");
  const [businessContext, setBusinessContext] = useState("");

  const { toast } = useToast();
  
  useEffect(() => {
    // Listen first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const confirmed = !!session?.user?.email_confirmed_at;
      setUser(confirmed ? session!.user : null);
      if (session && !confirmed) {
        setTimeout(() => { supabase.auth.signOut(); }, 0);
      }
    });

    // Then get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const confirmed = !!session?.user?.email_confirmed_at;
      setUser(confirmed ? session!.user : null);
      setLoading(false);
      if (session && !confirmed) {
        setTimeout(() => { supabase.auth.signOut(); }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Sync credits on initial load to fix any discrepancies
      syncCredits();
      
      loadToolHistory();
      loadIdeaHistory();
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
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

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

  const checkCanAnalyze = (analysisCount: number | null, windowStart: string | null): boolean => {
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

    // Within window: allow if fewer than 2 analyses used
    if ((analysisCount ?? 0) < 2) {
      setNextAnalysisTime(null);
      return true;
    }

    // Limit reached: show remaining time
    setNextAnalysisTime(windowEndsAt);
    return false;
  };

  const loadAnalysisLimit = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_credits')
      .select('analysis_count, analysis_window_start')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading analysis limit:', error);
      return;
    }

    setCanAnalyze(checkCanAnalyze(data?.analysis_count ?? 0, data?.analysis_window_start ?? null));
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

  const loadIdeaHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('business_ideas_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading idea history:', error);
      return;
    }

    setIdeaHistory((data || []) as unknown as IdeaHistoryItem[]);
  };

  const handleAnalyze = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: `Please sign in to get business ${activeTab} recommendations`,
        variant: "destructive",
      });
      return;
    }

    const isTools = activeTab === "tools";
    const inputText = isTools ? businessGoals.trim() : businessContext.trim();

    if (!industry || !teamSize || !budgetRange || !inputText) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    if (isTools) {
      setToolResult(null);
    } else {
      setIdeaResult(null);
    }

    try {
      const functionName = isTools ? 'business-tools-advisor' : 'business-ideas-advisor';
      const body = isTools 
        ? { industry, teamSize, budgetRange, businessGoals: inputText }
        : { industry, teamSize, budgetRange, businessContext: inputText };

      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) {
        if (error.message?.includes('Daily limit reached') || error.message?.includes('429')) {
          toast({
            title: "Daily limit reached",
            description: "Syncing your usage data...",
            variant: "destructive",
          });
          // Sync credits to fix any discrepancies
          await syncCredits();
        } else if (error.message?.includes('Rate limit') || error.message?.includes('402')) {
          toast({
            title: "Service temporarily unavailable",
            description: error.message || "Please try again later",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (isTools) {
        setToolResult(data);
        await loadToolHistory();
      } else {
        setIdeaResult(data);
        await loadIdeaHistory();
      }
      
      await loadAnalysisLimit();
      
      toast({
        title: "Recommendations generated",
        description: `Your personalized business ${activeTab} are ready`,
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

  const handleDeleteIdeaHistory = async (id: string) => {
    const { error } = await supabase
      .from('business_ideas_history')
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

    setIdeaHistory(ideaHistory.filter(item => item.id !== id));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
      <div className="flex-1 container mx-auto px-4 py-16 bg-gradient-to-b from-muted/30 via-primary/5 to-background">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 blur-3xl animate-pulse" />
                <Sparkles className="relative h-20 w-20 mx-auto text-primary animate-pulse" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-fade-in">
                Business AI Advisor
              </h1>
              <p className="text-xl sm:text-2xl text-foreground max-w-2xl mx-auto leading-relaxed">
                Get AI-powered recommendations for <span className="text-primary font-semibold">tools</span> and <span className="text-primary font-semibold">strategies</span> to supercharge your business growth
              </p>
            </div>

            <div className="py-6">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/auth'}
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-xl px-12 py-8 shadow-elegant hover:shadow-hover hover:scale-110 transition-all duration-300"
              >
                <LogIn className="mr-3 h-6 w-6" />
                Sign in to get started
              </Button>
              <p className="text-sm text-muted-foreground mt-3">Start your free analysis now</p>
            </div>

            <Card className="text-left shadow-elegant hover:shadow-hover transition-all duration-500 border-primary/20 bg-gradient-to-br from-card to-card overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="text-2xl sm:text-3xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  How it works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 group/item">
                  <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform duration-300">1</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-foreground">Share your business context</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Tell us about your industry, team size, budget, and goals</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 group/item">
                  <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform duration-300">2</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-foreground">Get personalized recommendations</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Receive 5-7 specific tool and strategy suggestions tailored to your needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 group/item">
                  <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform duration-300">3</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-foreground">Implement and grow</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Follow our actionable advice to optimize your business operations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentHistory = activeTab === "tools" ? toolHistory : ideaHistory;
  const currentResult = activeTab === "tools" ? toolResult : ideaResult;
  const handleDelete = activeTab === "tools" ? handleDeleteToolHistory : handleDeleteIdeaHistory;
  const setCurrentResult = activeTab === "tools" ? setToolResult : setIdeaResult;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-muted/20 to-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <ShopifyAffiliateBanner />
      </div>
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - History */}
        <aside className="w-full lg:w-80 shrink-0 space-y-4 animate-fade-in">
          <Card className="shadow-elegant hover:shadow-hover transition-all duration-300 border-primary/10 bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <BookOpen className="h-5 w-5 text-secondary" />
                </div>
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Previous Recommendations
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 lg:max-h-[calc(100vh-200px)] overflow-y-auto">
              {currentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
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
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 shrink-0 hover:bg-destructive/10 hover:text-destructive transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
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
        <main className="flex-1 w-full min-w-0 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="text-center px-2 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 mb-2">
              <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
              <span className="text-sm font-semibold text-foreground">AI-Powered Business Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
              Business AI Advisor
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get personalized AI-powered recommendations to grow your business with data-driven insights
            </p>
          </div>

          {/* Tab Selector */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "tools" | "ideas")} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12 bg-muted/50 p-1 backdrop-blur-sm">
              <TabsTrigger 
                value="tools" 
                className="gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-300"
              >
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Business </span>Tools
              </TabsTrigger>
              <TabsTrigger 
                value="ideas" 
                className="gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary/80 data-[state=active]:text-primary transition-all duration-300"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Business </span>Ideas
              </TabsTrigger>
            </TabsList>

            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-6 mt-6">
              <Card className="shadow-elegant hover:shadow-hover transition-all duration-300 border-primary/10 bg-gradient-to-br from-card to-primary/5">
                <CardHeader className="space-y-2 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Tell us about your business</CardTitle>
                  </div>
                  <CardDescription className="text-base">Provide details to get tailored tool recommendations powered by AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Industry</label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="marketing">Marketing Agency</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="real-estate">Real Estate</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="hospitality">Hospitality</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Team Size</label>
                      <Select value={teamSize} onValueChange={setTeamSize}>
                        <SelectTrigger><SelectValue placeholder="Select team size" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="solo">Solo (1 person)</SelectItem>
                          <SelectItem value="small">Small (2-10 people)</SelectItem>
                          <SelectItem value="medium">Medium (11-50 people)</SelectItem>
                          <SelectItem value="large">Large (51-200 people)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (200+ people)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Monthly Budget for Tools</label>
                      <Select value={budgetRange} onValueChange={setBudgetRange}>
                        <SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="minimal">Minimal ($0-$100/month)</SelectItem>
                          <SelectItem value="low">Low ($100-$500/month)</SelectItem>
                          <SelectItem value="medium">Medium ($500-$2,000/month)</SelectItem>
                          <SelectItem value="high">High ($2,000-$10,000/month)</SelectItem>
                          <SelectItem value="enterprise">Enterprise ($10,000+/month)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Business Goals</label>
                    <Textarea
                      placeholder="E.g., Increase sales by 30%, improve team collaboration, automate repetitive tasks, reduce operational costs..."
                      value={businessGoals}
                      onChange={(e) => setBusinessGoals(e.target.value)}
                      rows={4}
                      maxLength={50}
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing || !canAnalyze || !industry || !teamSize || !budgetRange || !businessGoals.trim()}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    {analyzing ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing your business needs...</>
                    ) : !canAnalyze ? (
                      <><Clock className="mr-2 h-5 w-5" />Next recommendation in {getTimeUntilNextAnalysis()}</>
                    ) : (
                      <><Lightbulb className="mr-2 h-5 w-5" />Get AI Tool Recommendations</>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    You can request new recommendations once every 24 hours
                  </p>
                </CardContent>
              </Card>

              {/* Tool Results */}
              {toolResult && (
                <div className="space-y-6 animate-fade-in">
                  <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-secondary/5 shadow-elegant">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <span>Strategic Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base text-foreground leading-relaxed">{toolResult.generalAdvice}</p>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1 flex-1 bg-gradient-to-r from-primary via-secondary to-primary/30 rounded-full" />
                      <h2 className="text-2xl font-bold whitespace-nowrap">Recommended Tools & Strategies</h2>
                      <div className="h-1 flex-1 bg-gradient-to-l from-primary via-secondary to-primary/30 rounded-full" />
                    </div>
                    <div className="grid gap-4">
                      {toolResult.recommendations.map((rec, index) => (
                        <Card 
                          key={index}
                          className="hover:shadow-hover transition-all duration-300 border-border hover:border-primary/30 bg-gradient-to-br from-card to-muted/20"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex-1 min-w-0 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                  <CardTitle className="text-base sm:text-lg break-words flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    {rec.name}
                                  </CardTitle>
                                  <Button asChild size="sm" variant="outline" className="gap-2 h-8 w-fit shrink-0 hover:bg-primary/10 hover:border-primary transition-all">
                                    <a
                                      href={`https://www.google.com/search?q=${encodeURIComponent(rec.name)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`Search for ${rec.name} on Google`}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      <span className="text-xs">Search</span>
                                    </a>
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-secondary to-secondary/80 text-primary font-medium shadow-sm">
                                    {rec.category}
                                  </span>
                                  <span className={`text-xs px-3 py-1.5 rounded-full border font-medium shadow-sm ${getImplementationColor(rec.implementation)}`}>
                                    {rec.implementation.replace('-', ' ')}
                                  </span>
                                  <span className="text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground flex items-center gap-1 font-medium shadow-sm">
                                    <DollarSign className="h-3 w-3" />{rec.estimatedCost}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-foreground leading-relaxed">{rec.rationale}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <p className="text-sm text-yellow-800">
                        <strong>Disclaimer:</strong> These recommendations are generated by AI (Google Gemini 2.5 Flash) based on general business best practices. 
                        Each business is unique - please evaluate these suggestions based on your specific needs, compliance requirements, 
                        and circumstances. This does not constitute professional consulting advice.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Ideas Tab */}
            <TabsContent value="ideas" className="space-y-6 mt-6">
              <Card className="shadow-elegant hover:shadow-hover transition-all duration-300 border-secondary/10 bg-gradient-to-br from-card to-secondary/5">
                <CardHeader className="space-y-2 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Sparkles className="h-5 w-5 text-secondary" />
                    </div>
                    <CardTitle className="text-xl">Tell us about your context</CardTitle>
                  </div>
                  <CardDescription className="text-base">Provide details to get tailored business idea recommendations powered by AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Industry</label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="marketing">Marketing Agency</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="real-estate">Real Estate</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="hospitality">Hospitality</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Team Size</label>
                      <Select value={teamSize} onValueChange={setTeamSize}>
                        <SelectTrigger><SelectValue placeholder="Select team size" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="solo">Solo (1 person)</SelectItem>
                          <SelectItem value="small">Small (2-10 people)</SelectItem>
                          <SelectItem value="medium">Medium (11-50 people)</SelectItem>
                          <SelectItem value="large">Large (51-200 people)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (200+ people)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Available Startup Budget</label>
                      <Select value={budgetRange} onValueChange={setBudgetRange}>
                        <SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="minimal">Minimal ($0-$100/month)</SelectItem>
                          <SelectItem value="low">Low ($100-$500/month)</SelectItem>
                          <SelectItem value="medium">Medium ($500-$2,000/month)</SelectItem>
                          <SelectItem value="high">High ($2,000-$10,000/month)</SelectItem>
                          <SelectItem value="enterprise">Enterprise ($10,000+/month)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Context & Goals</label>
                    <Textarea
                      placeholder="E.g., Looking to start a side business, have expertise in digital marketing, interested in sustainable products..."
                      value={businessContext}
                      onChange={(e) => setBusinessContext(e.target.value)}
                      rows={4}
                      maxLength={50}
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing || !canAnalyze || !industry || !teamSize || !budgetRange || !businessContext.trim()}
                    className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-primary transition-all duration-300 shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    {analyzing ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing market opportunities...</>
                    ) : !canAnalyze ? (
                      <><Clock className="mr-2 h-5 w-5" />Next recommendation in {getTimeUntilNextAnalysis()}</>
                    ) : (
                      <><Sparkles className="mr-2 h-5 w-5" />Get AI Business Ideas</>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    You can request new recommendations once every 24 hours
                  </p>
                </CardContent>
              </Card>

              {/* Idea Results */}
              {ideaResult && (
                <div className="space-y-6 animate-fade-in">
                  <Card className="border-secondary/30 bg-gradient-to-br from-secondary/5 via-card to-primary/5 shadow-elegant">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 rounded-lg bg-secondary/10">
                          <TrendingUp className="h-6 w-6 text-secondary" />
                        </div>
                        <span>Market Insights</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base text-foreground leading-relaxed">{ideaResult.generalAdvice}</p>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1 flex-1 bg-gradient-to-r from-secondary via-primary to-secondary/30 rounded-full" />
                      <h2 className="text-2xl font-bold whitespace-nowrap">Recommended Business Ideas</h2>
                      <div className="h-1 flex-1 bg-gradient-to-l from-secondary via-primary to-secondary/30 rounded-full" />
                    </div>
                    <div className="grid gap-4">
                      {ideaResult.recommendations.map((rec, index) => (
                        <Card 
                          key={index}
                          className="hover:shadow-hover transition-all duration-300 border-border hover:border-secondary/30 bg-gradient-to-br from-card to-muted/20"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex-1 min-w-0 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                  <CardTitle className="text-base sm:text-lg break-words flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                                    {rec.name}
                                  </CardTitle>
                                  <Button asChild size="sm" variant="outline" className="gap-2 h-8 w-fit shrink-0 hover:bg-secondary/10 hover:border-secondary transition-all">
                                    <a
                                      href={`https://www.google.com/search?q=${encodeURIComponent(rec.name + " business idea")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`Search for ${rec.name} on Google`}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      <span className="text-xs">Search</span>
                                    </a>
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-secondary to-secondary/80 text-primary font-medium shadow-sm">
                                    {rec.category}
                                  </span>
                                  <span className={`text-xs px-3 py-1.5 rounded-full border font-medium shadow-sm ${getImplementationColor(rec.viability)}`}>
                                    {rec.viability.replace('-', ' ')}
                                  </span>
                                  <span className="text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground flex items-center gap-1 font-medium shadow-sm">
                                    <DollarSign className="h-3 w-3" />{rec.estimatedInvestment}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-foreground leading-relaxed">{rec.rationale}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                    <CardContent className="pt-6">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Disclaimer:</strong> These recommendations are generated by AI (Google Gemini 2.5 Flash) based on general market trends and business practices. 
                        Each business idea requires thorough market research, validation, and planning. This does not constitute professional business consulting advice.
                      </p>
                    </CardContent>
                  </Card>
                  
                  {user && (toolHistory.length > 0 || ideaHistory.length > 0) && (
                    <Card className="border-primary bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-center sm:text-left">
                            <h3 className="font-semibold mb-1">Organize Your Recommendations</h3>
                            <p className="text-sm text-muted-foreground">
                              View all your AI analyses in a beautiful Notion-style workspace
                            </p>
                          </div>
                          <Button asChild variant="default" className="bg-gradient-to-r from-primary to-secondary whitespace-nowrap">
                            <Link to="/notion-idea">
                              <BookOpen className="mr-2 h-4 w-4" />
                              Open Notion Idea
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessToolsAdvisor;
