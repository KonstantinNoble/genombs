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

interface ValidationOutputProps {
  result: ValidationResult;
  validationId?: string;
  onStartExperiment?: () => void;
}

export function ValidationOutput({ result, validationId, onStartExperiment }: ValidationOutputProps) {
  const {
    gptResponse,
    geminiProResponse,
    geminiFlashResponse,
    consensusPoints,
    majorityPoints,
    dissentPoints,
    finalRecommendation,
    overallConfidence,
    synthesisReasoning,
    processingTimeMs,
    isPremium,
    strategicAlternatives,
    longTermOutlook,
    competitorInsights
  } = result;

  const hasTopActions = finalRecommendation.topActions && finalRecommendation.topActions.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Processing Time Badge */}
      <div className="flex justify-center gap-2">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/50 border text-base text-muted-foreground">
          <span>Analysis completed in {(processingTimeMs / 1000).toFixed(1)}s</span>
        </div>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
            Premium Analysis
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
        <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="font-bold text-xl text-foreground mb-5">
            Top Priority Actions
            {isPremium && <span className="text-sm font-normal text-muted-foreground ml-2">(Premium: 7 actions)</span>}
          </h3>
          <ol className="space-y-4">
            {finalRecommendation.topActions!.map((action, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-bold">
                  {i + 1}
                </span>
                <span className="text-base text-foreground pt-1.5 leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>

          {/* Start Experiment Button */}
          {validationId && onStartExperiment && (
            <div className="mt-6 pt-4 border-t border-primary/20">
              <StartExperimentButton onClick={onStartExperiment} />
            </div>
          )}
        </div>
      )}

      {/* Premium-only: Strategic Alternatives */}
      {isPremium && strategicAlternatives && strategicAlternatives.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Strategic Alternatives</span>
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs">
                Premium
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {strategicAlternatives.map((alt, i) => (
              <div key={i} className="p-4 rounded-lg bg-background border">
                <h4 className="font-semibold text-base mb-2">{alt.scenario}</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-primary mb-1">Pros</p>
                    <ul className="space-y-1">
                      {alt.pros.map((pro, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-primary">+</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-destructive mb-1">Cons</p>
                    <ul className="space-y-1">
                      {alt.cons.map((con, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-destructive">−</span>
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
          </CardContent>
        </Card>
      )}

      {/* Premium-only: Long-term Outlook */}
      {isPremium && longTermOutlook && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Long-term Outlook</span>
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs">
                Premium
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm font-medium text-muted-foreground mb-1">6-Month Projection</p>
                <p className="text-base">{longTermOutlook.sixMonths}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm font-medium text-muted-foreground mb-1">12-Month Projection</p>
                <p className="text-base">{longTermOutlook.twelveMonths}</p>
              </div>
            </div>
            {longTermOutlook.keyMilestones.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Key Milestones</p>
                <ul className="space-y-2">
                  {longTermOutlook.keyMilestones.map((milestone, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Competitor Insights</span>
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs">
                Premium
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base">{competitorInsights}</p>
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
        gptResponse={gptResponse}
        geminiProResponse={geminiProResponse}
        geminiFlashResponse={geminiFlashResponse}
        isPremium={isPremium}
      />
    </div>
  );
}
