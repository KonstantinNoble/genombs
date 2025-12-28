import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Professional color palette - no icons, clean design
const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 60%, 50%)"
];

interface CompetitorChartProps {
  data: Array<{
    name: string;
    marketShare: number;
    revenue?: number;
  }>;
}

export function CompetitorPieChart({ data }: CompetitorChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((item, index) => ({
    ...item,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Competitor Market Share
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="marketShare"
                nameKey="name"
                label={({ name, marketShare }) => `${name}: ${marketShare}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Market Share"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground truncate">{item.name}</span>
              <span className="font-medium text-foreground ml-auto">{item.marketShare}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ChannelChartProps {
  data: Array<{
    name: string;
    effectiveness: number;
    averageROI: number;
  }>;
}

export function ChannelBarChart({ data }: ChannelChartProps) {
  if (!data || data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => b.effectiveness - a.effectiveness);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Marketing Channel Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                formatter={(value: number, name: string) => [
                  name === "effectiveness" ? `${value}%` : `${value}% ROI`,
                  name === "effectiveness" ? "Effectiveness" : "Average ROI"
                ]}
              />
              <Legend />
              <Bar 
                dataKey="effectiveness" 
                fill="hsl(var(--primary))" 
                name="Effectiveness"
                radius={[0, 4, 4, 0]}
              />
              <Bar 
                dataKey="averageROI" 
                fill="hsl(var(--chart-2))" 
                name="Average ROI"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface TrendChartProps {
  data: Array<{
    name: string;
    impact: number;
    growthPotential: number;
  }>;
}

export function TrendImpactChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map(item => ({
    ...item,
    impactColor: item.impact >= 7 ? "hsl(142, 71%, 45%)" : item.impact >= 4 ? "hsl(45, 93%, 47%)" : "hsl(0, 84%, 60%)"
  }));

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Market Trends Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 20, right: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                formatter={(value: number, name: string) => [
                  `${value}/10`,
                  name === "impact" ? "Impact Score" : "Growth Potential"
                ]}
              />
              <Legend />
              <Bar 
                dataKey="impact" 
                fill="hsl(var(--primary))" 
                name="Impact Score"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="growthPotential" 
                fill="hsl(var(--chart-3))" 
                name="Growth Potential"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface DemographicsChartProps {
  data: Array<{
    segment: string;
    percentage: number;
    averageSpend?: number;
  }>;
}

export function DemographicsDonutChart({ data }: DemographicsChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((item, index) => ({
    ...item,
    name: item.segment,
    value: item.percentage,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Customer Demographics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const item = props.payload;
                  return [
                    `${value}%${item.averageSpend ? ` (Avg Spend: $${item.averageSpend})` : ''}`,
                    name
                  ];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-medium text-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface GrowthChartProps {
  data: {
    cagr: number;
    yearOverYear: number;
    projection2026: number;
  };
  currentMarketSize?: number;
}

export function GrowthProjectionChart({ data, currentMarketSize }: GrowthChartProps) {
  if (!data) return null;

  const baseValue = currentMarketSize || 100;
  const projectionData = [
    { year: "2024", value: baseValue, type: "Actual" },
    { year: "2025", value: baseValue * (1 + data.yearOverYear / 100), type: "Actual" },
    { year: "2026", value: data.projection2026 || baseValue * Math.pow(1 + data.cagr / 100, 2), type: "Projected" }
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Growth Projections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{data.cagr}%</p>
            <p className="text-xs text-muted-foreground">CAGR</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{data.yearOverYear}%</p>
            <p className="text-xs text-muted-foreground">YoY Growth</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">${data.projection2026}B</p>
            <p className="text-xs text-muted-foreground">2026 Projection</p>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                formatter={(value: number) => [`$${value.toFixed(1)}B`, "Market Size"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
