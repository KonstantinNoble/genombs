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
import AutopilotDashboard from '@/components/autopilot/AutopilotDashboard';

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
  actions_completed: number[];
  milestones_completed: number[];
}

const StrategyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isPremium, isLoading: authLoading } = useAuth();
  
  const [strategy, setStrategy] = useState<ActiveStrategy | null>(null);
  const [phases, setPhases] = useState<PhaseProgress[]>([]);
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

      // Fetch phases (now includes actions_completed and milestones_completed)
      const { data: phasesData } = await supabase
        .from('strategy_phase_progress')
        .select('*')
        .eq('strategy_id', id)
        .order('phase_index');
      
      setPhases((phasesData || []).map(p => ({
        ...p,
        actions_completed: p.actions_completed || [],
        milestones_completed: p.milestones_completed || []
      })) as PhaseProgress[]);

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

  const toggleAction = async (phaseIndex: number, actionIndex: number) => {
    const phase = phases.find(p => p.phase_index === phaseIndex);
    if (!phase) return;

    const isCurrentlyCompleted = phase.actions_completed.includes(actionIndex);
    const newActionsCompleted = isCurrentlyCompleted
      ? phase.actions_completed.filter(i => i !== actionIndex)
      : [...phase.actions_completed, actionIndex].sort((a, b) => a - b);

    // Optimistic update
    setPhases(prev => 
      prev.map(p => p.phase_index === phaseIndex 
        ? { ...p, actions_completed: newActionsCompleted } 
        : p
      )
    );

    try {
      await supabase
        .from('strategy_phase_progress')
        .update({ actions_completed: newActionsCompleted })
        .eq('id', phase.id);

      // Update strategy counters
      await updateStrategyCounts(newActionsCompleted.length - phase.actions_completed.length);
    } catch (error) {
      // Revert on error
      setPhases(prev => 
        prev.map(p => p.phase_index === phaseIndex 
          ? { ...p, actions_completed: phase.actions_completed } 
          : p
        )
      );
      toast.error('Failed to update action');
    }
  };

  const toggleMilestone = async (phaseIndex: number, milestoneIndex: number) => {
    const phase = phases.find(p => p.phase_index === phaseIndex);
    if (!phase) return;

    const isCurrentlyCompleted = phase.milestones_completed.includes(milestoneIndex);
    const newMilestonesCompleted = isCurrentlyCompleted
      ? phase.milestones_completed.filter(i => i !== milestoneIndex)
      : [...phase.milestones_completed, milestoneIndex].sort((a, b) => a - b);

    // Optimistic update
    setPhases(prev => 
      prev.map(p => p.phase_index === phaseIndex 
        ? { ...p, milestones_completed: newMilestonesCompleted } 
        : p
      )
    );

    try {
      await supabase
        .from('strategy_phase_progress')
        .update({ milestones_completed: newMilestonesCompleted })
        .eq('id', phase.id);
    } catch (error) {
      // Revert on error
      setPhases(prev => 
        prev.map(p => p.phase_index === phaseIndex 
          ? { ...p, milestones_completed: phase.milestones_completed } 
          : p
        )
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
    const oldPhase = phases.find(p => p.id === phaseId);
    const wasCompleted = oldPhase?.status === 'completed';
    const isNowCompleted = status === 'completed';

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

      // Update phase count if completion status changed
      if (wasCompleted !== isNowCompleted) {
        await updatePhaseCount(isNowCompleted ? 1 : -1);
      }
    } catch (error) {
      toast.error('Failed to update phase status');
    }
  };

  const updateStrategyCounts = async (actionDelta: number) => {
    if (!strategy) return;

    const newCompletedActions = strategy.completed_actions + actionDelta;

    try {
      await supabase
        .from('active_strategies')
        .update({
          completed_actions: newCompletedActions
        })
        .eq('id', strategy.id);

      setStrategy(prev => prev ? {
        ...prev,
        completed_actions: newCompletedActions
      } : null);
    } catch (error) {
      console.error('Error updating strategy counts:', error);
    }
  };

  const updatePhaseCount = async (phaseDelta: number) => {
    if (!strategy) return;

    const newCompletedPhases = strategy.completed_phases + phaseDelta;

    try {
      await supabase
        .from('active_strategies')
        .update({
          completed_phases: newCompletedPhases,
          status: newCompletedPhases === strategy.total_phases ? 'completed' : 'active'
        })
        .eq('id', strategy.id);

      setStrategy(prev => prev ? {
        ...prev,
        completed_phases: newCompletedPhases
      } : null);
    } catch (error) {
      console.error('Error updating phase count:', error);
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

      <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-12">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/my-strategies')}
            className="mb-3 sm:mb-4 -ml-2 h-8 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Back
          </Button>
          
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {strategy.is_deep_mode && (
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 text-[10px] sm:text-xs">
                  <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  Deep
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                {new Date(strategy.created_at).toLocaleDateString()}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">{strategy.name}</h1>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="py-4 sm:py-6 px-4 sm:px-6">
            <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold">Overall Progress</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {strategy.completed_actions}/{strategy.total_actions} actions
                </p>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-primary flex-shrink-0">{overallProgress}%</div>
            </div>
            <Progress value={overallProgress} className="h-2 sm:h-3" />
            
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="text-center p-2 sm:p-3 bg-muted/30 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold">{strategy.total_phases}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Phases</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-muted/30 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-primary">{strategy.completed_phases}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Done</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-muted/30 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold">{strategy.total_actions}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Actions</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-muted/30 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-primary">{strategy.completed_actions}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Done</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Autopilot Dashboard */}
        <AutopilotDashboard 
          strategyId={strategy.id} 
          strategyName={strategy.name}
          onTaskComplete={fetchData}
        />

        {/* Phases */}
        <div className="space-y-4 mt-6">
          {originalStrategies.map((originalPhase: StrategyPhase, phaseIndex: number) => {
            const phaseProgress = phases.find(p => p.phase_index === phaseIndex);
            const phaseActions = originalPhase.actions || [];
            const phaseMilestones = originalPhase.milestones || [];
            const completedInPhase = phaseProgress?.actions_completed.length || 0;
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
                  className="cursor-pointer hover:bg-muted/30 transition-colors p-4 sm:p-6"
                  onClick={() => setExpandedPhase(isExpanded ? null : phaseIndex)}
                >
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                        {phaseIndex + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm sm:text-lg leading-tight line-clamp-2">{originalPhase.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                          <Badge variant="outline" className={`${statusBadge.class} text-[10px] sm:text-xs px-1.5 sm:px-2`}>
                            {statusBadge.icon}
                            <span className="hidden xs:inline">{phaseProgress?.status?.replace('_', ' ') || 'not started'}</span>
                            <span className="xs:hidden">{phaseProgress?.status === 'in_progress' ? 'Active' : phaseProgress?.status === 'completed' ? 'Done' : 'New'}</span>
                          </Badge>
                          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{originalPhase.timeframe}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base sm:text-lg font-bold">{phasePercent}%</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{completedInPhase}/{phaseActions.length}</div>
                    </div>
                  </div>
                  <Progress value={phasePercent} className="h-1 sm:h-1.5 mt-3" />
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 px-4 sm:px-6 space-y-4 sm:space-y-6">
                    {/* Phase Status Buttons */}
                    {phaseProgress && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 pb-4 border-b border-border/50">
                        <span className="text-xs sm:text-sm text-muted-foreground mr-1 sm:mr-2 w-full sm:w-auto mb-1 sm:mb-0">Status:</span>
                        {(['not_started', 'in_progress', 'completed'] as const).map(status => (
                          <Button
                            key={status}
                            size="sm"
                            variant={phaseProgress.status === status ? 'default' : 'outline'}
                            onClick={() => updatePhaseStatus(phaseProgress.id, status)}
                            className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                          >
                            {status === 'not_started' && <span className="hidden sm:inline">Not Started</span>}
                            {status === 'not_started' && <span className="sm:hidden">New</span>}
                            {status === 'in_progress' && <><Play className="h-3 w-3 mr-1" /><span className="hidden sm:inline">In Progress</span><span className="sm:hidden">Active</span></>}
                            {status === 'completed' && <><CheckCircle className="h-3 w-3 mr-1" /><span className="hidden sm:inline">Completed</span><span className="sm:hidden">Done</span></>}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Actions Checklist */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 sm:mb-3 flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Actions ({completedInPhase}/{phaseActions.length})
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2">
                        {phaseActions.map((action, actionIndex) => {
                          const actionText = typeof action === 'string' ? action : action.text || '';
                          const resourceUrl = typeof action === 'object' && 'resourceUrl' in action 
                            ? String(action.resourceUrl || '')
                            : '';
                          const resourceTitle = typeof action === 'object' && 'resourceTitle' in action 
                            ? String(action.resourceTitle || '')
                            : '';
                          const isCompleted = phaseProgress?.actions_completed.includes(actionIndex) || false;
                          
                          return (
                            <div 
                              key={actionIndex}
                              className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all ${
                                isCompleted 
                                  ? 'bg-primary/5 border-primary/20' 
                                  : 'bg-muted/20 border-border/50 hover:border-primary/30'
                              }`}
                            >
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() => toggleAction(phaseIndex, actionIndex)}
                                className="mt-0.5 h-4 w-4"
                              />
                              <div className="flex-1 min-w-0">
                                <span className={`text-xs sm:text-sm leading-relaxed ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                  {actionText}
                                </span>
                                {resourceUrl && (
                                  <a 
                                    href={resourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 ml-1 sm:ml-2 text-[10px] sm:text-xs text-primary hover:underline"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    <span className="truncate max-w-[80px]">{resourceTitle || 'Resource'}</span>
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
                          {phaseMilestones.map((milestone, milestoneIndex) => {
                            const isCompleted = phaseProgress?.milestones_completed.includes(milestoneIndex) || false;
                            
                            return (
                              <div 
                                key={milestoneIndex}
                                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                  isCompleted 
                                    ? 'bg-amber-500/10 border-amber-500/30' 
                                    : 'bg-amber-500/5 border-amber-500/20'
                                }`}
                              >
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() => toggleMilestone(phaseIndex, milestoneIndex)}
                                  className="mt-0.5"
                                />
                                <span className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                  {milestone}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {phaseProgress && (
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          Notes
                        </h4>
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Add notes for this phase..."
                            value={phaseProgress.notes || ''}
                            onChange={(e) => {
                              if (e.target.value.length <= 100) {
                                updatePhaseNotes(phaseProgress.id, e.target.value);
                              }
                            }}
                            maxLength={100}
                            className="min-h-[60px] resize-none text-sm"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {(phaseProgress.notes || '').length}/100
                            </span>
                            <Button 
                              size="sm" 
                              onClick={() => savePhaseNotes(phaseProgress.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 mr-1" />
                              )}
                              Save
                            </Button>
                          </div>
                        </div>
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
