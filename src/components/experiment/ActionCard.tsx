import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActionCardProps {
  id: string;
  title: string;
  completed: boolean;
  outcome: string | null;
  onUpdate: (updates: { completed?: boolean; outcome?: string }) => void;
  disabled?: boolean;
}

const OUTCOME_OPTIONS = [
  { value: "positive", label: "Positive", color: "text-primary" },
  { value: "negative", label: "Negative", color: "text-destructive" },
  { value: "neutral", label: "Neutral", color: "text-muted-foreground" },
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
    <div className="py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={completed}
          onCheckedChange={(checked) =>
            onUpdate({ completed: checked as boolean })
          }
          disabled={disabled}
          className="h-5 w-5"
        />

        <span
          className={`flex-1 text-base ${
            completed ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {title}
        </span>

        <Select
          value={outcome || undefined}
          onValueChange={handleOutcomeChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[130px] h-9 text-sm">
            {selectedOutcome ? (
              <div className="flex items-center gap-2">
                <span className={selectedOutcome.color}>{selectedOutcome.label}</span>
              </div>
            ) : (
              <SelectValue placeholder="Evidence" />
            )}
          </SelectTrigger>
          <SelectContent>
            {OUTCOME_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-sm">
                <span className={option.color}>{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
