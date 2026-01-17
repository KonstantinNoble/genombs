import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface ActionCardProps {
  id: string;
  title: string;
  completed: boolean;
  outcome: string | null;
  onUpdate: (updates: { completed?: boolean; outcome?: string }) => void;
  disabled?: boolean;
}

const OUTCOME_OPTIONS = [
  { value: "positive", label: "Positive", icon: ThumbsUp, color: "text-primary" },
  { value: "negative", label: "Negative", icon: ThumbsDown, color: "text-destructive" },
  { value: "neutral", label: "Neutral", icon: Minus, color: "text-muted-foreground" },
];

export function ActionCard({
  id,
  title,
  completed,
  outcome,
  onUpdate,
  disabled,
}: ActionCardProps) {
  const handleOutcomeChange = (value: string) => {
    onUpdate({ outcome: value, completed: true });
  };

  const selectedOutcome = OUTCOME_OPTIONS.find((o) => o.value === outcome);

  return (
    <div className="py-2.5 border-b border-border/50 last:border-0">
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
            completed ? "text-muted-foreground" : ""
          }`}
        >
          {title}
        </span>

        <Select
          value={outcome || undefined}
          onValueChange={handleOutcomeChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[120px] h-7 text-xs">
            {selectedOutcome ? (
              <div className="flex items-center gap-1.5">
                <selectedOutcome.icon className={`h-3 w-3 ${selectedOutcome.color}`} />
                <span>{selectedOutcome.label}</span>
              </div>
            ) : (
              <SelectValue placeholder="Evidence" />
            )}
          </SelectTrigger>
          <SelectContent>
            {OUTCOME_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className={`h-3.5 w-3.5 ${option.color}`} />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
