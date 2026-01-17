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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-green-500" />
        <h3 className="text-xl font-bold text-foreground">
          Full Consensus
        </h3>
        <span className="text-base text-muted-foreground">
          (All 3 models agree)
        </span>
      </div>

      <div className="space-y-3">
        {points.map((point, index) => {
          const isExpanded = expandedIndex === index;
          
          return (
            <div
              key={index}
              className="rounded-xl border border-green-500/30 bg-green-500/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-green-500/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{point.topic}</h4>
                    <p className="text-base text-muted-foreground line-clamp-1">
                      {point.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-green-600 bg-green-500/20 px-3 py-1.5 rounded-full">
                    {point.confidence}% confident
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {isExpanded ? "−" : "+"}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-green-500/20">
                  <p className="text-base text-foreground mb-4">{point.description}</p>
                  
                  {point.actionItems.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                        Recommended Actions
                      </p>
                      <ul className="space-y-2">
                        {point.actionItems.map((action, i) => (
                          <li key={i} className="flex items-start gap-3 text-base">
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
