import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopifyAffiliateBanner from "@/components/ShopifyAffiliateBanner";
import AnalysisSelector from "@/components/notion-idea/AnalysisSelector";
import RecommendationDisplay from "@/components/notion-idea/RecommendationDisplay";
import { useToast } from "@/hooks/use-toast";

export interface ToolRecommendation {
  name: string;
  category: "productivity" | "marketing" | "sales" | "finance" | "hr" | "operations" | "strategy";
  implementation: "quick-win" | "medium-term" | "strategic";
  estimatedCost: string;
  rationale: string;
}

export interface IdeaRecommendation {
  name: string;
  category: "product" | "service" | "saas" | "marketplace" | "content" | "consulting" | "ecommerce";
  viability: "quick-launch" | "medium-term" | "long-term";
  estimatedInvestment: string;
  rationale: string;
}

export interface ToolHistoryItem {
  id: string;
  industry: string;
  team_size: string;
  budget_range: string;
  business_goals: string;
  result: {
    recommendations: ToolRecommendation[];
    generalAdvice: string;
  };
  created_at: string;
}

export interface IdeaHistoryItem {
  id: string;
  industry: string;
  team_size: string;
  budget_range: string;
  business_context: string;
  result: {
    recommendations: IdeaRecommendation[];
    generalAdvice: string;
  };
  created_at: string;
}

export interface CombinedRecommendation {
  id: string;
  type: 'tool' | 'idea';
  name: string;
  category: string;
  implementation?: string;
  viability?: string;
  estimatedCost?: string;
  estimatedInvestment?: string;
  rationale: string;
  sourceDate: string;
  sourceIndustry: string;
  sourceBudget: string;
  sourceTeamSize: string;
  generalAdvice?: string;
}

const NotionIdea = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toolsHistory, setToolsHistory] = useState<ToolHistoryItem[]>([]);
  const [ideasHistory, setIdeasHistory] = useState<IdeaHistoryItem[]>([]);
  const [importedRecommendations, setImportedRecommendations] = useState<CombinedRecommendation[]>(() => {
    const saved = localStorage.getItem('notion-idea-recommendations');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewMode, setViewMode] = useState<'landing' | 'select' | 'display'>(() => {
    const saved = localStorage.getItem('notion-idea-viewmode');
    return (saved as 'landing' | 'select' | 'display') || 'landing';
  });
  
  const navigate = useNavigate();
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
      fetchAnalysesHistory();
    }
  }, [user]);

  // When the user logs out, clear sensitive state and localStorage
  useEffect(() => {
    // Only clear if not loading and user is truly logged out
    if (!loading && !user) {
      setToolsHistory([]);
      setIdeasHistory([]);
      setImportedRecommendations([]);
      setViewMode('landing');
      try {
        localStorage.removeItem('notion-idea-recommendations');
        localStorage.removeItem('notion-idea-viewmode');
      } catch (e) {
        // ignore
      }
    }
  }, [user, loading]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('notion-idea-recommendations', JSON.stringify(importedRecommendations));
    localStorage.setItem('notion-idea-viewmode', viewMode);
  }, [importedRecommendations, viewMode]);
  const fetchAnalysesHistory = async () => {
    if (!user) return;

    try {
      const [toolsResponse, ideasResponse] = await Promise.all([
        supabase
          .from('business_tools_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('business_ideas_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (toolsResponse.error) throw toolsResponse.error;
      if (ideasResponse.error) throw ideasResponse.error;

      setToolsHistory((toolsResponse.data || []) as unknown as ToolHistoryItem[]);
      setIdeasHistory((ideasResponse.data || []) as unknown as IdeaHistoryItem[]);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your analyses. Please try again."
      });
    }
  };

  const handleImport = (selectedToolIds: string[], selectedIdeaIds: string[]) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (selectedToolIds.length === 0 && selectedIdeaIds.length === 0) {
      toast({
        variant: "destructive",
        title: "No Selection",
        description: "Please select at least one analysis to import."
      });
      return;
    }

    const recommendations: CombinedRecommendation[] = [];

    // Process selected tools
    selectedToolIds.forEach(toolId => {
      const tool = toolsHistory.find(t => t.id === toolId);
      if (!tool) return;

      tool.result.recommendations.forEach((rec, index) => {
        recommendations.push({
          id: `tool-${toolId}-${index}`,
          type: 'tool',
          name: rec.name,
          category: rec.category,
          implementation: rec.implementation,
          estimatedCost: rec.estimatedCost,
          rationale: rec.rationale,
          sourceDate: tool.created_at,
          sourceIndustry: tool.industry,
          sourceBudget: tool.budget_range,
          sourceTeamSize: tool.team_size,
          generalAdvice: tool.result.generalAdvice
        });
      });
    });

    // Process selected ideas
    selectedIdeaIds.forEach(ideaId => {
      const idea = ideasHistory.find(i => i.id === ideaId);
      if (!idea) return;

      idea.result.recommendations.forEach((rec, index) => {
        recommendations.push({
          id: `idea-${ideaId}-${index}`,
          type: 'idea',
          name: rec.name,
          category: rec.category,
          viability: rec.viability,
          estimatedInvestment: rec.estimatedInvestment,
          rationale: rec.rationale,
          sourceDate: idea.created_at,
          sourceIndustry: idea.industry,
          sourceBudget: idea.budget_range,
          sourceTeamSize: idea.team_size,
          generalAdvice: idea.result.generalAdvice
        });
      });
    });

    setImportedRecommendations(recommendations);
    setViewMode('display');
    
    toast({
      title: "Import Successful",
      description: `Imported ${recommendations.length} recommendations from ${selectedToolIds.length + selectedIdeaIds.length} analyses.`
    });
  };

  const handleBackToSelection = () => {
    setViewMode('landing');
  };

  const handleClearAll = () => {
    setImportedRecommendations([]);
    setViewMode('landing');
    localStorage.removeItem('notion-idea-recommendations');
    localStorage.removeItem('notion-idea-viewmode');
    toast({
      title: "Cleared",
      description: "All imported recommendations have been cleared."
    });
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (toolsHistory.length === 0 && ideasHistory.length === 0) {
      navigate('/business-tools');
      return;
    }
    
    setViewMode('select');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const effectiveViewMode = user ? viewMode : 'landing';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <ShopifyAffiliateBanner />
        </div>
        
        {effectiveViewMode === 'landing' && (
          <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-10 animate-fade-in py-6 sm:py-16">
            <div className="space-y-4 sm:space-y-6 px-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight px-2">
                Notion Idea Board
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
                Collect and organize your <span className="text-primary font-semibold">AI-generated</span> business recommendations in a clear, visual workspace
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 my-6 sm:my-10 px-4">
              <div className="p-5 sm:p-8 rounded-2xl border-2 border-border bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-500">
                <h3 className="font-bold mb-2 sm:mb-3 text-base sm:text-lg text-foreground">Import Analyses</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Import recommendations from your Business Tools & Ideas analyses
                </p>
              </div>
              
              <div className="p-5 sm:p-8 rounded-2xl border-2 border-border bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-500">
                <h3 className="font-bold mb-2 sm:mb-3 text-base sm:text-lg text-foreground">Organize</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Filter, sort, and group recommendations by categories
                </p>
              </div>
              
              <div className="p-5 sm:p-8 rounded-2xl border-2 border-border bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-500">
                <h3 className="font-bold mb-2 sm:mb-3 text-base sm:text-lg text-foreground">Execute</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Build your business roadmap with clear, actionable insights
                </p>
              </div>
            </div>

            {user ? (
              <div className="space-y-4 sm:space-y-6 px-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-primary hover:bg-primary/90 hover:shadow-lg transition-all text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 font-bold w-full sm:w-auto"
                >
                  Get Started
                </Button>
                {(toolsHistory.length === 0 && ideasHistory.length === 0) && (
                  <div className="mt-8 p-6 sm:p-8 rounded-2xl border-2 border-border bg-card shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                      <p className="text-base sm:text-lg text-foreground font-semibold text-center sm:text-left">
                        Ready to start your business journey?
                      </p>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center sm:text-left">
                      You haven't created any analyses yet. Use the Business AI Advisor to get personalized recommendations!
                    </p>
                    <Button 
                      onClick={() => navigate('/business-tools')}
                      variant="outline"
                      className="gap-2 w-full sm:w-auto border-2 border-primary/30 hover:bg-primary/10 font-semibold"
                    >
                      Go to Business AI →
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8 px-4">
                <div className="py-4 sm:py-6">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')}
                    className="bg-primary hover:bg-primary/90 hover:shadow-lg transition-all text-base sm:text-xl px-8 sm:px-12 py-6 sm:py-8 font-bold w-full sm:w-auto shadow-lg"
                  >
                    Sign In to Get Started
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3 text-center sm:text-left">Start organizing your ideas now - it's free</p>
                </div>

                <div className="p-6 sm:p-8 rounded-2xl border-2 border-border bg-card shadow-lg max-w-2xl mx-auto">
                  <h3 className="font-bold mb-6 text-xl sm:text-2xl text-center text-foreground">How it works:</h3>
                  <ol className="text-left space-y-4 text-sm sm:text-base">
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all duration-300">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold shadow-md">1</div>
                      <span className="text-foreground leading-relaxed">Create Business Tool or Idea analyses using our AI Advisor</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all duration-300">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold shadow-md">2</div>
                      <span className="text-foreground leading-relaxed">Import the recommendations into your Notion Idea Board</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all duration-300">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold shadow-md">3</div>
                      <span className="text-foreground leading-relaxed">Organize and prioritize your business strategy</span>
                    </li>
                  </ol>
                </div>
                
                <div className="max-w-md mx-auto">
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/business-tools')}
                    className="gap-2 text-lg px-10 py-7 font-semibold w-full border-2 border-primary/30 hover:bg-primary/10"
                  >
                    Go to Business AI Advisor →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        
        {effectiveViewMode === 'select' && (
          <AnalysisSelector
            toolsHistory={toolsHistory}
            ideasHistory={ideasHistory}
            onImport={handleImport}
          />
        )}
        
      {effectiveViewMode === 'display' && (
        <>
          {/* Phase 1: Haftungsausschluss-Banner */}
          <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-foreground">
                  <strong>Important:</strong> These AI-generated recommendations are for educational and informational purposes only. 
                  They do not constitute professional business, legal, or financial advice. Please consult qualified professionals 
                  before implementing any suggestions.
                </p>
              </div>
            </div>
          </div>

          <RecommendationDisplay
            recommendations={importedRecommendations}
            onBackToSelection={handleBackToSelection}
            onClearAll={handleClearAll}
          />
        </>
      )}
      </main>
      <Footer />
    </div>
  );
};

export default NotionIdea;
