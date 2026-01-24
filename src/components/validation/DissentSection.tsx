import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { DissentIcon } from "./icons/DissentIcon";
import type { DissentPoint } from "@/hooks/useMultiAIValidation";

const MODEL_COLORS: Record<string, string> = {
  'GPT-5 Mini': 'text-blue-600',
  'GPT-5.2': 'text-blue-600',
  'GPT-5': 'text-emerald-600',
  'Gemini 3 Pro': 'text-purple-600',
  'Gemini Flash': 'text-green-600',
  'Gemini 3 Flash': 'text-green-600',
  'Claude Sonnet 4': 'text-orange-600',
  'Sonar Pro': 'text-indigo-600',
};

interface DissentSectionProps {
  points: DissentPoint[];
  defaultOpen?: boolean;
}

export function DissentSection({ points, defaultOpen = false }: DissentSectionProps) {
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
      <CollapsibleTrigger className="flex items-center justify-between w-full p-5 sm:p-6 bg-card hover:bg-muted/30 rounded-xl transition-all duration-300 border border-border/60 border-l-[3px] border-l-amber-500 group">
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/15 transition-colors shrink-0">
            <DissentIcon size={20} className="text-amber-600" />
          </div>
          <div className="flex flex-col items-start gap-0.5 min-w-0">
            <span className="font-semibold text-foreground text-base sm:text-lg">
              Points of Dissent
            </span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Models have different views
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-medium text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
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
                "border-l-[3px] border-l-amber-500",
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
                    {point.positions?.length || 0} views
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      expandedCards.has(index) && "rotate-180",
                    )}
                  />
                </div>
              </button>

              {expandedCards.has(index) && point.positions && (
                <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4 animate-fade-in">
                  {point.positions.map((pos, posIndex) => {
                    const colorClass = MODEL_COLORS[pos.modelName] || 'text-muted-foreground';
                    
                    return (
                      <div
                        key={posIndex}
                        className="p-4 rounded-lg bg-muted/20 border border-border/30"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className={cn("text-sm font-semibold", colorClass)}>
                            {pos.modelName}
                          </span>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted/50">
                            {pos.position}
                          </span>
                        </div>
                        <p className="text-base text-muted-foreground leading-relaxed">
                          {pos.reasoning}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
