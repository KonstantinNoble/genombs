import { useState } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-amber-500/10 hover:bg-amber-500/15 rounded-lg transition-colors border border-amber-500/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="font-semibold text-amber-700 text-sm">
            Points of Dissent
          </span>
          <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-700 border-0">
            {points.length}
          </Badge>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-amber-600 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-2">
        <div className="space-y-2">
          {points.map((point, index) => (
            <div
              key={index}
              className="bg-card border border-amber-500/20 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleCard(index)}
                className="w-full p-3 flex items-center justify-between hover:bg-amber-500/5 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-medium text-sm">{point.topic}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex gap-1">
                    {point.positions?.slice(0, 3).map((pos, posIndex) => (
                      <Badge
                        key={posIndex}
                        className={cn(
                          "text-[10px] px-1.5 py-0 border",
                          MODEL_BADGE_COLORS[pos.modelName] || "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {pos.modelName.split(" ")[0]}
                      </Badge>
                    ))}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-muted-foreground transition-transform",
                      expandedCards.has(index) && "rotate-180",
                    )}
                  />
                </div>
              </button>

              {expandedCards.has(index) && point.positions && (
                <div className="px-3 pb-3 space-y-2 border-t border-amber-500/20 pt-2 animate-fade-in">
                  {point.positions.map((pos, posIndex) => {
                    const colorClass = MODEL_COLORS[pos.modelName] || 'bg-muted/50 border-border text-muted-foreground';
                    
                    return (
                      <div
                        key={posIndex}
                        className={cn("p-2 rounded-md border", colorClass)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {pos.modelName}
                          </Badge>
                          <span className="text-xs font-medium text-foreground">{pos.position}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{pos.reasoning}</p>
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