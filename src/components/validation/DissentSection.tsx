import { useState } from "react";
import type { DissentPoint } from "@/hooks/useMultiAIValidation";

const MODEL_COLORS: Record<string, string> = {
  'GPT-5 Mini': 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  'GPT-5.2': 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  'Gemini 3 Pro': 'bg-purple-500/10 border-purple-500/30 text-purple-600',
  'Gemini Flash': 'bg-green-500/10 border-green-500/30 text-green-600',
  'Gemini 3 Flash': 'bg-green-500/10 border-green-500/30 text-green-600',
};

interface DissentSectionProps {
  points: DissentPoint[];
}

export function DissentSection({ points }: DissentSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-red-500" />
        <h3 className="text-xl font-bold text-foreground">
          Points of Disagreement
        </h3>
        <span className="text-base text-muted-foreground">
          (Models have different views)
        </span>
      </div>

      <div className="space-y-3">
        {points.map((point, index) => {
          const isExpanded = expandedIndex === index;
          
          return (
            <div
              key={index}
              className="rounded-xl border border-red-500/30 bg-red-500/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{point.topic}</h4>
                    <p className="text-base text-muted-foreground">
                      {point.positions.length} different perspectives
                    </p>
                  </div>
                </div>
                <span className="text-muted-foreground text-sm">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-red-500/20 space-y-4">
                  <p className="text-base text-muted-foreground pt-4">
                    Review each perspective to make an informed decision:
                  </p>
                  
                  <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
                    {point.positions.map((pos, i) => {
                      const colorClass = MODEL_COLORS[pos.modelName] || 'bg-muted border-border text-foreground';
                      
                      return (
                        <div
                          key={i}
                          className={`p-5 rounded-xl border ${colorClass}`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-bold uppercase tracking-wide">
                              {pos.modelName}
                            </span>
                          </div>
                          <p className="text-base font-semibold text-foreground mb-2">
                            {pos.position}
                          </p>
                          <p className="text-base text-muted-foreground">
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
