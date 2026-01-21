import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { MajorityPoint } from "@/hooks/useMultiAIValidation";

interface MajoritySectionProps {
  points: MajorityPoint[];
  defaultOpen?: boolean;
}

export function MajoritySection({ points, defaultOpen = true }: MajoritySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (points.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/15 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Majority Agreement
            </h3>
            <span className="text-sm text-muted-foreground">({points.length})</span>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 text-blue-600 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="space-y-3 pt-3">
          {points.map((point, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm sm:text-base text-foreground">{point.topic}</h4>
                <span className="text-sm font-medium text-blue-600 bg-blue-500/20 px-2.5 py-1 rounded-full">
                  {point.confidence}%
                </span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{point.description}</p>
              
              {point.supportingModels && point.supportingModels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Agreed by:</span>
                  {point.supportingModels.map((model, i) => (
                    <span
                      key={i}
                      className="text-sm font-medium bg-blue-500/20 text-blue-600 px-2.5 py-1 rounded"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
