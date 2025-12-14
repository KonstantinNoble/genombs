import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusTask {
  id: string;
  task_title: string;
  task_description: string;
  task_type: string;
  priority: number;
  estimated_duration: string;
  phase_index: number;
  action_index: number | null;
  ai_reasoning: string;
  is_completed: boolean;
}

interface FocusTaskCardProps {
  task: FocusTask;
  onToggle: (taskId: string, completed: boolean) => void;
}

const FocusTaskCard = ({ task, onToggle }: FocusTaskCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const priorityEmoji = task.priority === 1 ? '1️⃣' : task.priority === 2 ? '2️⃣' : '3️⃣';
  
  const taskTypeLabel = {
    action: 'Action',
    preparation: 'Vorbereitung',
    review: 'Review',
  }[task.task_type] || 'Task';

  const taskTypeColor = {
    action: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    preparation: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    review: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  }[task.task_type] || 'bg-muted text-muted-foreground';

  return (
    <div 
      className={cn(
        "border rounded-lg p-4 transition-all duration-200",
        task.is_completed 
          ? "bg-muted/50 border-muted opacity-75" 
          : "bg-background border-border hover:border-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm">{priorityEmoji}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", taskTypeColor)}>
              {taskTypeLabel}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimated_duration}
            </span>
            <span className="text-xs text-muted-foreground">
              Phase {task.phase_index + 1}
            </span>
          </div>
          
          <h4 className={cn(
            "font-medium",
            task.is_completed && "line-through text-muted-foreground"
          )}>
            {task.task_title}
          </h4>
          
          {task.task_description && (
            <p className="text-sm text-muted-foreground mt-1">
              {task.task_description}
            </p>
          )}
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary mt-2 transition-colors"
          >
            <Lightbulb className="h-3 w-3" />
            Warum heute?
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          
          {expanded && (
            <div className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded p-2 italic">
              💡 {task.ai_reasoning}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusTaskCard;
