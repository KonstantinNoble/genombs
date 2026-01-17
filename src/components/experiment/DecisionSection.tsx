import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";

interface DecisionSectionProps {
  experimentStatus: "active" | "completed" | "abandoned";
  onComplete: (finalNotes: string) => void;
  onAbandon: (reason: string) => void;
  disabled?: boolean;
}

export function DecisionSection({
  experimentStatus,
  onComplete,
  onAbandon,
  disabled,
}: DecisionSectionProps) {
  const [finalNotes, setFinalNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [abandonReason, setAbandonReason] = useState("");

  const handleComplete = () => {
    onComplete(finalNotes);
  };

  const handleAbandon = () => {
    onAbandon(abandonReason);
    setShowAbandonDialog(false);
  };

  if (experimentStatus === "completed") {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle2 className="h-4 w-4" />
        <span>Experiment completed</span>
      </div>
    );
  }

  if (experimentStatus === "abandoned") {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="h-4 w-4" />
        <span>Experiment abandoned</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Optional Notes Toggle */}
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
      >
        {showNotes ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        Final notes (optional)
      </button>

      {showNotes && (
        <Textarea
          value={finalNotes}
          onChange={(e) => setFinalNotes(e.target.value)}
          placeholder="Your conclusion and next steps..."
          className="min-h-[60px] resize-none text-sm"
          disabled={disabled}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleComplete}
          disabled={disabled}
          size="sm"
          className="flex-1"
        >
          <CheckCircle2 className="h-4 w-4 mr-1.5" />
          Complete
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowAbandonDialog(true)}
          disabled={disabled}
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <XCircle className="h-4 w-4 mr-1.5" />
          Abandon
        </Button>
      </div>

      {/* Abandon Confirmation Dialog */}
      <AlertDialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Abandon Experiment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark your experiment as abandoned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Textarea
              value={abandonReason}
              onChange={(e) => setAbandonReason(e.target.value)}
              placeholder="Reason (optional)"
              className="min-h-[60px] resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAbandon}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Abandon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
