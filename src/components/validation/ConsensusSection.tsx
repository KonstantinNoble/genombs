import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ConsensusPoint } from "@/hooks/useMultiAIValidation";

interface ConsensusSectionProps {
  points: ConsensusPoint[];
  defaultOpen?: boolean;
}

export function ConsensusSection({ points, defaultOpen = true }: ConsensusSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (points.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/15 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Full Consensus
            </h3>
            <span className="text-sm text-muted-foreground">({points.length})</span>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 text-green-600 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="space-y-3 pt-3">
          {points.map((point, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-green-500/30 bg-green-500/5"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-semibold text-base sm:text-lg text-foreground">{point.topic}</h4>
                <span className="text-base font-medium text-green-600 bg-green-500/20 px-2.5 py-1 rounded-full">
                  {point.confidence}%
                </span>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{point.description}</p>
              
              {point.actionItems && point.actionItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-500/20">
                  <p className="text-base font-medium text-muted-foreground mb-2">Actions</p>
                  <ul className="space-y-2">
                    {point.actionItems.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-base sm:text-lg">
                        <span className="text-green-500 shrink-0">→</span>
                        <span className="text-foreground">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
