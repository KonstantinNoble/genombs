import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, Clock, Sparkles } from 'lucide-react';
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
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
  const [maxGenerations, setMaxGenerations] = useState(3);
  const [limitReached, setLimitReached] = useState(false);
  const [resetTime, setResetTime] = useState<string | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Calculate time until reset
  const calculateTimeUntilReset = (resetTimeStr: string) => {
    const resetDate = new Date(resetTimeStr);
    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Refreshing...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Update timer every minute
  useEffect(() => {
    if (!resetTime || !limitReached) return;
    
    const updateTimer = () => {
      const timeStr = calculateTimeUntilReset(resetTime);
      setTimeUntilReset(timeStr);
      
      // If timer expired, reset limit state
      if (timeStr === 'Refreshing...') {
        setLimitReached(false);
        setRemainingGenerations(maxGenerations);
        setResetTime(null);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [resetTime, limitReached, maxGenerations]);

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

      const data = response.data;
      
      // Handle 429 limit error - when this happens, data is null
      // Check error message or status to detect limit reached
      if (response.error && !data) {
        const errorMsg = response.error.message || '';
        const isLimitError = errorMsg.includes('429') || 
                            errorMsg.includes('limit') || 
                            errorMsg.includes('non-2xx');
        
        if (isLimitError) {
          // Calculate reset time client-side (midnight UTC)
          const now = new Date();
          const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
          const resetTimeStr = tomorrow.toISOString();
          
          setLimitReached(true);
          setRemainingGenerations(0);
          setResetTime(resetTimeStr);
          setTimeUntilReset(calculateTimeUntilReset(resetTimeStr));
          
          toast({
            title: "Daily limit reached",
            description: `You've used all AI generations today. Try again in ${calculateTimeUntilReset(resetTimeStr)}.`,
            variant: "destructive",
          });
          setLoading(false);
          setRegenerating(false);
          return;
        }
        
        throw new Error(response.error.message || 'Failed to generate tasks');
      }
      
      // Check for limit reached in data (when status is 200 with limit info)
      if (data?.limit_reached) {
        setLimitReached(true);
        setRemainingGenerations(data.remaining_generations ?? 0);
        if (data.max_generations !== undefined) {
          setMaxGenerations(data.max_generations);
        }
        if (data.reset_time) {
          setResetTime(data.reset_time);
          setTimeUntilReset(calculateTimeUntilReset(data.reset_time));
        }
        toast({
          title: "Daily limit reached",
          description: `You've used all ${data.max_generations || 3} AI generations today. New generations available in ${calculateTimeUntilReset(data.reset_time)}.`,
          variant: "destructive",
        });
        setLoading(false);
        setRegenerating(false);
        return;
      }

      if (data?.error) {
        throw new Error(data.error);
      }
      
      // Update generation counts from successful response
      if (data?.remaining_generations !== undefined) {
        setRemainingGenerations(data.remaining_generations);
      }
      if (data?.max_generations !== undefined) {
        setMaxGenerations(data.max_generations);
      }

      setLimitReached(false);
      setTasks(data?.tasks || []);
      setStreak(data?.streak ?? 0);
      setLongestStreak(data?.longestStreak ?? 0);

      if (data && !data.cached && forceRegenerate) {
        toast({
          title: "Tasks regenerated",
          description: `${data.remaining_generations} generation${data.remaining_generations !== 1 ? 's' : ''} remaining today.`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: error.message || "Could not load tasks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    // Reset state when strategy changes
    setRemainingGenerations(null);
    setLimitReached(false);
    setResetTime(null);
    setTasks([]);
    
    fetchOrGenerateTasks();
  }, [strategyId]);

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      // Optimistically update UI first
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }
          : t
      ));

      const { data, error } = await supabase
        .from('autopilot_focus_tasks')
        .update({ 
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', taskId)
        .select();

      if (error) {
        console.error('Database update error:', error);
        // Revert optimistic update on error
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, is_completed: !completed, completed_at: null }
            : t
        ));
        throw error;
      }

      console.log('Task updated successfully:', data);

      // Update strategy total completed tasks
      const currentCompletedCount = tasks.filter(t => 
        t.id === taskId ? completed : t.is_completed
      ).length;
      
      await supabase
        .from('active_strategies')
        .update({ 
          total_focus_tasks_completed: currentCompletedCount
        })
        .eq('id', strategyId);

      onTaskComplete?.();

      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, is_completed: completed } : t);
      const allCompleted = updatedTasks.every(t => t.is_completed);
      
      if (allCompleted && completed && updatedTasks.length > 0) {
        toast({
          title: "All tasks completed",
          description: "Great work. New tasks will be available tomorrow.",
        });
      }
    } catch (error: any) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error",
        description: "Could not update status.",
        variant: "destructive",
      });
    }
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const allCompleted = tasks.length > 0 && completedCount === tasks.length;

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating focus tasks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Today's Focus</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            {/* Generation counter */}
            {limitReached ? (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                Resets in {timeUntilReset}
              </Badge>
            ) : remainingGenerations !== null ? (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                {remainingGenerations}/{maxGenerations} left
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 text-xs animate-pulse">
                <Sparkles className="h-3 w-3" />
                Loading...
              </Badge>
            )}
            <StreakDisplay streak={streak} longestStreak={longestStreak} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchOrGenerateTasks(true)}
              disabled={regenerating || limitReached}
              className="h-8"
              title={limitReached ? `Limit reached. Resets in ${timeUntilReset}` : 'Regenerate tasks'}
            >
              <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {completedCount}/{tasks.length} tasks completed
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          limitReached ? (
            <div className="text-center py-6 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                Daily limit reached
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                New generations available in {timeUntilReset}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No tasks for today.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchOrGenerateTasks(true)}
                className="mt-3"
              >
                Generate tasks
              </Button>
            </div>
          )
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
                  All tasks completed. Great work.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  New tasks will be available tomorrow.
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
