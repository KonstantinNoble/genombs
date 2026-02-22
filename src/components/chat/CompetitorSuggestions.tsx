import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export interface CompetitorSuggestion {
  url: string;
  name: string;
  description: string;
}

interface CompetitorSuggestionsProps {
  competitors: CompetitorSuggestion[];
  onAnalyze: (selectedUrls: string[]) => void;
  disabled?: boolean;
  maxSelectable?: number;
}

const CompetitorSuggestions = ({ competitors, onAnalyze, disabled, maxSelectable }: CompetitorSuggestionsProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else if (maxSelectable === undefined || next.size < maxSelectable) {
        next.add(url);
      }
      return next;
    });
  };

  const selectedCount = selected.size;
  const atLimit = maxSelectable !== undefined && selectedCount >= maxSelectable;

  return (
    <div className="space-y-3">
      {competitors.map((c) => {
        const isChecked = selected.has(c.url);
        const isDisabledByLimit = atLimit && !isChecked;
        return (
          <label
            key={c.url}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isChecked
                ? "border-primary/50 bg-primary/5 cursor-pointer"
                : isDisabledByLimit
                  ? "border-border bg-card opacity-40 cursor-not-allowed"
                  : "border-border bg-card hover:border-border/80 cursor-pointer"
              } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => toggle(c.url)}
              disabled={disabled || isDisabledByLimit}
              className="mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{c.name}</p>
              <p className="text-xs text-primary/80 truncate">{c.url}</p>
              {c.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
              )}
            </div>
          </label>
        );
      })}

      {maxSelectable !== undefined && (
        <p className="text-[11px] text-muted-foreground text-center">
          {atLimit
            ? `Limit reached: max. ${maxSelectable} competitor${maxSelectable > 1 ? "s" : ""} selectable`
            : `${selectedCount} / ${maxSelectable} competitor${maxSelectable > 1 ? "s" : ""} selected`}
        </p>
      )}

      <Button
        onClick={() => onAnalyze(Array.from(selected))}
        disabled={disabled || selectedCount === 0}
        className="w-full"
        size="sm"
      >
        {selectedCount > 0
          ? `Analyze ${selectedCount} competitor${selectedCount > 1 ? "s" : ""}`
          : "Select competitors to analyze"}
      </Button>
    </div>
  );
};

export default CompetitorSuggestions;
