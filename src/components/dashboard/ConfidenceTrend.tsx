import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { TrendingUp } from "lucide-react";
import type { ConfidenceTrendPoint } from "@/hooks/useDashboardStats";
import { format, parseISO } from "date-fns";

interface ConfidenceTrendProps {
  data: ConfidenceTrendPoint[];
}

export function ConfidenceTrend({ data }: ConfidenceTrendProps) {
  // Format data for chart
  const chartData = data.map((point) => ({
    date: format(parseISO(point.created_at), "dd.MM"),
    confidence: point.confidence,
    fullDate: format(parseISO(point.created_at), "dd.MM.yyyy HH:mm"),
  }));

  // Calculate average for reference line
  const avgConfidence = data.length > 0 
    ? Math.round(data.reduce((sum, p) => sum + (p.confidence || 0), 0) / data.length)
    : 0;

  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Confidence Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No validation data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Confidence Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value}%`, "Confidence"]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
            />
            <ReferenceLine 
              y={avgConfidence} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              label={{ 
                value: `Avg: ${avgConfidence}%`, 
                position: "right",
                fontSize: 10,
                fill: "hsl(var(--muted-foreground))"
              }}
            />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
