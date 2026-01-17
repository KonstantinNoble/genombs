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
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Plus, X, Calendar, Target, BarChart3 } from "lucide-react";

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
  durationDays: 7 | 14 | 30;
  successMetrics: string[];
  selectedActions: TopAction[];
}

const DURATION_OPTIONS: readonly { value: 7 | 14 | 30; label: string; description: string; premium?: boolean }[] = [
  { value: 7, label: "7 Days", description: "Quick test" },
  { value: 14, label: "14 Days", description: "Standard" },
  { value: 30, label: "30 Days", description: "Deep analysis", premium: true },
];

export function ExperimentSetupDialog({
  open,
  onOpenChange,
  onSubmit,
  hypothesis,
  topActions,
  isPremium,
  isLoading,
}: ExperimentSetupDialogProps) {
  const [title, setTitle] = useState("");
  const [editedHypothesis, setEditedHypothesis] = useState(hypothesis);
  const [durationDays, setDurationDays] = useState<7 | 14 | 30>(7);
  const [successMetrics, setSuccessMetrics] = useState<string[]>([""]);
  const [selectedActionIndices, setSelectedActionIndices] = useState<number[]>(
    topActions.map((_, i) => i)
  );

  const handleAddMetric = () => {
    if (successMetrics.length < 5) {
      setSuccessMetrics([...successMetrics, ""]);
    }
  };

  const handleRemoveMetric = (index: number) => {
    setSuccessMetrics(successMetrics.filter((_, i) => i !== index));
  };

  const handleMetricChange = (index: number, value: string) => {
    const updated = [...successMetrics];
    updated[index] = value;
    setSuccessMetrics(updated);
  };

  const toggleAction = (index: number) => {
    if (selectedActionIndices.includes(index)) {
      setSelectedActionIndices(selectedActionIndices.filter((i) => i !== index));
    } else {
      setSelectedActionIndices([...selectedActionIndices, index]);
    }
  };

  const handleSubmit = () => {
    const validMetrics = successMetrics.filter((m) => m.trim() !== "");
    const selectedActions = selectedActionIndices.map((i) => topActions[i]);

    onSubmit({
      title: title.trim() || "My Experiment",
      hypothesis: editedHypothesis,
      durationDays,
      successMetrics: validMetrics,
      selectedActions,
    });
  };

  const canSubmit =
    editedHypothesis.trim() !== "" &&
    selectedActionIndices.length > 0 &&
    successMetrics.some((m) => m.trim() !== "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Setup Your Experiment
          </DialogTitle>
          <DialogDescription>
            Transform this AI recommendation into a measurable, time-limited test.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Experiment Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Enterprise Market Test"
              maxLength={100}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Duration
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((option) => {
                const isDisabled = option.premium && !isPremium;
                return (
                  <button
                    key={option.value}
                    onClick={() => !isDisabled && setDurationDays(option.value)}
                    disabled={isDisabled}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      durationDays === option.value
                        ? "border-primary bg-primary/5"
                        : isDisabled
                        ? "border-muted bg-muted/30 opacity-50 cursor-not-allowed"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                    {option.premium && !isPremium && (
                      <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                        Premium
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hypothesis */}
          <div className="space-y-2">
            <Label htmlFor="hypothesis" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Hypothesis
            </Label>
            <Textarea
              id="hypothesis"
              value={editedHypothesis}
              onChange={(e) => setEditedHypothesis(e.target.value)}
              placeholder="What do you expect to happen?"
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              What outcome do you expect from this experiment?
            </p>
          </div>

          {/* Success Metrics */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Success Metrics
            </Label>
            <div className="space-y-2">
              {successMetrics.map((metric, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={metric}
                    onChange={(e) => handleMetricChange(index, e.target.value)}
                    placeholder={`E.g., ${
                      index === 0
                        ? "Revenue increase by 10%"
                        : index === 1
                        ? "5 new enterprise leads"
                        : "Metric to measure"
                    }`}
                    maxLength={100}
                  />
                  {successMetrics.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMetric(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {successMetrics.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMetric}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Metric
              </Button>
            )}
          </div>

          {/* Actions to Include */}
          <div className="space-y-2">
            <Label>Tasks (from Top Priority Actions)</Label>
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
            {isLoading ? "Creating..." : "Start Experiment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
