import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface ExperimentEvidence {
  id: string;
  experiment_id: string;
  evidence_type: string;
  direction: "positive" | "negative" | "neutral";
  strength: "weak" | "medium" | "strong";
  note: string;
  order_index: number;
  created_at: string;
}

interface DecisionEvidenceLogProps {
  evidence: ExperimentEvidence[];
  onAddEvidence: (evidence: Omit<ExperimentEvidence, "id" | "experiment_id" | "created_at" | "order_index">) => Promise<void>;
  onDeleteEvidence: (evidenceId: string) => Promise<void>;
  isCompleted?: boolean;
}

const EVIDENCE_TYPES = [
  { value: "customer_feedback", label: "Customer Feedback" },
  { value: "market_data", label: "Market Data" },
  { value: "financial_signal", label: "Financial Signal" },
  { value: "competitor_move", label: "Competitor Move" },
  { value: "internal_metric", label: "Internal Metric" },
  { value: "other", label: "Other" },
];

const DIRECTION_OPTIONS: { value: "positive" | "negative" | "neutral"; label: string }[] = [
  { value: "positive", label: "+" },
  { value: "negative", label: "−" },
  { value: "neutral", label: "○" },
];

const STRENGTH_OPTIONS: { value: "weak" | "medium" | "strong"; label: string }[] = [
  { value: "weak", label: "Weak" },
  { value: "medium", label: "Medium" },
  { value: "strong", label: "Strong" },
];

function calculateEvidenceScore(evidence: ExperimentEvidence[]): number {
  const strengthValues = { weak: 1, medium: 2, strong: 3 };
  
  return evidence.reduce((score, e) => {
    const strength = strengthValues[e.strength];
    if (e.direction === "positive") return score + strength;
    if (e.direction === "negative") return score - strength;
    return score;
  }, 0);
}

function getEvidenceStats(evidence: ExperimentEvidence[]) {
  return {
    positive: evidence.filter(e => e.direction === "positive").length,
    negative: evidence.filter(e => e.direction === "negative").length,
    neutral: evidence.filter(e => e.direction === "neutral").length,
  };
}

function getStatusDisplay(score: number): { text: string; className: string } {
  if (score > 3) {
    return { text: `Evidence leans GO (+${score})`, className: "text-green-600 dark:text-green-400" };
  }
  if (score < -3) {
    return { text: `Evidence leans NO-GO (${score})`, className: "text-red-600 dark:text-red-400" };
  }
  return { text: `Evidence is mixed (${score >= 0 ? "+" : ""}${score})`, className: "text-yellow-600 dark:text-yellow-400" };
}

export function DecisionEvidenceLog({ 
  evidence, 
  onAddEvidence, 
  onDeleteEvidence,
  isCompleted = false 
}: DecisionEvidenceLogProps) {
  const [evidenceType, setEvidenceType] = useState<string>("customer_feedback");
  const [direction, setDirection] = useState<"positive" | "negative" | "neutral">("positive");
  const [strength, setStrength] = useState<"weak" | "medium" | "strong">("medium");
  const [note, setNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const score = calculateEvidenceScore(evidence);
  const stats = getEvidenceStats(evidence);
  const status = getStatusDisplay(score);

  const handleAddEvidence = async () => {
    if (!note.trim()) return;
    
    setIsAdding(true);
    try {
      await onAddEvidence({
        evidence_type: evidenceType,
        direction,
        strength,
        note: note.trim().slice(0, 200),
      });
      setNote("");
      setDirection("positive");
      setStrength("medium");
    } finally {
      setIsAdding(false);
    }
  };

  const getTypeLabel = (type: string) => {
    return EVIDENCE_TYPES.find(t => t.value === type)?.label || type;
  };

  const getDirectionDisplay = (dir: string) => {
    if (dir === "positive") return { text: "Positive", className: "text-green-600 dark:text-green-400" };
    if (dir === "negative") return { text: "Negative", className: "text-red-600 dark:text-red-400" };
    return { text: "Neutral", className: "text-muted-foreground" };
  };

  const getStrengthDisplay = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">DECISION EVIDENCE LOG</h3>
      </div>

      {/* Status Indicator */}
      {evidence.length > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg space-y-1">
          <p className={cn("text-sm font-medium", status.className)}>
            {status.text}
          </p>
          <p className="text-xs text-muted-foreground">
            {stats.positive} positive · {stats.negative} negative · {stats.neutral} neutral
          </p>
        </div>
      )}

      {/* Add Evidence Form */}
      {!isCompleted && (
        <div className="p-4 border border-border/50 rounded-xl bg-muted/20 space-y-3">
          <div className="flex flex-wrap gap-2">
            {/* Type Select */}
            <Select value={evidenceType} onValueChange={setEvidenceType}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVIDENCE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-xs">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Direction Buttons */}
            <div className="flex rounded-md border border-border/50 overflow-hidden">
              {DIRECTION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDirection(opt.value)}
                  className={cn(
                    "px-3 h-8 text-sm font-medium transition-colors",
                    direction === opt.value
                      ? opt.value === "positive"
                        ? "bg-green-600 text-white"
                        : opt.value === "negative"
                          ? "bg-red-600 text-white"
                          : "bg-muted text-foreground"
                      : "bg-background hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Strength Buttons */}
            <div className="flex rounded-md border border-border/50 overflow-hidden">
              {STRENGTH_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStrength(opt.value)}
                  className={cn(
                    "px-2.5 h-8 text-xs font-medium transition-colors",
                    strength === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              placeholder="Describe the evidence signal..."
              className="min-h-[60px] text-sm resize-none"
              maxLength={200}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {note.length}/200 characters
              </span>
              <Button
                onClick={handleAddEvidence}
                disabled={!note.trim() || isAdding}
                size="sm"
                className="h-8"
              >
                {isAdding ? "Adding..." : "Add Evidence"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence List */}
      {evidence.length > 0 && (
        <div className="space-y-2">
          {evidence
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((e) => {
              const dirDisplay = getDirectionDisplay(e.direction);
              return (
                <div
                  key={e.id}
                  className="p-3 border border-border/30 rounded-lg bg-background/50 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(e.created_at), "dd.MM.yyyy HH:mm")}</span>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">{getTypeLabel(e.evidence_type)}</span>
                        <span className="mx-1.5 text-muted-foreground">·</span>
                        <span className={dirDisplay.className}>{dirDisplay.text}</span>
                        <span className="mx-1.5 text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{getStrengthDisplay(e.strength)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground break-words">
                        "{e.note}"
                      </p>
                    </div>
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => onDeleteEvidence(e.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors text-sm px-1"
                        aria-label="Delete evidence"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {evidence.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No evidence recorded yet. Add signals as you gather real-world data.
        </p>
      )}
    </div>
  );
}
