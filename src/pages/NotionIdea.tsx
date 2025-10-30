import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, BookOpen, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 md:py-16">
        {viewMode === 'landing' && (
          <div className="max-w-5xl mx-auto text-center space-y-10 animate-fade-in py-8 sm:py-12 relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="space-y-6">
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-full mb-4 border border-primary/20 animate-scale-in">
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AI-Powered Business Planning
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
                Notion Idea Board
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Collect and organize your AI-generated business recommendations in a clear, visual workspace
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 my-16">
              <div className="group p-8 rounded-xl border bg-card shadow-elegant hover:shadow-glow hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">Import Analyses</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Import recommendations from your Business Tools & Ideas analyses
                </p>
              </div>
              
              <div className="group p-8 rounded-xl border bg-card shadow-elegant hover:shadow-glow hover:-translate-y-2 transition-all duration-500" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-bold text-lg mb-3 group-hover:text-secondary transition-colors">Organize</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Filter, sort, and group recommendations by categories
                </p>
              </div>
              
              <div className="group p-8 rounded-xl border bg-card shadow-elegant hover:shadow-glow hover:-translate-y-2 transition-all duration-500 sm:col-span-2 md:col-span-1" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">Execute</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Build your business roadmap with clear, actionable insights
                </p>
              </div>
            </div>

            {user ? (
              <div className="space-y-6">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-glow hover:scale-105 transition-all text-lg px-10 py-7 text-white font-semibold rounded-xl"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {(toolsHistory.length === 0 && ideasHistory.length === 0) && (
                  <div className="mt-10 p-8 rounded-2xl border bg-gradient-to-br from-card/80 to-card shadow-elegant backdrop-blur-sm">
                    <div className="flex items-center justify-center mb-4">
                      <Sparkles className="h-10 w-10 text-secondary animate-pulse" />
                    </div>
                    <p className="text-muted-foreground mb-6 text-lg">
                      You haven't created any analyses yet. Use the Business AI Advisor to get personalized recommendations!
                    </p>
                    <Button 
                      onClick={() => navigate('/business-tools')}
                      variant="outline"
                      className="gap-2 hover:shadow-md transition-all px-6 py-3"
                    >
                      Go to Business AI
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="p-8 rounded-2xl border bg-gradient-to-br from-card to-card/50 shadow-elegant max-w-3xl mx-auto backdrop-blur-sm">
                  <h3 className="font-bold mb-6 text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">How it works:</h3>
                  <ol className="text-left space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center font-bold text-white">1</span>
                      <span className="pt-1">Create Business Tool or Idea analyses using our AI Advisor</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center font-bold text-white">2</span>
                      <span className="pt-1">Import the recommendations into your Notion Idea Board</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center font-bold text-white">3</span>
                      <span className="pt-1">Organize and prioritize your business strategy</span>
                    </li>
                  </ol>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-primary to-secondary hover:shadow-glow hover:scale-105 transition-all text-lg px-10 py-7 text-white font-semibold rounded-xl"
                  >
                    Sign In to Get Started
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/business-tools')}
                    className="gap-2 text-lg px-10 py-7 hover:shadow-md transition-all rounded-xl hover:border-primary/50"
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
      </main>
      <Footer />
    </div>
  );
};

export default NotionIdea;
