import { Badge } from "@/components/ui/badge";
import { Flame, ArrowUp, Minus, CheckCircle2 } from "lucide-react";
import type { ImprovementTask } from "@/types/chat";

interface ImprovementPlanProps {
  tasks: ImprovementTask[];
}

const priorityColors: Record<string, string> = {
  high: "border-l-destructive",
  medium: "border-l-primary",
  low: "border-l-muted-foreground",
};

const priorityIcons: Record<string, React.ReactNode> = {
  high: <Flame className="w-3.5 h-3.5 text-destructive" />,
  medium: <ArrowUp className="w-3.5 h-3.5 text-primary" />,
  low: <Minus className="w-3.5 h-3.5 text-muted-foreground" />,
};

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const ImprovementPlan = ({ tasks }: ImprovementPlanProps) => {
  const sorted = [...tasks].sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
  });

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;

  return (
    <div className="space-y-3">
      {/* Progress summary */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-chart-6 transition-all duration-700"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
           <span className="text-xs text-muted-foreground whitespace-nowrap">
             {doneCount}/{totalCount} done
           </span>
        </div>
      )}

      {sorted.map((task) => (
        <div
          key={task.id}
          className={`border border-border bg-card rounded-lg p-4 border-l-[3px] transition-all duration-200 hover:border-primary/20 ${priorityColors[task.priority] ?? ""}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                {task.status === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-chart-6 shrink-0" />
                ) : (
                  priorityIcons[task.priority]
                )}
                 <p
                   className={`text-base font-semibold ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}
                 >
                   {task.title}
                 </p>
              </div>
               {task.description && (
                 <p className="text-sm text-muted-foreground mt-0.5 ml-5.5 pl-[22px]">
                   {task.description}
                 </p>
               )}
            </div>
            <Badge
              variant={task.status === "done" ? "secondary" : task.status === "in_progress" ? "default" : "outline"}
              className="text-xs shrink-0"
            >
              {statusLabels[task.status] ?? task.status}
            </Badge>
          </div>
           {task.category && (
             <div className="mt-2 pl-[22px]">
               <Badge variant="secondary" className="text-xs">
                 {task.category}
               </Badge>
             </div>
           )}
        </div>
      ))}
    </div>
  );
};

export default ImprovementPlan;
