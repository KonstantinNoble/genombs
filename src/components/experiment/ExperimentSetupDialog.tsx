import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TopAction {
  action: string;
  reasoning: string;
  priority: string;
}

interface ExperimentSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExperimentSetupData) => void;
  hypothesis: string;
  topActions: TopAction[];
  isPremium: boolean;
  isLoading?: boolean;
}

export interface ExperimentSetupData {
  title: string;
  hypothesis: string;
  decisionQuestion: string;
  durationDays: 7 | 14 | 30;
  successMetrics: string[];
  selectedActions: TopAction[];
}

export function ExperimentSetupDialog({
  open,
  onOpenChange,
  onSubmit,
  hypothesis,
  topActions,
  isPremium,
  isLoading,
}: ExperimentSetupDialogProps) {
  const [decisionQuestion, setDecisionQuestion] = useState("");
  const [editedHypothesis, setEditedHypothesis] = useState(hypothesis);
  const [scoringCriteria, setScoringCriteria] = useState<string[]>([
    "Revenue Impact",
    "Customer Interest",
    "Implementation Effort",
  ]);
  const [selectedActionIndices, setSelectedActionIndices] = useState<number[]>(
    topActions.map((_, i) => i)
  );

  const handleAddCriterion = () => {
    if (scoringCriteria.length < 5) {
      setScoringCriteria([...scoringCriteria, ""]);
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setScoringCriteria(scoringCriteria.filter((_, i) => i !== index));
  };

  const handleCriterionChange = (index: number, value: string) => {
    const updated = [...scoringCriteria];
    updated[index] = value;
    setScoringCriteria(updated);
  };

  const toggleAction = (index: number) => {
    if (selectedActionIndices.includes(index)) {
      setSelectedActionIndices(selectedActionIndices.filter((i) => i !== index));
    } else {
      setSelectedActionIndices([...selectedActionIndices, index]);
    }
  };

  const handleSubmit = () => {
    const validCriteria = scoringCriteria.filter((c) => c.trim() !== "");
    const selectedActions = selectedActionIndices.map((i) => topActions[i]);

    onSubmit({
      title: decisionQuestion.trim() || "Business Decision",
      hypothesis: editedHypothesis,
      decisionQuestion: decisionQuestion.trim(),
      durationDays: 7, // Simplified - no duration selection needed for decision-focused experiments
      successMetrics: validCriteria,
      selectedActions,
    });
  };

  const canSubmit =
    decisionQuestion.trim() !== "" &&
    editedHypothesis.trim() !== "" &&
    selectedActionIndices.length > 0 &&
    scoringCriteria.some((c) => c.trim() !== "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Setup Business Decision
          </DialogTitle>
          <DialogDescription>
            Transform this recommendation into a structured Go/No-Go decision.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Decision Question */}
          <div className="space-y-2">
            <Label htmlFor="decisionQuestion">
              Decision Question
            </Label>
            <Input
              id="decisionQuestion"
              value={decisionQuestion}
              onChange={(e) => setDecisionQuestion(e.target.value)}
              placeholder="E.g., Should I pivot to enterprise market?"
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">
              What business decision are you trying to make?
            </p>
          </div>

          {/* Hypothesis */}
          <div className="space-y-2">
            <Label htmlFor="hypothesis">Hypothesis</Label>
            <Textarea
              id="hypothesis"
              value={editedHypothesis}
              onChange={(e) => setEditedHypothesis(e.target.value)}
              placeholder="If I do X, then Y will happen..."
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              What outcome do you expect if you proceed?
            </p>
          </div>

          {/* Scoring Criteria */}
          <div className="space-y-2">
            <Label>
              Scoring Criteria
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Define the criteria you'll use to score this decision (1-10 scale).
            </p>
            <div className="space-y-2">
              {scoringCriteria.map((criterion, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={criterion}
                    onChange={(e) => handleCriterionChange(index, e.target.value)}
                    placeholder={`E.g., ${
                      index === 0
                        ? "Revenue Impact"
                        : index === 1
                        ? "Customer Interest"
                        : "Criterion name"
                    }`}
                    maxLength={50}
                  />
                  {scoringCriteria.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCriterion(index)}
                      className="shrink-0 px-2"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {scoringCriteria.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCriterion}
              >
                Add Criterion
              </Button>
            )}
          </div>

          {/* Validation Actions */}
          <div className="space-y-2">
            <Label>Validation Actions</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select the actions that will validate your hypothesis.
            </p>
            <div className="space-y-2">
              {topActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => toggleAction(index)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedActionIndices.includes(index)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                        selectedActionIndices.includes(index)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {selectedActionIndices.includes(index) && (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{action.action}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {action.reasoning}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
            {isLoading ? "Creating..." : "Start Decision Analysis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
