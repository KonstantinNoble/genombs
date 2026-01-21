import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/home/Pricing";
import { User } from "@supabase/supabase-js";
import { ValidationInput, ValidationInputRef } from "@/components/validation/ValidationInput";
import { ValidationOutput } from "@/components/validation/ValidationOutput";
import { MultiModelLoader } from "@/components/validation/MultiModelLoader";
import { LimitReachedDialog } from "@/components/validation/LimitReachedDialog";
import { ExperimentSetupDialog, ExperimentSetupData } from "@/components/experiment/ExperimentSetupDialog";
import { ExperimentWorkflow } from "@/components/experiment/ExperimentWorkflow";

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
  // New dynamic columns
  model_responses?: Record<string, any>;
  selected_models?: string[];
  model_weights?: Record<string, number>;
  // Premium fields
  is_premium?: boolean;
  strategic_alternatives?: any[];
  long_term_outlook?: any;
  competitor_insights?: string;
  citations?: string[];
}

export default function ValidationPlatform() {
  const { toast } = useToast();
  const { openCheckout } = useFreemiusCheckout();
  const { createExperiment, getActiveExperiment, isLoading: isCreatingExperiment } = useExperiment();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  
  const [prompt, setPrompt] = useState("");
  const [riskPreference, setRiskPreference] = useState(3);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelWeights, setModelWeights] = useState<Record<string, number>>({});
  
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
  const [shouldScrollToExperiment, setShouldScrollToExperiment] = useState(false);

  const resultRef = useRef<HTMLDivElement | null>(null);
  const experimentRef = useRef<HTMLDivElement | null>(null);
  const modelSelectorRef = useRef<ValidationInputRef>(null);

  const { validate, isValidating, status, modelStates, result } = useMultiAIValidation({
    onComplete: async (data) => {
      setDisplayedResult(data);
      setCurrentValidationId(data.validationId || null);
      if (user) {
        await loadHistory(user.id);
        const updatedCredits = await loadPremiumStatus(user.id);
        
        // After successful validation, check if limit is NOW reached (show popup automatically)
        if (updatedCredits && !updatedCredits.is_premium) {
          const limit = 2;
          const now = new Date();
          const windowExpired = !updatedCredits.validation_window_start || 
            now.getTime() >= new Date(updatedCredits.validation_window_start).getTime() + 24 * 60 * 60 * 1000;
          const effectiveCount = windowExpired ? 0 : (updatedCredits.validation_count || 0);
          
          if (effectiveCount >= limit) {
            // Calculate reset time
            const windowEndsAt = new Date(new Date(updatedCredits.validation_window_start!).getTime() + 24 * 60 * 60 * 1000);
            setLimitResetAt(windowEndsAt);
            setLimitIsPremium(false);
            setShowLimitDialog(true);
          }
        }
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

  const loadPremiumStatus = async (userId: string): Promise<{
    is_premium: boolean;
    validation_count: number | null;
    validation_window_start: string | null;
  } | null> => {
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
      
      return data;
    }
    return null;
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
      await validate(prompt.trim(), riskPreference, selectedModels, modelWeights);
    } catch (error) {
      // Error already handled in onError callback
    }
  };

  const handleHistoryClick = (item: HistoryItem) => {
    // Check for new dynamic storage format first
    if (item.model_responses && item.selected_models && item.selected_models.length > 0) {
      // New format: use dynamic columns
      const reconstructedResult: ValidationResult = {
        modelResponses: item.model_responses as Record<string, any>,
        selectedModels: item.selected_models,
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
        processingTimeMs: item.processing_time_ms || 0,
        // Use stored premium status or current user's status as fallback
        isPremium: item.is_premium ?? isPremium,
        // Reconstruct premium fields from DB
        strategicAlternatives: item.strategic_alternatives,
        longTermOutlook: item.long_term_outlook,
        competitorInsights: item.competitor_insights,
        citations: item.citations
      };
      setDisplayedResult(reconstructedResult);
      setCurrentValidationId(item.id);
      return;
    }
    
    // Fallback: Reconstruct model responses from legacy storage
    const modelResponses: Record<string, any> = {};
    const legacyModels: string[] = [];
    if (item.gpt_response) { modelResponses.gptMini = item.gpt_response; legacyModels.push('gptMini'); }
    if (item.gemini_pro_response) { modelResponses.geminiPro = item.gemini_pro_response; legacyModels.push('geminiPro'); }
    if (item.gemini_flash_response) { modelResponses.geminiFlash = item.gemini_flash_response; legacyModels.push('geminiFlash'); }
    
    const reconstructedResult: ValidationResult = {
      modelResponses,
      selectedModels: legacyModels,
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
      processingTimeMs: item.processing_time_ms || 0,
      // Use current user's premium status for legacy items
      isPremium: isPremium
    };
    setDisplayedResult(reconstructedResult);
    setCurrentValidationId(item.id);
  };

  const handleDeleteHistory = async (id: string) => {
    // Database CASCADE automatically deletes: experiments, experiment_tasks, experiment_checkpoints
    await supabase.from('validation_analyses').delete().eq('id', id);
    
    // Update history list
    setHistory(history.filter(item => item.id !== id));
    
    // If the currently displayed analysis was deleted: reset UI
    if (currentValidationId === id) {
      setDisplayedResult(null);
      setCurrentValidationId(null);
      setExperimentKey(prev => prev + 1); // Reload ExperimentWorkflow (shows nothing)
    }
    
    toast({ 
      title: "Deleted", 
      description: "Analysis and associated experiments permanently removed" 
    });
  };

  const handleStartExperiment = async () => {
    if (!currentValidationId) return;
    
    // Check if an experiment already exists for this validation
    const existingExperiment = await getActiveExperiment(currentValidationId);
    if (existingExperiment) {
      toast({
        title: "Experiment already exists",
        description: "Delete the existing experiment below before creating a new one.",
        variant: "destructive",
      });
      // Scroll to the experiment so user can see it
      if (experimentRef.current) {
        const top = experimentRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }
    
    setShowExperimentDialog(true);
  };

  const handleCreateExperiment = async (data: ExperimentSetupData) => {
    if (!currentValidationId) return;
    
    const experiment = await createExperiment(currentValidationId, data);
    if (experiment) {
      setShowExperimentDialog(false);
      // Trigger experiment workflow to reload
      setExperimentKey(prev => prev + 1);
      // Trigger scroll to experiment after it loads
      setShouldScrollToExperiment(true);
      toast({
        title: "Experiment Started!",
        description: `Your ${data.durationDays}-day experiment "${data.title}" has begun.`,
      });
    }
  };

  // Scroll to experiment when it becomes visible
  useEffect(() => {
    if (shouldScrollToExperiment && experimentRef.current) {
      const timer = setTimeout(() => {
        const element = experimentRef.current;
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        setShouldScrollToExperiment(false);
      }, 300); // Wait for ExperimentWorkflow to load
      return () => clearTimeout(timer);
    }
  }, [shouldScrollToExperiment, experimentKey]);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-lg text-muted-foreground">Loading...</span></div>;

  if (!user) return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Multi-AI Business Validator – Get Consensus from 3 AI Models"
        description="Validate your business decisions with 3 AI models. GPT-5 Mini, Gemini 3 Pro, and Gemini Flash analyze your strategy to find consensus and highlight risks."
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
        description="Validate your business decisions with 3 AI models. GPT-5 Mini, Gemini 3 Pro, and Gemini Flash analyze your strategy to find consensus and highlight risks."
        keywords="AI business validation, multi-model AI, business strategy, AI consensus, decision validation"
        canonical="/validate"
      />
      <Navbar />
      <div className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* History Sidebar - Collapsible on mobile */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 order-2 lg:order-1 space-y-3">
            <Card className="shadow-elegant border-primary/10">
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-lg sm:text-xl">Previous Analyses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto px-3 sm:px-6 pb-3 sm:pb-6">
                {history.length === 0 ? (
                  <p className="text-sm sm:text-base text-muted-foreground text-center py-4 sm:py-8">No history yet</p>
                ) : history.map(item => (
                  <div 
                    key={item.id} 
                    className="p-3 sm:p-4 border rounded-lg sm:rounded-xl hover:bg-accent/50 cursor-pointer group transition-colors" 
                    onClick={() => handleHistoryClick(item)}
                  >
                    <div className="flex justify-between items-start gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{item.prompt?.substring(0, 40)}...</p>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs sm:text-sm">{item.overall_confidence}%</Badge>
                          <span className="text-xs sm:text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-100 lg:opacity-0 group-hover:opacity-100 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteHistory(item.id); }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <main className="flex-1 space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Header Section - Optimized for mobile */}
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-sm sm:text-base font-semibold">3-Model AI Validation</span>
                {isPremium && <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs sm:text-sm">Premium</Badge>}
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">Multi-AI Validator</h1>
              <p className="text-sm sm:text-lg text-muted-foreground px-2">Get consensus from 3 AI models of your choice</p>
              <div className="flex items-center justify-center">
                <span className="text-sm sm:text-base text-muted-foreground">Validations: <span className="font-bold text-foreground">{validationCount}/{validationLimit}</span> daily</span>
              </div>
            </div>

            <Card className="border-primary/20 shadow-elegant">
              <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Ask Your Business Question</CardTitle>
                <CardDescription className="text-sm">Adjust risk & creativity preferences to tune the AI analysis style.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-4 sm:pb-6">
                <ValidationInput
                  ref={modelSelectorRef}
                  prompt={prompt}
                  onPromptChange={setPrompt}
                  riskPreference={riskPreference}
                  onRiskChange={setRiskPreference}
                  selectedModels={selectedModels}
                  onModelsChange={setSelectedModels}
                  modelWeights={modelWeights}
                  onWeightsChange={setModelWeights}
                  disabled={isValidating}
                  isPremium={isPremium}
                />
                
                {!isPremium && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                    <span className="text-xs sm:text-sm text-muted-foreground text-center">Unlock more validations daily</span>
                    <button 
                      onClick={() => openCheckout(user?.email || undefined)}
                      className="text-xs sm:text-sm font-semibold text-amber-600 hover:text-amber-500 underline underline-offset-2 transition-colors"
                    >
                      Upgrade to Premium →
                    </button>
                  </div>
                )}
                
                <Button 
                  onClick={() => {
                    if (selectedModels.length !== 3) {
                      modelSelectorRef.current?.openAndScroll();
                    } else {
                      handleValidate();
                    }
                  }} 
                  disabled={isValidating || !canValidate || !prompt.trim()} 
                  className="w-full h-11 sm:h-12 text-sm sm:text-base" 
                  size="lg"
                >
                  {isValidating ? 'Validating...' : !canValidate ? `Next in ${getTimeUntilNextValidation()}` : selectedModels.length !== 3 ? `Select ${3 - selectedModels.length} more model${selectedModels.length === 2 ? '' : 's'}` : 'Validate with 3 AI Models'}
                </Button>
              </CardContent>
            </Card>

            {isValidating && (
              <MultiModelLoader status={status} modelStates={modelStates} selectedModels={selectedModels} modelWeights={modelWeights} />
            )}

            {displayedResult && !isValidating && (
              <div ref={resultRef} className="animate-fade-in space-y-4 sm:space-y-6">
                <Card className="border-primary/20 shadow-elegant">
                  <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl">Validation Results</CardTitle>
                    <CardDescription className="text-sm">Cross-validated analysis from 3 AI models</CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                    <ValidationOutput 
                      result={displayedResult} 
                      validationId={currentValidationId || undefined}
                      onStartExperiment={handleStartExperiment}
                    />
                  </CardContent>
                </Card>

                {/* Experiment Workflow - appears below validation results */}
                {currentValidationId && (
                  <div ref={experimentRef}>
                    <ExperimentWorkflow 
                      key={experimentKey} 
                      validationId={currentValidationId} 
                    />
                  </div>
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