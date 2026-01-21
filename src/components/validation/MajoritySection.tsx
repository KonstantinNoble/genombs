import { useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-500/10 hover:bg-blue-500/15 rounded-lg transition-colors border border-blue-500/20">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-blue-700 text-sm">
            Majority Agreement
          </span>
          <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-700 border-0">
            {points.length}
          </Badge>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-blue-600 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {points.map((point, index) => (
            <div
              key={index}
              className="bg-card border border-blue-500/20 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleCard(index)}
                className="w-full p-3 flex items-center justify-between hover:bg-blue-500/5 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-medium text-sm truncate">{point.topic}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={cn("text-xs border", getConfidenceColor(point.confidence))}>
                    {point.confidence}%
                  </Badge>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-muted-foreground transition-transform",
                      expandedCards.has(index) && "rotate-180",
                    )}
                  />
                </div>
              </button>

              {expandedCards.has(index) && (
                <div className="px-3 pb-3 space-y-2 border-t border-blue-500/20 pt-2 animate-fade-in">
                  <p className="text-xs text-muted-foreground leading-relaxed">{point.description}</p>
                  {point.supportingModels && point.supportingModels.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-xs text-muted-foreground mr-1">Agreed by:</span>
                      {point.supportingModels.map((model, modelIndex) => (
                        <Badge
                          key={modelIndex}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-blue-500/10 border-blue-500/30 text-blue-600"
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