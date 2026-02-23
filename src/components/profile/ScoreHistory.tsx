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

interface Snapshot {
    hostname: string;
    overall_score: number;
    scanned_at: string;
}

interface DomainInfo {
    hostname: string;
    count: number;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

/**
 * ScoreHistory — shows a line chart of the user's overall score over time, per domain.
 *
 * Data flow:
 * 1. Fetch all unique hostnames the user has scanned (with scan count), max 10
 * 2. User selects a domain (most-scanned is auto-selected)
 * 3. Fetch snapshots only for that domain from the DB
 * 4. Render chart if ≥2 scans, otherwise show a "scan again" placeholder
 *
 * All snapshots are the PRIMARY URL the user entered — competitors are never stored.
 */
export const ScoreHistory = () => {
    const { user } = useAuth();
    const [domains, setDomains] = useState<DomainInfo[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(true);

    // Step 1: Fetch all hostnames the user has scanned (to build domain tabs)
    useEffect(() => {
        if (!user) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
            .from("analysis_snapshots")
            .select("hostname")
            .eq("user_id", user.id)
            .then(({ data }: { data: { hostname: string }[] | null }) => {
                if (!data || data.length === 0) {
                    setLoading(false);
                    return;
                }

                // Count scans per hostname
                const counts: Record<string, number> = {};
                for (const row of data) {
                    counts[row.hostname] = (counts[row.hostname] || 0) + 1;
                }

                // Sort by count descending, show all domains (even 1 scan), cap at 10
                const sorted = Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([hostname, count]) => ({ hostname, count }));

                setDomains(sorted);

                // Auto-select the most-scanned domain
                if (sorted.length > 0) {
                    setSelectedDomain(sorted[0].hostname);
                }

                setLoading(false);
            });
    }, [user]);

    // Step 2: Fetch snapshots for the selected domain only
    useEffect(() => {
        if (!user || !selectedDomain) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
            .from("analysis_snapshots")
            .select("hostname, overall_score, scanned_at")
            .eq("user_id", user.id)
            .eq("hostname", selectedDomain)
            .order("scanned_at", { ascending: true })
            .limit(50)
            .then(({ data }: { data: Snapshot[] | null }) => {
                setSnapshots(data ?? []);
            });
    }, [user, selectedDomain]);

    // Don't render until data is loaded and at least one domain exists
    if (loading || domains.length === 0) return null;

    const hasTrend = snapshots.length >= 2;

    const chartData = hasTrend
        ? snapshots.map((s) => ({
            date: formatDate(s.scanned_at),
            score: s.overall_score,
        }))
        : [];

    const delta =
        hasTrend
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
                        <span
                            className={`text-sm font-mono font-semibold shrink-0 ${delta > 0 ? "text-green-500" : "text-red-400"
                                }`}
                        >
                            {delta > 0 ? "↑" : "↓"} {Math.abs(delta)} pts
                        </span>
                    )}
                </div>

                {/* Domain selector — shown when user has multiple domains */}
                {domains.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                        {domains.map((d) => (
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
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                opacity={0.5}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                                formatter={(val: number) => [`${val}/100`, "Score"]}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "hsl(var(--primary))" }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-center gap-2">
                        <p className="text-2xl">📈</p>
                        <p className="text-sm font-medium text-foreground">
                            Score trend starts after your next scan
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Scan{" "}
                            <span className="font-mono">{selectedDomain}</span>{" "}
                            again to start tracking your progress over time
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
