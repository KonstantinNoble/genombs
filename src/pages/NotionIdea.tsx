import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, BookOpen, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {viewMode === 'landing' && (
          <div className="max-w-5xl mx-auto text-center space-y-12 animate-fade-in py-8 sm:py-16">
            <div className="space-y-6 px-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl" />
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/20 blur-2xl animate-pulse" />
                <Sparkles className="relative h-16 w-16 mx-auto text-primary animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
                Notion Idea Board
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-foreground max-w-3xl mx-auto leading-relaxed">
                Collect and organize your <span className="text-primary font-semibold">AI-generated</span> business recommendations in a clear, visual workspace
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 my-12 px-4">
              <div className="p-6 sm:p-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-elegant hover:scale-105 hover:border-primary/40 transition-all duration-500 group">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold mb-3 text-base sm:text-lg text-foreground">Import Analyses</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Import recommendations from your Business Tools & Ideas analyses
                </p>
              </div>
              
              <div className="p-6 sm:p-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-elegant hover:scale-105 hover:border-primary/40 transition-all duration-500 group">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold mb-3 text-base sm:text-lg text-foreground">Organize</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Filter, sort, and group recommendations by categories
                </p>
              </div>
              
              <div className="p-6 sm:p-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-elegant hover:scale-105 hover:border-primary/40 transition-all duration-500 group sm:col-span-2 lg:col-span-1">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold mb-3 text-base sm:text-lg text-foreground">Execute</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Build your business roadmap with clear, actionable insights
                </p>
              </div>
            </div>

            {user ? (
              <div className="space-y-6 px-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-elegant hover:scale-105 transition-all text-lg px-10 py-7 font-bold w-full sm:w-auto"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                {(toolsHistory.length === 0 && ideasHistory.length === 0) && (
                  <div className="mt-8 p-6 sm:p-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
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
                      Go to Business AI
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8 px-4">
                <div className="p-6 sm:p-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-card shadow-elegant max-w-2xl mx-auto">
                  <h3 className="font-bold mb-6 text-xl sm:text-2xl text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">How it works:</h3>
                  <ol className="text-left space-y-4 text-sm sm:text-base">
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300">
                      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold shadow-md">1</div>
                      <span className="text-foreground leading-relaxed">Create Business Tool or Idea analyses using our AI Advisor</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300">
                      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold shadow-md">2</div>
                      <span className="text-foreground leading-relaxed">Import the recommendations into your Notion Idea Board</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300">
                      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold shadow-md">3</div>
                      <span className="text-foreground leading-relaxed">Organize and prioritize your business strategy</span>
                    </li>
                  </ol>
                </div>
                
                <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-elegant hover:scale-105 transition-all text-lg px-10 py-7 font-bold w-full shadow-lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Sign In to Get Started
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/business-tools')}
                    className="gap-2 text-lg px-10 py-7 font-semibold w-full border-2 border-primary/30 hover:bg-primary/10"
                  >
                    Go to Business AI Advisor
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        
        {viewMode === 'select' && (
          <AnalysisSelector
            toolsHistory={toolsHistory}
            ideasHistory={ideasHistory}
            onImport={handleImport}
          />
        )}
        
        {viewMode === 'display' && (
          <RecommendationDisplay
            recommendations={importedRecommendations}
            onBackToSelection={handleBackToSelection}
            onClearAll={handleClearAll}
          />
        )}
        
        {viewMode === 'landing' && (
          <div className="mt-8">
            <ShopifyAffiliateBanner />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default NotionIdea;
