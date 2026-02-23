import { useEffect, useState, useMemo } from "react";
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
    url: string;
    overall_score: number;
    scanned_at: string;
}

function getHostname(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

export const ScoreHistory = () => {
    const { user } = useAuth();
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        supabase
            .from("analysis_snapshots")
            .select("url, overall_score, scanned_at")
            .eq("user_id", user.id)
            .order("scanned_at", { ascending: true })
            .limit(100)
            .then(({ data }) => {
                setSnapshots(data ?? []);
                setLoading(false);
            });
    }, [user]);

    // Group snapshots by domain, sorted by scan count descending
    const domainGroups = useMemo(() => {
        const groups: Record<string, Snapshot[]> = {};
        for (const s of snapshots) {
            const domain = getHostname(s.url);
            if (!groups[domain]) groups[domain] = [];
            groups[domain].push(s);
        }
        return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
    }, [snapshots]);

    // Auto-select the domain with the most scans on first load
    useEffect(() => {
        if (domainGroups.length > 0 && !selectedDomain) {
            setSelectedDomain(domainGroups[0][0]);
        }
    }, [domainGroups, selectedDomain]);

    // Only render if at least one domain has 2+ scans
    const tabbableDomains = domainGroups.filter(([, snaps]) => snaps.length >= 2);
    const hasEnoughData = tabbableDomains.length > 0;

    if (loading || !hasEnoughData || !selectedDomain) return null;

    const activeSnaps = domainGroups.find(([d]) => d === selectedDomain)?.[1] ?? [];

    // If the selected domain has only 1 scan, fall back to first tabbable domain
    const displaySnaps =
        activeSnaps.length >= 2
            ? activeSnaps
            : (tabbableDomains[0]?.[1] ?? []);
    const displayDomain =
        activeSnaps.length >= 2
            ? selectedDomain
            : tabbableDomains[0]?.[0] ?? selectedDomain;

    const chartData = displaySnaps.map((s) => ({
        date: formatDate(s.scanned_at),
        score: s.overall_score,
    }));

    const firstScore = displaySnaps[0].overall_score;
    const latestScore = displaySnaps[displaySnaps.length - 1].overall_score;
    const delta = latestScore - firstScore;

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg">Score History</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {displaySnaps.length} scans for{" "}
                            <span className="font-mono text-foreground">{displayDomain}</span>
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

                {/* Domain selector — only shown when user has multiple domains with ≥2 scans */}
                {tabbableDomains.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                        {tabbableDomains.map(([domain, snaps]) => (
                            <Button
                                key={domain}
                                size="sm"
                                variant={displayDomain === domain ? "default" : "outline"}
                                className="h-7 text-xs px-2.5"
                                onClick={() => setSelectedDomain(domain)}
                            >
                                {domain}
                                <span className="ml-1.5 opacity-60">{snaps.length}×</span>
                            </Button>
                        ))}
                    </div>
                )}
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
    );
};
