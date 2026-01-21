import { useState } from "react";
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <h3 className="text-sm sm:text-base font-bold text-foreground">
          Full Consensus
        </h3>
        <span className="text-xs text-muted-foreground">
          ({points.length} points)
        </span>
      </div>

      <div className="space-y-1.5">
        {points.map((point, index) => {
          const isExpanded = expandedIndex === index;
          
          return (
            <div
              key={index}
              className="rounded-lg border border-green-500/30 bg-green-500/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 text-left hover:bg-green-500/10 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">{point.topic}</h4>
                  {!isExpanded && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {point.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-medium text-green-600 bg-green-500/20 px-1.5 py-0.5 rounded-full">
                    {point.confidence}%
                  </span>
                  <span className="text-muted-foreground text-xs w-4 text-center">
                    {isExpanded ? "−" : "+"}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 border-t border-green-500/20">
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    {point.description}
                  </p>
                  
                  {point.actionItems && point.actionItems.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Actions
                      </p>
                      <ul className="space-y-1">
                        {point.actionItems.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                            <span className="text-green-500 shrink-0">→</span>
                            <span className="text-foreground">{action}</span>
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
