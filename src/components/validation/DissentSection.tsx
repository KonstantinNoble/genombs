import { useState } from "react";
import type { DissentPoint } from "@/hooks/useMultiAIValidation";

const MODEL_COLORS: Record<string, string> = {
  'GPT-5 Mini': 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  'GPT-5.2': 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  'GPT-5': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
  'Gemini 3 Pro': 'bg-purple-500/10 border-purple-500/30 text-purple-600',
  'Gemini Flash': 'bg-green-500/10 border-green-500/30 text-green-600',
  'Gemini 3 Flash': 'bg-green-500/10 border-green-500/30 text-green-600',
  'Claude Sonnet 4': 'bg-orange-500/10 border-orange-500/30 text-orange-600',
  'Sonar Pro': 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600',
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <h3 className="text-sm sm:text-base font-bold text-foreground">
          Points of Dissent
        </h3>
        <span className="text-xs text-muted-foreground">
          ({points.length} topics)
        </span>
      </div>

      <div className="space-y-1.5">
        {points.map((point, index) => {
          const isExpanded = expandedIndex === index;
          
          return (
            <div
              key={index}
              className="rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 text-left hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">{point.topic}</h4>
                  {!isExpanded && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {point.positions?.length || 0} different perspectives
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-medium text-amber-600 bg-amber-500/20 px-1.5 py-0.5 rounded-full">
                    {point.positions?.length || 0} views
                  </span>
                  <span className="text-muted-foreground text-xs w-4 text-center">
                    {isExpanded ? "−" : "+"}
                  </span>
                </div>
              </button>

              {isExpanded && point.positions && (
                <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 border-t border-amber-500/20">
                  <p className="text-xs text-muted-foreground mt-2 mb-2">
                    Review each perspective to make an informed decision:
                  </p>
                  
                  <div className="space-y-2">
                    {point.positions.map((pos, pIndex) => {
                      const colorClass = MODEL_COLORS[pos.modelName] || 'bg-muted border-border text-muted-foreground';
                      
                      return (
                        <div
                          key={pIndex}
                          className={`p-2.5 rounded-lg border ${colorClass}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wide">
                              {pos.modelName}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            {pos.position}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
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
