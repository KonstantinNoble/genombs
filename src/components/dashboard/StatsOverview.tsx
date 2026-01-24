import { Card, CardContent } from "@/components/ui/card";
import { FileCheck, TrendingUp, CheckCircle, Calendar } from "lucide-react";
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
      icon: FileCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Avg. Confidence",
      value: `${validationStats.avg_confidence}%`,
      icon: TrendingUp,
      color: "text-accent-info",
      bgColor: "bg-accent-info/10",
    },
    {
      label: "Confirmed Decisions",
      value: decisionStats.confirmed_decisions,
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active Days",
      value: validationStats.active_days,
      icon: Calendar,
      color: "text-accent-warm",
      bgColor: "bg-accent-warm/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={stat.label} className="glass-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
