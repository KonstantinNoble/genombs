import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, RefreshCw, Target, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import FocusTaskCard from './FocusTaskCard';
import StreakDisplay from './StreakDisplay';

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
  completed_at: string | null;
  generated_for_date: string;
}

interface AutopilotDashboardProps {
  strategyId: string;
  strategyName: string;
  onTaskComplete?: () => void;
}

const AutopilotDashboard = ({ strategyId, strategyName, onTaskComplete }: AutopilotDashboardProps) => {
  const [tasks, setTasks] = useState<FocusTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  const fetchOrGenerateTasks = async (forceRegenerate = false) => {
    try {
      if (forceRegenerate) {
        setRegenerating(true);
      } else {
        setLoading(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('generate-focus-tasks', {
        body: { 
          strategy_id: strategyId,
          force_regenerate: forceRegenerate
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate tasks');
      }

      const data = response.data;
      setTasks(data.tasks || []);
      setStreak(data.streak ?? 0);
      setLongestStreak(data.longestStreak ?? 0);

      if (!data.cached && !forceRegenerate) {
        toast({
          title: "Focus Tasks generiert",
          description: "Deine täglichen Aufgaben wurden erstellt.",
        });
      }
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Fehler",
        description: error.message || "Tasks konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchOrGenerateTasks();
  }, [strategyId]);

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('autopilot_focus_tasks')
        .update({ 
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }
          : t
      ));

      // Update strategy total completed tasks if completing
      if (completed) {
        await supabase
          .from('active_strategies')
          .update({ 
            total_focus_tasks_completed: tasks.filter(t => t.is_completed).length + 1
          })
          .eq('id', strategyId);
      }

      onTaskComplete?.();

      // Check if all tasks completed
      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, is_completed: completed } : t);
      const allCompleted = updatedTasks.every(t => t.is_completed);
      
      if (allCompleted && completed) {
        toast({
          title: "🎉 Alle Tasks erledigt!",
          description: "Super Arbeit! Morgen warten neue Aufgaben auf dich.",
        });
      }
    } catch (error: any) {
      console.error('Error toggling task:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const allCompleted = tasks.length > 0 && completedCount === tasks.length;

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generiere Focus Tasks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Today's Focus</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="flex items-center gap-3">
            <StreakDisplay streak={streak} longestStreak={longestStreak} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchOrGenerateTasks(true)}
              disabled={regenerating}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {completedCount}/{tasks.length} Tasks erledigt
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Keine Tasks für heute.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchOrGenerateTasks(true)}
              className="mt-3"
            >
              Tasks generieren
            </Button>
          </div>
        ) : (
          <>
            {tasks
              .sort((a, b) => a.priority - b.priority)
              .map((task) => (
                <FocusTaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleTaskToggle}
                />
              ))}
            
            {allCompleted && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✨ Alle Tasks erledigt! Super Arbeit!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Morgen warten neue Aufgaben auf dich.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AutopilotDashboard;
