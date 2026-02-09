import { Card, CardContent } from "@/components/ui/card";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PerformanceScores } from "@/lib/demo-data";

interface PerformanceChartProps {
  scores: PerformanceScores;
  industryAverage: PerformanceScores;
  companyName: string;
}

const dimensions: Array<{ key: keyof PerformanceScores; label: string }> = [
  { key: "seo", label: "SEO" },
  { key: "content", label: "Content" },
  { key: "social", label: "Social" },
  { key: "paid", label: "Paid" },
  { key: "trust", label: "Trust" },
  { key: "funnel", label: "Funnel" },
];

const PerformanceChart = ({ scores, industryAverage, companyName }: PerformanceChartProps) => {
  const data = dimensions.map((d) => ({
    dimension: d.label,
    score: scores[d.key],
    industry: industryAverage[d.key],
  }));

  return (
    <div className="space-y-5">
      {/* Radar Chart */}
      <Card className="border-border bg-card">
        <CardContent className="p-5">
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Performance vs Industry Average
          </h4>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="hsl(0, 0%, 20%)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "hsl(0, 0%, 65%)", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "hsl(0, 0%, 50%)", fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                name={companyName}
                dataKey="score"
                stroke="hsl(25, 95%, 53%)"
                fill="hsl(25, 95%, 53%)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Radar
                name="Industry Average"
                dataKey="industry"
                stroke="hsl(0, 0%, 55%)"
                fill="hsl(0, 0%, 55%)"
                fillOpacity={0.1}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "hsl(0, 0%, 65%)" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.map((d) => {
          const diff = d.score - d.industry;
          const isAbove = diff >= 0;
          return (
            <Card key={d.dimension} className="border-border bg-card">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                  {d.dimension}
                </p>
                <p className="text-2xl font-bold text-foreground">{d.score}</p>
                <p className={`text-xs font-mono mt-1 ${isAbove ? "text-primary" : "text-destructive"}`}>
                  {isAbove ? "+" : ""}{diff} vs avg
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceChart;
