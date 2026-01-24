import { Card, CardContent } from "@/components/ui/card";
import type { ValidationStats, DecisionStats } from "@/hooks/useDashboardStats";

interface StatsOverviewProps {
  validationStats: ValidationStats;
  decisionStats: DecisionStats;
}

export function StatsOverview({ validationStats, decisionStats }: StatsOverviewProps) {
  const stats = [
    {
      label: "Total Validations",
      value: validationStats.total_validations,
      accent: "from-primary/20 to-primary/5",
      border: "border-l-primary",
      valueColor: "text-primary",
    },
    {
      label: "Avg. Confidence",
      value: `${validationStats.avg_confidence}%`,
      accent: "from-accent-info/20 to-accent-info/5",
      border: "border-l-[hsl(199,89%,48%)]",
      valueColor: "text-[hsl(199,89%,48%)]",
    },
    {
      label: "AI Consensus Rate",
      value: validationStats.total_validations > 0 
        ? `${validationStats.consensus_rate}%`
        : "—",
      accent: "from-accent-success/20 to-accent-success/5",
      border: "border-l-[hsl(142,71%,45%)]",
      valueColor: "text-[hsl(142,71%,45%)]",
    },
    {
      label: "Active Days",
      value: validationStats.active_days,
      accent: "from-accent-warm/20 to-accent-warm/5",
      border: "border-l-[hsl(38,92%,50%)]",
      valueColor: "text-[hsl(38,92%,50%)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className={`glass-card border-l-4 ${stat.border} animate-fade-in overflow-hidden relative`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Subtle gradient accent */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-50`} />
          
          <CardContent className="p-5 relative">
            <p className={`text-3xl font-bold tracking-tight ${stat.valueColor}`}>
              {stat.value}
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
              {stat.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
