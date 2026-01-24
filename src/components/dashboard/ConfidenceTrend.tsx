import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Area, AreaChart } from "recharts";
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
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Confidence Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
              <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            <p className="text-muted-foreground text-sm">No validation data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Confidence Trend
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Avg: <span className="text-primary font-semibold">{avgConfidence}%</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
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
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) => [`${value}%`, "Confidence"]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
            />
            <ReferenceLine 
              y={avgConfidence} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="confidence"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#confidenceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
