import { cn } from "@/lib/utils";
import type { ModelResponse } from "@/hooks/useMultiAIValidation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { AVAILABLE_MODELS } from "./ModelSelector";

interface ModelDetailCardsProps {
  modelResponses: Record<string, ModelResponse>;
  selectedModels: string[];
  isPremium?: boolean;
  citations?: string[];
}

interface ModelCardContentProps {
  response?: ModelResponse;
  modelKey: string;
  colorClass: string;
  bgClass: string;
  isPremium?: boolean;
}

// Model color mappings
const MODEL_COLORS: Record<string, { colorClass: string; bgClass: string }> = {
  gptMini: { colorClass: "bg-blue-500/20 text-blue-600", bgClass: "border-blue-500/30 bg-blue-500/5" },
  gpt5: { colorClass: "bg-emerald-500/20 text-emerald-600", bgClass: "border-emerald-500/30 bg-emerald-500/5" },
  sonarReasoning: { colorClass: "bg-indigo-500/20 text-indigo-600", bgClass: "border-indigo-500/30 bg-indigo-500/5" },
  geminiPro: { colorClass: "bg-purple-500/20 text-purple-600", bgClass: "border-purple-500/30 bg-purple-500/5" },
  geminiFlash: { colorClass: "bg-green-500/20 text-green-600", bgClass: "border-green-500/30 bg-green-500/5" },
  claude: { colorClass: "bg-orange-500/20 text-orange-600", bgClass: "border-orange-500/30 bg-orange-500/5" },
  perplexity: { colorClass: "bg-cyan-500/20 text-cyan-600", bgClass: "border-cyan-500/30 bg-cyan-500/5" },
};

function ModelCardContent({ response, modelKey, colorClass, bgClass, isPremium = false }: ModelCardContentProps) {
  const navigate = useNavigate();
  const modelConfig = AVAILABLE_MODELS[modelKey];

  if (!response || response.error) {
    return (
      <div className={cn("rounded-lg border p-3 sm:p-4", bgClass, "opacity-60")}>
        <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
          {response?.error === "Request timed out" ? "Timed Out" : "Unavailable"}
        </Badge>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          {response?.error === "Request timed out" 
            ? "Model timed out. Analysis continued with other models."
            : response?.error || 'No response available'
          }
        </p>
      </div>
    );
  }

  const showFullContent = isPremium;
  const maxRecommendations = showFullContent ? response.recommendations.length : 1;
  const maxActionItems = showFullContent ? 7 : 2;

  return (
    <div className={cn("rounded-lg border p-3 sm:p-4", bgClass)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-sm">{modelConfig?.name || response.modelName}</span>
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
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", colorClass)}>
          {(response.processingTimeMs / 1000).toFixed(1)}s · {response.overallConfidence}%
        </span>
      </div>

      {/* Summary */}
      <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">{response.summary}</p>

      {/* Recommendations */}
      <div className="space-y-2">
        {response.recommendations.slice(0, maxRecommendations).map((rec, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-muted/30 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h5 className="font-medium text-xs sm:text-sm text-foreground">{rec.title}</h5>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  Risk: {rec.riskLevel}/5
                </span>
                <span className={cn("text-xs px-1.5 py-0.5 rounded-full", colorClass)}>
                  {rec.confidence}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
            
            {rec.actionItems && rec.actionItems.length > 0 && (
              <div className="pt-1.5 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Actions
                </p>
                <ul className="space-y-0.5">
                  {rec.actionItems.slice(0, maxActionItems).map((action, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs">
                      <span className="text-primary shrink-0">→</span>
                      <span className="text-foreground">{action}</span>
                    </li>
                  ))}
                  {!isPremium && rec.actionItems.length > maxActionItems && (
                    <li className="text-xs text-amber-600 italic">
                      +{rec.actionItems.length - maxActionItems} more (Premium)
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Premium-only fields */}
            {isPremium && (rec as any).competitiveAdvantage && (
              <div className="pt-1.5 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Competitive Advantage
                </p>
                <p className="text-xs text-foreground">{(rec as any).competitiveAdvantage}</p>
              </div>
            )}

            {isPremium && (rec as any).longTermImplications && (
              <div className="pt-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Long-term Implications
                </p>
                <p className="text-xs text-foreground">{(rec as any).longTermImplications}</p>
              </div>
            )}

            {isPremium && (rec as any).resourceRequirements && (
              <div className="pt-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Resource Requirements
                </p>
                <p className="text-xs text-foreground">{(rec as any).resourceRequirements}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upgrade Prompt */}
      {!isPremium && response.recommendations.length > maxRecommendations && (
        <button 
          onClick={() => navigate('/pricing')}
          className="w-full mt-2 p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-center text-xs text-amber-600 hover:text-amber-500 transition-colors"
        >
          +{response.recommendations.length - maxRecommendations} more recommendations (Premium) →
        </button>
      )}
    </div>
  );
}

export function ModelDetailCards({
  modelResponses,
  selectedModels,
  isPremium = false,
  citations
}: ModelDetailCardsProps) {
  const defaultModel = selectedModels.find(key => 
    modelResponses[key] && !modelResponses[key].error
  ) || selectedModels[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm sm:text-base font-bold text-foreground">
          Model Responses
        </h3>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs">
            Full Details
          </Badge>
        )}
      </div>

      <Tabs defaultValue={defaultModel} className="w-full">
        <TabsList 
          className="w-full grid h-auto p-1" 
          style={{ gridTemplateColumns: `repeat(${Math.min(selectedModels.length, 3)}, 1fr)` }}
        >
          {selectedModels.map(modelKey => {
            const response = modelResponses[modelKey];
            const hasError = !response || response.error;
            const modelConfig = AVAILABLE_MODELS[modelKey];
            
            return (
              <TabsTrigger 
                key={modelKey} 
                value={modelKey}
                className={cn(
                  "text-xs py-1.5 px-1",
                  hasError && "opacity-60"
                )}
              >
                <span className="truncate">{modelConfig?.name || modelKey}</span>
                {hasError && " ⚠"}
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {selectedModels.map(modelKey => {
          const colors = MODEL_COLORS[modelKey] || { 
            colorClass: "bg-muted text-muted-foreground", 
            bgClass: "border-border bg-muted/5" 
          };
          
          return (
            <TabsContent key={modelKey} value={modelKey} className="mt-2">
              <ModelCardContent
                response={modelResponses[modelKey]}
                modelKey={modelKey}
                colorClass={colors.colorClass}
                bgClass={colors.bgClass}
                isPremium={isPremium}
              />
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Citations */}
      {citations && citations.length > 0 && (
        <div className="mt-3 p-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
          <h4 className="font-semibold text-xs text-cyan-600 mb-2">
            Web Sources
          </h4>
          <ul className="space-y-1">
            {citations.slice(0, 5).map((citation, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs">
                <span className="text-cyan-600 shrink-0">[{i + 1}]</span>
                <a 
                  href={citation} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-600 hover:text-cyan-500 underline underline-offset-2 break-all"
                >
                  {citation}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
