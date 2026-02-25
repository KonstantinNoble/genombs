import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/external-client";
import { Card, CardContent } from "@/components/ui/card";

interface TodayVsAverageProps {
  userId: string;
  refreshKey?: number;
}

interface ProfileRow {
  overall_score: number | null;
  category_scores: Record<string, number> | null;
  created_at: string;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "findability", label: "Findability" },
  { key: "mobileUsability", label: "Mobile Usability" },
  { key: "offerClarity", label: "Offer Clarity" },
  { key: "trustProof", label: "Trust & Proof" },
  { key: "conversionReadiness", label: "Conversion Readiness" },
];

function useCountUp(target: number, duration = 800, enabled = true) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration, enabled]);

  return value;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function isToday(dateStr: string): boolean {
  return dateStr.slice(0, 10) === todayUTC();
}

function DeltaValue({ value, visible }: { value: number; visible: boolean }) {
  const animated = useCountUp(Math.abs(value), 800, visible);
  const color =
    value > 0 ? "text-[hsl(var(--chart-6))]" : value < 0 ? "text-destructive" : "text-muted-foreground";
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";

  return (
    <span className={`font-mono tabular-nums ${color}`}>
      {prefix}{animated} <span className="text-xs">pp</span>
    </span>
  );
}

function ScoreValue({ value, visible }: { value: number; visible: boolean }) {
  const animated = useCountUp(value, 800, visible);
  return <span className="font-mono tabular-nums text-foreground">{animated}</span>;
}

export const TodayVsAverage = ({ userId, refreshKey }: TodayVsAverageProps) => {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [todayCats, setTodayCats] = useState<Record<string, number>>({});
  const [avgCats, setAvgCats] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("website_profiles")
        .select("overall_score, category_scores, created_at")
        .eq("user_id", userId)
        .eq("is_own_website", true)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error || !data) { setLoading(false); return; }

      const rows = data as ProfileRow[];
      const todayRows = rows.filter((r) => isToday(r.created_at));
      const olderRows = rows.filter((r) => !isToday(r.created_at));

      // Today: latest entry from today
      if (todayRows.length > 0) {
        const latest = todayRows[0];
        setTodayScore(latest.overall_score);
        if (latest.category_scores && typeof latest.category_scores === "object") {
          const cats: Record<string, number> = {};
          for (const c of CATEGORIES) {
            const v = (latest.category_scores as Record<string, number>)[c.key];
            if (typeof v === "number") cats[c.key] = v;
          }
          setTodayCats(cats);
        }
      } else {
        setTodayScore(null);
        setTodayCats({});
      }

      // Average: all older entries
      if (olderRows.length > 0) {
        const scores = olderRows.map((r) => r.overall_score).filter((s): s is number => s !== null);
        setAvgScore(scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null);

        const catTotals: Record<string, { sum: number; count: number }> = {};
        for (const r of olderRows) {
          if (r.category_scores && typeof r.category_scores === "object") {
            for (const c of CATEGORIES) {
              const v = (r.category_scores as Record<string, number>)[c.key];
              if (typeof v === "number") {
                if (!catTotals[c.key]) catTotals[c.key] = { sum: 0, count: 0 };
                catTotals[c.key].sum += v;
                catTotals[c.key].count += 1;
              }
            }
          }
        }
        const avgs: Record<string, number> = {};
        for (const [key, { sum, count }] of Object.entries(catTotals)) {
          avgs[key] = Math.round(sum / count);
        }
        setAvgCats(avgs);
      } else {
        setAvgScore(null);
        setAvgCats({});
      }

      setLoading(false);
    };
    fetch();
  }, [userId, refreshKey]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-24 bg-muted rounded-xl" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    );
  }

  if (todayScore === null) {
    return (
      <div
        className="rounded-xl border border-border bg-card p-8 text-center transition-all duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <p className="text-sm text-muted-foreground">
          No analysis of your own website today. Run an analysis to see your daily comparison.
        </p>
      </div>
    );
  }

  const delta = avgScore !== null ? todayScore - avgScore : null;

  return (
    <div className="space-y-3">
      {/* Overall comparison — Today is visually prominent */}
      <Card
        className="border-border bg-card transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
        }}
      >
        <CardContent className="p-5">
          <div className="grid grid-cols-3 text-center items-end">
            {/* Today — larger & prominent */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Today</p>
              <p className="text-4xl font-bold">
                <ScoreValue value={todayScore} visible={visible} />
              </p>
            </div>
            {/* Divider */}
            <div className="relative">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
              <div className="absolute right-0 top-2 bottom-2 w-px bg-border" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Average</p>
              <p className="text-3xl font-bold">
                {avgScore !== null ? <ScoreValue value={avgScore} visible={visible} /> : <span className="text-muted-foreground">--</span>}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Delta</p>
              <p className="text-3xl font-bold">
                {delta !== null ? <DeltaValue value={delta} visible={visible} /> : <span className="text-muted-foreground">--</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown — alternating row tints */}
      <Card
        className="border-border bg-card transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "120ms",
        }}
      >
        <CardContent className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
            Category Breakdown
          </p>
          <div className="space-y-0">
            {CATEGORIES.map((cat, i) => {
              const tVal = todayCats[cat.key];
              const aVal = avgCats[cat.key];
              const catDelta = tVal !== undefined && aVal !== undefined ? tVal - aVal : null;

              return (
                <div
                  key={cat.key}
                  className={`flex items-center justify-between py-2 px-2 -mx-2 rounded-md transition-all duration-500
                    ${i % 2 === 1 ? 'bg-secondary/20' : ''}`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-8px)",
                    transitionDelay: `${200 + i * 60}ms`,
                  }}
                >
                  <span className="text-sm text-muted-foreground w-40 shrink-0">{cat.label}</span>
                  <div className="flex items-center gap-6 font-mono text-sm tabular-nums">
                    <span className="w-8 text-right text-foreground">{tVal ?? "--"}</span>
                    <span className="w-8 text-right text-foreground">{aVal ?? "--"}</span>
                    <span className="w-16 text-right">
                      {catDelta !== null ? <DeltaValue value={catDelta} visible={visible} /> : <span className="text-muted-foreground">--</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
