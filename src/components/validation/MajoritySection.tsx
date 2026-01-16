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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-yellow-500" />
        <h3 className="text-xl font-bold text-foreground">
          Majority Agreement
        </h3>
        <span className="text-base text-muted-foreground">
          (2 of 3 models agree)
        </span>
      </div>

      <div className="space-y-3">
        {points.map((point, index) => {
          const isExpanded = expandedIndex === index;
          
          return (
            <div
              key={index}
              className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-yellow-500/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Users className="h-6 w-6 text-yellow-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{point.topic}</h4>
                    <p className="text-base text-muted-foreground line-clamp-1">
                      {point.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-yellow-600 bg-yellow-500/20 px-3 py-1.5 rounded-full">
                    {point.confidence}% confident
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-yellow-500/20">
                  <p className="text-base text-foreground mb-4">{point.description}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className="text-sm text-muted-foreground">Supported by:</span>
                    {point.supportingModels.map((model, i) => (
                      <span
                        key={i}
                        className="text-sm font-medium bg-yellow-500/20 text-yellow-700 px-3 py-1 rounded-full"
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
