import { ConfidenceHeader } from "./ConfidenceHeader";
import { ConsensusSection } from "./ConsensusSection";
import { MajoritySection } from "./MajoritySection";
import { DissentSection } from "./DissentSection";
import { ModelDetailCards } from "./ModelDetailCards";
import type { ValidationResult } from "@/hooks/useMultiAIValidation";
import { Separator } from "@/components/ui/separator";
import { Clock, ArrowRight } from "lucide-react";

interface ValidationOutputProps {
  result: ValidationResult;
}

export function ValidationOutput({ result }: ValidationOutputProps) {
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Processing Time Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
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
      {finalRecommendation.topActions && finalRecommendation.topActions.length > 0 && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Top Priority Actions
          </h3>
          <ol className="space-y-2">
            {finalRecommendation.topActions.map((action, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-foreground pt-0.5">{action}</span>
              </li>
            ))}
          </ol>
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
