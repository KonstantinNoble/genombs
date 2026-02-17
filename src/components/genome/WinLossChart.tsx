import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import GenomeCard from "@/components/genome/GenomeCard";
import type { Deal } from "@/lib/demo-winloss-data";

interface WinLossChartProps {
  deals: Deal[];
}

const WinLossChart = ({ deals }: WinLossChartProps) => {
  const stats = useMemo(() => {
    const totalWon = deals.filter((d) => d.outcome === "won").length;
    const totalLost = deals.filter((d) => d.outcome === "lost").length;
    const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
    const winRate = deals.length > 0 ? Math.round((totalWon / deals.length) * 100) : 0;

    // Per competitor
    const competitorMap = new Map<string, { won: number; lost: number }>();
    deals.forEach((d) => {
      const entry = competitorMap.get(d.competitor) || { won: 0, lost: 0 };
      if (d.outcome === "won") entry.won++;
      else entry.lost++;
      competitorMap.set(d.competitor, entry);
    });

    const competitorStats = Array.from(competitorMap.entries())
      .map(([name, { won, lost }]) => ({
        name,
        won,
        lost,
        winRate: Math.round((won / (won + lost)) * 100),
        total: won + lost,
      }))
      .sort((a, b) => b.total - a.total);

    // Reasons
    const winReasons = new Map<string, number>();
    const lossReasons = new Map<string, number>();
    deals.forEach((d) => {
      const map = d.outcome === "won" ? winReasons : lossReasons;
      map.set(d.reason, (map.get(d.reason) || 0) + 1);
    });

    const topWinReasons = Array.from(winReasons.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topLossReasons = Array.from(lossReasons.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalWon, totalLost, totalValue, winRate, competitorStats, topWinReasons, topLossReasons };
  }, [deals]);

  const chartData = stats.competitorStats.map((c) => ({
    name: c.name,
    Won: c.won,
    Lost: c.lost,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-border rounded-lg p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Win Rate</p>
          <p className="text-3xl font-bold text-primary">{stats.winRate}%</p>
        </div>
        <div className="border border-border rounded-lg p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Deals</p>
          <p className="text-3xl font-bold text-foreground">{deals.length}</p>
        </div>
        <div className="border border-border rounded-lg p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Won</p>
          <p className="text-3xl font-bold text-chart-4">{stats.totalWon}</p>
        </div>
        <div className="border border-border rounded-lg p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Lost</p>
          <p className="text-3xl font-bold text-destructive">{stats.totalLost}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <GenomeCard title="Win/Loss by Competitor">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fill: "hsl(0 0% 85%)", fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "hsl(0 0% 85%)", fontSize: 12 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(0 0% 8%)",
                  border: "1px solid hsl(0 0% 15%)",
                  borderRadius: "8px",
                  color: "hsl(0 0% 98%)",
                }}
              />
              <Bar dataKey="Won" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Lost" fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Per-competitor bars */}
        <div className="mt-4 space-y-3">
          {stats.competitorStats.map((c) => (
            <div key={c.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-base text-foreground">vs {c.name}</span>
                <span className="text-sm font-mono text-foreground/70">
                  {c.won}W / {c.lost}L ({c.winRate}%)
                </span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                <div
                  className="bg-chart-4 transition-all"
                  style={{ width: `${(c.won / c.total) * 100}%` }}
                />
                <div
                  className="bg-destructive transition-all"
                  style={{ width: `${(c.lost / c.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GenomeCard>

      {/* Reasons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GenomeCard title="Top Win Reasons">
          <ol className="space-y-2">
            {stats.topWinReasons.map(([reason, count], i) => (
              <li key={reason} className="flex items-center justify-between text-base">
                <span className="text-foreground/80">
                  <span className="text-muted-foreground mr-2">{i + 1}.</span>
                  {reason}
                </span>
                <span className="text-sm font-mono text-chart-4">{count} deals</span>
              </li>
            ))}
          </ol>
        </GenomeCard>
        <GenomeCard title="Top Loss Reasons">
          <ol className="space-y-2">
            {stats.topLossReasons.map(([reason, count], i) => (
              <li key={reason} className="flex items-center justify-between text-base">
                <span className="text-foreground/80">
                  <span className="text-muted-foreground mr-2">{i + 1}.</span>
                  {reason}
                </span>
                <span className="text-sm font-mono text-destructive">{count} deals</span>
              </li>
            ))}
          </ol>
        </GenomeCard>
      </div>
    </div>
  );
};

export default WinLossChart;
