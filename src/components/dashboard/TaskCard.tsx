import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ImprovementTask } from "@/lib/mock-chat-data";

interface TaskCardProps {
  task: ImprovementTask;
  onStatusChange: (id: string, status: ImprovementTask["status"]) => void;
}

const statusConfig: Record<ImprovementTask["status"], { label: string; variant: "default" | "secondary" | "outline" }> = {
  todo: { label: "To Do", variant: "outline" },
  in_progress: { label: "In Progress", variant: "secondary" },
  done: { label: "Done", variant: "default" },
};

const priorityBorder: Record<ImprovementTask["priority"], string> = {
  high: "border-l-destructive",
  medium: "border-l-primary",
  low: "border-l-muted-foreground/30",
};

const nextStatus: Record<ImprovementTask["status"], ImprovementTask["status"]> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const TaskCard = ({ task, onStatusChange }: TaskCardProps) => {
  const status = statusConfig[task.status];

  return (
    <Card className={`border-border bg-card border-l-2 ${priorityBorder[task.priority]} ${task.status === "done" ? "opacity-50" : ""}`}>
      <CardContent className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`text-xs font-medium leading-tight ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {task.title}
          </h4>
          <button
            onClick={() => onStatusChange(task.id, nextStatus[task.status])}
            className="shrink-0"
          >
            <Badge variant={status.variant} className="text-[9px] cursor-pointer hover:opacity-80 transition-opacity">
              {status.label}
            </Badge>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            {task.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
