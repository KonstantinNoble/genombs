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
    <div className="space-y-6 animate-fade-in">
      {/* Processing Time & Models Badge */}
      <div className="flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border text-sm text-muted-foreground">
          <span>Completed in {(processingTimeMs / 1000).toFixed(1)}s</span>
        </div>
        <div className="text-sm text-muted-foreground text-center">
          {modelSummary}
        </div>
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
        <div className="p-4 sm:p-5 rounded-lg bg-primary/5 border border-primary/20">
          <h3 className="font-bold text-base sm:text-lg text-foreground mb-3">
            Top Priority Actions
            {isPremium && <span className="text-sm font-normal text-muted-foreground ml-2">(Premium: 7 actions)</span>}
          </h3>
          <ol className="space-y-3">
            {finalRecommendation.topActions!.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-sm sm:text-base text-foreground pt-1 leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>

          {/* Start Experiment Button */}
          {validationId && onStartExperiment && (
            <div className="mt-4 pt-4 border-t border-primary/20">
              <StartExperimentButton onClick={onStartExperiment} />
            </div>
          )}
        </div>
      )}

      {/* Premium Insights - Direct Display */}
      {hasPremiumInsights && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg text-foreground">Premium Insights</span>
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-sm">
              Premium
            </Badge>
          </div>
          
          {/* Strategic Alternatives */}
          {strategicAlternatives && strategicAlternatives.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm sm:text-base text-foreground mb-3">Strategic Alternatives</h4>
              <div className="space-y-3">
                {strategicAlternatives.map((alt, i) => (
                  <div key={i} className="p-4 rounded-lg bg-background border">
                    <h5 className="font-semibold text-sm sm:text-base mb-3">{alt.scenario}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-primary mb-2 text-sm">Pros</p>
                        <ul className="space-y-1.5">
                          {alt.pros.map((pro, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <span className="text-primary shrink-0">+</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-destructive mb-2 text-sm">Cons</p>
                        <ul className="space-y-1.5">
                          {alt.cons.map((con, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <span className="text-destructive shrink-0">−</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      <span className="font-medium">Best for:</span> {alt.bestFor}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Long-term Outlook */}
          {longTermOutlook && (
            <div>
              <h4 className="font-semibold text-sm sm:text-base text-foreground mb-3">Long-term Outlook</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="p-3 sm:p-4 rounded-lg bg-background border">
                  <p className="text-sm font-medium text-muted-foreground mb-1">6-Month</p>
                  <p className="text-sm sm:text-base">{longTermOutlook.sixMonths}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-background border">
                  <p className="text-sm font-medium text-muted-foreground mb-1">12-Month</p>
                  <p className="text-sm sm:text-base">{longTermOutlook.twelveMonths}</p>
                </div>
              </div>
              {longTermOutlook.keyMilestones && longTermOutlook.keyMilestones.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Key Milestones</p>
                  <ul className="space-y-2">
                    {longTermOutlook.keyMilestones.map((milestone, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm sm:text-base">
                        <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Competitor Insights */}
          {competitorInsights && (
            <div>
              <h4 className="font-semibold text-sm sm:text-base text-foreground mb-2">Competitor Insights</h4>
              <p className="text-sm sm:text-base leading-relaxed">{competitorInsights}</p>
            </div>
          )}
        </div>
      )}

      <Separator className="my-4" />

      {/* Analysis Points - Single Column */}
      <div className="space-y-5">
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
