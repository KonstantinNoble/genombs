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
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in py-8 sm:py-12">
            <div className="space-y-4 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 mb-2">
                <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
                <span className="text-sm font-semibold text-foreground">Visual Business Strategy Board</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
                Notion Idea Board
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Collect and organize your AI-generated business recommendations in a beautiful, visual workspace
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 my-8 sm:my-12 px-4">
              <div className="p-4 sm:p-6 rounded-xl border bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-elegant hover:border-primary/30 transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Import Analyses</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Import recommendations from your Business Tools & Ideas analyses
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-xl border bg-gradient-to-br from-card via-card to-secondary/5 hover:shadow-elegant hover:border-secondary/30 transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Organize</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Filter, sort, and group recommendations by categories
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-xl border bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-elegant hover:border-primary/30 transition-all duration-300 sm:col-span-2 lg:col-span-1 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Execute</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Build your business roadmap with clear, actionable insights
                </p>
              </div>
            </div>

            {user ? (
              <div className="space-y-4 px-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-primary via-secondary to-primary hover:shadow-elegant hover:scale-105 transition-all text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto shadow-lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                {(toolsHistory.length === 0 && ideasHistory.length === 0) && (
                  <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl border bg-gradient-to-br from-card to-muted/20 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-secondary" />
                      </div>
                      <h3 className="font-semibold">No Analyses Yet</h3>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                      You haven't created any analyses yet. Use the Business AI Advisor to get personalized recommendations!
                    </p>
                    <Button 
                      onClick={() => navigate('/business-tools')}
                      variant="outline"
                      className="gap-2 w-full sm:w-auto hover:bg-secondary/10 hover:border-secondary transition-all"
                    >
                      Go to Business AI
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 px-4">
                <div className="p-4 sm:p-6 rounded-xl border bg-gradient-to-br from-card to-muted/20 max-w-2xl mx-auto shadow-lg">
                  <h3 className="font-semibold mb-3 text-base sm:text-lg flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                    How it works:
                  </h3>
                  <ol className="text-left space-y-3 text-sm sm:text-base text-muted-foreground">
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <span className="font-bold text-primary shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</span>
                      <span className="leading-relaxed">Create Business Tool or Idea analyses using our AI Advisor</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <span className="font-bold text-primary shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">2</span>
                      <span className="leading-relaxed">Import the recommendations into your Notion Idea Board</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <span className="font-bold text-primary shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">3</span>
                      <span className="leading-relaxed">Organize and prioritize your business strategy</span>
                    </li>
                  </ol>
                </div>
                
                <div className="flex flex-col gap-3 sm:gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-primary via-secondary to-primary hover:shadow-elegant hover:scale-105 transition-all text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full shadow-lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Sign In to Get Started
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/business-tools')}
                    className="gap-2 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full hover:bg-secondary/10 hover:border-secondary transition-all"
                  >
                    Go to Business AI Advisor
                    <ArrowRight className="h-4 w-4" />
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
