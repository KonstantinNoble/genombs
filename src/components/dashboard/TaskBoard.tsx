import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import TaskCard from "./TaskCard";
import type { ImprovementTask } from "@/lib/mock-chat-data";

interface TaskBoardProps {
  initialTasks: ImprovementTask[];
}

const TaskBoard = ({ initialTasks }: TaskBoardProps) => {
  const [tasks, setTasks] = useState<ImprovementTask[]>(initialTasks);

  const handleStatusChange = (id: string, newStatus: ImprovementTask["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const todo = tasks.filter((t) => t.status === "todo");
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const done = tasks.filter((t) => t.status === "done");
  const progress = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;

  const Column = ({ title, items, count }: { title: string; items: ImprovementTask[]; count: number }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
        <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-1.5 py-0.5">{count}</span>
      </div>
      <div className="space-y-2">
        {items.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">{done.length}/{tasks.length} done</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Column title="To Do" items={todo} count={todo.length} />
        <Column title="In Progress" items={inProgress} count={inProgress.length} />
        <Column title="Done" items={done} count={done.length} />
      </div>
    </div>
  );
};

export default TaskBoard;
