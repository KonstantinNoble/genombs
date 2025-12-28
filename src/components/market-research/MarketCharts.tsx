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
  fontSize: 14,
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
    <div className="flex items-center gap-2 text-base">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
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
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-foreground">Competitor Market Share</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`h-[340px] ${CHART_FRAME_CLASS}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={96}
                paddingAngle={2}
                dataKey="marketShare"
                nameKey="name"
                label={(p: any) => {
                  const name = String(p?.name ?? "");
                  const marketShare = Number(p?.marketShare ?? 0);
                  const x = Number(p?.x ?? 0);
                  const y = Number(p?.y ?? 0);
                  const cx = Number(p?.cx ?? 0);
                  const shortName = name.length > 14 ? name.slice(0, 14) + "…" : name;
                  const isRight = x > cx;

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="hsl(var(--foreground))"
                      fillOpacity={0.92}
                      fontSize={14}
                      fontWeight={600}
                      textAnchor={isRight ? "start" : "end"}
                      dominantBaseline="central"
                    >
                      <title>{`${name}: ${marketShare}%`}</title>
                      {`${shortName}: ${marketShare}%`}
                    </text>
                  );
                }}
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

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-start gap-2 text-lg">
              <div
                className="w-4 h-4 rounded-sm flex-shrink-0 mt-1"
                style={{ backgroundColor: item.fill }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-foreground/80 font-medium break-words" title={item.name}>
                  {item.name}
                </div>
              </div>
              <div className="font-bold text-foreground ml-2 flex-shrink-0">{item.marketShare}%</div>
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
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-foreground">Marketing Channel Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`h-[340px] ${CHART_FRAME_CLASS}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} layout="vertical" margin={{ left: 56, right: 28, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={AXIS_TICK}
                tickMargin={10}
                stroke="hsl(var(--border))"
              />
              <YAxis
                dataKey="name"
                type="category"
                width={170}
                tick={{ ...AXIS_TICK, fontSize: 13 }}
                tickMargin={10}
                stroke="hsl(var(--border))"
                tickFormatter={(value) => (value.length > 24 ? value.slice(0, 24) + "…" : value)}
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

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
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
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-foreground">Market Trends Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`h-[360px] ${CHART_FRAME_CLASS}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 24, right: 20, bottom: 90, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ ...AXIS_TICK, fontSize: 13 }}
                tickMargin={12}
                stroke="hsl(var(--border))"
                angle={-40}
                textAnchor="end"
                height={95}
                tickFormatter={(value) => (value.length > 22 ? value.slice(0, 22) + "…" : value)}
              />
              <YAxis domain={[0, 10]} tick={AXIS_TICK} tickMargin={10} stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                formatter={(value: number, name: string) => [
                  `${value}/10`,
                  name === "impact" ? "Impact Score" : "Growth Potential",
                ]}
              />
              <Bar dataKey="impact" fill="hsl(var(--chart-1))" name="Impact Score" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="growthPotential"
                fill="hsl(var(--chart-3))"
                name="Growth Potential"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <LegendItem color="hsl(var(--chart-1))" label="Impact Score" />
          <LegendItem color="hsl(var(--chart-3))" label="Growth Potential" />
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
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-foreground">Customer Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`h-[340px] ${CHART_FRAME_CLASS}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={102}
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
                  return [`${value}%${item.averageSpend ? ` (Avg Spend: $${item.averageSpend})` : ""}`, name];
                }}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 space-y-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-start justify-between gap-3 text-lg">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0 mt-1"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-foreground/80 font-medium break-words" title={item.name}>
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-foreground flex-shrink-0">{item.value}%</span>
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
    {
      year: "2026",
      value: data.projection2026 || baseValue * Math.pow(1 + data.cagr / 100, 2),
      type: "Projected",
    },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-foreground">Growth Projections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <p className="text-3xl font-bold text-primary">{data.cagr}%</p>
            <p className="text-sm text-muted-foreground mt-1">CAGR</p>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <p className="text-3xl font-bold text-foreground">{data.yearOverYear}%</p>
            <p className="text-sm text-muted-foreground mt-1">YoY Growth</p>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <p className="text-3xl font-bold text-foreground">${data.projection2026}B</p>
            <p className="text-sm text-muted-foreground mt-1">2026 Projection</p>
          </div>
        </div>

        <div className={`h-[240px] ${CHART_FRAME_CLASS}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ left: 18, right: 18, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={AXIS_TICK} tickMargin={10} stroke="hsl(var(--border))" />
              <YAxis tick={AXIS_TICK} tickMargin={10} stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                formatter={(value: number) => [`$${value.toFixed(1)}B`, "Market Size"]}
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
      </CardContent>
    </Card>
  );
}
