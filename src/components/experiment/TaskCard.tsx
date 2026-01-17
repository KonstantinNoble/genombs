import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, NotebookPen } from "lucide-react";

interface TaskCardProps {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  notes: string | null;
  orderIndex: number;
  onUpdate: (updates: { completed?: boolean; notes?: string }) => void;
  disabled?: boolean;
}

export function TaskCard({
  id,
  title,
  description,
  completed,
  completedAt,
  notes,
  orderIndex,
  onUpdate,
  disabled,
}: TaskCardProps) {
  const [localNotes, setLocalNotes] = useState(notes || "");
  const [showNotes, setShowNotes] = useState(!!notes);

  const handleNotesBlur = () => {
    if (localNotes !== (notes || "")) {
      onUpdate({ notes: localNotes });
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        completed
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:border-primary/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Checkbox
            checked={completed}
            onCheckedChange={(checked) =>
              onUpdate({ completed: checked as boolean })
            }
            disabled={disabled}
            className="h-5 w-5"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div
                className={`font-medium ${
                  completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {title}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {completed ? (
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Done
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <Circle className="h-3 w-3 mr-1" />
                  Task {orderIndex + 1}
                </Badge>
              )}
            </div>
          </div>

          {completed && completedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Completed on {new Date(completedAt).toLocaleDateString()}
            </p>
          )}

          {/* Notes Section */}
          <div className="mt-3">
            {!showNotes ? (
              <button
                onClick={() => setShowNotes(true)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <NotebookPen className="h-3.5 w-3.5" />
                Add notes...
              </button>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <NotebookPen className="h-3 w-3" />
                  Notes & Observations
                </label>
                <Textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="What did you observe? What happened?"
                  className="min-h-[60px] resize-none text-sm"
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
