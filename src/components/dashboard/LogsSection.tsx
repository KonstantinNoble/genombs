import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase/external-client";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LogEntry {
  id: string;
  created_at: string;
  model_requested: string | null;
  model_used: string | null;
  provider: string | null;
  total_tokens: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  latency_ms: number | null;
  cache_hit: boolean | null;
  status: string | null;
  cache_entry_id: string | null;
  error_code: string | null;
}

type StatusFilter = "all" | "success" | "cached" | "error";

// ── Component ─────────────────────────────────────────────────────────────────

const LogsSection = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  // ── Fetch logs from DB ──────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("gateway_request_logs")
        .select(
          "id, created_at, model_requested, model_used, provider, total_tokens, prompt_tokens, completion_tokens, latency_ms, cache_hit, status, cache_entry_id, error_code"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: sortDirection === "asc" })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) {
        console.error("[LogsSection] Supabase error:", error.message, error.details);
        throw error;
      }
      setLogs(data ?? []);
    } catch (err) {
      console.error("[LogsSection] fetchLogs:", err);
    } finally {
      setLoading(false);
    }
  }, [user, sortDirection, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const getDisplayStatus = (log: LogEntry): "success" | "cached" | "error" => {
    if (log.cache_hit) return "cached";
    if (log.status === "error" || log.status === "failed") return "error";
    return "success";
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (log.model_used ?? "").toLowerCase().includes(q) ||
      (log.model_requested ?? "").toLowerCase().includes(q) ||
      (log.provider ?? "").toLowerCase().includes(q) ||
      (log.status ?? "").toLowerCase().includes(q);
    const displayStatus = getDisplayStatus(log);
    const matchesStatus = statusFilter === "all" || displayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRequests = logs.length;
  const cachedCount = logs.filter((l) => l.cache_hit).length;
  const cacheHitRate = totalRequests > 0 ? ((cachedCount / totalRequests) * 100).toFixed(1) : "0.0";
  const avgCacheLatency =
    cachedCount > 0
      ? Math.round(
          logs.filter((l) => l.cache_hit && l.latency_ms).reduce((a, l) => a + (l.latency_ms ?? 0), 0) / cachedCount
        )
      : 0;

  // ── Badge ───────────────────────────────────────────────────────────────────
  const getStatusBadge = (status: "success" | "cached" | "error") => {
    switch (status) {
      case "cached":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
            Cache Hit
          </Badge>
        );
      case "success":
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            API Call
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
            Error
          </Badge>
        );
    }
  };

  const providerColor = (p: string | null) => {
    switch (p?.toLowerCase()) {
      case "openai": return "text-green-400";
      case "anthropic": return "text-orange-400";
      case "google": return "text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Logs</h2>
        <p className="text-muted-foreground mt-1">View and analyze all requests through your gateway</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Total Requests</p>
            <p className="text-xl font-semibold mt-1">{loading ? "—" : totalRequests}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Cache Hit Rate</p>
            <p className="text-xl font-semibold text-green-500 mt-1">{loading ? "—" : `${cacheHitRate}%`}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Cached Requests</p>
            <p className="text-xl font-semibold text-primary mt-1">{loading ? "—" : cachedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Avg Latency (Cache)</p>
            <p className="text-xl font-semibold mt-1">{loading ? "—" : `${avgCacheLatency}ms`}</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="bg-card/50 border-border/40">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium">Request Logs</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search model or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56"
              />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="cached">Cache Hits</SelectItem>
                  <SelectItem value="success">API Calls</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
              >
                {sortDirection === "desc" ? "Newest" : "Oldest"}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchLogs}>
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading logs…
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No gateway requests yet — send your first request through the proxy to see logs here.
            </div>
          ) : (
            <div className="rounded-lg border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="w-44">Timestamp</TableHead>
                    <TableHead className="w-28">Provider</TableHead>
                    <TableHead>Model Used</TableHead>
                    <TableHead className="w-24 text-right">Tokens</TableHead>
                    <TableHead className="w-24 text-right">Latency</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const status = getDisplayStatus(log);
                    return (
                      <TableRow
                        key={log.id}
                        className={`cursor-pointer transition-colors ${expandedRow === log.id ? "bg-muted/10" : ""}`}
                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium capitalize ${providerColor(log.provider)}`}>
                            {log.provider ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">{log.model_used ?? log.model_requested ?? "—"}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {(log.total_tokens ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          <span className={log.cache_hit ? "text-green-500" : ""}>
                            {log.latency_ms != null
                              ? log.latency_ms < 1000
                                ? `${log.latency_ms}ms`
                                : `${(log.latency_ms / 1000).toFixed(1)}s`
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Expanded Details */}
          {expandedRow && (() => {
            const log = logs.find((l) => l.id === expandedRow);
            if (!log) return null;
            return (
              <div className="mt-4 p-4 rounded-lg bg-muted/10 border border-border/30">
                <span className="text-sm font-medium">Request Details</span>
                <div className="grid gap-4 md:grid-cols-3 mt-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Request ID</span>
                      <span className="font-mono text-xs truncate max-w-[160px]">{log.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Provider</span>
                      <span className={`font-mono text-xs capitalize ${providerColor(log.provider)}`}>{log.provider ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cache Hit</span>
                      <span className="font-mono text-xs">{log.cache_hit ? "Yes ✓" : "No"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Model Requested</span>
                      <span className="font-mono text-xs">{log.model_requested ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Model Used</span>
                      <span className="font-mono text-xs">{log.model_used ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-mono text-xs">{log.status ?? "—"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prompt Tokens</span>
                      <span className="font-mono text-xs">{(log.prompt_tokens ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completion Tokens</span>
                      <span className="font-mono text-xs">{(log.completion_tokens ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Tokens</span>
                      <span className="font-mono text-xs">{(log.total_tokens ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Showing {filteredLogs.length} of {totalRequests} requests (page {page + 1})
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={logs.length < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsSection;
