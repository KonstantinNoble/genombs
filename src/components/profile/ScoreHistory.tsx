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

interface DomainInfo {
    hostname: string;
    count: number;
}

function extractHostname(row: { url: string; hostname: string | null }): string {
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

export const ScoreHistory = () => {
    const { user } = useAuth();
    const [allRows, setAllRows] = useState<RawRow[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Single query: fetch all snapshots once, group in JS
    useEffect(() => {
        if (!user) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
            .from("analysis_snapshots")
            .select("url, hostname, overall_score, scanned_at")
            .eq("user_id", user.id)
            .order("scanned_at", { ascending: true })
            .limit(200)
            .then(({ data, error: queryErr }: { data: RawRow[] | null; error: unknown }) => {
                if (queryErr) {
                    console.error("ScoreHistory query failed:", queryErr);
                    setError("Failed to load score history");
                    setLoading(false);
                    return;
                }
                setAllRows(data ?? []);
                setLoading(false);
            });
    }, [user]);

    // Build domain list from all rows
    const domainMap = new Map<string, RawRow[]>();
    for (const row of allRows) {
        const host = extractHostname(row);
        if (!domainMap.has(host)) domainMap.set(host, []);
        domainMap.get(host)!.push(row);
    }
    const domains: DomainInfo[] = Array.from(domainMap.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 10)
        .map(([hostname, rows]) => ({ hostname, count: rows.length }));

    // Auto-select on first load
    useEffect(() => {
        if (domains.length > 0 && !selectedDomain) {
            setSelectedDomain(domains[0].hostname);
        }
    }, [domains.length, selectedDomain]);

    if (loading || domains.length === 0) return null;
    if (error) return null; // Fail silently in UI

    // Get snapshots for selected domain
    const activeDomain = selectedDomain ?? domains[0].hostname;
    const snapshots = (domainMap.get(activeDomain) ?? []).map(row => ({
        date: formatDate(row.scanned_at),
        score: row.overall_score,
    }));

    const hasTrend = snapshots.length >= 2;
    const delta = hasTrend ? snapshots[snapshots.length - 1].score - snapshots[0].score : 0;

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg">Score History</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {snapshots.length} scan{snapshots.length !== 1 ? "s" : ""} for{" "}
                            <span className="font-mono text-foreground">{activeDomain}</span>
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
                                variant={activeDomain === d.hostname ? "default" : "outline"}
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
                        <LineChart data={snapshots}>
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
                                Scan <span className="font-mono text-foreground/70">{activeDomain}</span> at least twice to start tracking your score over time.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
