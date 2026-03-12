import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

// Mock data for the cost comparison chart
const costData = [
  { month: "Jan", withoutGateway: 2400, withGateway: 1800 },
  { month: "Feb", withoutGateway: 2800, withGateway: 1950 },
  { month: "Mar", withoutGateway: 3200, withGateway: 2100 },
  { month: "Apr", withoutGateway: 3100, withGateway: 1900 },
  { month: "May", withoutGateway: 3600, withGateway: 2050 },
  { month: "Jun", withoutGateway: 4100, withGateway: 2200 },
  { month: "Jul", withoutGateway: 4500, withGateway: 2300 },
];

const chartConfig = {
  withoutGateway: {
    label: "Without Gateway",
    color: "hsl(var(--muted-foreground))",
  },
  withGateway: {
    label: "With Gateway",
    color: "hsl(var(--primary))",
  },
};

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

const KPICard = ({ title, value, change, changeType = "neutral" }: KPICardProps) => {
  const changeColor = changeType === "positive" 
    ? "text-green-500" 
    : changeType === "negative" 
    ? "text-red-500" 
    : "text-muted-foreground";

  return (
    <Card className="bg-card/50 border-border/40">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {change && (
          <p className={`text-sm mt-2 ${changeColor}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const InsightsSection = () => {
  const totalSavings = costData.reduce(
    (acc, item) => acc + (item.withoutGateway - item.withGateway),
    0
  );

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Insights</h2>
        <p className="text-muted-foreground mt-1">Monitor your cost savings and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Savings"
          value={`$${totalSavings.toLocaleString()}`}
          change="+23.5% vs last month"
          changeType="positive"
        />
        <KPICard
          title="Cache Hit Rate"
          value="87.3%"
          change="+4.2% improvement"
          changeType="positive"
        />
        <KPICard
          title="Latency Saved"
          value="2.4s"
          change="Average per request"
          changeType="neutral"
        />
        <KPICard
          title="Requests Today"
          value="12,847"
          change="Processed through gateway"
          changeType="neutral"
        />
      </div>

      {/* Cost Comparison Chart */}
      <Card className="bg-card/50 border-border/40">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Cost Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monthly API costs with and without the gateway
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={costData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="withoutGateway" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="withGateway" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-mono">${Number(value).toLocaleString()}</span>
                      )}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="withoutGateway"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#withoutGateway)"
                  name="Without Gateway"
                />
                <Area
                  type="monotone"
                  dataKey="withGateway"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#withGateway)"
                  name="With Gateway"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded-full bg-muted-foreground" />
              <span className="text-sm text-muted-foreground">Without Gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">With Gateway</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-semibold text-green-500 mt-1">$2,200</p>
            <p className="text-sm text-muted-foreground mt-1">saved so far</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Cache Efficiency</p>
            <p className="text-2xl font-semibold mt-1">94.2%</p>
            <p className="text-sm text-muted-foreground mt-1">semantic match rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Response</p>
            <p className="text-2xl font-semibold mt-1">45ms</p>
            <p className="text-sm text-muted-foreground mt-1">from cache</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsSection;
