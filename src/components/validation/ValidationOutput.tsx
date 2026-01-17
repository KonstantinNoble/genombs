import { ConfidenceHeader } from "./ConfidenceHeader";
import { ConsensusSection } from "./ConsensusSection";
import { MajoritySection } from "./MajoritySection";
import { DissentSection } from "./DissentSection";
import { ModelDetailCards } from "./ModelDetailCards";
import { StartExperimentButton } from "@/components/experiment/StartExperimentButton";
import type { ValidationResult } from "@/hooks/useMultiAIValidation";
import { Separator } from "@/components/ui/separator";

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
    processingTimeMs
  } = result;

  const hasTopActions = finalRecommendation.topActions && finalRecommendation.topActions.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Processing Time Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/50 border text-base text-muted-foreground">
          <span>Analysis completed in {(processingTimeMs / 1000).toFixed(1)}s</span>
        </div>
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
      />
    </div>
  );
}
