import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Target, Zap, Calendar, DollarSign, Flag, Crown, Search, ExternalLink } from 'lucide-react';

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
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {result.recommendations.map((rec, i) => (
            <Card key={i} className="bg-card/50">
              <CardHeader className="pb-2">
                <h4 className="font-semibold text-sm sm:text-base">{rec.name || 'Recommendation'}</h4>
                {rec.category && <Badge variant="outline" className="w-fit text-xs">{rec.category}</Badge>}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {rec.rationale && <p className="break-words">{rec.rationale}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
        {result.generalAdvice && (
          <div className="mt-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
            <p className="text-sm break-words">{result.generalAdvice}</p>
          </div>
        )}
      </div>
    );
  }

  if (isLegacyAdResult(result) && result.campaigns) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">Legacy format - Ad Campaigns</p>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {result.campaigns.map((campaign, i) => (
            <Card key={i} className="bg-card/50">
              <CardHeader className="pb-2">
                <h4 className="font-semibold text-sm sm:text-base">{campaign.campaignName || 'Campaign'}</h4>
                {campaign.platform && <Badge variant="outline" className="w-fit text-xs">{campaign.platform}</Badge>}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {campaign.strategy && <p className="break-words">{campaign.strategy}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
        {result.generalAdvice && (
          <div className="mt-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
            <p className="text-sm break-words">{result.generalAdvice}</p>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Premium indicator */}
      {isDeepMode && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Crown className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="font-medium text-amber-600 dark:text-amber-400">Premium Deep Analysis</span>
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 text-xs">
            Gemini 2.5 Pro
          </Badge>
        </div>
      )}

      {/* Timeline connector */}
      <div className="relative">
        <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden lg:block" />
        
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {strategies.map((phase, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden bg-gradient-to-br ${phaseColors[index % phaseColors.length]} border transition-all duration-300 hover:shadow-lg active:scale-[0.99] sm:hover:scale-[1.02] ${isDeepMode ? 'ring-1 ring-amber-500/20' : ''}`}
            >
              {/* Phase indicator bar */}
              <div className={`absolute top-0 left-0 w-1 sm:w-1.5 h-full ${phaseAccents[index % phaseAccents.length]}`} />
              
              {/* Premium badge for deep mode */}
              {isDeepMode && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9px] sm:text-[10px] px-1.5 py-0.5">
                    <Crown className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-2 sm:pb-3 pl-4 sm:pl-6 pr-3 sm:pr-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <Badge 
                    variant="outline" 
                    className="text-[10px] sm:text-xs font-medium bg-background/50 backdrop-blur-sm px-1.5 sm:px-2 py-0.5"
                  >
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    <span className="truncate max-w-[100px] sm:max-w-none">{phase.timeframe}</span>
                  </Badge>
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground/70 whitespace-nowrap">
                    Phase {phase.phase}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold leading-tight pr-12 sm:pr-16 break-words">{phase.title}</h3>
              </CardHeader>

              <CardContent className="pl-4 sm:pl-6 pr-3 sm:pr-4 space-y-3 sm:space-y-4 pb-4 sm:pb-6">
                {/* Objectives */}
                <div>
                  <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
                    <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    Objectives
                  </h4>
                  <ul className="space-y-1 sm:space-y-1.5">
                    {phase.objectives.map((objective, i) => (
                      <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0 mt-0.5" />
                        <span className="break-words min-w-0">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions with Google Search Links */}
                <div>
                  <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
                    <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    Actions
                  </h4>
                  <ol className="space-y-2 sm:space-y-2.5">
                    {phase.actions.map((action, i) => {
                      const isStructured = isStructuredAction(action);
                      const actionText = isStructured ? action.text : action;
                      const searchTerm = isStructured ? action.searchTerm : null;
                      
                      return (
                        <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <span className="flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="break-words">{actionText}</span>
                            {searchTerm && (
                              <a 
                                href={`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 sm:gap-1 ml-1 sm:ml-2 text-[10px] sm:text-xs text-primary hover:text-primary/80 hover:underline transition-colors whitespace-nowrap"
                                title={`Search: ${searchTerm}`}
                              >
                                <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="hidden xs:inline sm:inline">Learn more</span>
                                <span className="inline xs:hidden sm:hidden">🔍</span>
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
                    <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-muted-foreground">Budget: </span>
                        <span className="font-medium text-amber-600 dark:text-amber-400 break-words">{phase.budget}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Premium: Channels - only show in deep mode */}
                {isDeepMode && phase.channels && phase.channels.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {phase.channels.map((channel, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 px-1.5 sm:px-2 py-0.5">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Premium: Milestones - only show in deep mode */}
                {isDeepMode && phase.milestones && phase.milestones.length > 0 && (
                  <div className="pt-2 border-t border-border/40">
                    <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
                      <Flag className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 shrink-0" />
                      KPI Milestones
                    </h4>
                    <ul className="space-y-0.5 sm:space-y-1">
                      {phase.milestones.map((milestone, i) => (
                        <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-1.5 sm:gap-2">
                          <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5 sm:mt-2" />
                          <span className="break-words min-w-0">{milestone}</span>
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