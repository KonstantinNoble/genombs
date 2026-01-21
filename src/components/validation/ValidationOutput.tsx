import { useState } from "react";
import { ConfidenceHeader } from "./ConfidenceHeader";
import { ConsensusSection } from "./ConsensusSection";
import { MajoritySection } from "./MajoritySection";
import { DissentSection } from "./DissentSection";
import { ModelDetailCards } from "./ModelDetailCards";
import { StartExperimentButton } from "@/components/experiment/StartExperimentButton";
import type { ValidationResult } from "@/hooks/useMultiAIValidation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_MODELS } from "./ModelSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Target, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationOutputProps {
  result: ValidationResult;
  validationId?: string;
  onStartExperiment?: () => void;
}

export function ValidationOutput({ result, validationId, onStartExperiment }: ValidationOutputProps) {
  const [actionsExpanded, setActionsExpanded] = useState(false);
  
  const {
    modelResponses,
    selectedModels,
    consensusPoints,
    majorityPoints,
    dissentPoints,
    finalRecommendation,
    overallConfidence,
    synthesisReasoning,
    processingTimeMs,
    isPremium,
    citations,
    strategicAlternatives,
    longTermOutlook,
    competitorInsights
  } = result;

  const hasTopActions = finalRecommendation.topActions && finalRecommendation.topActions.length > 0;
  const hasPremiumInsights = isPremium && (strategicAlternatives || longTermOutlook || competitorInsights);

  // Build model summary string
  const modelSummary = selectedModels
    .map(key => AVAILABLE_MODELS[key]?.name || key)
    .join(' · ');

  // Show first 3 actions, rest behind expand
  const visibleActions = actionsExpanded 
    ? finalRecommendation.topActions 
    : finalRecommendation.topActions?.slice(0, 3);
  const hasMoreActions = (finalRecommendation.topActions?.length || 0) > 3;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Compact Processing Info */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="px-2 py-1 rounded-full bg-muted/50">
          {(processingTimeMs / 1000).toFixed(1)}s
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="text-center">{modelSummary}</span>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs px-2 py-0.5">
            Premium
          </Badge>
        )}
      </div>

      {/* Main Recommendation */}
      <ConfidenceHeader
        title={finalRecommendation.title}
        description={finalRecommendation.description}
        confidence={overallConfidence}
        reasoning={synthesisReasoning}
      />

      {/* Compact Top Actions */}
      {hasTopActions && (
        <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Top Priority Actions
            </h3>
            {isPremium && (
              <span className="text-xs text-muted-foreground">7 actions</span>
            )}
          </div>
          
          <ol className="space-y-2">
            {visibleActions!.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                <span className="text-foreground leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>

          {hasMoreActions && !actionsExpanded && (
            <button
              onClick={() => setActionsExpanded(true)}
              className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <ChevronDown className="h-3 w-3" />
              Show {(finalRecommendation.topActions?.length || 0) - 3} more actions
            </button>
          )}

          {/* Start Experiment Button */}
          {validationId && onStartExperiment && (
            <div className="mt-3 pt-3 border-t border-primary/20">
              <StartExperimentButton onClick={onStartExperiment} />
            </div>
          )}
        </div>
      )}

      {/* Premium Insights - Tabbed Interface */}
      {hasPremiumInsights && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-sm text-foreground">Premium Insights</span>
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs">
              Premium
            </Badge>
          </div>
          
          <Tabs defaultValue="strategy" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-8 mb-3">
              {strategicAlternatives && strategicAlternatives.length > 0 && (
                <TabsTrigger value="strategy" className="text-xs data-[state=active]:bg-amber-500/20">
                  <Target className="h-3 w-3 mr-1 hidden sm:inline" />
                  Strategy
                </TabsTrigger>
              )}
              {longTermOutlook && (
                <TabsTrigger value="outlook" className="text-xs data-[state=active]:bg-amber-500/20">
                  <TrendingUp className="h-3 w-3 mr-1 hidden sm:inline" />
                  Long-term
                </TabsTrigger>
              )}
              {competitorInsights && (
                <TabsTrigger value="competitors" className="text-xs data-[state=active]:bg-amber-500/20">
                  <Users className="h-3 w-3 mr-1 hidden sm:inline" />
                  Competition
                </TabsTrigger>
              )}
            </TabsList>

            {/* Strategic Alternatives */}
            {strategicAlternatives && strategicAlternatives.length > 0 && (
              <TabsContent value="strategy" className="mt-0">
                <div className="space-y-2">
                  {strategicAlternatives.map((alt, i) => (
                    <div key={i} className="p-3 rounded-lg bg-background border">
                      <h5 className="font-medium text-sm mb-2">{alt.scenario}</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="font-medium text-primary mb-1">Pros</p>
                          <ul className="space-y-0.5">
                            {alt.pros.slice(0, 3).map((pro, j) => (
                              <li key={j} className="flex items-start gap-1">
                                <span className="text-primary shrink-0">+</span>
                                <span className="text-muted-foreground line-clamp-2">{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-destructive mb-1">Cons</p>
                          <ul className="space-y-0.5">
                            {alt.cons.slice(0, 3).map((con, j) => (
                              <li key={j} className="flex items-start gap-1">
                                <span className="text-destructive shrink-0">−</span>
                                <span className="text-muted-foreground line-clamp-2">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="font-medium">Best for:</span> {alt.bestFor}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
            
            {/* Long-term Outlook */}
            {longTermOutlook && (
              <TabsContent value="outlook" className="mt-0">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-background border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">6-Month</p>
                    <p className="text-xs leading-relaxed">{longTermOutlook.sixMonths}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-background border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">12-Month</p>
                    <p className="text-xs leading-relaxed">{longTermOutlook.twelveMonths}</p>
                  </div>
                </div>
                {longTermOutlook.keyMilestones && longTermOutlook.keyMilestones.length > 0 && (
                  <div className="p-2 rounded-lg bg-background border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Key Milestones</p>
                    <ul className="space-y-1">
                      {longTermOutlook.keyMilestones.slice(0, 4).map((milestone, i) => (
                        <li key={i} className="flex items-start gap-1 text-xs">
                          <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                          <span className="text-muted-foreground">{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
            )}
            
            {/* Competitor Insights */}
            {competitorInsights && (
              <TabsContent value="competitors" className="mt-0">
                <div className="p-3 rounded-lg bg-background border">
                  <p className="text-xs leading-relaxed text-muted-foreground">{competitorInsights}</p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}

      <Separator className="my-3" />

      {/* Analysis Points */}
      <div className="space-y-3">
        <ConsensusSection points={consensusPoints} />
        <MajoritySection points={majorityPoints} />
        <DissentSection points={dissentPoints} />
      </div>

      <Separator className="my-3" />

      {/* Individual Model Details */}
      <ModelDetailCards
        modelResponses={modelResponses || {}}
        selectedModels={selectedModels || []}
        isPremium={isPremium}
        citations={citations}
      />
    </div>
  );
}
