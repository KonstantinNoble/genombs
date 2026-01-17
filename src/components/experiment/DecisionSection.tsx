import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  Target,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface DecisionSectionProps {
  hypothesis: string;
  experimentStatus: "active" | "completed" | "abandoned";
  onComplete: (finalNotes: string) => void;
  onAbandon: (reason: string) => void;
  disabled?: boolean;
}

const DECISION_PROMPTS = [
  {
    icon: Target,
    question: "Was your hypothesis confirmed?",
    hint: "Did the results match your expectations?",
  },
  {
    icon: TrendingUp,
    question: "Which metrics showed the most progress?",
    hint: "Look at your metrics tracker data.",
  },
  {
    icon: ArrowRight,
    question: "What is the logical next step?",
    hint: "Scale up, pivot, or try something different?",
  },
];

export function DecisionSection({
  hypothesis,
  experimentStatus,
  onComplete,
  onAbandon,
  disabled,
}: DecisionSectionProps) {
  const [finalNotes, setFinalNotes] = useState("");
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [abandonReason, setAbandonReason] = useState("");

  const handleComplete = () => {
    onComplete(finalNotes);
    setShowCompleteDialog(false);
  };

  const handleAbandon = () => {
    onAbandon(abandonReason);
    setShowAbandonDialog(false);
  };

  if (experimentStatus === "completed") {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            Experiment Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This experiment has been completed. Review your data and insights
            above to inform your next steps.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (experimentStatus === "abandoned") {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Experiment Abandoned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This experiment was abandoned. You can start a new experiment from a
            fresh validation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hypothesis Reminder */}
      <Card className="border-accent-info/20 bg-accent-info/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-accent-info shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm">Your Hypothesis</div>
              <p className="text-sm text-muted-foreground mt-1">{hypothesis}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Prompts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-accent-warm" />
          <span className="font-medium text-sm">
            Reflect on these questions:
          </span>
        </div>
        <div className="grid gap-2">
          {DECISION_PROMPTS.map((prompt, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-border bg-card/50"
            >
              <div className="flex items-center gap-2">
                <prompt.icon className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{prompt.question}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                {prompt.hint}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Final Decision Notes */}
      <div className="space-y-2">
        <label className="font-medium text-sm">Your Final Decision</label>
        <Textarea
          value={finalNotes}
          onChange={(e) => setFinalNotes(e.target.value)}
          placeholder="Based on your observations and data, what is your conclusion? What will you do next?"
          className="min-h-[120px] resize-none"
          disabled={disabled}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => setShowCompleteDialog(true)}
          disabled={disabled || !finalNotes.trim()}
          className="flex-1"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Complete Experiment
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAbandonDialog(true)}
          disabled={disabled}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Abandon
        </Button>
      </div>

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Complete Experiment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark your experiment as complete. Make sure you've
              documented all your observations and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              Complete Experiment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Abandon Confirmation Dialog */}
      <AlertDialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Abandon Experiment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark your experiment as abandoned. You can optionally
              provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Textarea
              value={abandonReason}
              onChange={(e) => setAbandonReason(e.target.value)}
              placeholder="Why are you abandoning this experiment? (optional)"
              className="min-h-[80px] resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAbandon}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Abandon Experiment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
