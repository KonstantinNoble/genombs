import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    if (isOpen) {
      loadArchivedExperiments();
    }
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    try {
      // Delete related tasks and checkpoints first
      await supabase.from("experiment_tasks").delete().eq("experiment_id", id);
      await supabase.from("experiment_checkpoints").delete().eq("experiment_id", id);
      
      // Then delete the experiment
      const { error } = await supabase.from("experiments").delete().eq("id", id);
      
      if (error) throw error;
      
      setExperiments((prev) => prev.filter((e) => e.id !== id));
      toast({
        title: "Deleted",
        description: "Decision permanently removed from database.",
      });
    } catch (error) {
      console.error("Error deleting experiment:", error);
      toast({
        title: "Error",
        description: "Failed to delete. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (experiments.length === 0 && !isOpen) {
    return null;
  }

  return (
    <Card className="border-muted">
      <CardHeader className="py-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Archived Decisions
            </CardTitle>
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
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 space-y-3">
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
                className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {exp.final_decision === "go" ? (
                      <Rocket className="h-3.5 w-3.5 text-primary shrink-0" />
                    ) : (
                      <Ban className="h-3.5 w-3.5 text-destructive shrink-0" />
                    )}
                    <span className="font-medium text-sm truncate">
                      {exp.decision_question || exp.title}
                    </span>
                    <Badge
                      variant={exp.final_decision === "go" ? "default" : "destructive"}
                      className="text-[10px] shrink-0"
                    >
                      {exp.final_decision === "go" ? "GO" : "NO-GO"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate italic">
                    "{exp.hypothesis}"
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(exp.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Decision?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this decision and all related
                        data. This action cannot be undone.
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
        </CardContent>
      )}
    </Card>
  );
}
