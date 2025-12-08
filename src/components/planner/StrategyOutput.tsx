import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Target, Zap, Calendar, DollarSign, Flag, Crown, ExternalLink, Shield, FlaskConical, TrendingUp, Users, AlertTriangle, ListChecks } from 'lucide-react';

// New structured action type
export interface ActionItem {
  text: string;
  searchTerm: string;
}

// Deep mode exclusive types
export interface CompetitorInfo {
  name: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ABTestSuggestion {
  element: string;
  variantA: string;
  variantB: string;
  expectedImpact: string;
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
  abTestSuggestions?: ABTestSuggestion[];
  roiProjection?: ROIProjection;
  weeklyBreakdown?: string[];
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
    <div className="space-y-4 sm:space-y-6">
      {/* Premium indicator */}
      {isDeepMode && (
        <div className="flex flex-wrap items-center gap-2 text-sm p-3 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-lg border border-amber-500/20">
          <Crown className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="font-medium text-amber-600 dark:text-amber-400">Premium Deep Analysis</span>
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 text-xs">
            Gemini 2.5 Pro
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">6 phases with competitor analysis, A/B tests & ROI projections</span>
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
                                <span className="hidden sm:inline">Learn more</span>
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

                {/* DEEP MODE EXCLUSIVE: Competitor Analysis */}
                {isDeepMode && phase.competitorAnalysis && phase.competitorAnalysis.length > 0 && (
                  <div className="pt-3 border-t border-amber-500/30 bg-amber-500/5 -mx-3 sm:-mx-4 px-3 sm:px-4 pb-3 rounded-b-lg">
                    <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      Competitor Analysis
                    </h4>
                    <div className="space-y-2">
                      {phase.competitorAnalysis.map((competitor, i) => (
                        <div key={i} className="bg-background/50 rounded-md p-2 sm:p-3 text-xs">
                          <div className="font-semibold text-foreground mb-1">{competitor.name}</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[10px] uppercase">Strengths:</span>
                              <ul className="mt-0.5 space-y-0.5">
                                {competitor.strengths.map((s, j) => (
                                  <li key={j} className="text-muted-foreground text-[10px] sm:text-xs flex items-start gap-1">
                                    <span className="text-emerald-500">+</span>
                                    <span className="break-words min-w-0">{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-rose-600 dark:text-rose-400 font-medium text-[10px] uppercase">Weaknesses:</span>
                              <ul className="mt-0.5 space-y-0.5">
                                {competitor.weaknesses.map((w, j) => (
                                  <li key={j} className="text-muted-foreground text-[10px] sm:text-xs flex items-start gap-1">
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
                  <div className="pt-2 border-t border-amber-500/30">
                    <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      Risk Mitigation
                    </h4>
                    <ul className="space-y-1">
                      {phase.riskMitigation.map((risk, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 bg-orange-500/5 rounded px-2 py-1">
                          <AlertTriangle className="h-3 w-3 text-orange-500 shrink-0 mt-0.5" />
                          <span className="break-words min-w-0">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* DEEP MODE EXCLUSIVE: A/B Test Suggestions */}
                {isDeepMode && phase.abTestSuggestions && phase.abTestSuggestions.length > 0 && (
                  <div className="pt-2 border-t border-amber-500/30">
                    <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                      <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                      A/B Test Suggestions
                    </h4>
                    <div className="space-y-2">
                      {phase.abTestSuggestions.map((test, i) => (
                        <div key={i} className="bg-violet-500/5 rounded-md p-2 text-xs border border-violet-500/20">
                          <div className="font-semibold text-violet-600 dark:text-violet-400 mb-1">{test.element}</div>
                          <div className="grid grid-cols-2 gap-2 mb-1">
                            <div className="bg-background/50 rounded px-2 py-1">
                              <span className="text-[10px] text-muted-foreground">Variant A:</span>
                              <p className="text-foreground break-words">{test.variantA}</p>
                            </div>
                            <div className="bg-background/50 rounded px-2 py-1">
                              <span className="text-[10px] text-muted-foreground">Variant B:</span>
                              <p className="text-foreground break-words">{test.variantB}</p>
                            </div>
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-medium">
                            Expected Impact: {test.expectedImpact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DEEP MODE EXCLUSIVE: ROI Projection */}
                {isDeepMode && phase.roiProjection && (
                  <div className="pt-2 border-t border-amber-500/30">
                    <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                      ROI Projection
                    </h4>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-md p-2 sm:p-3 border border-emerald-500/20">
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-muted-foreground text-[10px] uppercase">Investment:</span>
                          <p className="font-semibold text-foreground break-words">{phase.roiProjection.investment}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] uppercase">Expected Return:</span>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400 break-words">{phase.roiProjection.expectedReturn}</p>
                        </div>
                      </div>
                      <div className="text-xs mb-2">
                        <span className="text-muted-foreground text-[10px] uppercase">Timeframe:</span>
                        <p className="text-foreground">{phase.roiProjection.timeframe}</p>
                      </div>
                      {phase.roiProjection.assumptions && phase.roiProjection.assumptions.length > 0 && (
                        <div className="text-[10px] text-muted-foreground">
                          <span className="uppercase font-medium">Assumptions:</span>
                          <ul className="mt-0.5 space-y-0.5">
                            {phase.roiProjection.assumptions.map((a, i) => (
                              <li key={i} className="flex items-start gap-1">
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

                {/* DEEP MODE EXCLUSIVE: Weekly Breakdown */}
                {isDeepMode && phase.weeklyBreakdown && phase.weeklyBreakdown.length > 0 && (
                  <div className="pt-2 border-t border-amber-500/30">
                    <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5 shrink-0" />
                      Weekly Breakdown
                    </h4>
                    <ol className="space-y-1">
                      {phase.weeklyBreakdown.map((week, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 bg-blue-500/5 rounded px-2 py-1.5 border-l-2 border-blue-500/50">
                          <span className="break-words min-w-0">{week}</span>
                        </li>
                      ))}
                    </ol>
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
