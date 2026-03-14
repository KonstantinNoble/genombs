import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { DollarSign, Zap, Clock, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/external-client";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonthlyStats {
  month: string;
  totalRequests: number;
  cachedRequests: number;
  totalTokens: number;
  avgLatencyMs: number;
}

interface InsightsData {
  totalRequests: number;
  cachedRequests: number;
  cacheHitRate: number;
  tokensSavedByCache: number;
  avgLatencyMs: number;
  avgCacheLatencyMs: number;
  requestsToday: number;
  monthlySeries: MonthlyStats[];
}

const EMPTY: InsightsData = {
  totalRequests: 0,
  cachedRequests: 0,
  cacheHitRate: 0,
  tokensSavedByCache: 0,
  avgLatencyMs: 0,
  avgCacheLatencyMs: 0,
  requestsToday: 0,
  monthlySeries: [],
};

// ── Chart config ──────────────────────────────────────────────────────────────

const chartConfig = {
  totalRequests: { label: "Total Requests", color: "hsl(var(--muted-foreground))" },
  cachedRequests: { label: "Served from Cache", color: "hsl(var(--primary))" },
};

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string;
  description: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
  loading?: boolean;
}

const KPICard = ({ title, value, description, trend, trendValue, icon, loading }: KPICardProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ── Main Component ────────────────────────────────────────────────────────────

const InsightsSection = () => {
  const { user } = useAuth();
  const [data, setData] = useState<InsightsData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch request logs
        const { data: logs, error: logsError } = await (supabase as any)
          .from("gateway_request_logs")
          .select("created_at, status, cache_hit, total_tokens, latency_ms, prompt_tokens, completion_tokens")
          .eq("user_id", user.id)
          .gte("created_at", since)
          .order("created_at", { ascending: true });

        if (logsError) throw logsError;

        // Fetch cache entries (contains actual tokens_saved per entry)
        const { data: cacheEntries } = await (supabase as any)
          .from("gateway_cache_entries")
          .select("tokens_saved, hit_count")
          .eq("user_id", user.id)
          .gte("created_at", since);

        const tokensSaved = (cacheEntries ?? []).reduce(
          (acc: number, e: { tokens_saved: number | null; hit_count: number | null }) =>
            acc + (e.tokens_saved ?? 0) * Math.max(1, e.hit_count ?? 1),
          0
        );

        if (!logs || logs.length === 0) { setData({ ...EMPTY, tokensSavedByCache: tokensSaved }); return; }

        const total = logs.length;
        const cached = logs.filter((l: any) => l.cache_hit).length;
        const cacheHitRate = total > 0 ? Math.round((cached / total) * 1000) / 10 : 0;

        const nonCachedLogs = logs.filter((l: any) => !l.cache_hit && l.latency_ms);
        const avgLatencyMs = nonCachedLogs.length > 0
          ? Math.round(nonCachedLogs.reduce((acc: number, l: any) => acc + l.latency_ms, 0) / nonCachedLogs.length)
          : 0;

        const cachedLogs = logs.filter((l: any) => l.cache_hit && l.latency_ms);
        const avgCacheLatencyMs = cachedLogs.length > 0
          ? Math.round(cachedLogs.reduce((acc: number, l: any) => acc + l.latency_ms, 0) / cachedLogs.length)
          : 0;

        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const requestsToday = logs.filter((l: any) => new Date(l.created_at) >= todayStart).length;

        // Monthly series
        const monthMap: Record<string, { total: number; cached: number; tokens: number; latencies: number[] }> = {};
        for (const log of logs) {
          const key = new Date(log.created_at).toLocaleString("default", { month: "short" });
          if (!monthMap[key]) monthMap[key] = { total: 0, cached: 0, tokens: 0, latencies: [] };
          monthMap[key].total++;
          if (log.cache_hit) monthMap[key].cached++;
          monthMap[key].tokens += log.total_tokens || 0;
          if (log.latency_ms) monthMap[key].latencies.push(log.latency_ms);
        }

        const monthlySeries: MonthlyStats[] = Object.entries(monthMap).map(([month, v]) => ({
          month,
          totalRequests: v.total,
          cachedRequests: v.cached,
          totalTokens: v.tokens,
          avgLatencyMs: v.latencies.length > 0
            ? Math.round(v.latencies.reduce((a, b) => a + b, 0) / v.latencies.length)
            : 0,
        }));

        setData({ totalRequests: total, cachedRequests: cached, cacheHitRate, tokensSavedByCache: tokensSaved, avgLatencyMs, avgCacheLatencyMs, requestsToday, monthlySeries });
      } catch (err) {
        console.error("[InsightsSection] Failed to load insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Tokens Saved by Cache"
          value={loading ? "—" : fmtNum(data.tokensSavedByCache)}
          description="not sent to providers"
          trend="up"
          trendValue={`${data.cacheHitRate}% hit rate`}
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          loading={loading}
        />
        <KPICard
          title="Cache Hit Rate"
          value={loading ? "—" : `${data.cacheHitRate}%`}
          description="of requests served from cache"
          trend={data.cacheHitRate >= 50 ? "up" : "neutral"}
          icon={<Zap className="h-4 w-4 text-primary" />}
          loading={loading}
        />
        <KPICard
          title="Avg Latency (Cache)"
          value={loading ? "—" : `${data.avgCacheLatencyMs}ms`}
          description={`vs ${data.avgLatencyMs}ms without cache`}
          trend="up"
          icon={<Clock className="h-4 w-4 text-primary" />}
          loading={loading}
        />
        <KPICard
          title="Requests Today"
          value={loading ? "—" : fmtNum(data.requestsToday)}
          description="processed through gateway"
          trend="neutral"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          loading={loading}
        />
      </div>

      {/* Monthly Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Request Volume (Last 3 Months)</CardTitle>
          <CardDescription>Total requests vs. cache-served requests per month</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data.monthlySeries.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
              No data yet — send your first request through the gateway to see stats here.
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlySeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cacheGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="totalRequests" stroke="hsl(var(--muted-foreground))" strokeWidth={2} fillOpacity={1} fill="url(#totalGrad)" name="Total Requests" />
                  <Area type="monotone" dataKey="cachedRequests" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#cacheGrad)" name="Served from Cache" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/60" />
              <span className="text-sm text-muted-foreground">Total Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Served from Cache</span>
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
                <p className="text-sm text-muted-foreground">Total Requests (90d)</p>
                <p className="text-2xl font-bold">{loading ? "—" : fmtNum(data.totalRequests)}</p>
                <p className="text-xs text-muted-foreground">processed through gateway</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cache Efficiency</p>
                <p className="text-2xl font-bold">{loading ? "—" : `${data.cacheHitRate}%`}</p>
                <p className="text-xs text-muted-foreground">hit rate (90d)</p>
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
                <p className="text-sm text-muted-foreground">Avg Cache Response</p>
                <p className="text-2xl font-bold">{loading ? "—" : `${data.avgCacheLatencyMs}ms`}</p>
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
