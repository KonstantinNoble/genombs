import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DissentIcon } from "./icons/DissentIcon";
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

const MODEL_BADGE_COLORS: Record<string, string> = {
  'GPT-5 Mini': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  'GPT-5.2': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  'GPT-5': 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  'Gemini 3 Pro': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  'Gemini Flash': 'bg-green-500/20 text-green-700 border-green-500/30',
  'Gemini 3 Flash': 'bg-green-500/20 text-green-700 border-green-500/30',
  'Claude Sonnet 4': 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  'Sonar Pro': 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-5 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 rounded-xl transition-all border-l-4 border-l-amber-500 border border-amber-200 dark:border-amber-800 group hover:animate-dissent-shake">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-amber-500/20 rounded-lg group-hover:scale-110 transition-transform">
            <DissentIcon size={24} className="text-amber-600" />
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="font-bold text-amber-700 dark:text-amber-400 text-lg sm:text-xl">
              Points of Dissent
            </span>
            <span className="text-xs text-amber-600/70 dark:text-amber-500/70 hidden sm:block">
              Models have different views
            </span>
          </div>
          <Badge variant="secondary" className="text-base bg-amber-500/20 text-amber-700 dark:text-amber-300 border-0 px-4 py-1.5">
            {points.length}
          </Badge>
        </div>
        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center hover:bg-amber-500/30 transition-colors">
          <ChevronDown
            className={cn(
              "h-6 w-6 text-amber-600 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-2">
        <div className="space-y-4">
          {points.map((point, index) => (
            <div
              key={index}
              className="bg-card border-l-4 border-l-amber-500 border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleCard(index)}
                className="w-full p-5 flex items-center justify-between hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors text-left"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="font-semibold text-lg sm:text-xl">{point.topic}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex gap-2">
                    {point.positions?.slice(0, 3).map((pos, posIndex) => (
                      <Badge
                        key={posIndex}
                        className={cn(
                          "text-sm px-3 py-1.5 border",
                          MODEL_BADGE_COLORS[pos.modelName] || "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {pos.modelName.split(" ")[0]}
                      </Badge>
                    ))}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        expandedCards.has(index) && "rotate-180",
                      )}
                    />
                  </div>
                </div>
              </button>

              {expandedCards.has(index) && point.positions && (
                <div className="px-5 pb-5 space-y-4 border-t border-amber-200 dark:border-amber-800 pt-4 animate-fade-in">
                  {point.positions.map((pos, posIndex) => {
                    const colorClass = MODEL_COLORS[pos.modelName] || 'bg-muted/50 border-border text-muted-foreground';
                    
                    return (
                      <div
                        key={posIndex}
                        className={cn("p-4 rounded-lg border", colorClass)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="text-sm px-3 py-1.5">
                            {pos.modelName}
                          </Badge>
                          <span className="text-base font-semibold text-foreground">{pos.position}</span>
                        </div>
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{pos.reasoning}</p>
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
