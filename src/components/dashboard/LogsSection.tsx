import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface LogEntry {
  id: string;
  timestamp: string;
  model: string;
  prompt: string;
  tokens: number;
  latency: number;
  cost: number;
  saved: number;
  cacheHit: boolean;
  status: "success" | "error" | "cached";
}

// Mock log data
const mockLogs: LogEntry[] = [
  {
    id: "req_1",
    timestamp: "2024-01-15 14:32:15",
    model: "gpt-4",
    prompt: "Explain quantum computing in simple terms...",
    tokens: 847,
    latency: 45,
    cost: 0,
    saved: 0.025,
    cacheHit: true,
    status: "cached",
  },
  {
    id: "req_2",
    timestamp: "2024-01-15 14:31:42",
    model: "gpt-3.5-turbo",
    prompt: "What is the capital of France?",
    tokens: 52,
    latency: 230,
    cost: 0.0001,
    saved: 0,
    cacheHit: false,
    status: "success",
  },
  {
    id: "req_3",
    timestamp: "2024-01-15 14:30:58",
    model: "claude-3-opus",
    prompt: "Analyze this quarterly financial report and provide...",
    tokens: 2341,
    latency: 38,
    cost: 0,
    saved: 0.035,
    cacheHit: true,
    status: "cached",
  },
  {
    id: "req_4",
    timestamp: "2024-01-15 14:29:33",
    model: "gpt-4",
    prompt: "Write a Python function that implements...",
    tokens: 1205,
    latency: 1850,
    cost: 0.036,
    saved: 0,
    cacheHit: false,
    status: "success",
  },
  {
    id: "req_5",
    timestamp: "2024-01-15 14:28:10",
    model: "gpt-3.5-turbo",
    prompt: "Translate 'Hello, how are you?' to Spanish",
    tokens: 28,
    latency: 42,
    cost: 0,
    saved: 0.0001,
    cacheHit: true,
    status: "cached",
  },
  {
    id: "req_6",
    timestamp: "2024-01-15 14:27:45",
    model: "mistral-large",
    prompt: "Summarize the key points from this meeting transcript...",
    tokens: 1892,
    latency: 1200,
    cost: 0.015,
    saved: 0,
    cacheHit: false,
    status: "success",
  },
  {
    id: "req_7",
    timestamp: "2024-01-15 14:26:22",
    model: "gpt-4",
    prompt: "Connection timeout to OpenAI API",
    tokens: 0,
    latency: 30000,
    cost: 0,
    saved: 0,
    cacheHit: false,
    status: "error",
  },
  {
    id: "req_8",
    timestamp: "2024-01-15 14:25:18",
    model: "claude-instant",
    prompt: "Generate a creative tagline for a coffee shop...",
    tokens: 156,
    latency: 52,
    cost: 0,
    saved: 0.0001,
    cacheHit: true,
    status: "cached",
  },
];

const LogsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredLogs = mockLogs
    .filter((log) => {
      const matchesSearch = log.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || log.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

  const totalSaved = mockLogs.reduce((acc, log) => acc + log.saved, 0);
  const cacheHitRate = (mockLogs.filter((log) => log.cacheHit).length / mockLogs.length) * 100;

  const getStatusBadge = (status: LogEntry["status"]) => {
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
            <p className="text-xl font-semibold mt-1">{mockLogs.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Cache Hit Rate</p>
            <p className="text-xl font-semibold text-green-500 mt-1">{cacheHitRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="text-xl font-semibold text-primary mt-1">${totalSaved.toFixed(3)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Avg Latency (Cache)</p>
            <p className="text-xl font-semibold mt-1">44ms</p>
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
                placeholder="Search prompts or models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/30 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="w-40">Timestamp</TableHead>
                  <TableHead className="w-32">Model</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead className="w-24 text-right">Tokens</TableHead>
                  <TableHead className="w-24 text-right">Latency</TableHead>
                  <TableHead className="w-24 text-right">Saved</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className={`cursor-pointer transition-colors ${
                      expandedRow === log.id ? "bg-muted/10" : ""
                    }`}
                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.timestamp}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {log.model}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm">
                        {log.prompt}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {log.tokens.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <span className={log.cacheHit ? "text-green-500" : ""}>
                        {log.latency < 1000 ? `${log.latency}ms` : `${(log.latency / 1000).toFixed(1)}s`}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {log.saved > 0 ? (
                        <span className="font-mono text-sm text-green-500">
                          +${log.saved.toFixed(4)}
                        </span>
                      ) : (
                        <span className="font-mono text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Expanded Details */}
          {expandedRow && (
            <div className="mt-4 p-4 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Request Details</span>
                <Button variant="ghost" size="sm">
                  View Full Trace
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Full Prompt</p>
                  <p className="text-sm bg-background/50 p-3 rounded border border-border/30 font-mono">
                    {mockLogs.find((l) => l.id === expandedRow)?.prompt}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Request ID</span>
                    <span className="font-mono">{expandedRow}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cache Key</span>
                    <span className="font-mono text-xs">sem_hash_a7f3b2...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Similarity Score</span>
                    <span className="font-mono">98.7%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination hint */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Showing {filteredLogs.length} of {mockLogs.length} requests
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
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
