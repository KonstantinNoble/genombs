import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Wrench, Lightbulb, Calendar } from "lucide-react";
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
    setSelectedToolIds(toolsHistory.map(t => t.id));
  };

  const selectAllIdeas = () => {
    setSelectedIdeaIds(ideasHistory.map(i => i.id));
  };

  const handleImport = () => {
    onImport(selectedToolIds, selectedIdeaIds);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Import Your AI Recommendations
        </h1>
        <p className="text-muted-foreground">
          Select the analyses you want to organize in your Notion Idea board
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Tools Column */}
        {toolsHistory.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Tools Analyses</h2>
              </div>
              <Button variant="outline" size="sm" onClick={selectAllTools}>
                Select All
              </Button>
            </div>
            
            <div className="space-y-3">
              {toolsHistory.map(tool => (
                <Card
                  key={tool.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedToolIds.includes(tool.id)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : ''
                  }`}
                  onClick={() => toggleToolSelection(tool.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedToolIds.includes(tool.id)}
                          onCheckedChange={() => toggleToolSelection(tool.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(tool.created_at), 'MMM dd, yyyy')}
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
                      {tool.result.recommendations.length} recommendation{tool.result.recommendations.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Ideas Column */}
        {ideasHistory.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-secondary" />
                <h2 className="text-2xl font-semibold">Ideas Analyses</h2>
              </div>
              <Button variant="outline" size="sm" onClick={selectAllIdeas}>
                Select All
              </Button>
            </div>
            
            <div className="space-y-3">
              {ideasHistory.map(idea => (
                <Card
                  key={idea.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedIdeaIds.includes(idea.id)
                      ? 'ring-2 ring-secondary bg-secondary/5'
                      : ''
                  }`}
                  onClick={() => toggleIdeaSelection(idea.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedIdeaIds.includes(idea.id)}
                          onCheckedChange={() => toggleIdeaSelection(idea.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(idea.created_at), 'MMM dd, yyyy')}
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
                      {idea.result.recommendations.length} recommendation{idea.result.recommendations.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleImport}
          disabled={selectedToolIds.length === 0 && selectedIdeaIds.length === 0}
          className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
        >
          Import Selected ({selectedToolIds.length + selectedIdeaIds.length})
        </Button>
      </div>
    </div>
  );
};

export default AnalysisSelector;
