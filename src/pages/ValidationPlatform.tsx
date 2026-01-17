import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2, BrainCircuit } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/home/Pricing";
import { User } from "@supabase/supabase-js";
import { ValidationInput } from "@/components/validation/ValidationInput";
import { ValidationOutput } from "@/components/validation/ValidationOutput";
import { MultiModelLoader } from "@/components/validation/MultiModelLoader";
import { LimitReachedDialog } from "@/components/validation/LimitReachedDialog";
import { ExperimentSetupDialog, ExperimentSetupData } from "@/components/experiment/ExperimentSetupDialog";
import { ExperimentWorkflow } from "@/components/experiment/ExperimentWorkflow";
import { ArchivedDecisions } from "@/components/experiment/ArchivedDecisions";
import { useMultiAIValidation, ValidationResult, LimitReachedInfo } from "@/hooks/useMultiAIValidation";
import { useExperiment } from "@/hooks/useExperiment";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";

interface HistoryItem {
  id: string;
  prompt: string;
  overall_confidence: number;
  created_at: string;
  gpt_response: any;
  gemini_pro_response: any;
  gemini_flash_response: any;
  consensus_points: any;
  majority_points: any;
  dissent_points: any;
  final_recommendation: any;
  processing_time_ms: number;
}

export default function ValidationPlatform() {
  const { toast } = useToast();
  const { openCheckout } = useFreemiusCheckout();
  const { createExperiment, isLoading: isCreatingExperiment } = useExperiment();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  
  const [prompt, setPrompt] = useState("");
  const [riskPreference, setRiskPreference] = useState(3);
  const [creativityPreference, setCreativityPreference] = useState(3);
  
  const [displayedResult, setDisplayedResult] = useState<ValidationResult | null>(null);
  const [currentValidationId, setCurrentValidationId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [validationCount, setValidationCount] = useState(0);
  const [validationLimit, setValidationLimit] = useState(2);
  const [canValidate, setCanValidate] = useState(true);
  const [nextValidationTime, setNextValidationTime] = useState<Date | null>(null);
  
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [limitResetAt, setLimitResetAt] = useState<Date | null>(null);
  const [limitIsPremium, setLimitIsPremium] = useState(false);
  
  const [showExperimentDialog, setShowExperimentDialog] = useState(false);
  const [experimentKey, setExperimentKey] = useState(0);

  const resultRef = useRef<HTMLDivElement | null>(null);

  const { validate, isValidating, status, result } = useMultiAIValidation({
    onComplete: async (data) => {
      setDisplayedResult(data);
      setCurrentValidationId(data.validationId || null);
      if (user) {
        await loadHistory(user.id);
        await loadPremiumStatus(user.id);
      }
      toast({ title: "Validation Complete", description: "Your multi-AI analysis is ready" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error, variant: "destructive" });
    },
    onLimitReached: (info: LimitReachedInfo) => {
      setLimitResetAt(info.resetAt);
      setLimitIsPremium(info.isPremium);
      setShowLimitDialog(true);
    }
  });

  useEffect(() => {
    if (displayedResult && resultRef.current) {
      setTimeout(() => {
        const element = resultRef.current;
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [displayedResult]);

  useEffect(() => {
    checkAuth();
  }, []);

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

  const checkCanValidate = (count: number | null, windowStart: string | null, limit: number): boolean => {
    const now = new Date();
    if (!windowStart) { setNextValidationTime(null); return true; }
    const windowEndsAt = new Date(new Date(windowStart).getTime() + 24 * 60 * 60 * 1000);
    if (now >= windowEndsAt) { setNextValidationTime(null); return true; }
    if ((count ?? 0) < limit) { setNextValidationTime(null); return true; }
    setNextValidationTime(windowEndsAt);
    return false;
  };

  const loadPremiumStatus = async (userId: string) => {
    const { data } = await supabase.from('user_credits')
      .select('is_premium, validation_count, validation_window_start')
      .eq('user_id', userId).single();
    if (data) {
      setIsPremium(data.is_premium);
      const limit = data.is_premium ? 20 : 2;
      setValidationLimit(limit);
      
      const now = new Date();
      const windowExpired = !data.validation_window_start || 
        now >= new Date(new Date(data.validation_window_start).getTime() + 24 * 60 * 60 * 1000);
      
      const effectiveCount = windowExpired ? 0 : (data.validation_count || 0);
      setValidationCount(effectiveCount);
      setCanValidate(checkCanValidate(effectiveCount, data.validation_window_start, limit));
    }
  };

  const HISTORY_LIMIT = 10;

  const loadHistory = async (userId: string) => {
    // Prune DB to last 10 entries (delete oldest beyond limit)
    const { data: allIds, error: idsError } = await supabase
      .from("validation_analyses")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!idsError && allIds && allIds.length > HISTORY_LIMIT) {
      const idsToDelete = allIds.slice(HISTORY_LIMIT).map((r) => r.id);
      await supabase.from("validation_analyses").delete().in("id", idsToDelete);
    }

    // Load UI list
    const { data } = await supabase
      .from("validation_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT);

    if (data) setHistory(data as HistoryItem[]);
  };

  const handleValidate = async () => {
    if (!prompt.trim()) { 
      toast({ title: "Missing Information", description: "Please describe your business question", variant: "destructive" }); 
      return; 
    }
    
    setDisplayedResult(null);
    
    try {
      await validate(prompt.trim(), riskPreference, creativityPreference);
    } catch (error) {
      // Error already handled in onError callback
    }
  };

  const handleHistoryClick = (item: HistoryItem) => {
    const reconstructedResult: ValidationResult = {
      gptResponse: item.gpt_response,
      geminiProResponse: item.gemini_pro_response,
      geminiFlashResponse: item.gemini_flash_response,
      consensusPoints: item.consensus_points || [],
      majorityPoints: item.majority_points || [],
      dissentPoints: item.dissent_points || [],
      finalRecommendation: item.final_recommendation || {
        title: 'Analysis Complete',
        description: '',
        confidence: item.overall_confidence || 50,
        reasoning: '',
        topActions: []
      },
      overallConfidence: item.overall_confidence || 50,
      synthesisReasoning: '',
      processingTimeMs: item.processing_time_ms || 0
    };
    setDisplayedResult(reconstructedResult);
    setCurrentValidationId(item.id);
  };

  const handleDeleteHistory = async (id: string) => {
    await supabase.from('validation_analyses').delete().eq('id', id);
    setHistory(history.filter(item => item.id !== id));
    toast({ title: "Deleted", description: "Analysis removed from history" });
  };

  const handleStartExperiment = () => {
    setShowExperimentDialog(true);
  };

  const handleCreateExperiment = async (data: ExperimentSetupData) => {
    if (!currentValidationId) return;
    
    const experiment = await createExperiment(currentValidationId, data);
    if (experiment) {
      setShowExperimentDialog(false);
      // Trigger experiment workflow to reload
      setExperimentKey(prev => prev + 1);
      toast({
        title: "Experiment Started!",
        description: `Your ${data.durationDays}-day experiment "${data.title}" has begun.`,
      });
    }
  };

  const getTopActionsForExperiment = (): { action: string; reasoning: string; priority: string }[] => {
    if (!displayedResult?.finalRecommendation?.topActions) return [];
    return displayedResult.finalRecommendation.topActions.map((action, i) => ({
      action: typeof action === 'string' ? action : String(action),
      reasoning: '',
      priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low'
    }));
  };

  const getTimeUntilNextValidation = (): string => {
    if (!nextValidationTime) return "";
    const diff = nextValidationTime.getTime() - Date.now();
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (!user) return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Multi-AI Business Validator – Get Consensus from 3 AI Models"
        description="Validate your business decisions with 3 AI models. GPT-5.2, Gemini 3 Pro, and Gemini Flash analyze your strategy to find consensus and highlight risks."
        keywords="AI business validation, multi-model AI, business strategy, AI consensus, decision validation"
        canonical="/validate"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <article className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground drop-shadow-[0_0_30px_rgba(79,209,131,0.3)]">Multi-AI Validator</h1>
          <p className="text-xl text-muted-foreground">Get <span className="text-primary font-semibold">validated recommendations</span> from 3 AI models</p>
          <Pricing compact={true} />
        </article>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Multi-AI Business Validator – Get Consensus from 3 AI Models"
        description="Validate your business decisions with 3 AI models. GPT-5.2, Gemini 3 Pro, and Gemini Flash analyze your strategy to find consensus and highlight risks."
        keywords="AI business validation, multi-model AI, business strategy, AI consensus, decision validation"
        canonical="/validate"
      />
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-80 shrink-0 order-2 lg:order-1 space-y-4">
            <Card className="shadow-elegant border-primary/10">
              <CardHeader className="pb-3"><CardTitle className="text-lg">Previous Analyses</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {history.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No history yet</p> : history.map(item => (
                  <div key={item.id} className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer group" onClick={() => handleHistoryClick(item)}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.prompt?.substring(0, 50)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{item.overall_confidence}% confidence</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeleteHistory(item.id); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Archived Decisions */}
            <ArchivedDecisions userId={user.id} />
          </aside>

          <main className="flex-1 space-y-6 order-1 lg:order-2">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <BrainCircuit className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">3-Model AI Validation</span>
                {isPremium && <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">Premium</Badge>}
              </div>
              <h1 className="text-3xl lg:text-5xl font-extrabold">Multi-AI Validator</h1>
              <p className="text-muted-foreground">Get consensus from GPT-5.2, Gemini 3 Pro & Gemini Flash</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-muted-foreground">Validations: <span className="font-bold">{validationCount}/{validationLimit}</span> daily</span>
              </div>
            </div>

            <Card className="border-primary/20 shadow-elegant">
              <CardHeader>
                <CardTitle>Ask Your Business Question</CardTitle>
                <CardDescription>Adjust risk & creativity preferences to tune the AI analysis style.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ValidationInput
                  prompt={prompt}
                  onPromptChange={setPrompt}
                  riskPreference={riskPreference}
                  onRiskChange={setRiskPreference}
                  creativityPreference={creativityPreference}
                  onCreativityChange={setCreativityPreference}
                  disabled={isValidating}
                />
                
                {!isPremium && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                    <span className="text-sm text-muted-foreground">Unlock more validations daily</span>
                    <button 
                      onClick={() => openCheckout(user?.email || undefined)}
                      className="text-sm font-semibold text-amber-600 hover:text-amber-500 underline underline-offset-2 transition-colors"
                    >
                      Upgrade to Premium →
                    </button>
                  </div>
                )}
                
                <Button onClick={handleValidate} disabled={isValidating || !canValidate || !prompt.trim()} className="w-full" size="lg">
                  {isValidating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validating with 3 AI Models...</> : !canValidate ? `Next in ${getTimeUntilNextValidation()}` : 'Validate with 3 AI Models'}
                </Button>
              </CardContent>
            </Card>

            {isValidating && (
              <MultiModelLoader status={status} />
            )}

            {displayedResult && !isValidating && (
              <div ref={resultRef} className="animate-fade-in space-y-6">
                <Card className="border-primary/20 shadow-elegant">
                  <CardHeader>
                    <CardTitle>Validation Results</CardTitle>
                    <CardDescription>Cross-validated analysis from 3 AI models</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ValidationOutput 
                      result={displayedResult} 
                      validationId={currentValidationId || undefined}
                      onStartExperiment={handleStartExperiment}
                    />
                  </CardContent>
                </Card>

                {/* Experiment Workflow - appears below validation results */}
                {currentValidationId && (
                  <ExperimentWorkflow 
                    key={experimentKey} 
                    validationId={currentValidationId} 
                  />
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
      
      <LimitReachedDialog
        open={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
        isPremium={limitIsPremium}
        resetAt={limitResetAt}
        onUpgrade={() => openCheckout(user?.email || undefined)}
      />
      
      <ExperimentSetupDialog
        open={showExperimentDialog}
        onOpenChange={setShowExperimentDialog}
        onSubmit={handleCreateExperiment}
        hypothesis={displayedResult?.finalRecommendation?.description || ''}
        topActions={getTopActionsForExperiment()}
        isPremium={isPremium}
        isLoading={isCreatingExperiment}
      />
    </div>
  );
}