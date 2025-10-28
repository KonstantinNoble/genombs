import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lightbulb, TrendingUp, Clock, DollarSign, Trash2, LogIn, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User } from "@supabase/supabase-js";

interface ToolRecommendation {
  name: string;
  category: "productivity" | "marketing" | "sales" | "finance" | "hr" | "operations" | "strategy";
  implementation: "quick-win" | "medium-term" | "strategic";
  estimatedCost: string;
  rationale: string;
}

interface AdvisorResult {
  recommendations: ToolRecommendation[];
  generalAdvice: string;
}

interface HistoryItem {
  id: string;
  industry: string;
  team_size: string;
  budget_range: string;
  business_goals: string;
  result: AdvisorResult;
  created_at: string;
}

const BusinessToolsAdvisor = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [nextAnalysisTime, setNextAnalysisTime] = useState<Date | null>(null);

  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [businessGoals, setBusinessGoals] = useState("");

  const { toast } = useToast();

  useEffect(() => {
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
      loadHistory();
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

  const checkCanAnalyze = (lastAnalysisAt: string | null): boolean => {
    if (!lastAnalysisAt) return true;
    const lastAnalysis = new Date(lastAnalysisAt);
    const now = new Date();
    const hoursSinceLastAnalysis = (now.getTime() - lastAnalysis.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastAnalysis < 24) {
      const nextTime = new Date(lastAnalysis.getTime() + 24 * 60 * 60 * 1000);
      setNextAnalysisTime(nextTime);
      return false;
    }
    
    return true;
  };

  const loadAnalysisLimit = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_credits')
      .select('last_analysis_at')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error loading analysis limit:', error);
      return;
    }

    setCanAnalyze(checkCanAnalyze(data?.last_analysis_at));
  };

  const loadHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('business_tools_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading history:', error);
      return;
    }

    setHistory((data || []) as unknown as HistoryItem[]);
  };

  const handleAnalyze = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to get business tool recommendations",
        variant: "destructive",
      });
      return;
    }

    if (!industry || !teamSize || !budgetRange || !businessGoals.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('business-tools-advisor', {
        body: {
          industry,
          teamSize,
          budgetRange,
          businessGoals: businessGoals.trim()
        }
      });

      if (error) {
        if (error.message?.includes('Daily limit reached') || error.message?.includes('429')) {
          toast({
            title: "Daily limit reached",
            description: "You can request new recommendations once every 24 hours",
            variant: "destructive",
          });
          await loadAnalysisLimit();
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

      setResult(data);
      await loadHistory();
      await loadAnalysisLimit();
      
      toast({
        title: "Recommendations generated",
        description: "Your personalized business tools and strategies are ready",
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

    setHistory(history.filter(item => item.id !== id));
    toast({
      title: "Deleted",
      description: "History item removed",
    });
  };


  const getImplementationColor = (implementation: string) => {
    const colors: Record<string, string> = {
      "quick-win": "text-green-600 bg-green-50 border-green-200",
      "medium-term": "text-yellow-600 bg-yellow-50 border-yellow-200",
      "strategic": "text-blue-600 bg-blue-50 border-blue-200"
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
        <div className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Lightbulb className="h-16 w-16 mx-auto text-primary" />
              <h1 className="text-4xl font-bold">Business AI</h1>
              <p className="text-xl text-muted-foreground">
                Get AI-powered recommendations for tools and strategies to grow your business
              </p>
            </div>

            <Card className="text-left">
              <CardHeader>
                <CardTitle>How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold">Share your business context</h3>
                    <p className="text-sm text-muted-foreground">Tell us about your industry, team size, budget, and goals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold">Get personalized recommendations</h3>
                    <p className="text-sm text-muted-foreground">Receive 5-7 specific tool and strategy suggestions tailored to your needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold">Implement and grow</h3>
                    <p className="text-sm text-muted-foreground">Follow our actionable advice to optimize your business operations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button size="lg" onClick={() => window.location.href = '/auth'}>
              <LogIn className="mr-2 h-5 w-5" />
              Sign in to get started
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex gap-6 container mx-auto px-4 py-8">
        {/* Sidebar - History */}
        <aside className="w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Previous Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer group relative"
                    onClick={() => setResult(item.result)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.industry}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
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
        <main className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Business AI</h1>
            <p className="text-muted-foreground">
              Get personalized tool and strategy recommendations for your business
            </p>
          </div>

          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your business</CardTitle>
              <CardDescription>
                Provide details to get tailored recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
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
                  maxLength={40}
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !canAnalyze || !industry || !teamSize || !budgetRange || !businessGoals.trim()}
                className="w-full"
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
                    Next recommendation in {getTimeUntilNextAnalysis()}
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Get Recommendations
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You can request new recommendations once every 24 hours
              </p>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* General Advice */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Strategic Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{result.generalAdvice}</p>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Recommended Tools & Strategies</h2>
                <div className="grid gap-4">
                  {result.recommendations.map((rec, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <CardTitle className="text-lg">{rec.name}</CardTitle>
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="gap-2 h-8"
                              >
                                <a
                                  href={`https://www.google.com/search?q=${encodeURIComponent(rec.name)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`Search for ${rec.name} on Google`}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Google Search
                                </a>
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                                {rec.category}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full border ${getImplementationColor(rec.implementation)}`}>
                                {rec.implementation.replace('-', ' ')}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {rec.estimatedCost}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
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
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessToolsAdvisor;