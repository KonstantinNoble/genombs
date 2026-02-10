import { useState } from "react";
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

  const Column = ({ title, items, count }: { title: string; items: ImprovementTask[]; count: number }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
      <div className="space-y-2">
        {items.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Column title="To Do" items={todo} count={todo.length} />
      <Column title="In Arbeit" items={inProgress} count={inProgress.length} />
      <Column title="Erledigt" items={done} count={done.length} />
    </div>
  );
};

export default TaskBoard;
