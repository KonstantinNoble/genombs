import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/external-client";
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

/** Score color based on traffic-light system */
function scoreColor(score: number): string {
  if (score >= 80) return "text-[hsl(var(--chart-6))]";
  if (score >= 60) return "text-primary";
  return "text-destructive";
}

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
        className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 text-center transition-all duration-500"
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

      {/* Category Averages — HTML table */}
      {categoryAverages.length > 0 && (
        <div
          className="rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transitionDelay: "280ms",
          }}
        >
          <div className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
              Category Averages
            </p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground/60 uppercase tracking-wider pb-2">Category</th>
                  <th className="text-right text-xs font-medium text-muted-foreground/60 uppercase tracking-wider pb-2 w-20">Score</th>
                </tr>
              </thead>
              <tbody>
                {categoryAverages.map(({ key, label, avg }, i) => (
                  <tr
                    key={key}
                    className={`transition-all duration-500 ${i % 2 === 1 ? 'bg-secondary/20' : ''}`}
                    style={{
                      opacity: visible ? 1 : 0,
                      transitionDelay: `${300 + i * 60}ms`,
                    }}
                  >
                    <td className="text-sm text-muted-foreground py-2.5">{label}</td>
                    <td className={`text-right text-sm font-semibold font-mono tabular-nums py-2.5 ${scoreColor(avg)}`}>{avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Analyses — HTML table */}
      <div
        className="rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "380ms",
        }}
      >
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
            Recent Analyses
          </p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground/60 uppercase tracking-wider pb-2">URL</th>
                <th className="text-right text-xs font-medium text-muted-foreground/60 uppercase tracking-wider pb-2 w-20">Score</th>
                <th className="text-right text-xs font-medium text-muted-foreground/60 uppercase tracking-wider pb-2 w-28">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentProfiles.map((p, i) => (
                <tr
                  key={p.id}
                  className={`transition-all duration-500 hover:bg-secondary/30 ${i % 2 === 1 ? 'bg-secondary/20' : ''}`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transitionDelay: `${420 + i * 60}ms`,
                  }}
                >
                  <td className="text-sm text-foreground py-2.5 truncate max-w-[200px]">{shortenUrl(p.url)}</td>
                  <td className={`text-right text-sm font-semibold font-mono tabular-nums py-2.5 ${p.overall_score !== null ? scoreColor(p.overall_score) : 'text-foreground'}`}>
                    {p.overall_score !== null ? p.overall_score : "–"}
                  </td>
                  <td className="text-right text-xs text-muted-foreground font-mono py-2.5">{format(new Date(p.created_at), "dd MMM yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/** Stat card with count-up and traffic-light coloring */
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
      className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 transition-all duration-700 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${index * 70}ms`,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">{label}</p>
      <p className={`text-2xl font-bold font-mono tabular-nums leading-none ${isScore ? scoreColor(value) : 'text-foreground'}`}>
        {animated}
        {isScore && <span className="text-sm font-normal text-muted-foreground">/100</span>}
      </p>
    </div>
  );
}
