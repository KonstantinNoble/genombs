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

export function ArchivedDecisions() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [experiments, setExperiments] = useState<ArchivedExperiment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadArchivedExperiments = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("experiments")
        .select("id, title, decision_question, hypothesis, final_decision, decision_rationale, created_at, updated_at")
        .eq("user_id", userData.user.id)
        .in("status", ["completed", "abandoned"])
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setExperiments(data || []);
    } catch (error) {
      console.error("Error loading archived experiments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadArchivedExperiments();
  }, []);

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-card">
      <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-lg">
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

      <CollapsibleContent className="px-3 pb-3 space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Loading...
          </p>
        ) : experiments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No archived decisions yet
          </p>
        ) : (
          experiments.map((exp) => (
            <div
              key={exp.id}
              className="flex items-start justify-between gap-2 p-2 rounded-md border bg-background hover:bg-accent/30 transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  {exp.final_decision === "go" ? (
                    <Rocket className="h-3 w-3 text-primary shrink-0" />
                  ) : (
                    <Ban className="h-3 w-3 text-destructive shrink-0" />
                  )}
                  <span className="font-medium text-xs truncate">
                    {exp.decision_question || exp.title}
                  </span>
                  <Badge
                    variant={exp.final_decision === "go" ? "default" : "destructive"}
                    className="text-[9px] px-1 py-0 shrink-0"
                  >
                    {exp.final_decision === "go" ? "GO" : "NO-GO"}
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
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
