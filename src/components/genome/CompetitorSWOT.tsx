import { Card, CardContent } from "@/components/ui/card";
import type { SWOTAnalysis } from "@/lib/demo-competitor-data";

interface CompetitorSWOTProps {
  swot: SWOTAnalysis;
}

const quadrants = [
  { key: "strengths" as const, label: "Strengths", borderColor: "border-chart-4/50", dotColor: "bg-chart-4" },
  { key: "weaknesses" as const, label: "Weaknesses", borderColor: "border-destructive/50", dotColor: "bg-destructive" },
  { key: "opportunities" as const, label: "Opportunities", borderColor: "border-primary/50", dotColor: "bg-primary" },
  { key: "threats" as const, label: "Threats", borderColor: "border-chart-3/50", dotColor: "bg-chart-3" },
];

const CompetitorSWOT = ({ swot }: CompetitorSWOTProps) => {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
          SWOT — {swot.competitor}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quadrants.map((q) => (
            <div key={q.key} className={`border-l-2 ${q.borderColor} pl-3 space-y-1.5`}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{q.label}</p>
              <ul className="space-y-1">
                {swot[q.key].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                    <span className={`w-1 h-1 rounded-full ${q.dotColor} shrink-0 mt-1.5`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorSWOT;
