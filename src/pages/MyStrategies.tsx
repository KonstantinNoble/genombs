import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Target, 
  Play, 
  Pause, 
  CheckCircle, 
  Crown, 
  Calendar,
  ArrowRight,
  Plus,
  Loader2,
  Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ActiveStrategy {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  is_deep_mode: boolean;
  total_phases: number;
  completed_phases: number;
  total_actions: number;
  completed_actions: number;
  created_at: string;
  updated_at: string;
}

const MyStrategies = () => {
  const navigate = useNavigate();
  const { user, isPremium, isLoading: authLoading } = useAuth();
  const [strategies, setStrategies] = useState<ActiveStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (!authLoading && user && !isPremium) {
      toast.error('Premium required', { description: 'Strategy Tracker is a Premium feature' });
      navigate('/pricing');
      return;
    }

    if (user && isPremium) {
      fetchStrategies();
    }
  }, [user, isPremium, authLoading, navigate]);

  const fetchStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from('active_strategies')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setStrategies((data as ActiveStrategy[]) || []);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast.error('Failed to load strategies');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStrategy = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('active_strategies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setStrategies(prev => prev.filter(s => s.id !== id));
      toast.success('Strategy deleted');
    } catch (error) {
      console.error('Error deleting strategy:', error);
      toast.error('Failed to delete strategy');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-primary" />;
      case 'paused': return <Pause className="h-4 w-4 text-amber-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-primary/10 text-primary border-primary/30',
      paused: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
    };
    return variants[status] || variants.active;
  };

  const calculateProgress = (strategy: ActiveStrategy) => {
    if (strategy.total_actions === 0) return 0;
    return Math.round((strategy.completed_actions / strategy.total_actions) * 100);
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>My Strategies - Synoptas</title>
        <meta name="description" content="Track and manage your active business strategies" />
      </Helmet>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Target className="h-7 w-7 text-primary" />
              My Strategies
            </h1>
            <p className="text-muted-foreground mt-1">
              Track progress and manage your active strategies
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
            <Button onClick={() => navigate('/business-tools')} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Strategy Cards */}
        {strategies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Strategies</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Create a new business analysis and activate your strategy to start tracking progress.
              </p>
              <Button onClick={() => navigate('/business-tools')}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Strategy
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {strategies.map((strategy) => {
              const progress = calculateProgress(strategy);
              return (
                <Card 
                  key={strategy.id} 
                  className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/strategy/${strategy.id}`)}
                >
                  {strategy.is_deep_mode && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Deep Mode
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(strategy.status)}
                      <Badge variant="outline" className={getStatusBadge(strategy.status)}>
                        {strategy.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg pr-20 line-clamp-2">{strategy.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-muted/30 rounded-lg p-2 text-center">
                        <div className="font-semibold text-foreground">
                          {strategy.completed_phases}/{strategy.total_phases}
                        </div>
                        <div className="text-xs text-muted-foreground">Phases</div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2 text-center">
                        <div className="font-semibold text-foreground">
                          {strategy.completed_actions}/{strategy.total_actions}
                        </div>
                        <div className="text-xs text-muted-foreground">Actions</div>
                      </div>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(strategy.created_at).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              {deletingId === strategy.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Strategy?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{strategy.name}" and all progress data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteStrategy(strategy.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyStrategies;
