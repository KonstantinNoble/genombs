import type { ConsensusPoint } from "@/hooks/useMultiAIValidation";

interface ConsensusSectionProps {
  points: ConsensusPoint[];
}

export function ConsensusSection({ points }: ConsensusSectionProps) {
  if (points.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          Full Consensus
        </h3>
        <span className="text-sm text-muted-foreground">({points.length})</span>
      </div>

      <div className="space-y-3">
        {points.map((point, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-green-500/30 bg-green-500/5"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm sm:text-base text-foreground">{point.topic}</h4>
              <span className="text-sm font-medium text-green-600 bg-green-500/20 px-2.5 py-1 rounded-full">
                {point.confidence}%
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{point.description}</p>
            
            {point.actionItems && point.actionItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-green-500/20">
                <p className="text-sm font-medium text-muted-foreground mb-2">Actions</p>
                <ul className="space-y-2">
                  {point.actionItems.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm sm:text-base">
                      <span className="text-green-500 shrink-0">→</span>
                      <span className="text-foreground">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
