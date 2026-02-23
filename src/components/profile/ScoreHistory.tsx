import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/external-client";
import { useAuth } from "@/contexts/AuthContext";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RawRow {
    url: string;
    hostname: string | null;
    overall_score: number;
    scanned_at: string;
}

interface Snapshot {
    hostname: string;
    overall_score: number;
    scanned_at: string;
}

interface DomainInfo {
    hostname: string;
    count: number;
}

function extractHostname(row: { url: string; hostname: string | null }): string {
    // Prefer the stored hostname column; fall back to parsing the URL
    if (row.hostname) return row.hostname;
    try {
        return new URL(row.url).hostname.replace(/^www\./, "");
    } catch {
        return row.url;
    }
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

/**
 * ScoreHistory — shows a line chart of the user's overall score over time, per domain.
 *
 * Data flow:
 * 1. Fetch all rows (url + hostname) to build the domain tab list (max 10)
 * 2. User selects a domain (most-scanned is auto-selected)
 * 3. Fetch snapshots only for that domain from the DB
 * 4. Render chart if ≥2 scans, otherwise show a "scan again" placeholder
 *
 * Falls back to URL parsing if the hostname column is NULL (old rows before backfill).
 */
export const ScoreHistory = () => {
    const { user } = useAuth();
    const [domains, setDomains] = useState<DomainInfo[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(true);

    // Step 1: Fetch all rows to build domain tab list
    useEffect(() => {
        if (!user) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
            .from("analysis_snapshots")
            .select("url, hostname")
            .eq("user_id", user.id)
            .then(({ data }: { data: { url: string; hostname: string | null }[] | null }) => {
                if (!data || data.length === 0) {
                    setLoading(false);
                    return;
                }

                // Count scans per hostname (with URL fallback)
                const counts: Record<string, number> = {};
                for (const row of data) {
                    const host = extractHostname(row);
                    counts[host] = (counts[host] || 0) + 1;
                }

                // Sort by count descending, cap at 10
                const sorted = Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([hostname, count]) => ({ hostname, count }));

                setDomains(sorted);
                if (sorted.length > 0) {
                    setSelectedDomain(sorted[0].hostname);
                }
                setLoading(false);
            });
    }, [user]);

    // Step 2: Fetch snapshots for the selected domain
    useEffect(() => {
        if (!user || !selectedDomain) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
            .from("analysis_snapshots")
            .select("url, hostname, overall_score, scanned_at")
            .eq("user_id", user.id)
            .order("scanned_at", { ascending: true })
            .limit(200)
            .then(({ data }: { data: RawRow[] | null }) => {
                if (!data) { setSnapshots([]); return; }
                // Filter client-side by hostname (handles both old and new rows)
                const filtered = data
                    .filter(row => extractHostname(row) === selectedDomain)
                    .slice(0, 50)
                    .map(row => ({
                        hostname: extractHostname(row),
                        overall_score: row.overall_score,
                        scanned_at: row.scanned_at,
                    }));
                setSnapshots(filtered);
            });
    }, [user, selectedDomain]);

    if (loading || domains.length === 0) return null;

    const hasTrend = snapshots.length >= 2;
    const chartData = hasTrend
        ? snapshots.map(s => ({ date: formatDate(s.scanned_at), score: s.overall_score }))
        : [];
    const delta = hasTrend
        ? snapshots[snapshots.length - 1].overall_score - snapshots[0].overall_score
        : 0;

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg">Score History</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {snapshots.length} scan{snapshots.length !== 1 ? "s" : ""} for{" "}
                            <span className="font-mono text-foreground">{selectedDomain}</span>
                        </p>
                    </div>
                    {delta !== 0 && (
                        <span className={`text-sm font-mono font-semibold shrink-0 ${delta > 0 ? "text-green-500" : "text-red-400"}`}>
                            {delta > 0 ? "↑" : "↓"} {Math.abs(delta)} pts
                        </span>
                    )}
                </div>

                {domains.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                        {domains.map(d => (
                            <Button
                                key={d.hostname}
                                size="sm"
                                variant={selectedDomain === d.hostname ? "default" : "outline"}
                                className="h-7 text-xs px-2.5"
                                onClick={() => setSelectedDomain(d.hostname)}
                            >
                                {d.hostname}
                                <span className="ml-1.5 opacity-60">{d.count}×</span>
                            </Button>
                        ))}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {hasTrend ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={30} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                                formatter={(val: number) => [`${val}/100`, "Score"]}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">No trend data yet</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                                Scan <span className="font-mono text-foreground/70">{selectedDomain}</span> at least twice to start tracking your score over time.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
