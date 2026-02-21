import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/external-client';
import { CheckCircle, Circle, ListTodo } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { DailyTask } from '@/types/gamification';

interface DailyTaskPanelProps {
  userId: string | null;
  onTaskCompleted?: () => void;
}

export function DailyTaskPanel({ userId, onTaskCompleted }: DailyTaskPanelProps) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_tasks' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('created_at', today)
        .order('created_at', { ascending: false });
      
      setTasks((data as unknown as DailyTask[]) || []);
    } catch (err) {
      console.error('Fetch tasks error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_tasks' as any)
        .update({ completed: !completed })
        .eq('id', taskId);

      if (error) {
        console.error('Toggle task error:', error);
        return;
      }

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !completed } : t
      ));

      if (!completed) {
        onTaskCompleted?.();
      }
    } catch (err) {
      console.error('Toggle task error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-4 bg-secondary rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-8 bg-secondary rounded" />
          <div className="h-8 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (tasks.length === 0) return null;

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <ListTodo className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Heutige Aufgaben</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {completedCount}/{tasks.length}
        </span>
      </div>

      <Progress value={progress} className="h-1.5 mb-3" />

      <div className="space-y-2">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id, task.completed)}
            className={`w-full flex items-start gap-2.5 p-2.5 rounded-md text-left transition-all duration-200 hover:bg-secondary/50 ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            {task.completed ? (
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            )}
            <span className={`text-sm ${
              task.completed 
                ? 'line-through text-muted-foreground' 
                : 'text-foreground'
            }`}>
              {task.task_text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
