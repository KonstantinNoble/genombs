import { ChevronDown, ChevronUp, Zap, TrendingUp, Shield } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ModelResponse } from "@/hooks/useMultiAIValidation";

interface ModelDetailCardsProps {
  gptResponse?: ModelResponse;
  geminiProResponse?: ModelResponse;
  geminiFlashResponse?: ModelResponse;
}

interface ModelCardProps {
  response?: ModelResponse;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

function ModelCard({ response, icon, colorClass, bgClass }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!response || response.error) {
    return (
      <div className={cn("rounded-xl border p-4", bgClass, "opacity-50")}>
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold">{response?.modelName || 'Unknown'}</span>
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
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h4 className="font-semibold text-foreground">{response.modelName}</h4>
            <p className="text-sm text-muted-foreground">
              {response.recommendations.length} recommendations • {response.overallConfidence}% confident
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", colorClass)}>
            {response.processingTimeMs}ms
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t space-y-4">
          <p className="text-sm text-muted-foreground pt-3">{response.summary}</p>

          {response.recommendations.map((rec, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-foreground">{rec.title}</h5>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-muted px-2 py-0.5 rounded">
                    Risk: {rec.riskLevel}/5
                  </span>
                  <span className="bg-muted px-2 py-0.5 rounded">
                    {rec.confidence}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
              
              {rec.actionItems.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Actions:
                  </p>
                  <ul className="text-xs space-y-0.5">
                    {rec.actionItems.slice(0, 3).map((action, j) => (
                      <li key={j} className="flex items-start gap-1">
                        <span className="text-primary">•</span>
                        <span>{action}</span>
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
          icon={<Zap className="h-5 w-5 text-blue-500" />}
          colorClass="bg-blue-500/20 text-blue-600"
          bgClass="border-blue-500/30 bg-blue-500/5"
        />
        <ModelCard
          response={geminiProResponse}
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
          colorClass="bg-purple-500/20 text-purple-600"
          bgClass="border-purple-500/30 bg-purple-500/5"
        />
        <ModelCard
          response={geminiFlashResponse}
          icon={<Shield className="h-5 w-5 text-green-500" />}
          colorClass="bg-green-500/20 text-green-600"
          bgClass="border-green-500/30 bg-green-500/5"
        />
      </div>
    </div>
  );
}
