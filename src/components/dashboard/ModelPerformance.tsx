import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModelUsage } from "@/hooks/useDashboardStats";

interface ModelPerformanceProps {
  usage: ModelUsage;
}

const MODEL_CONFIG: Record<string, { name: string; color: string }> = {
  gptMini: { name: "GPT-5 Mini", color: "hsl(142, 76%, 36%)" },
  geminiPro: { name: "Gemini 3 Pro", color: "hsl(220, 76%, 55%)" },
  geminiFlash: { name: "Gemini Flash", color: "hsl(199, 89%, 48%)" },
  perplexity: { name: "Perplexity Sonar", color: "hsl(280, 60%, 55%)" },
  claude: { name: "Claude Sonnet 4", color: "hsl(38, 92%, 50%)" },
  sonarReasoning: { name: "Sonar Reasoning Pro", color: "hsl(320, 70%, 50%)" },
};

export function ModelPerformance({ usage }: ModelPerformanceProps) {
  const data = Object.entries(usage)
    .map(([key, value]) => ({
      key,
      name: MODEL_CONFIG[key]?.name || key,
      value,
      color: MODEL_CONFIG[key]?.color || "hsl(var(--primary))",
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalUsage = Object.values(usage).reduce((a, b) => a + b, 0);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (totalUsage === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Model Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] flex items-center justify-center">
          <div className="text-center">
            <div className="flex gap-1 justify-center mb-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 bg-muted rounded-full" style={{ height: `${20 + i * 8}px` }} />
              ))}
            </div>
            <p className="text-muted-foreground text-sm">No model usage data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Model Usage
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {totalUsage} queries
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-[220px] flex flex-col justify-center">
        <div className="space-y-4">
          {data.map((model, index) => {
            const percentage = Math.round((model.value / totalUsage) * 100);
            const barWidth = (model.value / maxValue) * 100;
            
            return (
              <div 
                key={model.key} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.value} <span className="text-muted-foreground/60">({percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${barWidth}%`,
                      backgroundColor: model.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
