import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { DissentPoint } from "@/hooks/useMultiAIValidation";

interface DissentSectionProps {
  points: DissentPoint[];
}

const MODEL_COLORS: Record<string, string> = {
  'GPT-5.2': 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  'Gemini 3 Pro': 'bg-purple-500/10 border-purple-500/30 text-purple-600',
  'Gemini Flash': 'bg-green-500/10 border-green-500/30 text-green-600',
  'Gemini 2.5 Flash': 'bg-green-500/10 border-green-500/30 text-green-600',
};

export function DissentSection({ points }: DissentSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <h3 className="text-lg font-semibold text-foreground">
          Points of Disagreement
        </h3>
        <span className="text-sm text-muted-foreground">
          (Models have different views)
        </span>
      </div>

      <div className="space-y-2">
        {points.map((point, index) => {
          const isExpanded = expandedIndex === index;
          
          return (
            <div
              key={index}
              className="rounded-xl border border-red-500/30 bg-red-500/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">{point.topic}</h4>
                    <p className="text-sm text-muted-foreground">
                      {point.positions.length} different perspectives
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-red-500/20 space-y-3">
                  <p className="text-xs text-muted-foreground pt-3">
                    Review each perspective to make an informed decision:
                  </p>
                  
                  <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
                    {point.positions.map((pos, i) => {
                      const colorClass = MODEL_COLORS[pos.modelName] || 'bg-muted border-border text-foreground';
                      
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border ${colorClass}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wide">
                              {pos.modelName}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            {pos.position}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pos.reasoning}
                          </p>
                        </div>
                      );
                    })}
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
