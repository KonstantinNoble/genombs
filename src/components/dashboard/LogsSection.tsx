import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ChevronUp, ChevronDown, Copy, Check, Wand2, GitFork, AlertCircle } from "lucide-react";
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
  is_streaming: boolean | null;
  // These columns may not exist yet in older DBs — treat as optional
  prompt_optimized?: boolean | null;
  fallback_used?: boolean | null;
}

type StatusFilter = "all" | "success" | "cached" | "error";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatLatency(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatTimestamp(iso: string): { date: string; time: string; relative: string } {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);

  let relative: string;
  if (secs < 60) relative = `${secs}s ago`;
  else if (mins < 60) relative = `${mins}m ago`;
  else if (hours < 24) relative = `${hours}h ago`;
  else relative = d.toLocaleDateString();

  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    relative,
  };
}

function formatTokens(n: number | null): string {
  if (n == null || n === 0) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function StatCard({ label, value, sub, valueClass }: { label: string; value: string | number; sub?: string; valueClass?: string }) {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardContent className="pt-5 pb-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-semibold mt-1 ${valueClass ?? ""}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

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

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    if (!user) { 
      console.log("[v0] LogsSection: No user, skipping fetch");
      setLoading(false); 
      return; 
    }
    console.log("[v0] LogsSection: Fetching logs for user", user.id, "page", page, "sort", sortDirection);
    setLoading(true);
    try {
      // Query only columns that exist in the original schema.
      // prompt_optimized and fallback_used may not exist yet — we'll handle them gracefully.
      const { data, error } = await (supabase as any)
        .from("gateway_request_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: sortDirection === "asc" })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) {
        console.error("[v0] LogsSection Supabase error:", error.message, error.details, error.hint);
        throw new Error("Could not load your gateway logs at this time. Please try again later.");
      }
      console.log("[v0] LogsSection fetched", data?.length ?? 0, "logs");
      // Normalize the data to ensure optional fields have defaults
      const normalizedLogs: LogEntry[] = (data ?? []).map((row: any) => ({
        ...row,
        prompt_optimized: row.prompt_optimized ?? false,
        fallback_used: row.fallback_used ?? false,
      }));
      setLogs(normalizedLogs);
    } catch (err: any) {
      console.error("[LogsSection] fetchLogs error:", err);
      // Generic error message is already set in the throw above
    } finally {
      setLoading(false);
    }
  }, [user, sortDirection, page]);

  useEffect(() => {
    fetchLogs();

    // Subscribe to real-time updates for new logs
    if (!user) return;
    const subscription = (supabase as any)
      .channel(`gateway_logs_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gateway_request_logs",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log("[LogsSection] Real-time update received, refreshing logs");
          // Small delay to ensure all database writes are complete
          setTimeout(() => fetchLogs(), 500);
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchLogs, user]);

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
      (log.status ?? "").toLowerCase().includes(q) ||
      (log.error_code ?? "").toLowerCase().includes(q);
    const displayStatus = getDisplayStatus(log);
    const matchesStatus = statusFilter === "all" || displayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalRequests = logs.length;
  const cachedCount = logs.filter((l) => l.cache_hit).length;
  const errorCount = logs.filter((l) => getDisplayStatus(l) === "error").length;
  const optimizedCount = logs.filter((l) => l.prompt_optimized).length;
  const fallbackCount = logs.filter((l) => l.fallback_used).length;
  const cacheHitRate = totalRequests > 0 ? ((cachedCount / totalRequests) * 100).toFixed(1) : "0.0";

  const apiCallLogs = logs.filter((l) => !l.cache_hit && l.latency_ms != null);
  const avgApiLatency = apiCallLogs.length > 0
    ? Math.round(apiCallLogs.reduce((a, l) => a + (l.latency_ms ?? 0), 0) / apiCallLogs.length)
    : 0;

  const avgCacheLatency =
    cachedCount > 0
      ? Math.round(logs.filter((l) => l.cache_hit && l.latency_ms != null).reduce((a, l) => a + (l.latency_ms ?? 0), 0) / cachedCount)
      : 0;

  // ── Badges ──────────────────────────────────────────────────────────────────
  const getStatusBadge = (status: "success" | "cached" | "error") => {
    switch (status) {
      case "cached":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Cache Hit</Badge>;
      case "success":
        return <Badge variant="secondary" className="bg-muted/80 text-muted-foreground">API Call</Badge>;
      case "error":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">Error</Badge>;
    }
  };

  const providerColor = (p: string | null) => {
    switch (p?.toLowerCase()) {
      case "openai": return "text-green-400";
      case "anthropic": return "text-orange-400";
      case "google": return "text-blue-400";
      case "mistral": return "text-purple-400";
      default: return "text-muted-foreground";
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Logs</h2>
        <p className="text-muted-foreground mt-1">View and analyze all requests through your gateway</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Requests" value={loading ? "—" : totalRequests} />
        <StatCard label="Cache Hit Rate" value={loading ? "—" : `${cacheHitRate}%`} valueClass="text-green-500"
          sub={loading ? undefined : `${cachedCount} cached`} />
        <StatCard label="Avg Latency (API)" value={loading ? "—" : formatLatency(avgApiLatency)}
          sub={loading ? undefined : `${apiCallLogs.length} live calls`} />
        <StatCard label="Avg Latency (Cache)" value={loading ? "—" : formatLatency(avgCacheLatency)}
          valueClass="text-green-500" />
        <StatCard label="Prompt Enhanced" value={loading ? "—" : optimizedCount}
          sub={loading ? undefined : `${fallbackCount} fallback used`} />
        <StatCard label="Errors" value={loading ? "—" : errorCount} valueClass={errorCount > 0 ? "text-red-500" : ""} />
      </div>

      {/* Table */}
      <Card className="bg-card/50 border-border/40">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium">Request Logs</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search model, provider, error..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-60"
              />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Filter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="cached">Cache Hits</SelectItem>
                  <SelectItem value="success">API Calls</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline" size="sm"
                onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
                className="flex items-center gap-1"
              >
                {sortDirection === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                {sortDirection === "desc" ? "Newest" : "Oldest"}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchLogs} className="flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading logs...
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
                    <TableHead className="w-36">Time</TableHead>
                    <TableHead className="w-24">Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="w-24 text-right">Tokens</TableHead>
                    <TableHead className="w-24 text-right">Latency</TableHead>
                    <TableHead className="w-20">Flags</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const status = getDisplayStatus(log);
                    const ts = formatTimestamp(log.created_at);
                    const isExpanded = expandedRow === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <TableRow
                          className={`cursor-pointer transition-colors ${isExpanded ? "bg-muted/10" : ""}`}
                          onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                        >
                          {/* Time */}
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground" title={`${ts.date} ${ts.time}`}>
                              {new Date(log.created_at).toLocaleString("en-US")}
                            </span>
                          </TableCell>
                          {/* Provider */}
                          <TableCell>
                            {log.cache_hit ? (
                              <span className="text-xs font-medium text-green-500">cache</span>
                            ) : (
                              <span className={`text-xs font-medium capitalize ${providerColor(log.provider)}`}>
                                {log.provider ?? "—"}
                              </span>
                            )}
                          </TableCell>
                          {/* Model */}
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs">{log.model_used ?? log.model_requested ?? "—"}</span>
                              {log.model_requested && log.model_used && log.model_requested !== log.model_used && (
                                <span className="text-xs text-muted-foreground/60 font-mono" title={`Requested: ${log.model_requested}`}>
                                  (req: {log.model_requested})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          {/* Tokens */}
                          <TableCell className="text-right font-mono text-sm">
                            {log.cache_hit ? (
                              <span className="text-green-500 text-xs">saved {formatTokens(log.total_tokens)}</span>
                            ) : (
                              formatTokens(log.total_tokens)
                            )}
                          </TableCell>
                          {/* Latency */}
                          <TableCell className="text-right font-mono text-sm">
                            <span className={log.cache_hit ? "text-green-500" : ""}>
                              {formatLatency(log.latency_ms)}
                            </span>
                          </TableCell>
                          {/* Flags */}
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {log.prompt_optimized && (
                                <span title="Prompt was enhanced by optimizer">
                                  <Wand2 className="h-3.5 w-3.5 text-primary" />
                                </span>
                              )}
                              {log.fallback_used && (
                                <span title="Fallback provider was used">
                                  <GitFork className="h-3.5 w-3.5 text-yellow-500" />
                                </span>
                              )}
                              {log.is_streaming && (
                                <span title="Streaming request" className="font-mono text-[10px] text-muted-foreground border border-border/50 rounded px-1">
                                  SSE
                                </span>
                              )}
                            </div>
                          </TableCell>
                          {/* Status */}
                          <TableCell>{getStatusBadge(status)}</TableCell>
                        </TableRow>

                        {/* Expanded Details Row */}
                        {isExpanded && (
                          <TableRow key={`${log.id}-details`} className="bg-muted/5 hover:bg-muted/5">
                            <TableCell colSpan={7} className="p-0">
                              <div className="px-4 py-4 border-t border-border/20">
                                <div className="grid gap-6 md:grid-cols-4">

                                  {/* Column 1 — Request */}
                                  <div className="space-y-2.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Request</p>
                                    <DetailRow label="Request ID">
                                      <span className="font-mono text-xs truncate">{log.id}</span>
                                      <CopyButton text={log.id} />
                                    </DetailRow>
                                    <DetailRow label="Timestamp">
                                      <span className="font-mono text-xs">{ts.date} {ts.time}</span>
                                    </DetailRow>
                                    <DetailRow label="Streaming">
                                      <span className="font-mono text-xs">{log.is_streaming ? "Yes" : "No"}</span>
                                    </DetailRow>
                                    <DetailRow label="Status">
                                      <span className="font-mono text-xs capitalize">{log.status ?? "—"}</span>
                                    </DetailRow>
                                  </div>

                                  {/* Column 2 — Routing */}
                                  <div className="space-y-2.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Routing</p>
                                    <DetailRow label="Model Requested">
                                      <span className="font-mono text-xs">{log.model_requested ?? "—"}</span>
                                    </DetailRow>
                                    <DetailRow label="Model Used">
                                      <span className={`font-mono text-xs ${providerColor(log.provider)}`}>
                                        {log.model_used ?? "—"}
                                      </span>
                                    </DetailRow>
                                    <DetailRow label="Provider">
                                      <span className={`font-mono text-xs capitalize ${providerColor(log.provider)}`}>
                                        {log.cache_hit ? "semantic cache" : (log.provider ?? "—")}
                                      </span>
                                    </DetailRow>
                                    <DetailRow label="Fallback Used">
                                      <span className={`font-mono text-xs ${log.fallback_used ? "text-yellow-500" : ""}`}>
                                        {log.fallback_used ? "Yes" : "No"}
                                      </span>
                                    </DetailRow>
                                  </div>

                                  {/* Column 3 — Tokens */}
                                  <div className="space-y-2.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tokens</p>
                                    <DetailRow label="Prompt Tokens">
                                      <span className="font-mono text-xs">{(log.prompt_tokens ?? 0).toLocaleString()}</span>
                                    </DetailRow>
                                    <DetailRow label="Completion Tokens">
                                      <span className="font-mono text-xs">{(log.completion_tokens ?? 0).toLocaleString()}</span>
                                    </DetailRow>
                                    <DetailRow label="Total Tokens">
                                      <span className="font-mono text-xs font-semibold">{(log.total_tokens ?? 0).toLocaleString()}</span>
                                    </DetailRow>
                                    <DetailRow label="Latency">
                                      <span className={`font-mono text-xs ${log.cache_hit ? "text-green-500" : ""}`}>
                                        {formatLatency(log.latency_ms)}
                                      </span>
                                    </DetailRow>
                                  </div>

                                  {/* Column 4 — Optimizer / Cache / Error */}
                                  <div className="space-y-2.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</p>
                                    <DetailRow label="Cache Hit">
                                      <span className={`font-mono text-xs ${log.cache_hit ? "text-green-500" : ""}`}>
                                        {log.cache_hit ? "Yes" : "No"}
                                      </span>
                                    </DetailRow>
                                    {log.cache_entry_id && (
                                      <DetailRow label="Cache Entry ID">
                                        <span className="font-mono text-xs truncate max-w-[100px]">{log.cache_entry_id}</span>
                                        <CopyButton text={log.cache_entry_id} />
                                      </DetailRow>
                                    )}
                                    <DetailRow label="Prompt Enhanced">
                                      <span className={`font-mono text-xs ${log.prompt_optimized ? "text-primary" : ""}`}>
                                        {log.prompt_optimized ? "Yes" : "No"}
                                      </span>
                                    </DetailRow>
                                    {log.error_code && (
                                      <DetailRow label="Error Code">
                                        <span className="flex items-center gap-1 font-mono text-xs text-red-500">
                                          <AlertCircle className="h-3 w-3" />
                                          {log.error_code}
                                        </span>
                                      </DetailRow>
                                    )}
                                  </div>

                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Showing {filteredLogs.length} of {totalRequests} requests on page {page + 1}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={logs.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Small helper for the expanded detail rows
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="flex items-center gap-1 min-w-0">{children}</span>
    </div>
  );
}

export default LogsSection;
