import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ModelResponse } from "@/hooks/useMultiAIValidation";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ModelDetailCardsProps {
  gptResponse?: ModelResponse;
  geminiProResponse?: ModelResponse;
  geminiFlashResponse?: ModelResponse;
  isPremium?: boolean;
}

interface ModelCardProps {
  response?: ModelResponse;
  colorClass: string;
  bgClass: string;
  isPremium?: boolean;
}

function ModelCard({ response, colorClass, bgClass, isPremium = false }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

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

  // Free users see limited content
  const showFullContent = isPremium;
  const maxRecommendations = showFullContent ? response.recommendations.length : 1;
  const maxActionItems = showFullContent ? 7 : 2;

  return (
    <div className={cn("rounded-xl border overflow-hidden", bgClass)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-base text-foreground">{response.modelName}</h4>
              {!isPremium && (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Limited
                </Badge>
              )}
            </div>
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

          {response.recommendations.slice(0, maxRecommendations).map((rec, i) => (
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
                    {rec.actionItems.slice(0, maxActionItems).map((action, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">→</span>
                        <span className="text-foreground">{action}</span>
                      </li>
                    ))}
                    {!isPremium && rec.actionItems.length > maxActionItems && (
                      <li className="text-sm text-amber-600 italic">
                        +{rec.actionItems.length - maxActionItems} more actions (Premium)
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Premium-only fields */}
              {isPremium && (rec as any).competitiveAdvantage && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Competitive Advantage
                  </p>
                  <p className="text-sm text-foreground">{(rec as any).competitiveAdvantage}</p>
                </div>
              )}

              {isPremium && (rec as any).longTermImplications && (
                <div className="pt-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Long-term Implications
                  </p>
                  <p className="text-sm text-foreground">{(rec as any).longTermImplications}</p>
                </div>
              )}

              {isPremium && (rec as any).resourceRequirements && (
                <div className="pt-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Resource Requirements
                  </p>
                  <p className="text-sm text-foreground">{(rec as any).resourceRequirements}</p>
                </div>
              )}
            </div>
          ))}

          {/* Show upgrade prompt for free users */}
          {!isPremium && response.recommendations.length > maxRecommendations && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                +{response.recommendations.length - maxRecommendations} more recommendations available
              </p>
              <button 
                onClick={() => navigate('/pricing')}
                className="text-sm font-semibold text-amber-600 hover:text-amber-500 underline underline-offset-2 transition-colors"
              >
                Upgrade to Premium for full details →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ModelDetailCards({
  gptResponse,
  geminiProResponse,
  geminiFlashResponse,
  isPremium = false
}: ModelDetailCardsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">
          Individual Model Responses
        </h3>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
            Full Details
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <ModelCard
          response={gptResponse}
          colorClass="bg-blue-500/20 text-blue-600"
          bgClass="border-blue-500/30 bg-blue-500/5"
          isPremium={isPremium}
        />
        <ModelCard
          response={geminiProResponse}
          colorClass="bg-purple-500/20 text-purple-600"
          bgClass="border-purple-500/30 bg-purple-500/5"
          isPremium={isPremium}
        />
        <ModelCard
          response={geminiFlashResponse}
          colorClass="bg-green-500/20 text-green-600"
          bgClass="border-green-500/30 bg-green-500/5"
          isPremium={isPremium}
        />
      </div>
    </div>
  );
}
