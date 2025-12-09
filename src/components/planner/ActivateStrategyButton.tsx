import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Target, Crown, Loader2, Lock } from 'lucide-react';
import { PlannerResult, StrategyPhase } from './StrategyOutput';

interface ActivateStrategyButtonProps {
  result: PlannerResult;
  isDeepMode?: boolean;
}

export function ActivateStrategyButton({ result, isDeepMode = false }: ActivateStrategyButtonProps) {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [strategyName, setStrategyName] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activeCount, setActiveCount] = useState<number | null>(null);

  const MAX_ACTIVE_STRATEGIES = 3;

  const checkActiveCount = async () => {
    if (!user) return;
    
    const { count } = await supabase
      .from('active_strategies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    setActiveCount(count || 0);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      checkActiveCount();
      // Generate default name from first strategy phase
      const defaultName = result.strategies?.[0]?.title || 'My Strategy';
      setStrategyName(defaultName);
    }
  };

  const activateStrategy = async () => {
    if (!user || !strategyName.trim()) return;
    
    if (activeCount !== null && activeCount >= MAX_ACTIVE_STRATEGIES) {
      toast.error(`Maximum ${MAX_ACTIVE_STRATEGIES} active strategies allowed`);
      return;
    }

    setIsActivating(true);

    try {
      const strategies = result.strategies || [];
      
      // Calculate totals
      let totalActions = 0;
      strategies.forEach((phase: StrategyPhase) => {
        totalActions += phase.actions?.length || 0;
      });

      // Insert main strategy
      const { data: strategyData, error: strategyError } = await supabase
        .from('active_strategies')
        .insert([{
          user_id: user.id,
          name: strategyName.trim(),
          original_result: JSON.parse(JSON.stringify(result)),
          is_deep_mode: isDeepMode,
          status: 'active',
          total_phases: strategies.length,
          completed_phases: 0,
          total_actions: totalActions,
          completed_actions: 0
        }])
        .select()
        .single();

      if (strategyError) throw strategyError;

      const strategyId = strategyData.id;

      // Insert phase progress records (now includes actions_completed and milestones_completed arrays)
      const phaseRecords = strategies.map((phase: StrategyPhase, index: number) => ({
        strategy_id: strategyId,
        phase_index: index,
        phase_name: phase.title,
        status: 'not_started' as const,
        actions_completed: [] as number[],
        milestones_completed: [] as number[]
      }));

      if (phaseRecords.length > 0) {
        const { error: phasesError } = await supabase
          .from('strategy_phase_progress')
          .insert(phaseRecords);
        if (phasesError) console.error('Error inserting phases:', phasesError);
      }

      toast.success('Strategy activated!', {
        description: 'Track your progress in My Strategies'
      });

      setIsOpen(false);
      navigate('/my-strategies');

    } catch (error) {
      console.error('Error activating strategy:', error);
      toast.error('Failed to activate strategy');
    } finally {
      setIsActivating(false);
    }
  };

  // Non-premium users see locked button
  if (!isPremium) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Lock className="h-4 w-4" />
        Activate Strategy
        <Badge className="ml-1 bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs">
          Premium
        </Badge>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
          <Target className="h-4 w-4" />
          Activate Strategy
          {isDeepMode && (
            <Crown className="h-3.5 w-3.5 text-amber-400" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Activate Strategy
          </DialogTitle>
          <DialogDescription>
            Track your progress and complete actions step by step. 
            {activeCount !== null && (
              <span className="block mt-1 text-xs">
                Active strategies: {activeCount}/{MAX_ACTIVE_STRATEGIES}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Strategy Name</label>
            <Input
              placeholder="e.g., Q1 Growth Strategy"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              maxLength={100}
            />
          </div>

          {isDeepMode && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-600 dark:text-amber-400">
                Deep Mode - Includes milestone tracking
              </span>
            </div>
          )}

          {activeCount !== null && activeCount >= MAX_ACTIVE_STRATEGIES && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-sm text-destructive">
              You've reached the maximum of {MAX_ACTIVE_STRATEGIES} active strategies. 
              Complete or delete an existing strategy to activate a new one.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={activateStrategy}
            disabled={isActivating || !strategyName.trim() || (activeCount !== null && activeCount >= MAX_ACTIVE_STRATEGIES)}
          >
            {isActivating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
