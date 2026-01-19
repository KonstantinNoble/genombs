import { ConfidenceHeader } from "./ConfidenceHeader";
import { ConsensusSection } from "./ConsensusSection";
import { MajoritySection } from "./MajoritySection";
import { DissentSection } from "./DissentSection";
import { ModelDetailCards } from "./ModelDetailCards";
import { StartExperimentButton } from "@/components/experiment/StartExperimentButton";
import type { ValidationResult } from "@/hooks/useMultiAIValidation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    modelWeights,
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

  // Build model summary string
  const modelSummary = selectedModels
    .map(key => `${AVAILABLE_MODELS[key]?.name || key} (${modelWeights[key] || 0}%)`)
    .join(' · ');

  return (
    <div className="space-y-5 sm:space-y-8 animate-fade-in">
      {/* Processing Time & Models Badge */}
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full bg-muted/50 border text-sm sm:text-lg text-muted-foreground">
          <span>Completed in {(processingTimeMs / 1000).toFixed(1)}s</span>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground text-center">
          {modelSummary}
        </div>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
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
        <div className="p-4 sm:p-8 rounded-lg sm:rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="font-bold text-lg sm:text-2xl text-foreground mb-4 sm:mb-6">
            Top Priority Actions
            {isPremium && <span className="text-sm sm:text-base font-normal text-muted-foreground ml-2 sm:ml-3">(Premium: 7 actions)</span>}
          </h3>
          <ol className="space-y-3 sm:space-y-5">
            {finalRecommendation.topActions!.map((action, i) => (
              <li key={i} className="flex items-start gap-3 sm:gap-5">
                <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm sm:text-lg font-bold">
                  {i + 1}
                </span>
                <span className="text-sm sm:text-lg text-foreground pt-1.5 sm:pt-2 leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>

          {/* Start Experiment Button */}
          {validationId && onStartExperiment && (
            <div className="mt-5 sm:mt-8 pt-4 sm:pt-5 border-t border-primary/20">
              <StartExperimentButton onClick={onStartExperiment} />
            </div>
          )}
        </div>
      )}

      {/* Premium-only: Strategic Alternatives */}
      {isPremium && strategicAlternatives && strategicAlternatives.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
            <CardTitle className="flex flex-wrap items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <span>Strategic Alternatives</span>
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs sm:text-sm">
                Premium
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 px-3 sm:px-6 pb-4 sm:pb-6">
            {strategicAlternatives.map((alt, i) => (
              <div key={i} className="p-3 sm:p-5 rounded-lg bg-background border">
                <h4 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">{alt.scenario}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <p className="font-medium text-primary mb-1.5 sm:mb-2 text-sm sm:text-base">Pros</p>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {alt.pros.map((pro, j) => (
                        <li key={j} className="flex items-start gap-1.5 sm:gap-2 text-sm sm:text-base">
                          <span className="text-primary">+</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-destructive mb-1.5 sm:mb-2 text-sm sm:text-base">Cons</p>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {alt.cons.map((con, j) => (
                        <li key={j} className="flex items-start gap-1.5 sm:gap-2 text-sm sm:text-base">
                          <span className="text-destructive">−</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4">
                  <span className="font-medium">Best for:</span> {alt.bestFor}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Premium-only: Long-term Outlook */}
      {isPremium && longTermOutlook && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
            <CardTitle className="flex flex-wrap items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <span>Long-term Outlook</span>
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs sm:text-sm">
                Premium
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="p-3 sm:p-5 rounded-lg bg-background border">
                <p className="text-sm sm:text-base font-medium text-muted-foreground mb-1.5 sm:mb-2">6-Month Projection</p>
                <p className="text-base sm:text-lg">{longTermOutlook.sixMonths}</p>
              </div>
              <div className="p-3 sm:p-5 rounded-lg bg-background border">
                <p className="text-sm sm:text-base font-medium text-muted-foreground mb-1.5 sm:mb-2">12-Month Projection</p>
                <p className="text-base sm:text-lg">{longTermOutlook.twelveMonths}</p>
              </div>
            </div>
            {longTermOutlook.keyMilestones.length > 0 && (
              <div>
                <p className="text-sm sm:text-base font-medium text-muted-foreground mb-2 sm:mb-3">Key Milestones</p>
                <ul className="space-y-2 sm:space-y-3">
                  {longTermOutlook.keyMilestones.map((milestone, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <span>{milestone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Premium-only: Competitor Insights */}
      {isPremium && competitorInsights && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
            <CardTitle className="flex flex-wrap items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <span>Competitor Insights</span>
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs sm:text-sm">
                Premium
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <p className="text-sm sm:text-lg leading-relaxed">{competitorInsights}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Consensus Points */}
      <ConsensusSection points={consensusPoints} />

      {/* Majority Points */}
      <MajoritySection points={majorityPoints} />

      {/* Dissent Points */}
      <DissentSection points={dissentPoints} />

      <Separator />

      {/* Individual Model Details */}
      <ModelDetailCards
        modelResponses={modelResponses || {}}
        selectedModels={selectedModels || []}
        modelWeights={modelWeights || {}}
        isPremium={isPremium}
        citations={citations}
      />
    </div>
  );
}
