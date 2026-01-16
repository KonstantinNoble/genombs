import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
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

  const getConfidenceIcon = (value: number) => {
    if (value >= 80) return CheckCircle2;
    if (value >= 50) return AlertTriangle;
    return XCircle;
  };

  const getConfidenceLabel = (value: number) => {
    if (value >= 80) return "High Confidence";
    if (value >= 60) return "Good Confidence";
    if (value >= 40) return "Moderate Confidence";
    return "Low Confidence";
  };

  const Icon = getConfidenceIcon(confidence);

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon className={cn("h-8 w-8", getConfidenceColor(confidence))} />
          <span className={cn("text-3xl font-bold", getConfidenceColor(confidence))}>
            {confidence}%
          </span>
          <span className="text-xs text-muted-foreground">
            {getConfidenceLabel(confidence)}
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>AI Consensus Level</span>
          <span>{confidence}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
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
        <p className="mt-4 text-sm text-muted-foreground italic border-t border-primary/10 pt-4">
          {reasoning}
        </p>
      )}
    </div>
  );
}
