import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Target, BarChart3, Megaphone } from "lucide-react";

interface CompetitorData {
  name: string;
  marketShare: number;
  revenue?: number;
}

interface TrendData {
  name: string;
  impact: number;
  growthPotential: number;
}

interface ChannelData {
  name: string;
  effectiveness: number;
  averageROI: number;
}

interface DemographicData {
  segment: string;
  percentage: number;
  averageSpend?: number;
}

interface GrowthData {
  cagr: number;
  yearOverYear: number;
  projectionNextYear?: number;
}

export function CompetitorsList({ data }: { data: CompetitorData[] }) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Competitors
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-3">
        {data.map((competitor, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                {competitor.name}
              </p>
              {competitor.revenue && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  ~${competitor.revenue}M revenue
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="font-bold text-primary text-sm sm:text-lg">
                {competitor.marketShare}%
              </p>
              <p className="text-xs text-muted-foreground">market share</p>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground italic mt-2">
          Data sourced via AI web research. Verify with primary sources.
        </p>
      </CardContent>
    </Card>
  );
}

export function TrendsList({ data }: { data: TrendData[] }) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Market Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-3">
        {data.map((trend, index) => (
          <div
            key={index}
            className="p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30"
          >
            <p className="font-semibold text-foreground text-sm sm:text-base mb-2">
              {trend.name}
            </p>
            <div className="flex gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Impact:</span>
                <span className="font-semibold text-foreground">{trend.impact}/10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-chart-3" />
                <span className="text-muted-foreground">Growth:</span>
                <span className="font-semibold text-foreground">{trend.growthPotential}/10</span>
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground italic mt-2">
          Data sourced via AI web research. Verify with primary sources.
        </p>
      </CardContent>
    </Card>
  );
}

export function ChannelsList({ data }: { data: ChannelData[] }) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          Marketing Channels
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-3">
        {data.map((channel, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm sm:text-base">
                {channel.name}
              </p>
            </div>
            <div className="flex gap-4 text-right flex-shrink-0 ml-3">
              <div>
                <p className="font-bold text-foreground text-sm sm:text-base">
                  {channel.effectiveness}%
                </p>
                <p className="text-xs text-muted-foreground">effectiveness</p>
              </div>
              <div>
                <p className="font-bold text-primary text-sm sm:text-base">
                  {channel.averageROI}%
                </p>
                <p className="text-xs text-muted-foreground">ROI</p>
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground italic mt-2">
          Data sourced via AI web research. Verify with primary sources.
        </p>
      </CardContent>
    </Card>
  );
}

export function DemographicsList({ data }: { data: DemographicData[] }) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Target Demographics
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-3">
        {data.map((segment, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm sm:text-base">
                {segment.segment}
              </p>
              {segment.averageSpend && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Avg. spend: ${segment.averageSpend}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="font-bold text-primary text-sm sm:text-lg">
                {segment.percentage}%
              </p>
              <p className="text-xs text-muted-foreground">of market</p>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground italic mt-2">
          Data sourced via AI web research. Verify with primary sources.
        </p>
      </CardContent>
    </Card>
  );
}

export function GrowthMetrics({ data, marketUnit }: { data: GrowthData; marketUnit?: string }) {
  if (!data) return null;

  const currentYear = new Date().getFullYear();
  const isMillions = marketUnit?.toLowerCase().includes('million');
  const displayUnit = isMillions ? 'M' : 'B';

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Growth Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30">
            <p className="text-xl sm:text-3xl font-bold text-primary">{data.cagr}%</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">CAGR</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30">
            <p className="text-xl sm:text-3xl font-bold text-foreground">{data.yearOverYear}%</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Year-over-Year</p>
          </div>
          {data.projectionNextYear && (
            <div className="text-center p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30">
              <p className="text-xl sm:text-3xl font-bold text-foreground">
                ${data.projectionNextYear}{displayUnit}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{currentYear + 1} Projection</p>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground italic mt-4 text-center">
          Data sourced via AI web research. Verify with primary sources.
        </p>
      </CardContent>
    </Card>
  );
}
