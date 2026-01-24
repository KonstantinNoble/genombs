import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ConfidenceHeader } from "./ConfidenceHeader";
import { ConsensusSection } from "./ConsensusSection";
import { MajoritySection } from "./MajoritySection";
import { DissentSection } from "./DissentSection";
import { ModelDetailCards } from "./ModelDetailCards";
import { PDFExportButton } from "./PDFExportButton";
import { DecisionConfirmation } from "./DecisionConfirmation";

import type { ValidationResult } from "@/hooks/useMultiAIValidation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_MODELS } from "./ModelSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationOutputProps {
  result: ValidationResult;
  validationId?: string;
  prompt?: string;
  onStartExperiment?: () => void;
}

export function ValidationOutput({ result, validationId, prompt = '', onStartExperiment }: ValidationOutputProps) {
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [decisionRecordId, setDecisionRecordId] = useState<string | undefined>();
  const [confirmedAt, setConfirmedAt] = useState<string | undefined>();
  const confirmationRef = useRef<HTMLDivElement>(null);
  const {
    modelResponses,
    selectedModels,
    consensusPoints,
    majorityPoints,
    dissentPoints,
    finalRecommendation,
    overallConfidence,
    synthesisReasoning,
    processingTimeMs,
    isPremium,
    citations,
    strategicAlternatives,
    longTermOutlook,
    competitorInsights
  } = result;

  const hasTopActions = finalRecommendation.topActions && finalRecommendation.topActions.length > 0;
  const hasPremiumInsights = isPremium && (strategicAlternatives || longTermOutlook || competitorInsights);

  // Build model summary string
  const modelSummary = selectedModels
    .map(key => AVAILABLE_MODELS[key]?.name || key)
    .join(' · ');

  // Show first 3 actions, rest behind expand
  const visibleActions = actionsExpanded 
    ? finalRecommendation.topActions 
    : finalRecommendation.topActions?.slice(0, 3);
  const hasMoreActions = (finalRecommendation.topActions?.length || 0) > 3;

  const handleConfirmed = (recordId: string) => {
    setIsConfirmed(true);
    setDecisionRecordId(recordId);
    setConfirmedAt(new Date().toISOString());
  };

  const scrollToConfirmation = () => {
    if (confirmationRef.current) {
      const top = confirmationRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Reset confirmation state when validation changes
  useEffect(() => {
    setIsConfirmed(false);
    setDecisionRecordId(undefined);
    setConfirmedAt(undefined);
  }, [validationId]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Processing Info */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
        <span className="px-3 py-1.5 rounded-full bg-muted/50">
          {(processingTimeMs / 1000).toFixed(1)}s
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="text-center">{modelSummary}</span>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-sm px-3 py-1">
            Premium
          </Badge>
        )}
        <PDFExportButton 
          result={result} 
          prompt={prompt} 
          isPremium={isPremium || false}
          isConfirmed={isConfirmed}
          confirmedAt={confirmedAt}
          onRequireConfirmation={scrollToConfirmation}
        />
      </div>

      {/* Main Recommendation */}
      <ConfidenceHeader
        title={finalRecommendation.title}
        description={finalRecommendation.description}
        confidence={overallConfidence}
        reasoning={synthesisReasoning}
      />

      {/* Top Actions - Documented Perspectives */}
      {hasTopActions && (
        <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/60">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg sm:text-xl text-foreground">
              Documented Perspectives
            </h3>
            {isPremium && (
              <span className="text-sm text-muted-foreground">
                {finalRecommendation.topActions?.length} insights
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {visibleActions!.map((action, i) => (
              <div 
                key={i} 
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-border/50 transition-all duration-200"
              >
                <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-base text-foreground leading-relaxed pt-0.5">
                  {action}
                </span>
              </div>
            ))}
          </div>

          {hasMoreActions && !actionsExpanded && (
            <button
              onClick={() => setActionsExpanded(true)}
              className="mt-5 text-sm text-primary hover:text-primary/80 flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
              Show {(finalRecommendation.topActions?.length || 0) - 3} more
            </button>
          )}
        </div>
      )}

      {/* Premium Insights - Elegant Tabbed Interface */}
      {hasPremiumInsights && (
        <div className="rounded-2xl border border-amber-500/20 bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-lg sm:text-xl text-foreground">Strategic Insights</span>
            <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
              Premium
            </span>
          </div>
          
          <Tabs defaultValue="strategy" className="w-full">
            <TabsList className="w-full flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-1 h-auto sm:h-11 mb-6 bg-muted/30 p-1 rounded-lg">
              {strategicAlternatives && strategicAlternatives.length > 0 && (
                <TabsTrigger value="strategy" className="text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  Scenarios
                </TabsTrigger>
              )}
              {longTermOutlook && (
                <TabsTrigger value="outlook" className="text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  Projections
                </TabsTrigger>
              )}
              {competitorInsights && (
                <TabsTrigger value="competitors" className="text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  Market Context
                </TabsTrigger>
              )}
            </TabsList>

            {/* Strategic Alternatives */}
            {strategicAlternatives && strategicAlternatives.length > 0 && (
              <TabsContent value="strategy" className="mt-0 space-y-4">
                {strategicAlternatives.map((alt, i) => (
                  <div key={i} className="p-5 rounded-xl bg-muted/20 border border-border/30">
                    <h5 className="font-medium text-lg mb-4 text-foreground">{alt.scenario}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Pros</p>
                        {alt.pros.slice(0, 3).map((pro, j) => (
                          <p key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary shrink-0">+</span>
                            {pro}
                          </p>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-2">Cons</p>
                        {alt.cons.slice(0, 3).map((con, j) => (
                          <p key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-destructive shrink-0">−</span>
                            {con}
                          </p>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 pt-3 border-t border-border/30">
                      <span className="font-medium text-foreground">Best for:</span> {alt.bestFor}
                    </p>
                  </div>
                ))}
              </TabsContent>
            )}
            
            {/* Long-term Outlook */}
            {longTermOutlook && (
              <TabsContent value="outlook" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-5 rounded-xl bg-muted/20 border border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">6-Month</p>
                    <p className="text-base leading-relaxed text-foreground">{longTermOutlook.sixMonths}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-muted/20 border border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">12-Month</p>
                    <p className="text-base leading-relaxed text-foreground">{longTermOutlook.twelveMonths}</p>
                  </div>
                </div>
                {longTermOutlook.keyMilestones && longTermOutlook.keyMilestones.length > 0 && (
                  <div className="p-5 rounded-xl bg-muted/20 border border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Key Milestones</p>
                    <div className="space-y-2.5">
                      {longTermOutlook.keyMilestones.slice(0, 4).map((milestone, i) => (
                        <p key={i} className="text-base text-muted-foreground flex items-start gap-3">
                          <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                          {milestone}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            )}
            
            {/* Competitor Insights */}
            {competitorInsights && (
              <TabsContent value="competitors" className="mt-0">
                <div className="p-5 rounded-xl bg-muted/20 border border-border/30">
                  <p className="text-base leading-relaxed text-muted-foreground">{competitorInsights}</p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}

      <Separator className="my-4" />

      {/* Analysis Points */}
      <div className="space-y-4">
        <ConsensusSection points={consensusPoints} />
        <MajoritySection points={majorityPoints} />
        <DissentSection points={dissentPoints} />
      </div>

      <Separator className="my-4" />

      {/* Individual Model Details */}
      <ModelDetailCards
        modelResponses={modelResponses || {}}
        selectedModels={selectedModels || []}
        isPremium={isPremium}
        citations={citations}
      />

      {/* Decision Confirmation - Required for PDF Export */}
      {isPremium && validationId && (
        <div ref={confirmationRef}>
          <Separator className="my-6" />
          <DecisionConfirmation
            validationId={validationId}
            prompt={prompt}
            onConfirmed={handleConfirmed}
            isConfirmed={isConfirmed}
            decisionRecordId={decisionRecordId}
            result={result}
          />
        </div>
      )}

      {/* Dashboard Link */}
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground border-t border-border/50 mt-6">
        <span>Track your decision patterns</span>
        <Link 
          to="/dashboard" 
          className="text-primary hover:text-primary/80 hover:underline flex items-center gap-1 font-medium transition-colors"
        >
          View Dashboard
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
