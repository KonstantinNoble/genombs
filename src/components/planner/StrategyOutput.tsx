import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Target, Zap, Calendar, DollarSign, Flag, Crown, Search } from 'lucide-react';

// New structured action type
export interface ActionItem {
  text: string;
  searchTerm: string;
}

export interface StrategyPhase {
  phase: number;
  title: string;
  timeframe: string;
  objectives: string[];
  actions: (ActionItem | string)[];  // Support both new structured and legacy string formats
  budget?: string;
  channels?: string[];
  milestones?: string[];
}

export interface PlannerResult {
  strategies: StrategyPhase[];
}

interface StrategyOutputProps {
  result: PlannerResult;
  isDeepMode?: boolean;
}

// Legacy result type for backwards compatibility
interface LegacyToolResult {
  recommendations?: Array<{
    name?: string;
    category?: string;
    rationale?: string;
    implementationStrategy?: string;
    estimatedCost?: string;
  }>;
  generalAdvice?: string;
}

interface LegacyAdResult {
  campaigns?: Array<{
    campaignName?: string;
    platform?: string;
    strategy?: string;
    budget?: string;
    targetAudience?: string;
  }>;
  generalAdvice?: string;
}

function isLegacyToolResult(result: unknown): result is LegacyToolResult {
  return typeof result === 'object' && result !== null && 'recommendations' in result;
}

function isLegacyAdResult(result: unknown): result is LegacyAdResult {
  return typeof result === 'object' && result !== null && 'campaigns' in result;
}

function isPlannerResult(result: unknown): result is PlannerResult {
  return typeof result === 'object' && result !== null && 'strategies' in result && Array.isArray((result as PlannerResult).strategies);
}

// Helper to check if action is structured (has text and searchTerm)
function isStructuredAction(action: ActionItem | string): action is ActionItem {
  return typeof action === 'object' && action !== null && 'text' in action && 'searchTerm' in action;
}

// Fallback renderer for legacy results
function LegacyResultRenderer({ result }: { result: LegacyToolResult | LegacyAdResult }) {
  if (isLegacyToolResult(result) && result.recommendations) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">Legacy format - Tool Recommendations</p>
        <div className="grid gap-4 md:grid-cols-2">
          {result.recommendations.map((rec, i) => (
            <Card key={i} className="bg-card/50">
              <CardHeader className="pb-2">
                <h4 className="font-semibold">{rec.name || 'Recommendation'}</h4>
                {rec.category && <Badge variant="outline" className="w-fit">{rec.category}</Badge>}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {rec.rationale && <p>{rec.rationale}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
        {result.generalAdvice && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm">{result.generalAdvice}</p>
          </div>
        )}
      </div>
    );
  }

  if (isLegacyAdResult(result) && result.campaigns) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">Legacy format - Ad Campaigns</p>
        <div className="grid gap-4 md:grid-cols-2">
          {result.campaigns.map((campaign, i) => (
            <Card key={i} className="bg-card/50">
              <CardHeader className="pb-2">
                <h4 className="font-semibold">{campaign.campaignName || 'Campaign'}</h4>
                {campaign.platform && <Badge variant="outline" className="w-fit">{campaign.platform}</Badge>}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {campaign.strategy && <p>{campaign.strategy}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
        {result.generalAdvice && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm">{result.generalAdvice}</p>
          </div>
        )}
      </div>
    );
  }

  return <p className="text-muted-foreground">No results to display</p>;
}

export function StrategyOutput({ result, isDeepMode = false }: StrategyOutputProps) {
  // Handle legacy results
  if (!isPlannerResult(result)) {
    return <LegacyResultRenderer result={result as LegacyToolResult | LegacyAdResult} />;
  }

  const { strategies } = result;

  if (!strategies || strategies.length === 0) {
    return <p className="text-muted-foreground">No strategy phases generated</p>;
  }

  const phaseColors = [
    'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  ];

  const phaseAccents = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-emerald-500',
    'bg-amber-500',
  ];

  return (
    <div className="space-y-6">
      {/* Premium indicator */}
      {isDeepMode && (
        <div className="flex items-center gap-2 text-sm">
          <Crown className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-amber-600 dark:text-amber-400">Premium Deep Analysis</span>
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 text-xs">
            Gemini 2.5 Pro
          </Badge>
        </div>
      )}

      {/* Timeline connector */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden lg:block" />
        
        <div className="grid gap-6 lg:grid-cols-2">
          {strategies.map((phase, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden bg-gradient-to-br ${phaseColors[index % phaseColors.length]} border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${isDeepMode ? 'ring-1 ring-amber-500/20' : ''}`}
            >
              {/* Phase indicator bar */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${phaseAccents[index % phaseAccents.length]}`} />
              
              {/* Premium badge for deep mode */}
              {isDeepMode && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">
                    <Crown className="h-2.5 w-2.5 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-3 pl-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs font-medium bg-background/50 backdrop-blur-sm"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {phase.timeframe}
                  </Badge>
                  <span className="text-xs font-bold text-muted-foreground/70">
                    Phase {phase.phase}
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-tight pr-16">{phase.title}</h3>
              </CardHeader>

              <CardContent className="pl-6 space-y-4">
                {/* Objectives */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    Objectives
                  </h4>
                  <ul className="space-y-1.5">
                    {phase.objectives.map((objective, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions with Google Search Links */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    Actions
                  </h4>
                  <ol className="space-y-2">
                    {phase.actions.map((action, i) => {
                      const isStructured = isStructuredAction(action);
                      const actionText = isStructured ? action.text : action;
                      const searchTerm = isStructured ? action.searchTerm : null;
                      
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <span>{actionText}</span>
                            {searchTerm && (
                              <a 
                                href={`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 ml-2 text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
                                title={`Search: ${searchTerm}`}
                              >
                                <Search className="h-3 w-3" />
                                <span>Learn more</span>
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {/* Premium: Budget - only show in deep mode */}
                {isDeepMode && phase.budget && (
                  <div className="pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-amber-500" />
                      <span className="text-muted-foreground">Budget Allocation:</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">{phase.budget}</span>
                    </div>
                  </div>
                )}

                {/* Premium: Channels - only show in deep mode */}
                {isDeepMode && phase.channels && phase.channels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {phase.channels.map((channel, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Premium: Milestones - only show in deep mode */}
                {isDeepMode && phase.milestones && phase.milestones.length > 0 && (
                  <div className="pt-2 border-t border-border/40">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Flag className="h-3.5 w-3.5 text-amber-500" />
                      KPI Milestones
                    </h4>
                    <ul className="space-y-1">
                      {phase.milestones.map((milestone, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}