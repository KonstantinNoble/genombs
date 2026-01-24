import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ConfidenceHeader } from "./ConfidenceHeader";
import { ConsensusSection } from "./ConsensusSection";
import { MajoritySection } from "./MajoritySection";
import { DissentSection } from "./DissentSection";
import { ModelDetailCards } from "./ModelDetailCards";
import { PDFExportButton } from "./PDFExportButton";
import { DecisionConfirmation } from "./DecisionConfirmation";
import { KeyInsightsPanel } from "./KeyInsightsPanel";

import type { ValidationResult } from "@/hooks/useMultiAIValidation";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_MODELS } from "./ModelSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationOutputProps {
  result: ValidationResult;
  validationId?: string;
  prompt?: string;
  onStartExperiment?: () => void;
}

export function ValidationOutput({ result, validationId, prompt = '', onStartExperiment }: ValidationOutputProps) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
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
    setShowFullAnalysis(false);
  }, [validationId]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Processing Info - Compact */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="px-2.5 py-1 rounded-full bg-muted/50 text-xs">
          {(processingTimeMs / 1000).toFixed(1)}s
        </span>
        <span className="hidden sm:inline text-muted-foreground/50">·</span>
        <span className="text-xs text-center">{modelSummary}</span>
        {isPremium && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs px-2 py-0.5">
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

      {/* LEVEL 1: Executive Summary - Always Visible */}
      <ConfidenceHeader
        title={finalRecommendation.title}
        description={finalRecommendation.description}
        confidence={overallConfidence}
        reasoning={synthesisReasoning}
        showAnalysisExpanded={showFullAnalysis}
        onToggleAnalysis={() => setShowFullAnalysis(!showFullAnalysis)}
      />

      {/* LEVEL 2: Key Insights Panel - Always Visible */}
      <KeyInsightsPanel
        consensusPoints={consensusPoints}
        majorityPoints={majorityPoints}
        dissentPoints={dissentPoints}
        onShowAll={() => setShowFullAnalysis(true)}
      />

      {/* LEVEL 3: Full Analysis - Expandable */}
      {showFullAnalysis && (
        <div className="space-y-4 animate-fade-in">
          <Accordion type="multiple" className="space-y-3">
            {/* Documented Perspectives */}
            {hasTopActions && (
              <AccordionItem value="perspectives" className="border rounded-xl overflow-hidden">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 data-[state=open]:bg-primary/5">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-base">Documented Perspectives</span>
                    <Badge variant="secondary" className="text-xs">
                      {finalRecommendation.topActions?.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <ol className="space-y-3">
                    {finalRecommendation.topActions!.map((action, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                        <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium text-sm">
                          {i + 1}
                        </span>
                        <span className="text-foreground leading-relaxed pt-0.5">{action}</span>
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* All Insights */}
            <AccordionItem value="insights" className="border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 data-[state=open]:bg-primary/5">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-base">All Insights</span>
                  <Badge variant="secondary" className="text-xs">
                    {consensusPoints.length + majorityPoints.length + dissentPoints.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 space-y-4">
                <ConsensusSection points={consensusPoints} defaultOpen={false} />
                <MajoritySection points={majorityPoints} defaultOpen={false} />
                <DissentSection points={dissentPoints} defaultOpen={false} />
              </AccordionContent>
            </AccordionItem>

            {/* Model Responses */}
            <AccordionItem value="models" className="border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 data-[state=open]:bg-primary/5">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-base">Model Responses</span>
                  <Badge variant="secondary" className="text-xs">
                    {selectedModels.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <ModelDetailCards
                  modelResponses={modelResponses || {}}
                  selectedModels={selectedModels || []}
                  isPremium={isPremium}
                  citations={citations}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Premium Strategic Analysis */}
            {hasPremiumInsights && (
              <AccordionItem value="premium" className="border border-amber-500/30 rounded-xl overflow-hidden bg-amber-500/5">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-amber-500/10 data-[state=open]:bg-amber-500/10">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-base">Strategic Analysis</span>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs">
                      Premium
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <Tabs defaultValue="strategy" className="w-full">
                    <TabsList className="w-full flex flex-col sm:grid sm:grid-cols-3 gap-1 h-auto sm:h-10 mb-4 bg-amber-500/10">
                      {strategicAlternatives && strategicAlternatives.length > 0 && (
                        <TabsTrigger value="strategy" className="text-sm data-[state=active]:bg-amber-500/20">
                          Scenarios
                        </TabsTrigger>
                      )}
                      {longTermOutlook && (
                        <TabsTrigger value="outlook" className="text-sm data-[state=active]:bg-amber-500/20">
                          Outlook
                        </TabsTrigger>
                      )}
                      {competitorInsights && (
                        <TabsTrigger value="competitors" className="text-sm data-[state=active]:bg-amber-500/20">
                          Market
                        </TabsTrigger>
                      )}
                    </TabsList>

                    {strategicAlternatives && strategicAlternatives.length > 0 && (
                      <TabsContent value="strategy" className="mt-0 space-y-3">
                        {strategicAlternatives.map((alt, i) => (
                          <div key={i} className="p-4 rounded-lg bg-background border text-sm">
                            <h5 className="font-semibold text-base mb-3">{alt.scenario}</h5>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                              <div>
                                <p className="font-medium text-primary mb-1.5 text-xs uppercase">Pros</p>
                                <ul className="space-y-1">
                                  {alt.pros.slice(0, 2).map((pro, j) => (
                                    <li key={j} className="text-muted-foreground flex items-start gap-1.5">
                                      <span className="text-primary shrink-0">+</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium text-destructive mb-1.5 text-xs uppercase">Cons</p>
                                <ul className="space-y-1">
                                  {alt.cons.slice(0, 2).map((con, j) => (
                                    <li key={j} className="text-muted-foreground flex items-start gap-1.5">
                                      <span className="text-destructive shrink-0">−</span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium">Best for:</span> {alt.bestFor}
                            </p>
                          </div>
                        ))}
                      </TabsContent>
                    )}
                    
                    {longTermOutlook && (
                      <TabsContent value="outlook" className="mt-0">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="p-3 rounded-lg bg-background border">
                            <p className="text-xs font-medium text-muted-foreground mb-1">6-Month</p>
                            <p className="text-sm leading-relaxed">{longTermOutlook.sixMonths}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-background border">
                            <p className="text-xs font-medium text-muted-foreground mb-1">12-Month</p>
                            <p className="text-sm leading-relaxed">{longTermOutlook.twelveMonths}</p>
                          </div>
                        </div>
                        {longTermOutlook.keyMilestones && longTermOutlook.keyMilestones.length > 0 && (
                          <div className="p-3 rounded-lg bg-background border">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Key Milestones</p>
                            <ul className="space-y-1.5">
                              {longTermOutlook.keyMilestones.slice(0, 3).map((milestone, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                                  <span className="text-muted-foreground">{milestone}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </TabsContent>
                    )}
                    
                    {competitorInsights && (
                      <TabsContent value="competitors" className="mt-0">
                        <div className="p-4 rounded-lg bg-background border">
                          <p className="text-sm leading-relaxed text-muted-foreground">{competitorInsights}</p>
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Decision Confirmation - Premium Only */}
          {isPremium && validationId && (
            <div ref={confirmationRef} className="pt-2">
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
        </div>
      )}

      {/* Dashboard Link - Always Visible */}
      <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground border-t border-border/50">
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
