import type { MajorityPoint } from "@/hooks/useMultiAIValidation";

interface MajoritySectionProps {
  points: MajorityPoint[];
}

export function MajoritySection({ points }: MajoritySectionProps) {
  if (points.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-blue-500" />
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          Majority Agreement
        </h3>
        <span className="text-sm text-muted-foreground">({points.length})</span>
      </div>

      <div className="space-y-3">
        {points.map((point, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm sm:text-base text-foreground">{point.topic}</h4>
              <span className="text-sm font-medium text-blue-600 bg-blue-500/20 px-2.5 py-1 rounded-full">
                {point.confidence}%
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{point.description}</p>
            
            {point.supportingModels && point.supportingModels.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">Agreed by:</span>
                {point.supportingModels.map((model, i) => (
                  <span
                    key={i}
                    className="text-sm font-medium bg-blue-500/20 text-blue-600 px-2.5 py-1 rounded"
                  >
                    {model}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
