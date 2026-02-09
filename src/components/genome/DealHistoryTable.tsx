import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GenomeCard from "@/components/genome/GenomeCard";
import type { Deal } from "@/lib/demo-winloss-data";

interface DealHistoryTableProps {
  deals: Deal[];
}

const DealHistoryTable = ({ deals }: DealHistoryTableProps) => {
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [competitorFilter, setCompetitorFilter] = useState<string>("all");

  const competitors = useMemo(
    () => Array.from(new Set(deals.map((d) => d.competitor))).sort(),
    [deals]
  );

  const filtered = useMemo(() => {
    return deals
      .filter((d) => outcomeFilter === "all" || d.outcome === outcomeFilter)
      .filter((d) => competitorFilter === "all" || d.competitor === competitorFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [deals, outcomeFilter, competitorFilter]);

  const formatValue = (value?: number) =>
    value ? `$${value.toLocaleString()}` : "—";

  return (
    <GenomeCard title="Deal History">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={competitorFilter} onValueChange={setCompetitorFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Competitors</SelectItem>
            {competitors.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Deal</th>
              <th className="text-center py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Result</th>
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Competitor</th>
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Reason</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Value</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((deal) => (
              <tr key={deal.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2 px-3 text-sm font-mono text-muted-foreground">
                  {new Date(deal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td className="py-2 px-3 text-sm text-foreground">
                  {deal.name}
                  {deal.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                      {deal.notes}
                    </p>
                  )}
                </td>
                <td className="py-2 px-3 text-center">
                  <Badge
                    variant="outline"
                    className={
                      deal.outcome === "won"
                        ? "bg-chart-4/15 text-chart-4 border-chart-4/30 text-[10px]"
                        : "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                    }
                  >
                    {deal.outcome === "won" ? "Won" : "Lost"}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-sm text-foreground">{deal.competitor}</td>
                <td className="py-2 px-3 text-sm text-muted-foreground">{deal.reason}</td>
                <td className="py-2 px-3 text-sm font-mono text-foreground text-right">
                  {formatValue(deal.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No deals match your filters.
        </p>
      )}
    </GenomeCard>
  );
};

export default DealHistoryTable;
