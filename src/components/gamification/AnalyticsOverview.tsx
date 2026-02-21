import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/external-client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Globe, TrendingUp, Award, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

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
  findability: 'Findability',
  mobileUsability: 'Mobile Usability',
  offerClarity: 'Offer Clarity',
  trustProof: 'Trust Proof',
  conversionReadiness: 'Conversion Readiness',
};

const CATEGORY_COLORS: Record<string, string> = {
  findability: 'bg-blue-500',
  mobileUsability: 'bg-emerald-500',
  offerClarity: 'bg-amber-500',
  trustProof: 'bg-violet-500',
  conversionReadiness: 'bg-rose-500',
};

export const AnalyticsOverview = ({ userId, refreshKey }: AnalyticsOverviewProps) => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('website_profiles')
        .select('id, url, overall_score, category_scores, created_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProfiles(data as ProfileData[]);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [userId, refreshKey]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No completed analyses yet. Run your first analysis to see stats here!</p>
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
    if (p.category_scores && typeof p.category_scores === 'object') {
      for (const [key, val] of Object.entries(p.category_scores)) {
        if (typeof val === 'number') {
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
      color: CATEGORY_COLORS[key] || 'bg-primary',
    }))
    .sort((a, b) => b.avg - a.avg);

  const recentProfiles = profiles.slice(0, 5);

  const statCards = [
    { icon: BarChart3, label: 'Total Analyses', value: totalAnalyses },
    { icon: Globe, label: 'Websites Analyzed', value: uniqueUrls },
    { icon: TrendingUp, label: 'Average Score', value: `${avgScore}/100` },
    { icon: Award, label: 'Best Score', value: `${bestScore}/100` },
  ];

  const shortenUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return url.length > 30 ? url.slice(0, 30) + '…' : url;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="border-border bg-card">
            <CardContent className="p-5 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Breakdown */}
      {categoryAverages.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Category Averages</h3>
            <div className="space-y-4">
              {categoryAverages.map(({ key, label, avg, color }) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{avg}/100</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full transition-all ${color}`}
                      style={{ width: `${avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Analyses */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Analyses</h3>
          <div className="space-y-3">
            {recentProfiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">{shortenUrl(p.url)}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {p.overall_score !== null ? `${p.overall_score}/100` : '–'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(p.created_at), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
