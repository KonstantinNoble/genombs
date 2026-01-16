import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ConsensusPoint } from "@/hooks/useMultiAIValidation";

interface ConsensusSectionProps {
  points: ConsensusPoint[];
}

export function ConsensusSection({ points }: ConsensusSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <h3 className="text-lg font-semibold text-foreground">
          Full Consensus
        </h3>
        <span className="text-sm text-muted-foreground">
          (All 3 models agree)
        </span>
      </div>

      <div className="space-y-2">
        {points.map((point, index) => {
          const isExpanded = expandedIndex === index;
          
          return (
            <div
              key={index}
              className="rounded-xl border border-green-500/30 bg-green-500/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-green-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">{point.topic}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {point.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-600 bg-green-500/20 px-2 py-1 rounded-full">
                    {point.confidence}% confident
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-green-500/20">
                  <p className="text-sm text-foreground mb-3">{point.description}</p>
                  
                  {point.actionItems.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Recommended Actions
                      </p>
                      <ul className="space-y-1">
                        {point.actionItems.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500 mt-1">→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
