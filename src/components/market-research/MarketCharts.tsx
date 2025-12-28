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
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Chart palette uses design-system tokens (defined in index.css).
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
];

const AXIS_TICK = {
  fill: "hsl(var(--foreground))",
  fillOpacity: 0.92,
  fontSize: 12,
  fontWeight: 600,
} as const;

const AXIS_TICK_MOBILE = {
  fill: "hsl(var(--foreground))",
  fillOpacity: 0.92,
  fontSize: 10,
  fontWeight: 600,
} as const;

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  color: "hsl(var(--foreground))",
  fontSize: 14,
} as const;

const TOOLTIP_LABEL_STYLE = {
  color: "hsl(var(--foreground))",
  fontSize: 14,
  fontWeight: 700,
} as const;

const TOOLTIP_ITEM_STYLE = {
  color: "hsl(var(--foreground))",
  fontSize: 14,
  fontWeight: 600,
} as const;

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base">
      <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
      <span className="text-foreground/80 font-medium">{label}</span>
    </div>
  );
}

const CHART_FRAME_CLASS =
  "[&_.recharts-wrapper]:overflow-visible [&_.recharts-surface]:overflow-visible";

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
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-xl font-bold text-foreground">Competitor Market Share</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className={`h-[260px] sm:h-[340px] ${CHART_FRAME_CLASS}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="marketShare"
                nameKey="name"
                label={false}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Market Share"]}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 sm:mt-5 grid grid-cols-1 gap-2 sm:gap-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm sm:text-lg">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-foreground/80 font-medium text-sm sm:text-base" title={item.name}>
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-foreground text-sm sm:text-base flex-shrink-0">{item.marketShare}%</span>
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
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-xl font-bold text-foreground">Marketing Channels</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className={`h-[280px] sm:h-[340px] ${CHART_FRAME_CLASS}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} layout="vertical" margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={AXIS_TICK_MOBILE}
                tickMargin={6}
                stroke="hsl(var(--border))"
              />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={AXIS_TICK_MOBILE}
                tickMargin={6}
                stroke="hsl(var(--border))"
                tickFormatter={(value) => (value.length > 12 ? value.slice(0, 12) + "…" : value)}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                formatter={(value: number, name: string) => [
                  name === "effectiveness" ? `${value}%` : `${value}% ROI`,
                  name === "effectiveness" ? "Effectiveness" : "Average ROI",
                ]}
              />
              <Bar dataKey="effectiveness" fill="hsl(var(--chart-1))" name="Effectiveness" radius={[0, 4, 4, 0]} />
              <Bar dataKey="averageROI" fill="hsl(var(--chart-2))" name="Average ROI" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 sm:mt-5 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2">
          <LegendItem color="hsl(var(--chart-1))" label="Effectiveness" />
          <LegendItem color="hsl(var(--chart-2))" label="Average ROI" />
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

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-xl font-bold text-foreground">Market Trends</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="p-3 sm:p-4 bg-background/50 rounded-lg">
              <p className="text-sm sm:text-base font-medium text-foreground mb-2">{item.name}</p>
              <div className="flex justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
                  <span className="text-muted-foreground">Impact:</span>
                  <span className="font-semibold text-foreground">{item.impact}/10</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-3))" }} />
                  <span className="text-muted-foreground">Growth Potential:</span>
                  <span className="font-semibold text-foreground">{item.growthPotential}/10</span>
                </div>
              </div>
            </div>
          ))}
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
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-xl font-bold text-foreground">Demographics</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className={`h-[240px] sm:h-[340px] ${CHART_FRAME_CLASS}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
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
                  return [`${value}%${item.averageSpend ? ` (Avg: $${item.averageSpend})` : ""}`, name];
                }}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 sm:mt-5 space-y-2 sm:space-y-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-2 text-sm sm:text-lg">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-foreground/80 font-medium text-sm sm:text-base" title={item.name}>
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-foreground text-sm sm:text-base flex-shrink-0">{item.value}%</span>
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
    projectionNextYear?: number;
    projection2026?: number; // Legacy support
  };
  currentMarketSize?: number;
  marketUnit?: string;
}

export function GrowthProjectionChart({ data, currentMarketSize, marketUnit }: GrowthChartProps) {
  if (!data) return null;

  const currentYear = new Date().getFullYear();
  const baseValue = currentMarketSize || 100;
  const projectionValue = data.projectionNextYear || data.projection2026 || baseValue * Math.pow(1 + data.cagr / 100, 2);
  
  // Determine if we're dealing with millions or billions
  const isMillions = marketUnit?.toLowerCase().includes('million') || projectionValue < 1;
  const displayUnit = isMillions ? 'M' : 'B';
  
  const projectionData = [
    { year: String(currentYear - 1), value: baseValue, type: "Actual" },
    { year: String(currentYear), value: baseValue * (1 + data.yearOverYear / 100), type: "Actual" },
    {
      year: String(currentYear + 1),
      value: projectionValue,
      type: "Projected",
    },
  ];

  // Format value based on unit
  const formatValue = (value: number) => {
    if (isMillions) {
      return `$${value.toFixed(0)}M`;
    }
    return `$${value.toFixed(1)}B`;
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-xl font-bold text-foreground">Growth Projections</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-2 sm:p-4 bg-background/50 rounded-lg">
            <p className="text-lg sm:text-3xl font-bold text-primary">{data.cagr}%</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">CAGR</p>
          </div>
          <div className="text-center p-2 sm:p-4 bg-background/50 rounded-lg">
            <p className="text-lg sm:text-3xl font-bold text-foreground">{data.yearOverYear}%</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">YoY</p>
          </div>
          <div className="text-center p-2 sm:p-4 bg-background/50 rounded-lg">
            <p className="text-lg sm:text-3xl font-bold text-foreground">${projectionValue}{displayUnit}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{currentYear + 1}</p>
          </div>
        </div>

        <div className={`h-[180px] sm:h-[240px] ${CHART_FRAME_CLASS}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={AXIS_TICK_MOBILE} tickMargin={6} stroke="hsl(var(--border))" />
              <YAxis tick={AXIS_TICK_MOBILE} tickMargin={6} stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                formatter={(value: number) => [formatValue(value), "Market Size"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1) / 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-muted-foreground italic mt-3 text-center">
          Data is AI-generated based on web research. Verify with primary sources.
        </p>
      </CardContent>
    </Card>
  );
}
