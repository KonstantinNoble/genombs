import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ImprovementTask } from "@/lib/mock-chat-data";

interface TaskCardProps {
  task: ImprovementTask;
  onStatusChange: (id: string, status: ImprovementTask["status"]) => void;
}

const statusConfig: Record<ImprovementTask["status"], { label: string; variant: "default" | "secondary" | "outline" }> = {
  todo: { label: "To Do", variant: "outline" },
  in_progress: { label: "In Arbeit", variant: "secondary" },
  done: { label: "Erledigt", variant: "default" },
};

const priorityConfig: Record<ImprovementTask["priority"], { label: string; className: string }> = {
  high: { label: "Hoch", className: "text-destructive" },
  medium: { label: "Mittel", className: "text-primary" },
  low: { label: "Niedrig", className: "text-muted-foreground" },
};

const nextStatus: Record<ImprovementTask["status"], ImprovementTask["status"]> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const TaskCard = ({ task, onStatusChange }: TaskCardProps) => {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <Card className={`border-border bg-card transition-all ${task.status === "done" ? "opacity-60" : ""}`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {task.title}
          </h4>
          <button
            onClick={() => onStatusChange(task.id, nextStatus[task.status])}
            className="shrink-0"
          >
            <Badge variant={status.variant} className="text-[10px] cursor-pointer hover:opacity-80 transition-opacity">
              {status.label}
            </Badge>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{task.description}</p>
        <p className={`text-[10px] font-medium ${priority.className}`}>
          Priorität: {priority.label}
        </p>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
