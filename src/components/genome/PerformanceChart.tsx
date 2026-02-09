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
import PremiumLock from "@/components/genome/PremiumLock";
import type { PerformanceScores, ScoreInsight, IndustryBenchmark } from "@/lib/demo-data";

interface PerformanceChartProps {
  scores: PerformanceScores;
  industryAverage: PerformanceScores;
  companyName: string;
  scoreInsights: ScoreInsight[];
  industryBenchmarks: IndustryBenchmark[];
  isPremium?: boolean;
}

const dimensions: Array<{ key: keyof PerformanceScores; label: string }> = [
  { key: "seo", label: "SEO" },
  { key: "content", label: "Content" },
  { key: "social", label: "Social" },
  { key: "paid", label: "Paid" },
  { key: "trust", label: "Trust" },
  { key: "funnel", label: "Funnel" },
];

const PerformanceChart = ({ scores, industryAverage, companyName, scoreInsights, industryBenchmarks, isPremium = false }: PerformanceChartProps) => {
  const data = dimensions.map((d) => ({
    dimension: d.label,
    score: scores[d.key],
    industry: industryAverage[d.key],
  }));

  const insightMap = Object.fromEntries(scoreInsights.map((s) => [s.key, s]));

  return (
    <div className="space-y-5">
      {/* Radar Chart — always free */}
      <Card className="border-border bg-card">
        <CardContent className="p-5">
          <h4 className="text-base font-semibold text-foreground uppercase tracking-wide mb-4">
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

      {/* Premium: Score Insights + Next Steps */}
      {isPremium ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.map((d) => {
            const diff = d.score - d.industry;
            const isAbove = diff >= 0;
            const key = dimensions.find((dim) => dim.label === d.dimension)?.key;
            const scoreInsight = key ? insightMap[key] : undefined;
            return (
              <Card key={d.dimension} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      {d.dimension}
                    </p>
                    <p className={`text-xs font-mono ${isAbove ? "text-primary" : "text-destructive"}`}>
                      {isAbove ? "+" : ""}{diff} vs avg
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">{d.score}</p>
                  {scoreInsight && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">{scoreInsight.insight}</p>
                      <p className="text-xs text-primary leading-relaxed border-l-2 border-primary/30 pl-2">
                        {scoreInsight.nextStep}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <PremiumLock title="Unlock Score Insights & Next Steps">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((d) => {
              const diff = d.score - d.industry;
              const isAbove = diff >= 0;
              const key = dimensions.find((dim) => dim.label === d.dimension)?.key;
              const scoreInsight = key ? insightMap[key] : undefined;
              return (
                <Card key={d.dimension} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {d.dimension}
                      </p>
                      <p className={`text-xs font-mono ${isAbove ? "text-primary" : "text-destructive"}`}>
                        {isAbove ? "+" : ""}{diff} vs avg
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1">{d.score}</p>
                    {scoreInsight && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground leading-relaxed">{scoreInsight.insight}</p>
                        <p className="text-xs text-primary leading-relaxed border-l-2 border-primary/30 pl-2">
                          {scoreInsight.nextStep}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </PremiumLock>
      )}

      {/* Premium: Industry Benchmarks */}
      {industryBenchmarks.length > 0 && (
        isPremium ? (
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="px-5 py-3 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Industry Benchmarks
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-5 text-[10px] uppercase tracking-wider text-muted-foreground">Metric</th>
                      <th className="text-left py-3 px-5 text-[10px] uppercase tracking-wider text-muted-foreground">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryBenchmarks.map((b) => (
                      <tr key={b.metric} className="border-b border-border/50">
                        <td className="py-3 px-5 text-sm text-foreground">{b.metric}</td>
                        <td className="py-3 px-5 text-sm font-mono text-muted-foreground">{b.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <PremiumLock title="Unlock Industry Benchmarks">
            <Card className="border-border bg-card">
              <CardContent className="p-0">
                <div className="px-5 py-3 border-b border-border">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Industry Benchmarks
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-5 text-[10px] uppercase tracking-wider text-muted-foreground">Metric</th>
                        <th className="text-left py-3 px-5 text-[10px] uppercase tracking-wider text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {industryBenchmarks.map((b) => (
                        <tr key={b.metric} className="border-b border-border/50">
                          <td className="py-3 px-5 text-sm text-foreground">{b.metric}</td>
                          <td className="py-3 px-5 text-sm font-mono text-muted-foreground">{b.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </PremiumLock>
        )
      )}
    </div>
  );
};

export default PerformanceChart;
