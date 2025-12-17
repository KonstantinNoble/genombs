import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Target, Zap, Calendar, DollarSign, Flag, Crown, ExternalLink, Shield, TrendingUp, Users, AlertTriangle, Globe } from 'lucide-react';
import { ActivateStrategyButton } from './ActivateStrategyButton';

// New structured action type with resource URL
export interface ActionItem {
  text: string;
  resourceUrl?: string;
  resourceTitle?: string;
}

// Deep mode exclusive types
export interface CompetitorInfo {
  name: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ROIProjection {
  investment: string;
  expectedReturn: string;
  timeframe: string;
  assumptions: string[];
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
  // Deep mode exclusive fields
  competitorAnalysis?: CompetitorInfo[];
  riskMitigation?: string[];
  roiProjection?: ROIProjection;
}

export interface PlannerResult {
  strategies: StrategyPhase[];
  // Market intelligence from Perplexity
  marketInsights?: string;
  sources?: string[];
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

// Helper to check if action is structured (has text property)
function isStructuredAction(action: ActionItem | string): action is ActionItem {
  return typeof action === 'object' && action !== null && 'text' in action;
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

  const { strategies, marketInsights, sources } = result;

  if (!strategies || strategies.length === 0) {
    return <p className="text-muted-foreground">No strategy phases generated</p>;
  }

  const hasMarketIntelligence = marketInsights && marketInsights.length > 0;

  const phaseColors = [
    'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    'from-rose-500/20 to-rose-600/10 border-rose-500/30',
    'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  ];

  const phaseAccents = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Activate Strategy Button */}
      <div className="flex justify-end">
        <ActivateStrategyButton result={result} isDeepMode={isDeepMode} />
      </div>

      {/* Market Intelligence Banner */}
      {hasMarketIntelligence && (
        <div className="p-5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-cyan-500" />
            <span className="font-medium text-cyan-600 dark:text-cyan-400 text-base">
              Powered by Real-Time Market Intelligence
            </span>
            <Badge variant="outline" className="text-xs bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              LIVE DATA
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This strategy was enhanced with current market research and industry insights.
          </p>
        </div>
      )}

      {/* Premium indicator */}
      {isDeepMode && (
        <div className="flex flex-wrap items-center gap-3 text-base p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-lg border border-amber-500/20">
          <Crown className="h-5 w-5 text-amber-500 shrink-0" />
          <span className="font-medium text-amber-600 dark:text-amber-400">Premium Deep Analysis</span>
          <span className="text-sm text-muted-foreground ml-auto">Enhanced analysis with competitor insights & ROI projections</span>
        </div>
      )}

      {/* Timeline connector */}
      <div className="relative">
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden xl:block" />
        
        <div className="grid gap-6 sm:gap-8 grid-cols-1 xl:grid-cols-2">
          {strategies.map((phase, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden bg-gradient-to-br ${phaseColors[index % phaseColors.length]} border transition-all duration-300 hover:shadow-lg active:scale-[0.99] sm:hover:scale-[1.02] ${isDeepMode ? 'ring-1 ring-amber-500/20' : ''}`}
            >
              {/* Phase indicator bar */}
              <div className={`absolute top-0 left-0 w-1.5 sm:w-2 h-full ${phaseAccents[index % phaseAccents.length]}`} />
              
              <CardHeader className="pb-4 pl-6 sm:pl-8 pr-4 sm:pr-6">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <Badge 
                    variant="outline" 
                    className="text-sm font-medium bg-background/50 backdrop-blur-sm px-3 py-1"
                  >
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span className="truncate max-w-[150px] sm:max-w-none">{phase.timeframe}</span>
                  </Badge>
                  <span className="text-sm font-bold text-muted-foreground/70 whitespace-nowrap">
                    Phase {phase.phase}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold leading-tight pr-16 sm:pr-20 break-words">{phase.title}</h3>
              </CardHeader>

              <CardContent className="pl-6 sm:pl-8 pr-4 sm:pr-6 space-y-5 sm:space-y-6 pb-6 sm:pb-8">
                {/* Objectives */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 shrink-0" />
                    Objectives
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {phase.objectives.map((objective, i) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="break-words min-w-0">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions with Google Search Links */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 shrink-0" />
                    Actions
                  </h4>
                  <ol className="space-y-3 sm:space-y-4">
                    {phase.actions.map((action, i) => {
                      const isStructured = isStructuredAction(action);
                      const actionText = isStructured ? action.text : action;
                      const resourceUrl = isStructured ? action.resourceUrl : null;
                      const resourceTitle = isStructured ? action.resourceTitle : null;
                      
                      return (
                        <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="break-words">{actionText}</span>
                            {resourceUrl && (
                              <a 
                                href={resourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 ml-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors whitespace-nowrap"
                                title={resourceUrl}
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span className="truncate max-w-[150px]">{resourceTitle || 'Resource'}</span>
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
                  <div className="pt-3 border-t border-border/40">
                    <div className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
                      <DollarSign className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-muted-foreground">Budget: </span>
                        <span className="font-medium text-amber-600 dark:text-amber-400 break-words">{phase.budget}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Premium: Channels - only show in deep mode */}
                {isDeepMode && phase.channels && phase.channels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {phase.channels.map((channel, i) => (
                      <Badge key={i} variant="secondary" className="text-sm bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 px-3 py-1">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Premium: Milestones - only show in deep mode */}
                {isDeepMode && phase.milestones && phase.milestones.length > 0 && (
                  <div className="pt-3 border-t border-border/40">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Flag className="h-4 w-4 text-amber-500 shrink-0" />
                      KPI Milestones
                    </h4>
                    <ul className="space-y-2">
                      {phase.milestones.map((milestone, i) => (
                        <li key={i} className="text-sm sm:text-base text-muted-foreground flex items-start gap-2 sm:gap-3">
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-2" />
                          <span className="break-words min-w-0">{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* DEEP MODE EXCLUSIVE: Competitor Analysis */}
                {isDeepMode && phase.competitorAnalysis && phase.competitorAnalysis.length > 0 && (
                  <div className="pt-4 border-t border-amber-500/30 bg-amber-500/5 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 rounded-b-lg">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" />
                      Competitor Analysis
                    </h4>
                    <div className="space-y-3">
                      {phase.competitorAnalysis.map((competitor, i) => (
                        <div key={i} className="bg-background/50 rounded-md p-4 text-sm">
                          <div className="font-semibold text-foreground mb-2 text-base">{competitor.name}</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs uppercase">Strengths:</span>
                              <ul className="mt-1 space-y-1">
                                {competitor.strengths.map((s, j) => (
                                  <li key={j} className="text-muted-foreground text-sm flex items-start gap-2">
                                    <span className="text-emerald-500">+</span>
                                    <span className="break-words min-w-0">{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-rose-600 dark:text-rose-400 font-medium text-xs uppercase">Weaknesses:</span>
                              <ul className="mt-1 space-y-1">
                                {competitor.weaknesses.map((w, j) => (
                                  <li key={j} className="text-muted-foreground text-sm flex items-start gap-2">
                                    <span className="text-rose-500">-</span>
                                    <span className="break-words min-w-0">{w}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DEEP MODE EXCLUSIVE: Risk Mitigation */}
                {isDeepMode && phase.riskMitigation && phase.riskMitigation.length > 0 && (
                  <div className="pt-3 border-t border-amber-500/30">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 shrink-0" />
                      Risk Mitigation
                    </h4>
                    <ul className="space-y-2">
                      {phase.riskMitigation.map((risk, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 bg-orange-500/5 rounded px-3 py-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                          <span className="break-words min-w-0">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* DEEP MODE EXCLUSIVE: ROI Projection */}
                {isDeepMode && phase.roiProjection && (
                  <div className="pt-3 border-t border-amber-500/30">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 shrink-0" />
                      ROI Projection
                    </h4>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-md p-4 border border-emerald-500/20">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground text-xs uppercase">Investment:</span>
                          <p className="font-semibold text-foreground break-words text-base">{phase.roiProjection.investment}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs uppercase">Expected Return:</span>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400 break-words text-base">{phase.roiProjection.expectedReturn}</p>
                        </div>
                      </div>
                      <div className="text-sm mb-3">
                        <span className="text-muted-foreground text-xs uppercase">Timeframe:</span>
                        <p className="text-foreground text-base">{phase.roiProjection.timeframe}</p>
                      </div>
                      {phase.roiProjection.assumptions && phase.roiProjection.assumptions.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <span className="uppercase font-medium text-xs">Assumptions:</span>
                          <ul className="mt-1 space-y-1">
                            {phase.roiProjection.assumptions.map((a, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-500">*</span>
                                <span className="break-words min-w-0">{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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
