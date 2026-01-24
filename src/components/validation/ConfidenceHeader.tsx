import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { SynthesisIcon } from "./icons/SynthesisIcon";
import { ConfidenceGauge } from "./icons/ConfidenceGauge";
import { useIsMobile } from "@/hooks/use-mobile";

interface ConfidenceHeaderProps {
  title: string;
  description: string;
  confidence: number;
  reasoning?: string;
}

export function ConfidenceHeader({
  title,
  description,
  confidence,
  reasoning,
}: ConfidenceHeaderProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      {/* Header with Synthesis Icon */}
      <div className="flex items-center gap-3 mb-4">
        <SynthesisIcon size={28} className="text-primary shrink-0" />
        <span className="text-sm font-medium text-primary uppercase tracking-wider">
          Decision Documentation Summary
        </span>
      </div>

      {/* Mobile: Stacked layout, Desktop: Side by side */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-4">
        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-3xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{description}</p>
        </div>
        
        {/* Confidence Gauge - Centered on mobile, right-aligned on desktop */}
        <div className="shrink-0 flex justify-center sm:justify-end pt-2 sm:pt-0">
          <ConfidenceGauge value={confidence} size={isMobile ? 100 : 140} />
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs sm:text-sm text-muted-foreground mt-4 italic border-t border-primary/10 pt-4">
        This analysis documents perspectives. The final decision remains with you.
      </p>

      {/* Collapsible Reasoning */}
      {reasoning && (
        <div className="mt-4">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
          >
            <ChevronDown className={cn("h-5 w-5 transition-transform", showReasoning && "rotate-180")} />
            {showReasoning ? "Hide reasoning" : "Show reasoning"}
          </button>
          
          {showReasoning && (
            <div className="mt-3 bg-muted/30 rounded-lg p-4 border-l-2 border-primary/50 animate-fade-in">
              <p className="text-sm sm:text-base text-muted-foreground italic leading-relaxed">{reasoning}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
