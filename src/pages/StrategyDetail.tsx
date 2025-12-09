import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Target, 
  ArrowLeft,
  Play, 
  Pause, 
  CheckCircle, 
  Crown, 
  Calendar,
  Loader2,
  Save,
  Flag,
  Zap,
  ExternalLink
} from 'lucide-react';
import { PlannerResult, StrategyPhase } from '@/components/planner/StrategyOutput';

interface ActiveStrategy {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  is_deep_mode: boolean;
  original_result: PlannerResult;
  total_phases: number;
  completed_phases: number;
  total_actions: number;
  completed_actions: number;
  created_at: string;
}

interface PhaseProgress {
  id: string;
  phase_index: number;
  phase_name: string;
  status: 'not_started' | 'in_progress' | 'completed';
  notes: string | null;
}

interface ActionProgress {
  id: string;
  phase_index: number;
  action_index: number;
  action_text: string;
  is_completed: boolean;
}

interface MilestoneProgress {
  id: string;
  phase_index: number;
  milestone_text: string;
  is_completed: boolean;
}

const StrategyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isPremium, isLoading: authLoading } = useAuth();
  
  const [strategy, setStrategy] = useState<ActiveStrategy | null>(null);
  const [phases, setPhases] = useState<PhaseProgress[]>([]);
  const [actions, setActions] = useState<ActionProgress[]>([]);
  const [milestones, setMilestones] = useState<MilestoneProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  const fetchData = useCallback(async () => {
    if (!id) return;
    
    try {
      // Fetch strategy
      const { data: strategyData, error: strategyError } = await supabase
        .from('active_strategies')
        .select('*')
        .eq('id', id)
        .single();

      if (strategyError) throw strategyError;
      setStrategy(strategyData as unknown as ActiveStrategy);

      // Fetch phases
      const { data: phasesData } = await supabase
        .from('strategy_phase_progress')
        .select('*')
        .eq('strategy_id', id)
        .order('phase_index');
      setPhases((phasesData as PhaseProgress[]) || []);

      // Fetch actions
      const { data: actionsData } = await supabase
        .from('strategy_action_progress')
        .select('*')
        .eq('strategy_id', id)
        .order('phase_index')
        .order('action_index');
      setActions((actionsData as ActionProgress[]) || []);

      // Fetch milestones
      const { data: milestonesData } = await supabase
        .from('strategy_milestone_progress')
        .select('*')
        .eq('strategy_id', id)
        .order('phase_index');
      setMilestones((milestonesData as MilestoneProgress[]) || []);

    } catch (error) {
      console.error('Error fetching strategy:', error);
      toast.error('Failed to load strategy');
      navigate('/my-strategies');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (!authLoading && user && !isPremium) {
      toast.error('Premium required');
      navigate('/pricing');
      return;
    }

    if (user && isPremium && id) {
      fetchData();
    }
  }, [user, isPremium, authLoading, id, navigate, fetchData]);

  const toggleAction = async (action: ActionProgress) => {
    const newCompleted = !action.is_completed;
    
    // Optimistic update
    setActions(prev => 
      prev.map(a => a.id === action.id ? { ...a, is_completed: newCompleted } : a)
    );

    try {
      await supabase
        .from('strategy_action_progress')
        .update({ 
          is_completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        })
        .eq('id', action.id);

      // Update strategy counters
      await updateStrategyCounts();
    } catch (error) {
      // Revert on error
      setActions(prev => 
        prev.map(a => a.id === action.id ? { ...a, is_completed: !newCompleted } : a)
      );
      toast.error('Failed to update action');
    }
  };

  const toggleMilestone = async (milestone: MilestoneProgress) => {
    const newCompleted = !milestone.is_completed;
    
    setMilestones(prev => 
      prev.map(m => m.id === milestone.id ? { ...m, is_completed: newCompleted } : m)
    );

    try {
      await supabase
        .from('strategy_milestone_progress')
        .update({ 
          is_completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        })
        .eq('id', milestone.id);
    } catch (error) {
      setMilestones(prev => 
        prev.map(m => m.id === milestone.id ? { ...m, is_completed: !newCompleted } : m)
      );
      toast.error('Failed to update milestone');
    }
  };

  const updatePhaseNotes = async (phaseId: string, notes: string) => {
    setPhases(prev => 
      prev.map(p => p.id === phaseId ? { ...p, notes } : p)
    );
  };

  const savePhaseNotes = async (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;

    setIsSaving(true);
    try {
      await supabase
        .from('strategy_phase_progress')
        .update({ notes: phase.notes })
        .eq('id', phaseId);
      toast.success('Notes saved');
    } catch (error) {
      toast.error('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePhaseStatus = async (phaseId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    setPhases(prev => 
      prev.map(p => p.id === phaseId ? { ...p, status } : p)
    );

    try {
      await supabase
        .from('strategy_phase_progress')
        .update({ 
          status,
          started_at: status !== 'not_started' ? new Date().toISOString() : null,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', phaseId);

      await updateStrategyCounts();
    } catch (error) {
      toast.error('Failed to update phase status');
    }
  };

  const updateStrategyCounts = async () => {
    if (!strategy) return;

    const completedActions = actions.filter(a => a.is_completed).length;
    const completedPhases = phases.filter(p => p.status === 'completed').length;

    try {
      await supabase
        .from('active_strategies')
        .update({
          completed_actions: completedActions,
          completed_phases: completedPhases,
          status: completedPhases === strategy.total_phases ? 'completed' : 'active'
        })
        .eq('id', strategy.id);

      setStrategy(prev => prev ? {
        ...prev,
        completed_actions: completedActions,
        completed_phases: completedPhases
      } : null);
    } catch (error) {
      console.error('Error updating strategy counts:', error);
    }
  };

  const getPhaseStatusBadge = (status: string) => {
    const variants: Record<string, { class: string; icon: React.ReactNode }> = {
      not_started: { 
        class: 'bg-muted text-muted-foreground border-border', 
        icon: null 
      },
      in_progress: { 
        class: 'bg-primary/10 text-primary border-primary/30', 
        icon: <Play className="h-3 w-3 mr-1" /> 
      },
      completed: { 
        class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', 
        icon: <CheckCircle className="h-3 w-3 mr-1" /> 
      }
    };
    return variants[status] || variants.not_started;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">Strategy not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const overallProgress = strategy.total_actions > 0 
    ? Math.round((strategy.completed_actions / strategy.total_actions) * 100) 
    : 0;

  const originalStrategies = strategy.original_result?.strategies || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{strategy.name} - Strategy Tracker - Synoptas</title>
      </Helmet>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/my-strategies')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Strategies
          </Button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {strategy.is_deep_mode && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                    <Crown className="h-3 w-3 mr-1" />
                    Deep Mode
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(strategy.created_at).toLocaleDateString()}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{strategy.name}</h1>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Overall Progress</h2>
                <p className="text-sm text-muted-foreground">
                  {strategy.completed_actions} of {strategy.total_actions} actions completed
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
            </div>
            <Progress value={overallProgress} className="h-3" />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">{strategy.total_phases}</div>
                <div className="text-xs text-muted-foreground">Total Phases</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{strategy.completed_phases}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">{strategy.total_actions}</div>
                <div className="text-xs text-muted-foreground">Total Actions</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{strategy.completed_actions}</div>
                <div className="text-xs text-muted-foreground">Done</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phases */}
        <div className="space-y-4">
          {originalStrategies.map((originalPhase: StrategyPhase, phaseIndex: number) => {
            const phaseProgress = phases.find(p => p.phase_index === phaseIndex);
            const phaseActions = actions.filter(a => a.phase_index === phaseIndex);
            const phaseMilestones = milestones.filter(m => m.phase_index === phaseIndex);
            const completedInPhase = phaseActions.filter(a => a.is_completed).length;
            const phasePercent = phaseActions.length > 0 
              ? Math.round((completedInPhase / phaseActions.length) * 100) 
              : 0;
            const statusBadge = getPhaseStatusBadge(phaseProgress?.status || 'not_started');
            const isExpanded = expandedPhase === phaseIndex;

            return (
              <Card 
                key={phaseIndex} 
                className={`overflow-hidden transition-all duration-300 ${
                  strategy.is_deep_mode ? 'border-amber-500/20' : ''
                }`}
              >
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedPhase(isExpanded ? null : phaseIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {phaseIndex + 1}
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg">{originalPhase.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={statusBadge.class}>
                            {statusBadge.icon}
                            {phaseProgress?.status?.replace('_', ' ') || 'not started'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{originalPhase.timeframe}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{phasePercent}%</div>
                      <div className="text-xs text-muted-foreground">{completedInPhase}/{phaseActions.length}</div>
                    </div>
                  </div>
                  <Progress value={phasePercent} className="h-1.5 mt-3" />
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-6">
                    {/* Phase Status Buttons */}
                    {phaseProgress && (
                      <div className="flex flex-wrap gap-2 pb-4 border-b border-border/50">
                        <span className="text-sm text-muted-foreground mr-2">Status:</span>
                        {(['not_started', 'in_progress', 'completed'] as const).map(status => (
                          <Button
                            key={status}
                            size="sm"
                            variant={phaseProgress.status === status ? 'default' : 'outline'}
                            onClick={() => updatePhaseStatus(phaseProgress.id, status)}
                            className="text-xs"
                          >
                            {status === 'not_started' && 'Not Started'}
                            {status === 'in_progress' && <><Play className="h-3 w-3 mr-1" /> In Progress</>}
                            {status === 'completed' && <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Actions Checklist */}
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Actions ({completedInPhase}/{phaseActions.length})
                      </h4>
                      <div className="space-y-2">
                        {phaseActions.map((action) => {
                          const originalAction = originalPhase.actions[action.action_index];
                          const searchTerm = typeof originalAction === 'object' && 'searchTerm' in originalAction 
                            ? originalAction.searchTerm 
                            : null;
                          
                          return (
                            <div 
                              key={action.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                action.is_completed 
                                  ? 'bg-primary/5 border-primary/20' 
                                  : 'bg-muted/20 border-border/50 hover:border-primary/30'
                              }`}
                            >
                              <Checkbox
                                checked={action.is_completed}
                                onCheckedChange={() => toggleAction(action)}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm ${action.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {action.action_text}
                                </span>
                                {searchTerm && (
                                  <a 
                                    href={`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 ml-2 text-xs text-primary hover:underline"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Learn more
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Milestones (Deep Mode) */}
                    {strategy.is_deep_mode && phaseMilestones.length > 0 && (
                      <div className="pt-4 border-t border-amber-500/30">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                          <Flag className="h-4 w-4" />
                          KPI Milestones
                        </h4>
                        <div className="space-y-2">
                          {phaseMilestones.map((milestone) => (
                            <div 
                              key={milestone.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                milestone.is_completed 
                                  ? 'bg-amber-500/10 border-amber-500/30' 
                                  : 'bg-amber-500/5 border-amber-500/20'
                              }`}
                            >
                              <Checkbox
                                checked={milestone.is_completed}
                                onCheckedChange={() => toggleMilestone(milestone)}
                                className="mt-0.5"
                              />
                              <span className={`text-sm ${milestone.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                {milestone.milestone_text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {phaseProgress && (
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          Notes
                        </h4>
                        <Textarea
                          placeholder="Add notes for this phase..."
                          value={phaseProgress.notes || ''}
                          onChange={(e) => updatePhaseNotes(phaseProgress.id, e.target.value)}
                          className="min-h-[100px] resize-none"
                        />
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={() => savePhaseNotes(phaseProgress.id)}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Notes
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StrategyDetail;
