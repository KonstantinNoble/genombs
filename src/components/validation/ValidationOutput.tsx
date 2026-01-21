import { useState } from "react";
import { ConfidenceHeader } from "./ConfidenceHeader";
import { ConsensusSection } from "./ConsensusSection";
import { MajoritySection } from "./MajoritySection";
import { DissentSection } from "./DissentSection";
import { ModelDetailCards } from "./ModelDetailCards";

import type { ValidationResult } from "@/hooks/useMultiAIValidation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_MODELS } from "./ModelSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown } from "lucide-react";
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
    <div className="space-y-5 animate-fade-in">
      {/* Processing Info */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
        <span className="px-3 py-1.5 rounded-full bg-muted/50">
          {(processingTimeMs / 1000).toFixed(1)}s
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="text-center">{modelSummary}</span>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-sm px-3 py-1">
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

      {/* Top Actions */}
      {hasTopActions && (
        <div className="p-5 sm:p-6 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg sm:text-xl text-foreground">
              Top Priority Actions
            </h3>
            {isPremium && (
              <span className="text-base text-muted-foreground">7 actions</span>
            )}
          </div>
          
          <ol className="space-y-4">
            {visibleActions!.map((action, i) => (
              <li key={i} className="flex items-start gap-4 text-base sm:text-lg">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-bold">
                  {i + 1}
                </span>
                <span className="text-foreground leading-relaxed pt-1">{action}</span>
              </li>
            ))}
          </ol>

          {hasMoreActions && !actionsExpanded && (
            <button
              onClick={() => setActionsExpanded(true)}
              className="mt-4 text-base text-primary hover:text-primary/80 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <ChevronDown className="h-5 w-5" />
              Show {(finalRecommendation.topActions?.length || 0) - 3} more actions
            </button>
          )}
        </div>
      )}

      {/* Premium Insights - Tabbed Interface */}
      {hasPremiumInsights && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="font-bold text-lg sm:text-xl text-foreground">Premium Insights</span>
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-base">
              Premium
            </Badge>
          </div>
          
          <Tabs defaultValue="strategy" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-12 mb-5">
              {strategicAlternatives && strategicAlternatives.length > 0 && (
                <TabsTrigger value="strategy" className="text-base data-[state=active]:bg-amber-500/20">
                  Strategy
                </TabsTrigger>
              )}
              {longTermOutlook && (
                <TabsTrigger value="outlook" className="text-base data-[state=active]:bg-amber-500/20">
                  Long-term
                </TabsTrigger>
              )}
              {competitorInsights && (
                <TabsTrigger value="competitors" className="text-base data-[state=active]:bg-amber-500/20">
                  Competition
                </TabsTrigger>
              )}
            </TabsList>

            {/* Strategic Alternatives */}
            {strategicAlternatives && strategicAlternatives.length > 0 && (
              <TabsContent value="strategy" className="mt-0">
                <div className="space-y-4">
                  {strategicAlternatives.map((alt, i) => (
                    <div key={i} className="p-5 rounded-xl bg-background border">
                      <h5 className="font-semibold text-lg sm:text-xl mb-4">{alt.scenario}</h5>
                      <div className="grid grid-cols-2 gap-4 text-base">
                        <div>
                          <p className="font-semibold text-primary mb-3">Pros</p>
                          <ul className="space-y-2">
                            {alt.pros.slice(0, 3).map((pro, j) => (
                              <li key={j} className="flex items-start gap-2">
                                <span className="text-primary shrink-0">+</span>
                                <span className="text-muted-foreground">{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-destructive mb-3">Cons</p>
                          <ul className="space-y-2">
                            {alt.cons.slice(0, 3).map((con, j) => (
                              <li key={j} className="flex items-start gap-2">
                                <span className="text-destructive shrink-0">−</span>
                                <span className="text-muted-foreground">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <p className="text-base text-muted-foreground mt-4">
                        <span className="font-semibold">Best for:</span> {alt.bestFor}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
            
            {/* Long-term Outlook */}
            {longTermOutlook && (
              <TabsContent value="outlook" className="mt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-background border">
                    <p className="text-base font-semibold text-muted-foreground mb-3">6-Month</p>
                    <p className="text-base sm:text-lg leading-relaxed">{longTermOutlook.sixMonths}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-background border">
                    <p className="text-base font-semibold text-muted-foreground mb-3">12-Month</p>
                    <p className="text-base sm:text-lg leading-relaxed">{longTermOutlook.twelveMonths}</p>
                  </div>
                </div>
                {longTermOutlook.keyMilestones && longTermOutlook.keyMilestones.length > 0 && (
                  <div className="p-4 rounded-xl bg-background border">
                    <p className="text-base font-semibold text-muted-foreground mb-3">Key Milestones</p>
                    <ul className="space-y-3">
                      {longTermOutlook.keyMilestones.slice(0, 4).map((milestone, i) => (
                        <li key={i} className="flex items-start gap-3 text-base sm:text-lg">
                          <span className="text-primary font-bold shrink-0">{i + 1}.</span>
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
                <div className="p-5 rounded-xl bg-background border">
                  <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{competitorInsights}</p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}

      <Separator className="my-4" />

      {/* Analysis Points */}
      <div className="space-y-4">
        <ConsensusSection points={consensusPoints} />
        <MajoritySection points={majorityPoints} />
        <DissentSection points={dissentPoints} />
      </div>

      <Separator className="my-4" />

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