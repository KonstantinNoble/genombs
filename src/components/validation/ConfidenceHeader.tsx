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
    <div className="relative p-6 sm:p-8 rounded-2xl bg-card border border-border/60 overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.04] pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header label */}
        <div className="flex items-center gap-3 mb-6">
          <SynthesisIcon size={24} className="text-primary/70 shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">
            Decision Summary
          </span>
        </div>

        {/* Main content area - Centered gauge on mobile, side-by-side on desktop */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-8">
          {/* Confidence Gauge - Centered as hero element */}
          <div className="shrink-0 order-first sm:order-last">
            <ConfidenceGauge value={confidence} size={isMobile ? 120 : 150} />
          </div>
          
          {/* Text Content */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight tracking-tight">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              {description}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/70 mt-8 pt-5 border-t border-border/40 text-center sm:text-left">
          This analysis documents perspectives. The final decision remains with you.
        </p>

        {/* Collapsible Reasoning */}
        {reasoning && (
          <div className="mt-5">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2.5 rounded-lg hover:bg-muted/40 mx-auto sm:mx-0"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", showReasoning && "rotate-180")} />
              {showReasoning ? "Hide reasoning" : "View reasoning"}
            </button>
            
            {showReasoning && (
              <div className="mt-4 p-5 rounded-xl bg-muted/20 border-l-3 border-primary/30 animate-fade-in">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {reasoning}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
