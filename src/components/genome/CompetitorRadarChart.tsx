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
import type { CompetitorProfile } from "@/lib/demo-competitor-data";

interface CompetitorRadarChartProps {
  yourName: string;
  yourScores: PerformanceScores;
  competitors: CompetitorProfile[];
}

const dimensions: Array<{ key: keyof PerformanceScores; label: string }> = [
  { key: "seo", label: "SEO" },
  { key: "content", label: "Content" },
  { key: "social", label: "Social" },
  { key: "paid", label: "Paid" },
  { key: "trust", label: "Trust" },
  { key: "funnel", label: "Funnel" },
];

const competitorColors = [
  "hsl(0, 0%, 55%)",
  "hsl(0, 0%, 40%)",
  "hsl(0, 0%, 70%)",
];

const CompetitorRadarChart = ({ yourName, yourScores, competitors }: CompetitorRadarChartProps) => {
  const data = dimensions.map((d) => {
    const entry: Record<string, string | number> = {
      dimension: d.label,
      you: yourScores[d.key],
    };
    competitors.forEach((c) => {
      entry[c.name] = c.scores[d.key];
    });
    return entry;
  });

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
          Score Comparison
        </h4>
        <ResponsiveContainer width="100%" height={360}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
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
              name={yourName}
              dataKey="you"
              stroke="hsl(25, 95%, 53%)"
              fill="hsl(25, 95%, 53%)"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            {competitors.map((c, i) => (
              <Radar
                key={c.name}
                name={c.name}
                dataKey={c.name}
                stroke={competitorColors[i % competitorColors.length]}
                fill={competitorColors[i % competitorColors.length]}
                fillOpacity={0.08}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            ))}
            <Legend
              wrapperStyle={{ fontSize: 12, color: "hsl(0, 0%, 65%)" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CompetitorRadarChart;
