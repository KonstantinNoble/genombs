import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/external-client";

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

function DeltaChip({ value, visible }: { value: number; visible: boolean }) {
  const animated = useCountUp(Math.abs(value), 800, visible);
  const chipClass =
    value > 0
      ? "dashboard-delta-chip dashboard-delta-positive dashboard-arrow-up"
      : value < 0
        ? "dashboard-delta-chip dashboard-delta-negative dashboard-arrow-down"
        : "dashboard-delta-chip dashboard-delta-neutral";
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";

  return (
    <span className={chipClass}>
      {prefix}{animated} <span className="text-xs ml-0.5">pp</span>
    </span>
  );
}

function ScoreValue({ value, visible }: { value: number; visible: boolean }) {
  const animated = useCountUp(value, 800, visible);
  return <span className="font-mono tabular-nums text-foreground">{animated}</span>;
}

export const TodayVsAverage = ({ userId, refreshKey }: TodayVsAverageProps) => {
  const navigate = useNavigate();
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
        className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 text-center transition-all duration-500"
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
      {/* Overall comparison — horizontal bar with spotlight + delta chip */}
      <div
        className="rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
        }}
      >
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="p-5 text-center dashboard-streak-cell">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Today</p>
            <p className="text-5xl font-bold dashboard-score-spotlight">
              <ScoreValue value={todayScore} visible={visible} />
            </p>
          </div>
          <div className="p-5 text-center dashboard-streak-cell">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Average</p>
            <p className="text-3xl font-bold">
              {avgScore !== null ? <ScoreValue value={avgScore} visible={visible} /> : <span className="text-muted-foreground">--</span>}
            </p>
          </div>
          <div className="p-5 text-center dashboard-streak-cell">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Delta</p>
            <p className="text-3xl font-bold">
              {delta !== null ? <DeltaChip value={delta} visible={visible} /> : <span className="text-muted-foreground">--</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Category breakdown — HTML table with delta chips + row hover accents */}
      <div
        className="rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "120ms",
        }}
      >
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
            Category Breakdown
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] table-fixed">
              <thead>
                <tr className="dashboard-table-header">
                  <th className="w-2/5 text-left text-xs font-medium text-muted-foreground/60 uppercase tracking-wider pb-2.5 pt-1 pl-3">Category</th>
                  <th className="w-[15%] text-right text-xs font-medium text-muted-foreground/60 uppercase tracking-wider pb-2.5 pt-1 whitespace-nowrap">Today</th>
                  <th className="w-[15%] text-right text-xs font-medium text-muted-foreground/60 uppercase tracking-wider pb-2.5 pt-1 whitespace-nowrap">Average</th>
                  <th className="w-[30%] text-right text-xs font-medium text-muted-foreground/60 uppercase tracking-wider pb-2.5 pt-1 pr-3 whitespace-nowrap">Delta</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat, i) => {
                  const tVal = todayCats[cat.key];
                  const aVal = avgCats[cat.key];
                  const catDelta = tVal !== undefined && aVal !== undefined ? tVal - aVal : null;

                  return (
                    <tr
                      key={cat.key}
                      className={`dashboard-table-row transition-all duration-500 ${i % 2 === 1 ? 'bg-secondary/20' : ''}`}
                      style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "scale(1)" : "scale(0.98)",
                        transitionDelay: `${200 + i * 60}ms`,
                      }}
                    >
                      <td className="w-2/5 text-left text-sm text-muted-foreground py-2.5 pl-3">{cat.label}</td>
                      <td className="w-[15%] text-right text-sm font-mono tabular-nums text-foreground py-2.5 whitespace-nowrap">{tVal ?? "--"}</td>
                      <td className="w-[15%] text-right text-sm font-mono tabular-nums text-foreground py-2.5 whitespace-nowrap">{aVal ?? "--"}</td>
                      <td className="w-[30%] text-right text-sm py-2.5 pr-3 whitespace-nowrap">
                        {catDelta !== null ? <DeltaChip value={catDelta} visible={visible} /> : <span className="text-muted-foreground">--</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
