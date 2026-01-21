import type { DissentPoint } from "@/hooks/useMultiAIValidation";

const MODEL_COLORS: Record<string, string> = {
  'GPT-5 Mini': 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  'GPT-5.2': 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  'GPT-5': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
  'Gemini 3 Pro': 'bg-purple-500/10 border-purple-500/30 text-purple-600',
  'Gemini Flash': 'bg-green-500/10 border-green-500/30 text-green-600',
  'Gemini 3 Flash': 'bg-green-500/10 border-green-500/30 text-green-600',
  'Claude Sonnet 4': 'bg-orange-500/10 border-orange-500/30 text-orange-600',
  'Sonar Pro': 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600',
};

interface DissentSectionProps {
  points: DissentPoint[];
}

export function DissentSection({ points }: DissentSectionProps) {
  if (points.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-amber-500" />
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          Points of Dissent
        </h3>
        <span className="text-sm text-muted-foreground">({points.length})</span>
      </div>

      <div className="space-y-3">
        {points.map((point, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5"
          >
            <h4 className="font-semibold text-sm sm:text-base text-foreground mb-2">{point.topic}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Review each perspective to make an informed decision:
            </p>
            
            {point.positions && (
              <div className="space-y-3">
                {point.positions.map((pos, pIndex) => {
                  const colorClass = MODEL_COLORS[pos.modelName] || 'bg-muted border-border text-muted-foreground';
                  
                  return (
                    <div
                      key={pIndex}
                      className={`p-3 sm:p-4 rounded-lg border ${colorClass}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold uppercase tracking-wide">
                          {pos.modelName}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-medium text-foreground mb-1">
                        {pos.position}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pos.reasoning}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
