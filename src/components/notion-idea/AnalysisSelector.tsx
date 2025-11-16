import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ToolHistoryItem, IdeaHistoryItem } from "@/pages/NotionIdea";
import { format } from "date-fns";

interface AnalysisSelectorProps {
  toolsHistory: ToolHistoryItem[];
  ideasHistory: IdeaHistoryItem[];
  onImport: (selectedToolIds: string[], selectedIdeaIds: string[]) => void;
}

const AnalysisSelector = ({ toolsHistory, ideasHistory, onImport }: AnalysisSelectorProps) => {
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<string[]>([]);

  // Robust helpers to avoid runtime errors on mobile (undefined data, stringified JSON, invalid dates)
  const getRecCount = (res: any) => {
    try {
      const parsed = typeof res === 'string' ? JSON.parse(res) : res;
      const recs = parsed?.recommendations;
      return Array.isArray(recs) ? recs.length : 0;
    } catch {
      return 0;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return format(d, 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const toggleToolSelection = (id: string) => {
    setSelectedToolIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleIdeaSelection = (id: string) => {
    setSelectedIdeaIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllTools = () => {
    setSelectedToolIds((toolsHistory || []).map(t => t.id));
  };

  const selectAllIdeas = () => {
    setSelectedIdeaIds((ideasHistory || []).map(i => i.id));
  };

  const handleExportPDF = async () => {
    const { pdf } = await import('@react-pdf/renderer');
    const { ReportPDF } = await import('@/components/ReportPDF');
    
    // Combine selected analyses
    const selectedTools = toolsHistory.filter(t => selectedToolIds.includes(t.id));
    const selectedIdeas = ideasHistory.filter(i => selectedIdeaIds.includes(i.id));
    
    // Combine all recommendations
    const allRecommendations = [
      ...selectedTools.flatMap(t => {
        const result = typeof t.result === 'string' ? JSON.parse(t.result) : t.result;
        return (result?.recommendations || []).map((rec: any) => ({
          ...rec,
          source: `Tools Analysis - ${t.industry}`,
        }));
      }),
      ...selectedIdeas.flatMap(i => {
        const result = typeof i.result === 'string' ? JSON.parse(i.result) : i.result;
        return (result?.recommendations || []).map((rec: any) => ({
          ...rec,
          source: `Ideas Analysis - ${i.industry}`,
        }));
      }),
    ];

    const combinedResult = {
      recommendations: allRecommendations,
      generalAdvice: `Combined analysis from ${selectedTools.length} tools and ${selectedIdeas.length} ideas analyses.`,
    };

    const metadata = {
      websiteType: 'Combined Analysis',
      websiteStatus: `${selectedTools.length + selectedIdeas.length} Analyses`,
      budgetRange: 'Various',
      date: formatDate(new Date().toISOString()),
      analysisMode: 'combined',
    };

    const blob = await pdf(
      ReportPDF({ 
        type: 'tools', 
        result: combinedResult, 
        metadata 
      })
    ).toBlob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notion-idea-export-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in px-2 sm:px-4 pb-24 sm:pb-0">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-foreground">
          Import Your AI Recommendations
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-3">
          Select the analyses you want to organize in your Notion Idea board
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Tools Column - always render with fallback message */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-2xl font-semibold">Tools Analyses</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllTools}
              className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
              disabled={(toolsHistory?.length ?? 0) === 0}
            >
              Select All
            </Button>
          </div>

          <div className="space-y-3">
            {(toolsHistory?.length ?? 0) > 0 ? (
              toolsHistory.map(tool => (
                <Card
                  key={tool.id}
                  className={`cursor-pointer transition-all hover:shadow-md touch-manipulation active:scale-[0.98] ${
                    selectedToolIds.includes(tool.id)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : ''
                  }`}
                  onClick={() => toggleToolSelection(tool.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleToolSelection(tool.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedToolIds.includes(tool.id)}
                          onCheckedChange={() => toggleToolSelection(tool.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          className="pointer-events-auto"
                          aria-label="Select tool analysis"
                        />
                        <div className="flex-1">
                          <div className="mb-2">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(tool.created_at)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{tool.industry}</Badge>
                            <Badge variant="outline">{tool.team_size}</Badge>
                            <Badge variant="outline">{tool.budget_range}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm font-medium text-primary">
                      {getRecCount(tool.result)} recommendation{getRecCount(tool.result) !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground px-2">Keine Tools-Analysen gefunden.</p>
            )}
          </div>
        </div>

        {/* Ideas Column - always render with fallback message */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-2xl font-semibold">Ideas Analyses</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllIdeas}
              className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
              disabled={(ideasHistory?.length ?? 0) === 0}
            >
              Select All
            </Button>
          </div>

          <div className="space-y-3">
            {(ideasHistory?.length ?? 0) > 0 ? (
              ideasHistory.map(idea => (
                <Card
                  key={idea.id}
                  className={`cursor-pointer transition-all hover:shadow-md touch-manipulation active:scale-[0.98] ${
                    selectedIdeaIds.includes(idea.id)
                      ? 'ring-2 ring-secondary bg-secondary/5'
                      : ''
                  }`}
                  onClick={() => toggleIdeaSelection(idea.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleIdeaSelection(idea.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedIdeaIds.includes(idea.id)}
                          onCheckedChange={() => toggleIdeaSelection(idea.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          className="pointer-events-auto"
                          aria-label="Select idea analysis"
                        />
                        <div className="flex-1">
                          <div className="mb-2">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(idea.created_at)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{idea.industry}</Badge>
                            <Badge variant="outline">{idea.team_size}</Badge>
                            <Badge variant="outline">{idea.budget_range}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm font-medium text-secondary">
                      {getRecCount(idea.result)} recommendation{getRecCount(idea.result) !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground px-2">Keine Ideen-Analysen gefunden.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Import Bar on mobile, centered on desktop */}
      <div className="sm:static fixed inset-x-0 bottom-0 z-40 safe-area-inset-bottom">
        <div className="px-4 py-3 sm:px-0 sm:py-0 bg-background/95 sm:bg-transparent border-t border-border sm:border-0 backdrop-blur-md sm:backdrop-blur-none">
          <div className="max-w-7xl mx-auto flex justify-center">
            <Button
              size="lg"
              onClick={handleExportPDF}
              disabled={selectedToolIds.length === 0 && selectedIdeaIds.length === 0}
              className="bg-primary hover:bg-primary/90 hover:shadow-lg transition-all w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base font-semibold"
            >
              PDF exportieren ({selectedToolIds.length + selectedIdeaIds.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSelector;
