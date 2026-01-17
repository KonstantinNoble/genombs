import { cn } from "@/lib/utils";

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
  reasoning
}: ConfidenceHeaderProps) {
  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getConfidenceBarColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceLabel = (value: number) => {
    if (value >= 80) return "High Confidence";
    if (value >= 60) return "Good Confidence";
    if (value >= 40) return "Moderate Confidence";
    return "Low Confidence";
  };

  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground mb-3">{title}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className={cn("text-4xl font-bold", getConfidenceColor(confidence))}>
            {confidence}%
          </span>
          <span className="text-sm text-muted-foreground">
            {getConfidenceLabel(confidence)}
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>AI Consensus Level</span>
          <span>{confidence}%</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              getConfidenceBarColor(confidence)
            )}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {reasoning && (
        <p className="mt-6 text-base text-muted-foreground italic border-t border-primary/10 pt-6">
          {reasoning}
        </p>
      )}
    </div>
  );
}
