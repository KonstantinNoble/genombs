import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Sparkles } from "lucide-react";

interface InsightsPanelProps {
  insights: string[];
  isPremium?: boolean;
}

export function InsightsPanel({ insights, isPremium = false }: InsightsPanelProps) {
  if (!isPremium) {
    return (
      <Card className="glass-card border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent-warm" />
            AI Insights
            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Premium
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 blur-sm select-none pointer-events-none">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Your average confidence of 82% is excellent — you're making well-validated decisions.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
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
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent-warm" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">
            Complete more validations to unlock personalized insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-accent-warm" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
