import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MajorityIcon } from "./icons/MajorityIcon";
import type { MajorityPoint } from "@/hooks/useMultiAIValidation";

interface MajoritySectionProps {
  points: MajorityPoint[];
  defaultOpen?: boolean;
}

export function MajoritySection({ points, defaultOpen = true }: MajoritySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  if (points.length === 0) return null;

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
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 sm:p-5 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-xl transition-all border-l-4 border-l-blue-500 border border-blue-200 dark:border-blue-800 group hover:animate-majority-wiggle">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform shrink-0">
            <MajorityIcon size={20} className="text-blue-600 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col items-start gap-0.5 sm:gap-1 min-w-0">
            <span className="font-bold text-blue-700 dark:text-blue-400 text-base sm:text-xl truncate">
              Majority Agreement
            </span>
            <span className="text-xs text-blue-600/70 dark:text-blue-500/70 hidden sm:block">
              Most models agree (≥60% weight)
            </span>
          </div>
          <Badge variant="secondary" className="text-sm sm:text-base bg-blue-500/20 text-blue-700 dark:text-blue-300 border-0 px-2 sm:px-4 py-1 sm:py-1.5 shrink-0">
            {points.length}
          </Badge>
        </div>
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30 transition-colors shrink-0">
          <ChevronDown
            className={cn(
              "h-5 w-5 sm:h-6 sm:w-6 text-blue-600 transition-transform",
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
              className="bg-card border-l-4 border-l-blue-500 border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleCard(index)}
                className="w-full p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors text-left"
              >
                <span className="font-semibold text-base sm:text-xl leading-tight">{point.topic}</span>
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
                <div className="px-5 pb-5 space-y-4 border-t border-blue-200 dark:border-blue-800 pt-4 animate-fade-in">
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{point.description}</p>
                  {point.supportingModels && point.supportingModels.length > 0 && (
                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="text-base text-muted-foreground">Agreed by:</span>
                      {point.supportingModels.map((model, modelIndex) => (
                        <Badge
                          key={modelIndex}
                          variant="outline"
                          className="text-sm px-3 py-1.5 bg-blue-500/10 border-blue-500/30 text-blue-600"
                        >
                          {model}
                        </Badge>
                      ))}
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
