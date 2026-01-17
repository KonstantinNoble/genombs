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
      <div className={cn("rounded-xl border p-6", bgClass, "opacity-60")}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">{response?.modelName || 'Unknown'}</span>
          <Badge variant="outline" className="text-sm bg-destructive/10 text-destructive border-destructive/30">
            {response?.error === "Request timed out" ? "Timed Out" : "Unavailable"}
          </Badge>
        </div>
        <p className="text-base text-muted-foreground mt-3">
          {response?.error === "Request timed out" 
            ? "This model took too long to respond. Analysis continued with other models."
            : response?.error || 'No response available'
          }
        </p>
        {response?.isFallback && (
          <p className="text-sm text-amber-600 mt-2">
            A faster model was used as fallback.
          </p>
        )}
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
        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-lg text-foreground">{response.modelName}</h4>
              {response.isFallback && (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Fallback
                </Badge>
              )}
              {!isPremium && (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Limited
                </Badge>
              )}
            </div>
            <p className="text-base text-muted-foreground mt-1">
              {response.recommendations.length} recommendations · {response.overallConfidence}% confident
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-base font-medium px-4 py-2 rounded-full", colorClass)}>
            {(response.processingTimeMs / 1000).toFixed(1)}s
          </span>
          <span className="text-muted-foreground text-lg font-medium">
            {isExpanded ? "−" : "+"}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t space-y-5">
          <p className="text-lg text-muted-foreground pt-5 leading-relaxed">{response.summary}</p>

          {response.recommendations.slice(0, maxRecommendations).map((rec, i) => (
            <div key={i} className="p-5 rounded-lg bg-muted/30 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h5 className="font-semibold text-lg text-foreground">{rec.title}</h5>
                <div className="flex items-center gap-2">
                  <span className="text-base bg-muted px-3 py-1.5 rounded-full">
                    Risk: {rec.riskLevel}/5
                  </span>
                  <span className="text-base bg-muted px-3 py-1.5 rounded-full">
                    {rec.confidence}%
                  </span>
                </div>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">{rec.description}</p>
              
              {rec.actionItems.length > 0 && (
                <div className="pt-3">
                  <p className="text-base font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Actions
                  </p>
                  <ul className="space-y-2">
                    {rec.actionItems.slice(0, maxActionItems).map((action, j) => (
                      <li key={j} className="flex items-start gap-3 text-base">
                        <span className="text-primary mt-0.5">→</span>
                        <span className="text-foreground">{action}</span>
                      </li>
                    ))}
                    {!isPremium && rec.actionItems.length > maxActionItems && (
                      <li className="text-base text-amber-600 italic">
                        +{rec.actionItems.length - maxActionItems} more actions (Premium)
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Premium-only fields */}
              {isPremium && (rec as any).competitiveAdvantage && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-base font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Competitive Advantage
                  </p>
                  <p className="text-base text-foreground">{(rec as any).competitiveAdvantage}</p>
                </div>
              )}

              {isPremium && (rec as any).longTermImplications && (
                <div className="pt-3">
                  <p className="text-base font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Long-term Implications
                  </p>
                  <p className="text-base text-foreground">{(rec as any).longTermImplications}</p>
                </div>
              )}

              {isPremium && (rec as any).resourceRequirements && (
                <div className="pt-3">
                  <p className="text-base font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Resource Requirements
                  </p>
                  <p className="text-base text-foreground">{(rec as any).resourceRequirements}</p>
                </div>
              )}
            </div>
          ))}

          {/* Show upgrade prompt for free users */}
          {!isPremium && response.recommendations.length > maxRecommendations && (
            <div className="p-5 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-center">
              <p className="text-base text-muted-foreground mb-3">
                +{response.recommendations.length - maxRecommendations} more recommendations available
              </p>
              <button 
                onClick={() => navigate('/pricing')}
                className="text-base font-semibold text-amber-600 hover:text-amber-500 underline underline-offset-2 transition-colors"
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">
          Individual Model Responses
        </h3>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-sm">
            Full Details
          </Badge>
        )}
      </div>

      <div className="space-y-4">
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
