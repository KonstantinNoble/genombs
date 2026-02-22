import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { COMPETITOR_SEARCH_COST } from "@/lib/constants";

export interface CompetitorSuggestion {
  url: string;
  name: string;
  description: string;
}

interface CompetitorSuggestionsProps {
  competitors: CompetitorSuggestion[];
  onAnalyze: (selectedUrls: string[]) => void;
  disabled?: boolean;
}

const CompetitorSuggestions = ({ competitors, onAnalyze, disabled }: CompetitorSuggestionsProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const selectedCount = selected.size;

  return (
    <div className="space-y-3">
      {competitors.map((c) => (
        <label
          key={c.url}
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            selected.has(c.url)
              ? "border-primary/50 bg-primary/5"
              : "border-border bg-card hover:border-border/80"
          } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <Checkbox
            checked={selected.has(c.url)}
            onCheckedChange={() => toggle(c.url)}
            disabled={disabled}
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
      ))}

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
