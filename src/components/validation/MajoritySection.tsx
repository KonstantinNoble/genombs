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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-blue-500/10 hover:bg-blue-500/15 rounded-xl transition-colors border border-blue-500/20">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-blue-700 text-lg">
            Majority Agreement
          </span>
          <Badge variant="secondary" className="text-sm bg-blue-500/20 text-blue-700 border-0 px-3 py-1">
            {points.length}
          </Badge>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
          <ChevronDown
            className={cn(
              "h-6 w-6 text-blue-600 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {points.map((point, index) => (
            <div
              key={index}
              className="bg-card border border-blue-500/20 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleCard(index)}
                className="w-full p-4 flex items-center justify-between hover:bg-blue-500/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-semibold text-base truncate">{point.topic}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge className={cn("text-sm border px-3 py-1", getConfidenceColor(point.confidence))}>
                    {point.confidence}%
                  </Badge>
                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        expandedCards.has(index) && "rotate-180",
                      )}
                    />
                  </div>
                </div>
              </button>

              {expandedCards.has(index) && (
                <div className="px-4 pb-4 space-y-3 border-t border-blue-500/20 pt-3 animate-fade-in">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{point.description}</p>
                  {point.supportingModels && point.supportingModels.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-muted-foreground">Agreed by:</span>
                      {point.supportingModels.map((model, modelIndex) => (
                        <Badge
                          key={modelIndex}
                          variant="outline"
                          className="text-xs px-2 py-1 bg-blue-500/10 border-blue-500/30 text-blue-600"
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