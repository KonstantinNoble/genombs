import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Cpu } from "lucide-react";
import type { ModelUsage } from "@/hooks/useDashboardStats";

interface ModelPerformanceProps {
  usage: ModelUsage;
}

const MODEL_NAMES: Record<string, string> = {
  gpt5: "GPT-5",
  geminiPro: "Gemini Pro",
  geminiFlash: "Gemini Flash",
  perplexity: "Perplexity",
  claude: "Claude",
};

const MODEL_COLORS: Record<string, string> = {
  gpt5: "hsl(142, 76%, 36%)",
  geminiPro: "hsl(220, 76%, 55%)",
  geminiFlash: "hsl(199, 89%, 48%)",
  perplexity: "hsl(280, 60%, 55%)",
  claude: "hsl(38, 92%, 50%)",
};

export function ModelPerformance({ usage }: ModelPerformanceProps) {
  const data = Object.entries(usage)
    .map(([key, value]) => ({
      name: MODEL_NAMES[key] || key,
      value,
      key,
      color: MODEL_COLORS[key] || "hsl(var(--primary))",
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalUsage = Object.values(usage).reduce((a, b) => a + b, 0);

  if (totalUsage === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            Model Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No model usage data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          Model Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={85}
              tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [
                `${value} uses (${Math.round((value / totalUsage) * 100)}%)`,
                "Usage",
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
