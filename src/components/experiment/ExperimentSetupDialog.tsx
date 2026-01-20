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
  topActions,
  isLoading,
}: ExperimentSetupDialogProps) {
  const [selectedActionIndices, setSelectedActionIndices] = useState<number[]>(
    topActions.map((_, i) => i)
  );

  const toggleAction = (index: number) => {
    if (selectedActionIndices.includes(index)) {
      setSelectedActionIndices(selectedActionIndices.filter((i) => i !== index));
    } else {
      setSelectedActionIndices([...selectedActionIndices, index]);
    }
  };

  const handleSubmit = () => {
    const selectedActions = selectedActionIndices.map((i) => topActions[i]);

    onSubmit({
      title: "Validation Actions",
      hypothesis: "",
      decisionQuestion: "",
      durationDays: 7,
      successMetrics: [],
      selectedActions,
    });
  };

  const canSubmit = selectedActionIndices.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Validation Actions</DialogTitle>
          <DialogDescription>
            Choose the actions you want to track for this validation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Validation Actions */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-2">
              Select the actions you want to validate.
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
            {isLoading ? "Creating..." : "Start Tracking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
