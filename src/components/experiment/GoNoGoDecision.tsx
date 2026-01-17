import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Ban, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Archive, 
  RefreshCw,
  MessageSquare
} from "lucide-react";

interface GoNoGoDecisionProps {
  experimentStatus: "active" | "completed" | "abandoned";
  finalDecision: string | null;
  decisionRationale: string | null;
  overallScore: number;
  onDecision: (decision: "go" | "no_go", rationale: string) => void;
  onStartNewExperiment?: () => void;
  onMarkAsDone?: () => void;
  onArchive?: () => void;
  onNewValidation?: () => void;
  disabled?: boolean;
}

export function GoNoGoDecision({
  experimentStatus,
  finalDecision,
  decisionRationale,
  overallScore,
  onDecision,
  onStartNewExperiment,
  onMarkAsDone,
  onArchive,
  onNewValidation,
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
          className={`flex items-center gap-3 p-4 rounded-lg ${
            isGo ? "bg-primary/10" : "bg-destructive/10"
          }`}
        >
          <Badge 
            variant={isGo ? "default" : "destructive"}
            className="text-sm px-3 py-1"
          >
            {isGo ? "GO" : "NO-GO"}
          </Badge>
          <span className={`font-medium ${isGo ? "text-primary" : "text-destructive"}`}>
            {isGo ? "Proceed with this strategy" : "Strategy not pursued"}
          </span>
        </div>

        {/* Decision Rationale (if provided) */}
        {decisionRationale && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
            <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="italic">"{decisionRationale}"</p>
          </div>
        )}

        {/* Follow-up Actions */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Next Steps
          </div>
          <div className="flex flex-wrap gap-2">
            {isGo ? (
              <>
                <Button 
                  size="sm" 
                  onClick={onStartNewExperiment}
                  className="gap-1.5"
                >
                  <Rocket className="h-4 w-4" />
                  Start New Experiment
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onMarkAsDone}
                  className="gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Mark as Done
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onArchive}
                  className="gap-1.5"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
                <Button 
                  size="sm" 
                  onClick={onNewValidation}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-4 w-4" />
                  New Validation
                </Button>
              </>
            )}
          </div>
        </div>
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
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        Your Decision
      </div>

      {overallScore > 0 && (
        <div className={`text-sm ${recommendation.color}`}>
          {recommendation.text}
        </div>
      )}

      {/* Optional Rationale Toggle */}
      <button
        onClick={() => setShowRationale(!showRationale)}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
      >
        {showRationale ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        Add decision rationale (optional)
      </button>

      {showRationale && (
        <Textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Why are you making this decision?"
          className="min-h-[60px] resize-none text-sm"
          disabled={disabled}
          maxLength={500}
        />
      )}

      {/* Decision Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => onDecision("go", rationale)}
          disabled={disabled}
          size="sm"
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          <Rocket className="h-4 w-4 mr-1.5" />
          GO
        </Button>
        <Button
          variant="outline"
          onClick={() => onDecision("no_go", rationale)}
          disabled={disabled}
          size="sm"
          className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
        >
          <Ban className="h-4 w-4 mr-1.5" />
          NO-GO
        </Button>
      </div>
    </div>
  );
}
