import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";

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
  initialSelectedUrls?: string[];
  onSelected?: (urls: string[]) => void;
}

const CompetitorSuggestions = ({ competitors, onAnalyze, disabled, maxSelectable, initialSelectedUrls, onSelected }: CompetitorSuggestionsProps) => {
  const alreadySubmitted = !!initialSelectedUrls && initialSelectedUrls.length > 0;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [submittedUrls, setSubmittedUrls] = useState<string[]>(initialSelectedUrls || []);

  // Sync when initialSelectedUrls changes after mount (e.g. optimistic patch or async load)
  useEffect(() => {
    if (initialSelectedUrls && initialSelectedUrls.length > 0) {
      setSubmitted(true);
      setSubmittedUrls(initialSelectedUrls);
    }
  }, [initialSelectedUrls]);

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

  const handleAnalyze = () => {
    const urls = Array.from(selected);
    setSubmittedUrls(urls);
    setSubmitted(true);
    onAnalyze(urls);
    onSelected?.(urls);
  };

  const selectedCount = submitted ? submittedUrls.length : selected.size;
  const atLimit = maxSelectable !== undefined && !submitted && selectedCount >= maxSelectable;

  return (
    <div className="space-y-3">
      {competitors.map((c) => {
        const isChecked = submitted ? submittedUrls.includes(c.url) : selected.has(c.url);
        const isDisabledByLimit = !submitted && atLimit && !isChecked;
        const isNotSelected = submitted && !isChecked;
        return (
          <label
            key={c.url}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isChecked
                ? "border-primary/50 bg-primary/5"
                : isDisabledByLimit
                  ? "border-border bg-card opacity-40 cursor-not-allowed"
                  : isNotSelected
                    ? "border-border bg-card opacity-40"
                    : "border-border bg-card hover:border-border/80 cursor-pointer"
              } ${submitted ? "pointer-events-none" : ""} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => !submitted && toggle(c.url)}
              disabled={submitted || disabled || isDisabledByLimit}
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

      {submitted ? (
        <div className="flex items-center gap-2 justify-center py-1">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm font-medium text-foreground">
            {submittedUrls.length} competitor{submittedUrls.length > 1 ? "s" : ""} selected for analysis
          </p>
        </div>
      ) : (
        <>
          {maxSelectable !== undefined && (
            <p className="text-[11px] text-muted-foreground text-center">
              {atLimit
                ? `Limit reached: max. ${maxSelectable} competitor${maxSelectable > 1 ? "s" : ""} selectable`
                : `${selectedCount} / ${maxSelectable} competitor${maxSelectable > 1 ? "s" : ""} selected`}
            </p>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={disabled || selectedCount === 0}
            className="w-full"
            size="sm"
          >
            {selectedCount > 0
              ? `Analyze ${selectedCount} competitor${selectedCount > 1 ? "s" : ""}`
              : "Select competitors to analyze"}
          </Button>
        </>
      )}
    </div>
  );
};

export default CompetitorSuggestions;
