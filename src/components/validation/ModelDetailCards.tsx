import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ModelResponse } from "@/hooks/useMultiAIValidation";
import { Label } from "@/components/ui/label";

interface ModelDetailCardsProps {
  gptResponse?: ModelResponse;
  geminiProResponse?: ModelResponse;
  geminiFlashResponse?: ModelResponse;
}

interface ModelCardProps {
  response?: ModelResponse;
  colorClass: string;
  bgClass: string;
}

function ModelCard({ response, colorClass, bgClass }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!response || response.error) {
    return (
      <div className={cn("rounded-xl border p-5", bgClass, "opacity-50")}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base">{response?.modelName || 'Unknown'}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {response?.error || 'No response available'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border overflow-hidden", bgClass)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div>
            <h4 className="font-semibold text-base text-foreground">{response.modelName}</h4>
            <p className="text-sm text-muted-foreground">
              {response.recommendations.length} recommendations · {response.overallConfidence}% confident
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-sm font-medium px-3 py-1.5 rounded-full", colorClass)}>
            {response.processingTimeMs}ms
          </span>
          <span className="text-muted-foreground text-base font-medium">
            {isExpanded ? "−" : "+"}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t space-y-4">
          <p className="text-base text-muted-foreground pt-4">{response.summary}</p>

          {response.recommendations.map((rec, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h5 className="font-semibold text-base text-foreground">{rec.title}</h5>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-muted px-2.5 py-1 rounded-full">
                    Risk: {rec.riskLevel}/5
                  </span>
                  <span className="text-sm bg-muted px-2.5 py-1 rounded-full">
                    {rec.confidence}%
                  </span>
                </div>
              </div>
              <p className="text-base text-muted-foreground">{rec.description}</p>
              
              {rec.actionItems.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Actions
                  </p>
                  <ul className="space-y-1.5">
                    {rec.actionItems.slice(0, 3).map((action, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">→</span>
                        <span className="text-foreground">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ModelDetailCards({
  gptResponse,
  geminiProResponse,
  geminiFlashResponse
}: ModelDetailCardsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">
        Individual Model Responses
      </h3>

      <div className="space-y-2">
        <ModelCard
          response={gptResponse}
          colorClass="bg-blue-500/20 text-blue-600"
          bgClass="border-blue-500/30 bg-blue-500/5"
        />
        <ModelCard
          response={geminiProResponse}
          colorClass="bg-purple-500/20 text-purple-600"
          bgClass="border-purple-500/30 bg-purple-500/5"
        />
        <ModelCard
          response={geminiFlashResponse}
          colorClass="bg-green-500/20 text-green-600"
          bgClass="border-green-500/30 bg-green-500/5"
        />
      </div>
    </div>
  );
}
