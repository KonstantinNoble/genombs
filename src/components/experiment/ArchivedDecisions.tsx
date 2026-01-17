import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArchivedDecisionDialog } from "./ArchivedDecisionDialog";
import { useToast } from "@/hooks/use-toast";
import { Archive, Trash2, ChevronDown, ChevronUp, Rocket, Ban } from "lucide-react";

interface ArchivedExperiment {
  id: string;
  title: string;
  decision_question: string | null;
  hypothesis: string;
  final_decision: string | null;
  decision_rationale: string | null;
  created_at: string;
  updated_at: string;
}

type ArchivedDecisionsProps = {
  userId?: string;
};

export function ArchivedDecisions({ userId }: ArchivedDecisionsProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [experiments, setExperiments] = useState<ArchivedExperiment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);

  const ARCHIVE_LIMIT = 10;
  const PRUNE_BATCH = 50;

  const pruneArchivedExperiments = async (idsToDelete: string[]) => {
    if (!idsToDelete.length) return;

    const [tasksRes, checkpointsRes] = await Promise.all([
      supabase.from("experiment_tasks").delete().in("experiment_id", idsToDelete),
      supabase.from("experiment_checkpoints").delete().in("experiment_id", idsToDelete),
    ]);

    if (tasksRes.error || checkpointsRes.error) {
      console.warn("Prune dependencies failed", {
        tasks: tasksRes.error,
        checkpoints: checkpointsRes.error,
      });
    }

    const expRes = await supabase.from("experiments").delete().in("id", idsToDelete);
    if (expRes.error) {
      console.warn("Prune experiments failed", expRes.error);
    }
  };

  const loadArchivedExperiments = async () => {
    setIsLoading(true);
    try {
      const uid =
        userId ??
        (await supabase.auth.getUser()).data.user?.id ??
        null;

      if (!uid) return;

      // Load the newest entries quickly for UI
      const { data, error } = await supabase
        .from("experiments")
        .select(
          "id, title, decision_question, hypothesis, final_decision, decision_rationale, created_at, updated_at",
        )
        .eq("user_id", uid)
        .in("status", ["completed", "abandoned"])
        .order("updated_at", { ascending: false })
        .limit(ARCHIVE_LIMIT);

      if (error) throw error;

      const rows = data ?? [];
      setExperiments(rows);

      // Non-blocking retention cleanup in small batches to avoid UI jank
      void (async () => {
        const { data: oldRows, error: oldError } = await supabase
          .from("experiments")
          .select("id")
          .eq("user_id", uid)
          .in("status", ["completed", "abandoned"])
          .order("updated_at", { ascending: false })
          .range(ARCHIVE_LIMIT, ARCHIVE_LIMIT + PRUNE_BATCH - 1);

        if (oldError || !oldRows?.length) return;
        await pruneArchivedExperiments(oldRows.map((r) => r.id));
      })();
    } catch (error) {
      console.error("Error loading archived experiments:", error);
      toast({
        title: "Error",
        description: "Archived decisions could not be loaded.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load when the list opens (keeps it up-to-date and avoids initial layout shift)
  useEffect(() => {
    if (!isOpen) return;
    loadArchivedExperiments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  const handleDelete = async (id: string) => {
    try {
      await supabase.from("experiment_tasks").delete().eq("experiment_id", id);
      await supabase.from("experiment_checkpoints").delete().eq("experiment_id", id);
      const { error } = await supabase.from("experiments").delete().eq("id", id);
      
      if (error) throw error;
      
      setExperiments((prev) => prev.filter((e) => e.id !== id));
      toast({
        title: "Deleted",
        description: "Decision permanently removed.",
      });
    } catch (error) {
      console.error("Error deleting experiment:", error);
      toast({
        title: "Error",
        description: "Failed to delete.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="border rounded-lg bg-card"
      >
        <CollapsibleTrigger
          type="button"
          aria-expanded={isOpen}
          className="w-full p-3 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Archived Decisions
            </span>
            {experiments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {experiments.length}
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="px-3 pb-3 pt-2">
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="space-y-2 py-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-md border bg-muted/20 animate-pulse"
                    />
                  ))}
                </div>
              ) : experiments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No archived decisions yet
                </p>
              ) : (
                experiments.map((exp) => {
                  const isGo = exp.final_decision === "go";
                  const isNoGo = exp.final_decision === "no_go";

                  return (
                    <div
                      key={exp.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedExperimentId(exp.id);
                        setDetailOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedExperimentId(exp.id);
                          setDetailOpen(true);
                        }
                      }}
                      className="flex items-start justify-between gap-2 p-2 rounded-md border bg-background hover:bg-accent/30 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {isGo ? (
                            <Rocket className="h-3 w-3 text-primary shrink-0" />
                          ) : isNoGo ? (
                            <Ban className="h-3 w-3 text-destructive shrink-0" />
                          ) : (
                            <Archive className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                          <span className="font-medium text-xs truncate">
                            {exp.decision_question || exp.title}
                          </span>
                          <Badge
                            variant={isGo ? "default" : isNoGo ? "destructive" : "secondary"}
                            className="text-[9px] px-1 py-0 shrink-0"
                          >
                            {isGo ? "GO" : isNoGo ? "NO-GO" : "ARCHIVED"}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(exp.updated_at).toLocaleDateString()}
                        </p>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Decision?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this decision. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(exp.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <ArchivedDecisionDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        experimentId={selectedExperimentId}
      />
    </>
  );
}
