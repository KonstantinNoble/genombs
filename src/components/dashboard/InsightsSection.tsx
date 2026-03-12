import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { DollarSign, Zap, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

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
  description: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
}

const KPICard = ({ title, value, description, trend, trendValue, icon }: KPICardProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && trendValue && (
            <span className={`flex items-center gap-1 text-xs ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              {trendValue}
            </span>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const InsightsSection = () => {
  // Calculate total savings
  const totalSavings = costData.reduce(
    (acc, item) => acc + (item.withoutGateway - item.withGateway),
    0
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Savings"
          value={`$${totalSavings.toLocaleString()}`}
          description="vs. direct API calls"
          trend="up"
          trendValue="+23.5%"
          icon={<DollarSign className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Cache Hit Rate"
          value="87.3%"
          description="of requests served from cache"
          trend="up"
          trendValue="+4.2%"
          icon={<Zap className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Latency Saved"
          value="2.4s"
          description="average per request"
          trend="up"
          trendValue="+12%"
          icon={<Clock className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Requests Today"
          value="12,847"
          description="processed through gateway"
          trend="neutral"
          trendValue="stable"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* Cost Comparison Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Cost Comparison</CardTitle>
          <CardDescription>
            Monthly API costs: With vs. Without Gateway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={costData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="withoutGateway" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="withGateway" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                  className="text-xs"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
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
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/60" />
              <span className="text-sm text-muted-foreground">Without Gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">With Gateway</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-green-500">$2,200</p>
                <p className="text-xs text-muted-foreground">saved so far</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cache Efficiency</p>
                <p className="text-2xl font-bold">94.2%</p>
                <p className="text-xs text-muted-foreground">semantic match rate</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">45ms</p>
                <p className="text-xs text-muted-foreground">from cache</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsSection;
