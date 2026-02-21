import { useEffect, useState } from "react";
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

export const AnalyticsOverview = ({ userId, refreshKey }: AnalyticsOverviewProps) => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="rounded-xl border border-border bg-card p-8 text-center">
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
    { label: "Total Analyses", value: totalAnalyses },
    { label: "Websites Analyzed", value: uniqueUrls },
    { label: "Average Score", value: `${avgScore}` },
    { label: "Best Score", value: `${bestScore}` },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards — data-first, no icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">{label}</p>
            <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      {categoryAverages.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
              Category Averages
            </p>
            <div className="space-y-3">
              {categoryAverages.map(({ key, label, avg }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${avg}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground tabular-nums w-8 text-right">{avg}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Analyses */}
      <Card className="border-border bg-card">
        <CardContent className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
            Recent Analyses
          </p>
          <div className="divide-y divide-border">
            {recentProfiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
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
