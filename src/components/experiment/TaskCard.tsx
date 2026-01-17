import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { NotebookPen, ChevronDown, ChevronUp } from "lucide-react";

interface TaskCardProps {
  id: string;
  title: string;
  completed: boolean;
  notes: string | null;
  onUpdate: (updates: { completed?: boolean; notes?: string }) => void;
  disabled?: boolean;
}

export function TaskCard({
  id,
  title,
  completed,
  notes,
  onUpdate,
  disabled,
}: TaskCardProps) {
  const [localNotes, setLocalNotes] = useState(notes || "");
  const [showNotes, setShowNotes] = useState(false);

  const handleNotesBlur = () => {
    if (localNotes !== (notes || "")) {
      onUpdate({ notes: localNotes });
    }
  };

  return (
    <div className="py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={completed}
          onCheckedChange={(checked) =>
            onUpdate({ completed: checked as boolean })
          }
          disabled={disabled}
          className="h-4 w-4"
        />

        <span
          className={`flex-1 text-sm ${
            completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {title}
        </span>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-muted/50"
          disabled={disabled}
        >
          <NotebookPen className="h-3 w-3" />
          {showNotes ? (
            <ChevronUp className="h-3 w-3" />
          ) : notes ? (
            <span className="text-primary">1</span>
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>

      {showNotes && (
        <div className="mt-2 ml-7">
          <Textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add a note..."
            className="min-h-[50px] resize-none text-xs"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
