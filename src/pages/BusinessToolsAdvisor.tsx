import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/home/Pricing";
import { User } from "@supabase/supabase-js";
import { StrategyInput, OptionalParams } from "@/components/planner/StrategyInput";
import { StrategyOutput, PlannerResult } from "@/components/planner/StrategyOutput";
import { pdf } from "@react-pdf/renderer";
import { StrategyPDF } from "@/components/planner/StrategyPDF";

interface HistoryItem {
  id: string;
  business_goals: string;
  result: PlannerResult;
  analysis_mode: string;
  created_at: string;
}

export default function BusinessToolsAdvisor() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  
  const [prompt, setPrompt] = useState("");
  const [optionalParams, setOptionalParams] = useState<OptionalParams>({});
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
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
    if (user) loadPremiumStatus(user.id);
  }, [analysisMode, user]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadPremiumStatus(session.user.id);
        await loadHistory(session.user.id);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanAnalyze = (count: number | null, windowStart: string | null, limit: number): boolean => {
    const now = new Date();
    if (!windowStart) { setNextAnalysisTime(null); return true; }
    const windowEndsAt = new Date(new Date(windowStart).getTime() + 24 * 60 * 60 * 1000);
    if (now >= windowEndsAt) { setNextAnalysisTime(null); return true; }
    if ((count ?? 0) < limit) { setNextAnalysisTime(null); return true; }
    setNextAnalysisTime(windowEndsAt);
    return false;
  };

  const loadPremiumStatus = async (userId: string) => {
    const { data } = await supabase.from('user_credits')
      .select('is_premium, deep_analysis_count, deep_analysis_window_start, standard_analysis_count, standard_analysis_window_start')
      .eq('user_id', userId).single();
    if (data) {
      setIsPremium(data.is_premium);
      const deepLimit = data.is_premium ? 2 : 0;
      const standardLimit = data.is_premium ? 6 : 2;
      setDeepAnalysisLimit(deepLimit);
      setStandardAnalysisLimit(standardLimit);
      setDeepAnalysisCount(data.deep_analysis_count || 0);
      setStandardAnalysisCount(data.standard_analysis_count || 0);
      if (analysisMode === 'deep') setCanAnalyze(checkCanAnalyze(data.deep_analysis_count, data.deep_analysis_window_start, deepLimit));
      else setCanAnalyze(checkCanAnalyze(data.standard_analysis_count, data.standard_analysis_window_start, standardLimit));
    }
  };

  const loadHistory = async (userId: string) => {
    const { data } = await supabase.from('business_tools_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    if (data) setHistory(data.map(item => ({ ...item, result: item.result as unknown as PlannerResult })));
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) { toast({ title: "Missing Information", description: "Please describe your business goals", variant: "destructive" }); return; }
    setAnalyzing(true); setResult(null);
    try {
      const body: any = { prompt: prompt.trim(), analysisMode };
      if (optionalParams.budget) body.budget = optionalParams.budget;
      if (optionalParams.industry) body.industry = optionalParams.industry;
      if (optionalParams.channels) body.channels = optionalParams.channels;
      if (optionalParams.timeline) body.timeline = optionalParams.timeline;
      if (optionalParams.geographic) body.geographic = optionalParams.geographic;

      const { data, error } = await supabase.functions.invoke('business-tools-advisor', { body });
      if (error) { toast({ title: "Analysis Error", description: error.message, variant: "destructive" }); return; }
      if (data?.error) { toast({ title: "Error", description: data.error, variant: "destructive" }); return; }
      setResult(data);
      await loadHistory(user!.id);
      await loadPremiumStatus(user!.id);
      toast({ title: "Strategy Created", description: `Your ${analysisMode === 'deep' ? 'comprehensive' : 'quick'} business strategy is ready` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate strategy", variant: "destructive" });
    } finally { setAnalyzing(false); }
  };

  const handleDeleteHistory = async (id: string) => {
    await supabase.from('business_tools_history').delete().eq('id', id);
    setHistory(history.filter(item => item.id !== id));
  };

  const getTimeUntilNextAnalysis = (): string => {
    if (!nextAnalysisTime) return "";
    const diff = nextAnalysisTime.getTime() - Date.now();
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (!user) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet><title>AI Business Planner - Strategic Business Planning</title></Helmet>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <article className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground drop-shadow-[0_0_30px_rgba(79,209,131,0.3)]">AI Business Planner</h1>
          <p className="text-xl text-muted-foreground">Create <span className="text-primary font-semibold">phased business strategies</span> tailored to your goals</p>
          <Pricing compact={true} />
        </article>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet><title>AI Business Planner - Strategic Business Planning</title></Helmet>
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-80 shrink-0 order-2 lg:order-1">
            <Card className="shadow-elegant border-primary/10">
              <CardHeader className="pb-3"><CardTitle className="text-lg">Previous Strategies</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {history.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No history yet</p> : history.map(item => (
                  <div key={item.id} className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer group" onClick={() => setResult(item.result)}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.business_goals?.substring(0, 50)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{item.analysis_mode}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeleteHistory(item.id); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <main className="flex-1 space-y-6 order-1 lg:order-2">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-sm font-semibold">AI-Powered Business Strategy</span>
                {isPremium && <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">Premium</Badge>}
              </div>
              <h1 className="text-3xl lg:text-5xl font-extrabold">AI Business Planner</h1>
              <p className="text-muted-foreground">Describe your business goals and get a phased strategy</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                {isPremium ? <>
                  <span className="text-muted-foreground">Deep: <span className="font-bold">{deepAnalysisCount}/{deepAnalysisLimit}</span></span>
                  <span className="text-muted-foreground">Standard: <span className="font-bold">{standardAnalysisCount}/{standardAnalysisLimit}</span></span>
                </> : <span className="text-muted-foreground">Standard: <span className="font-bold">{standardAnalysisCount}/{standardAnalysisLimit}</span></span>}
              </div>
            </div>

            <Card className="border-primary/20 shadow-elegant">
              <CardHeader><CardTitle>Describe Your Business Goals</CardTitle><CardDescription>Use the + button to add optional context like budget or industry.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <StrategyInput value={prompt} onChange={setPrompt} optionalParams={optionalParams} onOptionalParamsChange={setOptionalParams} placeholder="E.g., I want to grow my SaaS business from 1000 to 10000 users. Focus on SEO, content marketing, and improving conversion rates..." disabled={analyzing} />
                <Tabs value={analysisMode} onValueChange={(v) => setAnalysisMode(v as "standard" | "deep")}>
                  <TabsList className="grid grid-cols-2 h-auto bg-transparent border-0 gap-0 w-full">
                    <TabsTrigger value="standard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border rounded-l-lg rounded-r-none min-h-[70px] sm:min-h-[60px]">
                      <div className="py-2 px-1 text-center">
                        <div className="font-semibold text-sm sm:text-base">Standard</div>
                        <div className="text-[10px] sm:text-xs opacity-80">4 phases</div>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="deep" disabled={!isPremium} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-l-0 rounded-r-lg rounded-l-none min-h-[70px] sm:min-h-[60px]">
                      <div className="py-2 px-1 text-center">
                        <div className="font-semibold text-sm sm:text-base whitespace-nowrap">Deep {!isPremium && <span className="text-[10px] sm:text-xs">(Premium)</span>}</div>
                        <div className="text-[10px] sm:text-xs opacity-80 whitespace-normal leading-tight">6 phases + Insights</div>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                {!isPremium && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                    <span className="text-sm text-muted-foreground">Unlock Deep Analysis & more analyses</span>
                    <a 
                      href={`https://checkout.freemius.com/product/21730/plan/36437/?user_email=${user?.email}&readonly_user=true`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-amber-600 hover:text-amber-500 underline underline-offset-2 transition-colors"
                    >
                      Upgrade to Premium →
                    </a>
                  </div>
                )}
                <Button onClick={handleAnalyze} disabled={analyzing || !canAnalyze || !prompt.trim()} className="w-full" size="lg">
                  {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Strategy...</> : !canAnalyze ? `Next in ${getTimeUntilNextAnalysis()}` : 'Create Business Strategy'}
                </Button>
              </CardContent>
            </Card>

            {result && (
              <div ref={resultRef} className="animate-fade-in">
                <Card className="border-primary/20 shadow-elegant">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Your Business Strategy</CardTitle>
                      <CardDescription>{result.strategies?.length || 0} phases planned</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={async () => {
                        try {
                          const blob = await pdf(
                            <StrategyPDF 
                              result={result} 
                              isDeepMode={analysisMode === 'deep'} 
                              businessGoals={prompt}
                            />
                          ).toBlob();
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `business-strategy-${new Date().toISOString().split('T')[0]}.pdf`;
                          link.click();
                          URL.revokeObjectURL(url);
                          toast({ title: "PDF Downloaded", description: "Your strategy has been exported" });
                        } catch (error) {
                          toast({ title: "Export Failed", description: "Could not generate PDF", variant: "destructive" });
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export PDF</span>
                    </Button>
                  </CardHeader>
                  <CardContent><StrategyOutput result={result} isDeepMode={analysisMode === 'deep'} /></CardContent>
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
