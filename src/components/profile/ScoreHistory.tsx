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

interface Snapshot {
    url: string;
    overall_score: number;
    scanned_at: string;
}

export const ScoreHistory = () => {
    const { user } = useAuth();
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        supabase
            .from("analysis_snapshots")
            .select("url, overall_score, scanned_at")
            .eq("user_id", user.id)
            .order("scanned_at", { ascending: true })
            .limit(30)
            .then(({ data }) => {
                setSnapshots(data ?? []);
                setLoading(false);
            });
    }, [user]);

    // Don't render anything while loading or if fewer than 2 snapshots
    if (loading || snapshots.length < 2) return null;

    const chartData = snapshots.map((s) => {
        let hostname = s.url;
        try {
            hostname = new URL(s.url).hostname;
        } catch {
            // keep raw url as fallback
        }

        const date = new Date(s.scanned_at);
        return {
            date: `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}`,
            score: s.overall_score,
            url: hostname,
        };
    });

    // Calculate score delta: latest vs first
    const firstScore = snapshots[0].overall_score;
    const latestScore = snapshots[snapshots.length - 1].overall_score;
    const delta = latestScore - firstScore;

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Score History</CardTitle>
                    {delta !== 0 && (
                        <span
                            className={`text-sm font-mono font-semibold ${delta > 0 ? "text-green-500" : "text-red-400"
                                }`}
                        >
                            {delta > 0 ? "↑" : "↓"} {Math.abs(delta)} pts
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    Overall score across your last {snapshots.length} scans
                </p>
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
