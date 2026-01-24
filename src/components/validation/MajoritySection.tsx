import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-5 sm:p-6 bg-card hover:bg-muted/30 rounded-xl transition-all duration-300 border border-border/60 border-l-[3px] border-l-blue-500 group">
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/15 transition-colors shrink-0">
            <MajorityIcon size={20} className="text-blue-600" />
          </div>
          <div className="flex flex-col items-start gap-0.5 min-w-0">
            <span className="font-semibold text-foreground text-base sm:text-lg">
              Majority Agreement
            </span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Most models agree
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-medium text-blue-600 bg-blue-500/10 px-3 py-1 rounded-full">
            {points.length}
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-1">
        <div className="space-y-3">
          {points.map((point, index) => (
            <div
              key={index}
              className={cn(
                "bg-card rounded-xl border border-border/50 overflow-hidden transition-all duration-300",
                "border-l-[3px] border-l-blue-500",
                "hover:border-border hover:shadow-sm hover:-translate-y-0.5"
              )}
            >
              <button
                onClick={() => toggleCard(index)}
                className="w-full p-5 flex items-start sm:items-center justify-between gap-4 text-left transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-base sm:text-lg text-foreground leading-snug block">
                    {point.topic}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-muted-foreground">
                    {point.confidence}%
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      expandedCards.has(index) && "rotate-180",
                    )}
                  />
                </div>
              </button>

              {expandedCards.has(index) && (
                <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4 animate-fade-in">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                  {point.supportingModels && point.supportingModels.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center pt-1">
                      <span className="text-sm text-muted-foreground">Supported by:</span>
                      {point.supportingModels.map((model, modelIndex) => (
                        <span
                          key={modelIndex}
                          className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 font-medium"
                        >
                          {model}
                        </span>
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
