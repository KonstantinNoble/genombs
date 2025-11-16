import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, TrendingUp, Calendar, Download, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Tables } from "@/integrations/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [filterBudget, setFilterBudget] = useState<string>("all");
  const [filterTeamSize, setFilterTeamSize] = useState<string>("all");
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

  // Get unique values for filters
  const uniqueIndustries = useMemo(() => {
    return Array.from(new Set(history.map(item => item.industry)));
  }, [history]);

  const uniqueModes = useMemo(() => {
    return Array.from(new Set(history.map(item => item.analysis_mode).filter(Boolean)));
  }, [history]);

  const uniqueBudgets = useMemo(() => {
    return Array.from(new Set(history.map(item => item.budget_range)));
  }, [history]);

  const uniqueTeamSizes = useMemo(() => {
    return Array.from(new Set(history.map(item => item.team_size)));
  }, [history]);

  // Filter history based on selected filters
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      if (filterIndustry !== "all" && item.industry !== filterIndustry) return false;
      if (filterMode !== "all" && item.analysis_mode !== filterMode) return false;
      if (filterBudget !== "all" && item.budget_range !== filterBudget) return false;
      if (filterTeamSize !== "all" && item.team_size !== filterTeamSize) return false;
      return true;
    });
  }, [history, filterIndustry, filterMode, filterBudget, filterTeamSize]);

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

  const handleExportPDF = async (item: AnalysisItem) => {
    try {
      const { Document, Page, Text, View, StyleSheet, pdf } = await import("@react-pdf/renderer");
      
      const styles = StyleSheet.create({
        page: { padding: 30, fontFamily: "Helvetica" },
        title: { fontSize: 24, marginBottom: 10, fontWeight: "bold" },
        subtitle: { fontSize: 14, marginBottom: 20, color: "#666" },
        section: { marginBottom: 15 },
        sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
        text: { fontSize: 12, marginBottom: 5, lineHeight: 1.5 },
        badge: { fontSize: 10, color: "#4F46E5", marginBottom: 5 },
        card: { marginBottom: 15, padding: 10, borderLeft: "4px solid #4F46E5", backgroundColor: "#F9FAFB" },
        cardTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
      });

      const PDFDocument = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.title}>AI Website Analysis Report</Text>
            <Text style={styles.subtitle}>
              Generated: {new Date().toLocaleDateString("de-DE")}
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Analysis Details</Text>
              <Text style={styles.text}>Industry: {item.industry}</Text>
              <Text style={styles.text}>Team Size: {item.team_size}</Text>
              <Text style={styles.text}>Budget: {item.budget_range}</Text>
              {item.analysis_mode && (
                <Text style={styles.text}>Mode: {item.analysis_mode}</Text>
              )}
              <Text style={styles.text}>
                Date: {new Date(item.created_at).toLocaleDateString("de-DE")}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Goals</Text>
              <Text style={styles.text}>{item.business_goals}</Text>
            </View>

            {item.result.generalAdvice && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>General Advice</Text>
                <Text style={styles.text}>{item.result.generalAdvice}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Recommendations ({item.result.recommendations?.length || 0})
              </Text>
              {item.result.recommendations?.map((rec, idx) => (
                <View key={idx} style={styles.card}>
                  <Text style={styles.cardTitle}>{rec.name}</Text>
                  <Text style={styles.badge}>
                    {rec.category} • {rec.implementation} • {rec.estimatedCost}
                  </Text>
                  <Text style={styles.text}>{rec.rationale}</Text>
                </View>
              ))}
            </View>
          </Page>
        </Document>
      );

      const blob = await pdf(<PDFDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analysis-${item.industry.toLowerCase().replace(/\s+/g, "-")}-${new Date(item.created_at).toISOString().split("T")[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Analysis exported as PDF",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {history.length === 0 ? (
        <Card className="p-8 md:p-12 text-center">
          <TrendingUp className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No analyses yet</p>
          <p className="text-sm text-muted-foreground">
            Your AI website advisor analyses will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {/* Filter Header */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Filter Analyses</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {uniqueIndustries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Mode</label>
                <Select value={filterMode} onValueChange={setFilterMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    {uniqueModes.map(mode => (
                      <SelectItem key={mode} value={mode || ""}>{mode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Budget</label>
                <Select value={filterBudget} onValueChange={setFilterBudget}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Budgets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Budgets</SelectItem>
                    {uniqueBudgets.map(budget => (
                      <SelectItem key={budget} value={budget}>{budget}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Team Size</label>
                <Select value={filterTeamSize} onValueChange={setFilterTeamSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Team Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team Sizes</SelectItem>
                    {uniqueTeamSizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(filterIndustry !== "all" || filterMode !== "all" || filterBudget !== "all" || filterTeamSize !== "all") && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredHistory.length} of {history.length} analyses
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFilterIndustry("all");
                    setFilterMode("all");
                    setFilterBudget("all");
                    setFilterTeamSize("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>

          {filteredHistory.length === 0 ? (
            <Card className="p-8 md:p-12 text-center">
              <Filter className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No matching analyses</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
            </Card>
          ) : (
            filteredHistory.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <CardTitle className="text-lg md:text-xl break-words">{item.industry}</CardTitle>
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
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExportPDF(item)}
                      title="Als PDF exportieren"
                    >
                      <Download className="w-4 h-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>
                    {new Date(item.created_at).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Business Goals */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">Business Goals</h3>
                  <p className="text-sm text-muted-foreground break-words">
                    {item.business_goals}
                  </p>
                </div>

                {/* General Advice */}
                {item.result.generalAdvice && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">General Advice</h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {item.result.generalAdvice}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {item.result.recommendations && item.result.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-3">
                      Recommendations ({item.result.recommendations.length})
                    </h3>
                    <div className="space-y-3">
                      {item.result.recommendations.map((rec, idx) => (
                        <Card key={idx} className="border-l-4 border-l-primary">
                          <CardHeader className="pb-3 px-3 md:px-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <CardTitle className="text-sm md:text-base break-words">
                                {rec.name}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className={`${getImplementationColor(rec.implementation)} shrink-0 self-start text-xs`}
                              >
                                {rec.implementation}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {rec.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {rec.estimatedCost}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="px-3 md:px-6">
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
                )}
              </CardContent>
            </Card>
          ))
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;
