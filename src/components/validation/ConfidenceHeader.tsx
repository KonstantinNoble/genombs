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
          Synoptas Synthesis
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-4">
        <div className="flex-1 order-2 sm:order-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{description}</p>
        </div>
        
        {/* Confidence Gauge */}
        <div className="order-1 sm:order-2 shrink-0 flex justify-center w-full sm:w-auto">
          <ConfidenceGauge value={confidence} size={isMobile ? 100 : 140} />
        </div>
      </div>

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
