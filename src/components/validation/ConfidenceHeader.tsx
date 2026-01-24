import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { ConfidenceGauge } from "./icons/ConfidenceGauge";
import { useIsMobile } from "@/hooks/use-mobile";

interface ConfidenceHeaderProps {
  title: string;
  description: string;
  confidence: number;
  reasoning?: string;
  showAnalysisExpanded?: boolean;
  onToggleAnalysis?: () => void;
}

export function ConfidenceHeader({
  title,
  description,
  confidence,
  reasoning,
  showAnalysisExpanded = true,
  onToggleAnalysis,
}: ConfidenceHeaderProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      {/* Mobile: Stacked layout, Desktop: Side by side */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        {/* Confidence Gauge - Prominent visual anchor */}
        <div className="shrink-0 flex justify-center sm:justify-start">
          <ConfidenceGauge value={confidence} size={isMobile ? 110 : 150} />
        </div>
        
        {/* Text Content */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 leading-tight">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
        </div>
      </div>

      {/* Collapsible Reasoning - Compact */}
      {reasoning && (
        <div className="mt-4 pt-4 border-t border-primary/10">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", showReasoning && "rotate-180")} />
            {showReasoning ? "Hide reasoning" : "Show reasoning"}
          </button>
          
          {showReasoning && (
            <p className="mt-3 text-sm text-muted-foreground italic leading-relaxed animate-fade-in">
              {reasoning}
            </p>
          )}
        </div>
      )}

      {/* Toggle Full Analysis Button */}
      {onToggleAnalysis && (
        <button
          onClick={onToggleAnalysis}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:text-primary/80 border-t border-primary/10 transition-colors"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", showAnalysisExpanded && "rotate-180")} />
          {showAnalysisExpanded ? "Collapse Analysis" : "Show Full Analysis"}
        </button>
      )}
    </div>
  );
}
