import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Clock,
  PenLine,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CheckpointCardProps {
  id: string;
  title: string;
  dueDate: string;
  reflection: string | null;
  completed: boolean;
  completedAt: string | null;
  orderIndex: number;
  onUpdate: (updates: { reflection?: string; completed?: boolean }) => void;
  disabled?: boolean;
}

export function CheckpointCard({
  id,
  title,
  dueDate,
  reflection,
  completed,
  completedAt,
  orderIndex,
  onUpdate,
  disabled,
}: CheckpointCardProps) {
  const [localReflection, setLocalReflection] = useState(reflection || "");
  const [isOpen, setIsOpen] = useState(!completed);

  const handleReflectionBlur = () => {
    if (localReflection !== (reflection || "")) {
      onUpdate({ reflection: localReflection });
    }
  };

  const handleMarkComplete = () => {
    onUpdate({ completed: true, reflection: localReflection });
  };

  const isPastDue = new Date(dueDate) < new Date() && !completed;
  const isDueSoon =
    !isPastDue &&
    new Date(dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) &&
    !completed;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={`rounded-xl border-2 transition-all ${
          completed
            ? "border-primary/30 bg-primary/5"
            : isPastDue
            ? "border-destructive/30 bg-destructive/5"
            : isDueSoon
            ? "border-accent-warm/30 bg-accent-warm/5"
            : "border-border"
        }`}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              {completed ? (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    isPastDue
                      ? "bg-destructive/10"
                      : isDueSoon
                      ? "bg-accent-warm/10"
                      : "bg-muted"
                  }`}
                >
                  <span className="font-bold text-sm">{orderIndex + 1}</span>
                </div>
              )}

              <div>
                <div className="font-semibold">{title}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {completed
                      ? `Completed ${new Date(completedAt!).toLocaleDateString()}`
                      : `Due ${new Date(dueDate).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPastDue && (
                <Badge
                  variant="destructive"
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
              {isDueSoon && (
                <Badge
                  className="text-xs bg-accent-warm text-accent-warm-foreground"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Due Soon
                </Badge>
              )}
              {completed && (
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary text-xs"
                >
                  Complete
                </Badge>
              )}
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            <div className="border-t border-border/50 pt-3 space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <PenLine className="h-3.5 w-3.5" />
                Reflection & Observations
              </label>
              <Textarea
                value={localReflection}
                onChange={(e) => setLocalReflection(e.target.value)}
                onBlur={handleReflectionBlur}
                placeholder="What have you observed so far? What's working? What needs adjustment?"
                className="min-h-[100px] resize-none"
                disabled={disabled || completed}
              />
            </div>

            {!completed && (
              <Button
                onClick={handleMarkComplete}
                disabled={disabled}
                className="w-full"
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Checkpoint Complete
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
