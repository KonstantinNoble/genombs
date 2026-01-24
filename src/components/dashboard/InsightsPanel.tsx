import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightsPanelProps {
  insights: string[];
  isPremium?: boolean;
}

export function InsightsPanel({ insights, isPremium = false }: InsightsPanelProps) {
  if (!isPremium) {
    return (
      <Card className="glass-card border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              AI Insights
            </CardTitle>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full">
              Premium
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 blur-sm select-none pointer-events-none">
            <div className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary/30">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your average confidence of 82% is excellent — you're making well-validated decisions.
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary/30">
              <p className="text-sm text-muted-foreground leading-relaxed">
                You rely heavily on GPT-5 (75%). Try diversifying models for broader perspectives.
              </p>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Upgrade to Premium for personalized AI insights
          </p>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-accent-warm/20" />
            <p className="text-muted-foreground text-sm">
              Complete more validations to unlock personalized insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
