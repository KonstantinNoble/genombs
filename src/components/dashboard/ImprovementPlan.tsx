import { Badge } from "@/components/ui/badge";
import type { ImprovementTask } from "@/lib/mock-chat-data";

interface ImprovementPlanProps {
  tasks: ImprovementTask[];
}

const priorityColors: Record<string, string> = {
  high: "border-l-destructive",
  medium: "border-l-primary",
  low: "border-l-muted-foreground",
};

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const ImprovementPlan = ({ tasks }: ImprovementPlanProps) => {
  const sorted = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-2">
      {sorted.map((task) => (
        <div
          key={task.id}
          className={`border border-border bg-card rounded-lg p-3 border-l-[3px] ${priorityColors[task.priority]}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {task.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{task.description}</p>
            </div>
            <Badge
              variant={task.status === "done" ? "secondary" : task.status === "in_progress" ? "default" : "outline"}
              className="text-[10px] shrink-0"
            >
              {statusLabels[task.status]}
            </Badge>
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-[10px]">{task.category}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImprovementPlan;
