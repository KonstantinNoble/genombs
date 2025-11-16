import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
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

// Strip markdown formatting for plain text display
function stripMarkdown(md: string): string {
  if (!md) return '';
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\((.*?)\)/g, '$1')
    .replace(/^>+\s?/gm, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^-{3,}$/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const NotionIdea = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlainMode, setIsPlainMode] = useState(false);
  const [toolsHistory, setToolsHistory] = useState<ToolHistoryItem[]>([]);
  const [ideasHistory, setIdeasHistory] = useState<IdeaHistoryItem[]>([]);
  const [importedRecommendations, setImportedRecommendations] = useState<CombinedRecommendation[]>(() => {
    try {
      const saved = localStorage.getItem('notion-idea-recommendations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [viewMode, setViewMode] = useState<'landing' | 'select' | 'display'>(() => {
    try {
      const saved = localStorage.getItem('notion-idea-viewmode');
      return saved === 'select' || saved === 'display' ? saved : 'landing';
    } catch {
      return 'landing';
    }
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for safe mode from URL or localStorage (guard for Safari private mode)
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('');
    const safeModeParam = params.get('safe');

    let safeModeStorage = 'false';
    try {
      safeModeStorage = localStorage.getItem('safe-mode') || 'false';
    } catch (e) {
      console.warn('Safe mode storage not accessible:', e);
      safeModeStorage = 'false';
    }

    setIsPlainMode(safeModeParam === '1' || safeModeStorage === 'true');
    
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
    try {
      localStorage.setItem('notion-idea-recommendations', JSON.stringify(importedRecommendations));
      localStorage.setItem('notion-idea-viewmode', viewMode);
    } catch {
      // Ignore localStorage errors
    }
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

  const parseResult = (res: any) => {
    try {
      const v = typeof res === 'string' ? JSON.parse(res) : res;
      const recommendations = Array.isArray(v?.recommendations) ? v.recommendations : [];
      const generalAdvice = typeof v?.generalAdvice === 'string' ? v.generalAdvice : '';
      return { recommendations, generalAdvice };
    } catch {
      return { recommendations: [], generalAdvice: '' };
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

      const t = parseResult(tool.result);
      t.recommendations.forEach((rec, index) => {
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
          generalAdvice: t.generalAdvice
        });
      });
    });

    // Process selected ideas
    selectedIdeaIds.forEach(ideaId => {
      const idea = ideasHistory.find(i => i.id === ideaId);
      if (!idea) return;

      const i = parseResult(idea.result);
      i.recommendations.forEach((rec, index) => {
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
          generalAdvice: i.generalAdvice
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
    <div className="min-h-screen isolate bg-background/60 sm:bg-background/80 sm:backdrop-blur-[8px] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const effectiveViewMode = user ? viewMode : 'landing';

  return (
    <div className="min-h-screen isolate bg-background/60 sm:bg-background/80 sm:backdrop-blur-[8px] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl overflow-x-hidden">
        {effectiveViewMode === 'landing' && (
          <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-10 animate-fade-in py-4 sm:py-16">
            <div className="space-y-3 sm:space-y-6 px-2 sm:px-4">
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Website Idea Board
              </h1>
              <p className="text-sm sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Collect and organize your <span className="text-primary font-semibold">AI-generated</span> website recommendations in a clear, visual workspace
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 my-4 sm:my-10 px-2 sm:px-4">
              <div className="p-4 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-border bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                <h3 className="font-bold mb-2 sm:mb-3 text-sm sm:text-lg text-foreground">Import Analyses</h3>
                <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
                  Import recommendations from your Website Tools & Ideas analyses
                </p>
              </div>
              
              <div className="p-4 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-border bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                <h3 className="font-bold mb-2 sm:mb-3 text-sm sm:text-lg text-foreground">Organize</h3>
                <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
                  Filter, sort, and group recommendations by categories
                </p>
              </div>
              
              <div className="p-4 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-border bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                <h3 className="font-bold mb-2 sm:mb-3 text-sm sm:text-lg text-foreground">Execute</h3>
                <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
                  Build your website roadmap with clear, actionable insights
                </p>
              </div>
            </div>

            {user ? (
              <div className="space-y-3 sm:space-y-6 px-2 sm:px-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-primary hover:bg-primary/90 hover:shadow-lg transition-all text-sm sm:text-lg px-6 sm:px-10 py-5 sm:py-7 font-bold w-full sm:w-auto"
                >
                  Get Started
                </Button>
                {(toolsHistory.length === 0 && ideasHistory.length === 0) && (
                  <div className="mt-8 p-6 sm:p-8 rounded-2xl border-2 border-border bg-card shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                      <p className="text-base sm:text-lg text-foreground font-semibold text-center sm:text-left">
                        Ready to start optimizing your website?
                      </p>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center sm:text-left">
                      You haven't created any analyses yet. Use the AI Website Advisor to get personalized recommendations!
                    </p>
                    <Button 
                      onClick={() => navigate('/business-tools')}
                      variant="outline"
                      className="gap-2 w-full sm:w-auto border-2 border-primary/30 hover:bg-primary/10 font-semibold"
                    >
                      Go to AI Website Advisor →
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-primary hover:bg-primary/90 hover:shadow-lg transition-all text-base sm:text-xl px-8 sm:px-12 py-6 sm:py-8 font-bold w-full sm:w-auto shadow-lg"
                >
                  Sign In to Get Started
                </Button>
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
        
      {effectiveViewMode === 'display' && !isPlainMode && (
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
      
      {effectiveViewMode === 'display' && isPlainMode && (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Your Recommendations</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBackToSelection}>Import More</Button>
              <Button variant="destructive" onClick={handleClearAll}>Clear All</Button>
            </div>
          </div>
          
          {Object.entries(
            importedRecommendations.reduce((acc, rec) => {
              if (!acc[rec.category]) acc[rec.category] = [];
              acc[rec.category].push(rec);
              return acc;
            }, {} as Record<string, CombinedRecommendation[]>)
          ).map(([category, recs]) => (
            <div key={category} className="border-l-4 border-primary pl-4">
              <h2 className="text-xl font-bold capitalize mb-3">{category}</h2>
              {recs.map((rec) => (
                <div key={rec.id} className="mb-4 pb-4 border-b last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10">
                      {rec.type === 'tool' ? 'Tool' : 'Idea'}
                    </span>
                    <h3 className="font-semibold">{rec.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.type === 'tool' ? rec.implementation : rec.viability} • {rec.type === 'tool' ? rec.estimatedCost : rec.estimatedInvestment}
                  </p>
                  <p className="text-sm">{rec.rationale}</p>
                </div>
              ))}
            </div>
          ))}
          
          {importedRecommendations.some(r => r.generalAdvice) && (
            <div className="mt-6 p-4 border rounded bg-muted/50">
              <h3 className="font-semibold mb-2">Strategic Overview</h3>
              {Array.from(new Set(importedRecommendations.filter(r => r.generalAdvice).map(r => r.generalAdvice))).map((advice, idx) => (
                <p key={idx} className="whitespace-pre-wrap mb-3 last:mb-0">{stripMarkdown(advice)}</p>
              ))}
            </div>
          )}
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
};

export default NotionIdea;
