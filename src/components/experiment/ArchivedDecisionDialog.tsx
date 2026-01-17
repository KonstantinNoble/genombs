import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExperiment } from "@/hooks/useExperiment";
import { Loader2, Rocket, Ban } from "lucide-react";

interface ScoreMetric {
  name: string;
  weight: number;
  score: number;
}

interface ArchivedDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experimentId: string | null;
}

export function ArchivedDecisionDialog({
  open,
  onOpenChange,
  experimentId,
}: ArchivedDecisionDialogProps) {
  const { getExperimentWithDetails } = useExperiment();
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      if (!open || !experimentId) return;
      setIsLoading(true);
      try {
        const data = await getExperimentWithDetails(experimentId);
        setDetails(data);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [open, experimentId, getExperimentWithDetails]);

  const scoreMetrics: ScoreMetric[] = useMemo(() => {
    const raw = details?.checkpoints?.[0]?.metrics_data;
    if (Array.isArray(raw)) {
      return raw
        .filter((m) => m && typeof m.name === "string")
        .map((m) => ({
          name: String(m.name),
          weight: Number(m.weight ?? 1),
          score: Number(m.score ?? 0),
        }));
    }
    return [];
  }, [details]);

  const overallScore = useMemo(() => {
    if (!scoreMetrics.length) return 0;
    const totalWeight = scoreMetrics.reduce((sum, m) => sum + (m.weight || 0), 0);
    const weightedSum = scoreMetrics.reduce(
      (sum, m) => sum + (m.score || 0) * (m.weight || 0),
      0
    );
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }, [scoreMetrics]);

  const experiment = details?.experiment;
  const tasks = details?.tasks ?? [];
  const isGo = experiment?.final_decision === "go";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {experiment?.final_decision ? (
              isGo ? (
                <Rocket className="h-4 w-4 text-primary" />
              ) : (
                <Ban className="h-4 w-4 text-destructive" />
              )
            ) : null}
            Archived Decision
          </DialogTitle>
          <DialogDescription>
            Read-only view of a past GO/NO-GO decision.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : !experiment ? (
          <div className="py-6 text-sm text-muted-foreground">Not found.</div>
        ) : (
          <ScrollArea className="max-h-[70vh] pr-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Decision
                  </div>
                  <h3 className="font-semibold truncate">
                    {experiment.decision_question || experiment.title}
                  </h3>
                </div>
                <Badge variant={isGo ? "default" : "destructive"}>
                  {isGo ? "GO" : "NO-GO"}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Hypothesis
                </div>
                <p className="text-sm italic">"{experiment.hypothesis}"</p>
              </div>

              {experiment.decision_rationale ? (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Rationale
                  </div>
                  <p className="text-sm text-muted-foreground">{experiment.decision_rationale}</p>
                </div>
              ) : null}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Validation Actions
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tasks.filter((t: any) => t.completed).length}/{tasks.length}
                  </div>
                </div>

                <div className="space-y-2">
                  {tasks.map((t: any) => (
                    <div key={t.id} className="p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{t.title}</div>
                          {t.description ? (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {t.description}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {t.outcome ? (
                            <Badge variant="outline" className="text-[10px]">
                              {String(t.outcome).toUpperCase()}
                            </Badge>
                          ) : null}
                          <Badge variant={t.completed ? "secondary" : "outline"} className="text-[10px]">
                            {t.completed ? "DONE" : "OPEN"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Scorecard
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Overall: {overallScore ? overallScore.toFixed(1) : "0.0"}/10
                  </div>
                </div>

                {scoreMetrics.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No scorecard data.</div>
                ) : (
                  <div className="space-y-2">
                    {scoreMetrics.map((m) => (
                      <div key={m.name} className="flex items-center justify-between gap-3">
                        <div className="text-sm truncate">{m.name}</div>
                        <div className="text-sm text-muted-foreground shrink-0">
                          {m.score}/10
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
