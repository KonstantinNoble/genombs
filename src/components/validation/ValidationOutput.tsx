import { ConfidenceHeader } from "./ConfidenceHeader";
import { ConsensusSection } from "./ConsensusSection";
import { MajoritySection } from "./MajoritySection";
import { DissentSection } from "./DissentSection";
import { ModelDetailCards } from "./ModelDetailCards";
import { StartExperimentButton } from "@/components/experiment/StartExperimentButton";
import type { ValidationResult } from "@/hooks/useMultiAIValidation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AVAILABLE_MODELS } from "./ModelSelector";

interface ValidationOutputProps {
  result: ValidationResult;
  validationId?: string;
  onStartExperiment?: () => void;
}

export function ValidationOutput({ result, validationId, onStartExperiment }: ValidationOutputProps) {
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

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Processing Time & Models Badge */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted/50 border text-xs sm:text-sm text-muted-foreground">
          <span>Completed in {(processingTimeMs / 1000).toFixed(1)}s</span>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          {modelSummary}
        </div>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs px-2.5 py-1">
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
        <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h3 className="font-bold text-sm sm:text-base text-foreground mb-2 sm:mb-3">
            Top Priority Actions
            {isPremium && <span className="text-xs font-normal text-muted-foreground ml-2">(Premium: 7 actions)</span>}
          </h3>
          <ol className="space-y-2">
            {finalRecommendation.topActions!.map((action, i) => (
              <li key={i} className="flex items-start gap-2 sm:gap-3">
                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-xs sm:text-sm text-foreground pt-0.5 leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>

          {/* Start Experiment Button */}
          {validationId && onStartExperiment && (
            <div className="mt-3 sm:mt-4 pt-3 border-t border-primary/20">
              <StartExperimentButton onClick={onStartExperiment} />
            </div>
          )}
        </div>
      )}

      {/* Premium Insights as Tabs */}
      {hasPremiumInsights && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-sm sm:text-base text-foreground">Premium Insights</span>
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs">
              Premium
            </Badge>
          </div>
          
          <Tabs 
            defaultValue={strategicAlternatives ? "alternatives" : longTermOutlook ? "outlook" : "competitors"} 
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 h-auto p-1">
              {strategicAlternatives && strategicAlternatives.length > 0 && (
                <TabsTrigger value="alternatives" className="text-xs py-1.5">
                  Alternatives
                </TabsTrigger>
              )}
              {longTermOutlook && (
                <TabsTrigger value="outlook" className="text-xs py-1.5">
                  Outlook
                </TabsTrigger>
              )}
              {competitorInsights && (
                <TabsTrigger value="competitors" className="text-xs py-1.5">
                  Competitors
                </TabsTrigger>
              )}
            </TabsList>
            
            {strategicAlternatives && strategicAlternatives.length > 0 && (
              <TabsContent value="alternatives" className="mt-3 space-y-2">
                {strategicAlternatives.map((alt, i) => (
                  <div key={i} className="p-3 rounded-lg bg-background border">
                    <h4 className="font-semibold text-sm mb-2">{alt.scenario}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="font-medium text-primary mb-1 text-xs">Pros</p>
                        <ul className="space-y-1">
                          {alt.pros.map((pro, j) => (
                            <li key={j} className="flex items-start gap-1 text-xs">
                              <span className="text-primary shrink-0">+</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-destructive mb-1 text-xs">Cons</p>
                        <ul className="space-y-1">
                          {alt.cons.map((con, j) => (
                            <li key={j} className="flex items-start gap-1 text-xs">
                              <span className="text-destructive shrink-0">−</span>
                              <span>{con}</span>
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
              </TabsContent>
            )}
            
            {longTermOutlook && (
              <TabsContent value="outlook" className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-background border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">6-Month</p>
                    <p className="text-xs">{longTermOutlook.sixMonths}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">12-Month</p>
                    <p className="text-xs">{longTermOutlook.twelveMonths}</p>
                  </div>
                </div>
                {longTermOutlook.keyMilestones && longTermOutlook.keyMilestones.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Key Milestones</p>
                    <ul className="space-y-1">
                      {longTermOutlook.keyMilestones.map((milestone, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
            )}
            
            {competitorInsights && (
              <TabsContent value="competitors" className="mt-3">
                <p className="text-xs leading-relaxed">{competitorInsights}</p>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}

      <Separator className="my-2" />

      {/* Analysis Points - 2 Column Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <ConsensusSection points={consensusPoints} />
          <MajoritySection points={majorityPoints} />
        </div>
        <div>
          <DissentSection points={dissentPoints} />
        </div>
      </div>

      <Separator className="my-2" />

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
