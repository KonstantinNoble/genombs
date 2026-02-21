import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/external-client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface AnalyticsOverviewProps {
  userId: string;
  refreshKey?: number;
}

interface ProfileData {
  id: string;
  url: string;
  overall_score: number | null;
  category_scores: Record<string, number> | null;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  findability: "Findability",
  mobileUsability: "Mobile Usability",
  offerClarity: "Offer Clarity",
  trustProof: "Trust & Proof",
  conversionReadiness: "Conversion Readiness",
};

/** Animates a number from 0 to `target` over `duration` ms */
function useCountUp(target: number, duration = 800, enabled = true) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (target === 0) {
      setValue(0);
      return;
    }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, enabled]);

  return value;
}

/** Animated progress bar that slides in from 0 */
function AnimatedBar({ value, delay = 0 }: { value: number; delay?: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 100);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
      <div
        className="h-full rounded-full bg-primary"
        style={{
          width: `${width}%`,
          transition: `width 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
        }}
      />
    </div>
  );
}

export const AnalyticsOverview = ({ userId, refreshKey }: AnalyticsOverviewProps) => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("website_profiles")
        .select("id, url, overall_score, category_scores, created_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProfiles(data as ProfileData[]);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [userId, refreshKey]);

  // Trigger entrance animation after data loads
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div
        className="rounded-xl border border-border bg-card p-8 text-center transition-all duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <p className="text-sm text-muted-foreground">
          No completed analyses yet. Run your first analysis to see stats here.
        </p>
      </div>
    );
  }

  // Compute stats
  const totalAnalyses = profiles.length;
  const uniqueUrls = new Set(profiles.map((p) => p.url)).size;
  const scores = profiles.map((p) => p.overall_score).filter((s): s is number => s !== null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  // Category averages
  const categoryTotals: Record<string, { sum: number; count: number }> = {};
  for (const p of profiles) {
    if (p.category_scores && typeof p.category_scores === "object") {
      for (const [key, val] of Object.entries(p.category_scores)) {
        if (typeof val === "number") {
          if (!categoryTotals[key]) categoryTotals[key] = { sum: 0, count: 0 };
          categoryTotals[key].sum += val;
          categoryTotals[key].count += 1;
        }
      }
    }
  }

  const categoryAverages = Object.entries(categoryTotals)
    .filter(([key]) => key in CATEGORY_LABELS)
    .map(([key, { sum, count }]) => ({
      key,
      label: CATEGORY_LABELS[key] || key,
      avg: Math.round(sum / count),
    }))
    .sort((a, b) => b.avg - a.avg);

  const recentProfiles = profiles.slice(0, 5);

  const shortenUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return url.length > 30 ? url.slice(0, 30) + "…" : url;
    }
  };

  const statCards = [
    { label: "Total Analyses", value: totalAnalyses, isScore: false },
    { label: "Websites Analyzed", value: uniqueUrls, isScore: false },
    { label: "Average Score", value: avgScore, isScore: true },
    { label: "Best Score", value: bestScore, isScore: true },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards — staggered fade-up + count-up */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, isScore }, i) => (
          <StatCard key={label} label={label} value={value} isScore={isScore} index={i} visible={visible} />
        ))}
      </div>

      {/* Category Breakdown — progress bars animate in */}
      {categoryAverages.length > 0 && (
        <Card
          className="border-border bg-card transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transitionDelay: "280ms",
          }}
        >
          <CardContent className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
              Category Averages
            </p>
            <div className="space-y-3">
              {categoryAverages.map(({ key, label, avg }, i) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
                  <AnimatedBar value={avg} delay={visible ? 300 + i * 80 : 99999} />
                  <span className="text-sm font-semibold text-foreground tabular-nums w-8 text-right">{avg}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Analyses — staggered list items */}
      <Card
        className="border-border bg-card transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "380ms",
        }}
      >
        <CardContent className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
            Recent Analyses
          </p>
          <div className="divide-y divide-border">
            {recentProfiles.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-8px)",
                  transitionDelay: `${420 + i * 60}ms`,
                }}
              >
                <span className="text-sm text-foreground truncate max-w-[200px]">{shortenUrl(p.url)}</span>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {p.overall_score !== null ? p.overall_score : "–"}
                    <span className="text-xs text-muted-foreground font-normal">/100</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{format(new Date(p.created_at), "dd MMM yyyy")}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/** Stat card with count-up */
function StatCard({
  label,
  value,
  isScore,
  index,
  visible,
}: {
  label: string;
  value: number;
  isScore: boolean;
  index: number;
  visible: boolean;
}) {
  const animated = useCountUp(value, 800, visible);

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 transition-all duration-700 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${index * 70}ms`,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">{label}</p>
      <p className="text-2xl font-bold text-foreground tabular-nums leading-none">
        {animated}
        {isScore && <span className="text-sm font-normal text-muted-foreground">/100</span>}
      </p>
    </div>
  );
}
