import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Tables } from "@/integrations/supabase/types";

interface ToolRecommendation {
  name: string;
  category: string;
  implementation: string;
  estimatedCost: string;
  rationale: string;
}

interface ToolAdvisorResult {
  recommendations: ToolRecommendation[];
  generalAdvice: string;
}

type AnalysisItem = Omit<Tables<"business_tools_history">, "result"> & {
  result: ToolAdvisorResult;
};

const AnalysisHistory = () => {
  const [history, setHistory] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("business_tools_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory((data || []) as unknown as AnalysisItem[]);
    } catch (error) {
      console.error("Error loading history:", error);
      toast({
        title: "Error",
        description: "Failed to load analysis history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("business_tools_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setHistory(history.filter((item) => item.id !== id));
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }

      toast({
        title: "Success",
        description: "Analysis deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting analysis:", error);
      toast({
        title: "Error",
        description: "Failed to delete analysis",
        variant: "destructive",
      });
    }
  };

  const getImplementationColor = (implementation: string) => {
    switch (implementation) {
      case "quick-win":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "medium-term":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "strategic":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const mdComponents = {
    h1: ({ children }: any) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold mt-5 mb-3 text-foreground">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
    p: ({ children }: any) => <p className="text-sm leading-relaxed mb-3 text-foreground">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }: any) => <li className="text-sm text-foreground ml-2">{children}</li>,
    strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">AI Analysis History ({history.length})</h2>
      </div>

      {history.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No analyses yet</p>
          <p className="text-sm text-muted-foreground">
            Your AI website advisor analyses will appear here
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* History List */}
          <div className="space-y-3">
            {history.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                  selectedAnalysis?.id === item.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedAnalysis(item)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base">{item.industry}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.team_size}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.budget_range}
                        </Badge>
                        {item.analysis_mode && (
                          <Badge variant="secondary" className="text-xs">
                            {item.analysis_mode}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {item.business_goals}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis Details */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedAnalysis ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Analysis Details</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{selectedAnalysis.industry}</Badge>
                    <Badge variant="outline">{selectedAnalysis.team_size}</Badge>
                    <Badge variant="outline">{selectedAnalysis.budget_range}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                  {/* Goals */}
                  <div>
                    <h3 className="font-semibold mb-2">Business Goals</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAnalysis.business_goals}
                    </p>
                  </div>

                  {/* General Advice */}
                  {selectedAnalysis.result.generalAdvice && (
                    <div>
                      <h3 className="font-semibold mb-2">General Advice</h3>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {selectedAnalysis.result.generalAdvice}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-semibold mb-3">
                      Recommendations ({selectedAnalysis.result.recommendations?.length || 0})
                    </h3>
                    <div className="space-y-4">
                      {selectedAnalysis.result.recommendations?.map((rec, idx) => (
                        <Card key={idx} className="border-l-4 border-l-primary">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">{rec.name}</CardTitle>
                              <Badge
                                variant="outline"
                                className={getImplementationColor(rec.implementation)}
                              >
                                {rec.implementation}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {rec.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {rec.estimatedCost}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                {rec.rationale}
                              </ReactMarkdown>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  Select an analysis to view details
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;
