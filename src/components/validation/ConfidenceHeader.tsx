import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

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

  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    if (value >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getConfidenceBarColor = (value: number) => {
    if (value >= 80) return "bg-gradient-to-r from-green-500 to-emerald-400";
    if (value >= 60) return "bg-gradient-to-r from-yellow-500 to-amber-400";
    if (value >= 40) return "bg-gradient-to-r from-orange-500 to-amber-500";
    return "bg-gradient-to-r from-red-500 to-rose-400";
  };

  const getConfidenceLabel = (value: number) => {
    if (value >= 80) return "High";
    if (value >= 60) return "Good";
    if (value >= 40) return "Moderate";
    return "Low";
  };

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex-1 order-2 sm:order-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-1 order-1 sm:order-2 shrink-0 bg-background/50 rounded-lg px-4 py-3">
          <span className={cn("text-4xl sm:text-5xl font-bold", getConfidenceColor(confidence))}>
            {confidence}%
          </span>
          <span className="text-sm text-muted-foreground">
            {getConfidenceLabel(confidence)}
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            getConfidenceBarColor(confidence)
          )}
          style={{ width: `${confidence}%` }}
        />
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