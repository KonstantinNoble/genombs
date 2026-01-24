import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ConsensusPoint, MajorityPoint, DissentPoint } from "@/hooks/useMultiAIValidation";

interface KeyInsightsPanelProps {
  consensusPoints: ConsensusPoint[];
  majorityPoints: MajorityPoint[];
  dissentPoints: DissentPoint[];
  onShowAll: () => void;
}

type InsightType = 'consensus' | 'majority' | 'dissent';

interface KeyInsight {
  type: InsightType;
  topic: string;
  confidence?: number;
  description: string;
}

const INSIGHT_STYLES: Record<InsightType, { accent: string; label: string; bg: string }> = {
  consensus: { 
    accent: 'border-l-green-500', 
    label: 'Agreed',
    bg: 'hover:bg-green-50 dark:hover:bg-green-950/20'
  },
  majority: { 
    accent: 'border-l-blue-500', 
    label: 'Majority',
    bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/20'
  },
  dissent: { 
    accent: 'border-l-amber-500', 
    label: 'Debated',
    bg: 'hover:bg-amber-50 dark:hover:bg-amber-950/20'
  },
};

export function KeyInsightsPanel({ 
  consensusPoints, 
  majorityPoints, 
  dissentPoints,
  onShowAll 
}: KeyInsightsPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Combine and prioritize insights: 1 consensus, 1 majority, 1 dissent (if available)
  const keyInsights: KeyInsight[] = [];
  
  if (consensusPoints.length > 0) {
    keyInsights.push({
      type: 'consensus',
      topic: consensusPoints[0].topic,
      confidence: consensusPoints[0].confidence,
      description: consensusPoints[0].description,
    });
  }
  
  if (majorityPoints.length > 0) {
    keyInsights.push({
      type: 'majority',
      topic: majorityPoints[0].topic,
      confidence: majorityPoints[0].confidence,
      description: majorityPoints[0].description,
    });
  }
  
  if (dissentPoints.length > 0) {
    keyInsights.push({
      type: 'dissent',
      topic: dissentPoints[0].topic,
      description: dissentPoints[0].positions?.[0]?.reasoning || 'Multiple perspectives exist on this topic.',
    });
  }

  const totalInsights = consensusPoints.length + majorityPoints.length + dissentPoints.length;
  const remainingCount = totalInsights - keyInsights.length;

  if (keyInsights.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg sm:text-xl text-foreground">
          Key Insights
        </h3>
        <span className="text-sm text-muted-foreground">
          {keyInsights.length} / {totalInsights}
        </span>
      </div>

      {/* Insight Cards */}
      <div className="space-y-3">
        {keyInsights.map((insight, index) => {
          const style = INSIGHT_STYLES[insight.type];
          const isExpanded = expandedIndex === index;
          
          return (
            <button
              key={index}
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-l-[3px] bg-transparent transition-colors",
                style.accent,
                style.bg
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn(
                      "text-xs font-medium uppercase tracking-wide",
                      insight.type === 'consensus' && "text-green-600",
                      insight.type === 'majority' && "text-blue-600",
                      insight.type === 'dissent' && "text-amber-600"
                    )}>
                      {style.label}
                    </span>
                    {insight.confidence && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50">
                        {insight.confidence}%
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium text-base text-foreground leading-snug">
                    {insight.topic}
                  </p>
                </div>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-1",
                    isExpanded && "rotate-180"
                  )} 
                />
              </div>
              
              {isExpanded && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed animate-fade-in">
                  {insight.description}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Show All Button */}
      {remainingCount > 0 && (
        <button
          onClick={onShowAll}
          className="mt-4 w-full text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-primary/5 transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
          View all {totalInsights} insights
        </button>
      )}
    </div>
  );
}
