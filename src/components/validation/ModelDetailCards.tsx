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
      <div className={cn("rounded-lg border p-4 sm:p-5", bgClass, "opacity-60")}>
        <Badge variant="outline" className="text-xs sm:text-sm bg-destructive/10 text-destructive border-destructive/30">
          {response?.error === "Request timed out" ? "Timed Out" : "Unavailable"}
        </Badge>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
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
    <div className={cn("rounded-lg border p-4 sm:p-5", bgClass)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-base sm:text-lg">{modelConfig?.name || response.modelName}</span>
          {response.isFallback && (
            <Badge variant="outline" className="text-xs sm:text-sm bg-amber-500/10 text-amber-600 border-amber-500/30">
              Fallback
            </Badge>
          )}
          {!isPremium && (
            <Badge variant="outline" className="text-xs sm:text-sm bg-amber-500/10 text-amber-600 border-amber-500/30">
              Limited
            </Badge>
          )}
        </div>
        <span className={cn("text-sm font-medium px-3 py-1 rounded-full", colorClass)}>
          {(response.processingTimeMs / 1000).toFixed(1)}s · {response.overallConfidence}%
        </span>
      </div>

      {/* Summary */}
      <p className="text-base sm:text-lg text-muted-foreground mb-4 leading-relaxed">{response.summary}</p>

      {/* Recommendations */}
      <div className="space-y-3">
        {response.recommendations.slice(0, maxRecommendations).map((rec, i) => (
          <div key={i} className="p-4 rounded-lg bg-muted/30 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h5 className="font-medium text-base sm:text-lg text-foreground">{rec.title}</h5>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-base bg-muted px-2 py-1 rounded">
                  Risk: {rec.riskLevel}/5
                </span>
                <span className={cn("text-base px-2 py-1 rounded-full", colorClass)}>
                  {rec.confidence}%
                </span>
              </div>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{rec.description}</p>
            
            {rec.actionItems && rec.actionItems.length > 0 && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-base font-medium text-muted-foreground mb-2">Actions</p>
                <ul className="space-y-1.5">
                  {rec.actionItems.slice(0, maxActionItems).map((action, j) => (
                    <li key={j} className="flex items-start gap-2 text-base sm:text-lg">
                      <span className="text-primary shrink-0">→</span>
                      <span className="text-foreground">{action}</span>
                    </li>
                  ))}
                  {!isPremium && rec.actionItems.length > maxActionItems && (
                    <li className="text-base text-amber-600 italic">
                      +{rec.actionItems.length - maxActionItems} more (Premium)
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Premium-only fields */}
            {isPremium && (rec as any).competitiveAdvantage && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-base font-medium text-muted-foreground mb-1">Competitive Advantage</p>
                <p className="text-base sm:text-lg text-foreground">{(rec as any).competitiveAdvantage}</p>
              </div>
            )}

            {isPremium && (rec as any).longTermImplications && (
              <div className="pt-3">
                <p className="text-base font-medium text-muted-foreground mb-1">Long-term Implications</p>
                <p className="text-base sm:text-lg text-foreground">{(rec as any).longTermImplications}</p>
              </div>
            )}

            {isPremium && (rec as any).resourceRequirements && (
              <div className="pt-3">
                <p className="text-base font-medium text-muted-foreground mb-1">Resource Requirements</p>
                <p className="text-base sm:text-lg text-foreground">{(rec as any).resourceRequirements}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upgrade Prompt */}
      {!isPremium && response.recommendations.length > maxRecommendations && (
        <button 
          onClick={() => navigate('/pricing')}
          className="w-full mt-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-center text-base sm:text-lg text-amber-600 hover:text-amber-500 transition-colors"
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          Model Responses
        </h3>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-sm">
            Full Details
          </Badge>
        )}
      </div>

      <Tabs defaultValue={defaultModel} className="w-full">
        <TabsList 
          className="w-full grid h-auto p-1.5 bg-muted/50" 
          style={{ gridTemplateColumns: `repeat(${Math.min(selectedModels.length, 3)}, 1fr)` }}
        >
          {selectedModels.map(modelKey => {
            const response = modelResponses[modelKey];
            const hasError = !response || response.error;
            const modelConfig = AVAILABLE_MODELS[modelKey];
            const colors = MODEL_COLORS[modelKey];
            
            return (
              <TabsTrigger 
                key={modelKey} 
                value={modelKey}
                className={cn(
                  "text-base py-3 px-3 font-medium transition-all",
                  "data-[state=active]:shadow-md",
                  hasError && "opacity-60",
                  // Farbige Tabs basierend auf Model
                  modelKey === 'gptMini' && "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
                  modelKey === 'gpt5' && "data-[state=active]:bg-emerald-500 data-[state=active]:text-white",
                  modelKey === 'sonarReasoning' && "data-[state=active]:bg-indigo-500 data-[state=active]:text-white",
                  modelKey === 'geminiPro' && "data-[state=active]:bg-purple-500 data-[state=active]:text-white",
                  modelKey === 'geminiFlash' && "data-[state=active]:bg-green-500 data-[state=active]:text-white",
                  modelKey === 'claude' && "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
                  modelKey === 'perplexity' && "data-[state=active]:bg-cyan-500 data-[state=active]:text-white",
                  // Inactive state mit leichter Farbe
                  modelKey === 'gptMini' && "data-[state=inactive]:bg-blue-500/10 data-[state=inactive]:text-blue-600",
                  modelKey === 'gpt5' && "data-[state=inactive]:bg-emerald-500/10 data-[state=inactive]:text-emerald-600",
                  modelKey === 'sonarReasoning' && "data-[state=inactive]:bg-indigo-500/10 data-[state=inactive]:text-indigo-600",
                  modelKey === 'geminiPro' && "data-[state=inactive]:bg-purple-500/10 data-[state=inactive]:text-purple-600",
                  modelKey === 'geminiFlash' && "data-[state=inactive]:bg-green-500/10 data-[state=inactive]:text-green-600",
                  modelKey === 'claude' && "data-[state=inactive]:bg-orange-500/10 data-[state=inactive]:text-orange-600",
                  modelKey === 'perplexity' && "data-[state=inactive]:bg-cyan-500/10 data-[state=inactive]:text-cyan-600"
                )}
              >
                <span className="truncate">{modelConfig?.name || modelKey}</span>
                {hasError && " (Error)"}
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
            <TabsContent key={modelKey} value={modelKey} className="mt-3">
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
        <div className="mt-5 p-5 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
          <h4 className="font-semibold text-lg sm:text-xl text-cyan-600 mb-4">
            Web Sources
          </h4>
          <ul className="space-y-3">
            {citations.slice(0, 5).map((citation, i) => (
              <li key={i} className="flex items-start gap-3 text-base sm:text-lg">
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
