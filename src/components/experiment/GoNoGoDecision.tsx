import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GoNoGoDecisionProps {
  experimentStatus: "active" | "completed" | "abandoned";
  finalDecision: string | null;
  decisionRationale: string | null;
  overallScore: number;
  onDecision: (decision: "go" | "no_go", rationale: string) => void;
  onComplete?: () => void;
  disabled?: boolean;
}

export function GoNoGoDecision({
  experimentStatus,
  finalDecision,
  decisionRationale,
  overallScore,
  onDecision,
  onComplete,
  disabled,
}: GoNoGoDecisionProps) {
  const [rationale, setRationale] = useState("");
  const [showRationale, setShowRationale] = useState(false);

  // Post-decision state: Show status + follow-up actions
  if (experimentStatus === "completed" || experimentStatus === "abandoned") {
    const isGo = finalDecision === "go";
    
    return (
      <div className="space-y-4">
        {/* Prominent Decision Status */}
        <div 
          className={`flex items-center gap-3 p-5 rounded-xl ${
            isGo ? "bg-primary/10" : "bg-destructive/10"
          }`}
        >
          <Badge 
            variant={isGo ? "default" : "destructive"}
            className="text-base px-4 py-1.5"
          >
            {isGo ? "GO" : "NO-GO"}
          </Badge>
          <span className={`text-base font-semibold ${isGo ? "text-primary" : "text-destructive"}`}>
            {isGo ? "Proceed with this strategy" : "Strategy not pursued"}
          </span>
        </div>

        {/* Decision Rationale (if provided) */}
        {decisionRationale && (
          <div className="flex items-start gap-2 text-base text-muted-foreground bg-muted/30 rounded-xl p-4">
            <p className="italic">"{decisionRationale}"</p>
          </div>
        )}

        {/* Single Completed Button */}
        <Button 
          size="default" 
          onClick={onComplete}
          className="w-full"
        >
          Completed
        </Button>
      </div>
    );
  }

  // Active state: Show decision buttons
  const getRecommendation = () => {
    if (overallScore >= 7) {
      return { text: "Score suggests: GO", color: "text-primary" };
    } else if (overallScore >= 5) {
      return { text: "Score suggests: Borderline", color: "text-yellow-600" };
    }
    return { text: "Score suggests: NO-GO", color: "text-destructive" };
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-4">
      <div className="text-base text-muted-foreground font-semibold uppercase tracking-wide">
        Your Decision
      </div>

      {overallScore > 0 && (
        <div className={`text-base font-medium ${recommendation.color}`}>
          {recommendation.text}
        </div>
      )}

      {/* Optional Rationale Toggle */}
      <button
        onClick={() => setShowRationale(!showRationale)}
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
      >
        <span>{showRationale ? "−" : "+"}</span>
        Add decision rationale (optional)
      </button>

      {showRationale && (
        <Textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Why are you making this decision?"
          className="min-h-[80px] resize-none text-base"
          disabled={disabled}
          maxLength={500}
        />
      )}

      {/* Decision Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => onDecision("go", rationale)}
          disabled={disabled}
          size="default"
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          GO
        </Button>
        <Button
          variant="outline"
          onClick={() => onDecision("no_go", rationale)}
          disabled={disabled}
          size="default"
          className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
        >
          NO-GO
        </Button>
      </div>
    </div>
  );
}
