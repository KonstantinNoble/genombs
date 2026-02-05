import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ConsensusIcon } from "./icons/ConsensusIcon";
import type { ConsensusPoint } from "@/hooks/useMultiAIValidation";

interface ConsensusSectionProps {
  points: ConsensusPoint[];
  defaultOpen?: boolean;
}

export function ConsensusSection({ points, defaultOpen = true }: ConsensusSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Check if we have any full consensus points
  const hasFullConsensus = points.some(p => p.agreementLevel === 'full');
  const hasPartialOnly = points.length > 0 && !hasFullConsensus;

  // Empty state - always render section
  if (points.length === 0) {
    return (
      <div className="p-4 sm:p-5 bg-green-50 dark:bg-green-950/30 rounded-xl border-l-4 border-l-green-500 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg shrink-0">
            <ConsensusIcon size={20} className="text-green-600 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-green-700 dark:text-green-400 text-base sm:text-xl block">
              Points of Agreement
            </span>
            <p className="text-sm text-green-600/70 dark:text-green-500/70 mt-1">
              No high-confidence overlaps detected. Models may still align on broader themes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "bg-green-500/10 text-green-600 border-green-500/30";
    if (value >= 60) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    if (value >= 40) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
    return "bg-red-500/10 text-red-600 border-red-500/30";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 sm:p-5 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 rounded-xl transition-all border-l-4 border-l-green-500 border border-green-200 dark:border-green-800 group animate-consensus-pulse">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform shrink-0">
            <ConsensusIcon size={20} className="text-green-600 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col items-start gap-0.5 sm:gap-1 min-w-0">
            <span className="font-bold text-green-700 dark:text-green-400 text-base sm:text-xl truncate">
              {hasPartialOnly ? 'Points of Agreement' : 'Full Consensus'}
            </span>
            <span className="text-xs text-green-600/70 dark:text-green-500/70 hidden sm:block">
              {hasPartialOnly ? 'Majority of models agree' : 'All models agree'}
            </span>
          </div>
          <Badge variant="secondary" className="text-sm sm:text-base bg-green-500/20 text-green-700 dark:text-green-300 border-0 px-2 sm:px-4 py-1 sm:py-1.5 shrink-0">
            {points.length}
          </Badge>
        </div>
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-500/20 flex items-center justify-center hover:bg-green-500/30 transition-colors shrink-0">
          <ChevronDown
            className={cn(
              "h-5 w-5 sm:h-6 sm:w-6 text-green-600 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-2">
        <div className="grid grid-cols-1 gap-4">
          {points.map((point, index) => (
            <div
              key={index}
              className="bg-card border-l-4 border-l-green-500 border border-green-200 dark:border-green-800 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleCard(index)}
                className="w-full p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-semibold text-base sm:text-xl leading-tight">{point.topic}</span>
                  {point.agreementLevel === 'partial' && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 shrink-0">
                      Partial
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0 self-end sm:self-auto">
                  <Badge className={cn("text-sm sm:text-base border px-2 sm:px-4 py-1 sm:py-1.5", getConfidenceColor(point.confidence))}>
                    {point.confidence}%
                  </Badge>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform",
                        expandedCards.has(index) && "rotate-180",
                      )}
                    />
                  </div>
                </div>
              </button>

              {expandedCards.has(index) && (
                <div className="px-5 pb-5 space-y-4 border-t border-green-200 dark:border-green-800 pt-4 animate-fade-in">
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{point.description}</p>
                  {point.actionItems && point.actionItems.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-base font-semibold text-foreground">Observations:</span>
                      <ul className="space-y-3">
                        {point.actionItems.map((action, actionIndex) => (
                          <li
                            key={actionIndex}
                            className="text-base sm:text-lg text-muted-foreground flex items-start gap-3"
                          >
                            <span className="text-green-500 shrink-0">→</span>
                            <span className="leading-relaxed">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
