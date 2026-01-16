import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { MajorityPoint } from "@/hooks/useMultiAIValidation";

interface MajoritySectionProps {
  points: MajorityPoint[];
}

export function MajoritySection({ points }: MajoritySectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <h3 className="text-lg font-semibold text-foreground">
          Majority Agreement
        </h3>
        <span className="text-sm text-muted-foreground">
          (2 of 3 models agree)
        </span>
      </div>

      <div className="space-y-2">
        {points.map((point, index) => {
          const isExpanded = expandedIndex === index;
          
          return (
            <div
              key={index}
              className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-yellow-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-yellow-500 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">{point.topic}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {point.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-yellow-600 bg-yellow-500/20 px-2 py-1 rounded-full">
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
                <div className="px-4 pb-4 pt-0 border-t border-yellow-500/20">
                  <p className="text-sm text-foreground mb-3">{point.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">Supported by:</span>
                    {point.supportingModels.map((model, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium bg-yellow-500/20 text-yellow-700 px-2 py-0.5 rounded-full"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
