import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats, generateInsights } from "@/hooks/useDashboardStats";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { ConfidenceTrend } from "@/components/dashboard/ConfidenceTrend";
import { DecisionRatio } from "@/components/dashboard/DecisionRatio";
import { ModelPerformance } from "@/components/dashboard/ModelPerformance";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

export default function Dashboard() {
  const { user, isLoading: authLoading, isPremium } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useDashboardStats(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const insights = generateInsights(stats);

  return (
    <>
      <SEOHead
        title="Decision Intelligence Dashboard | Synoptas"
        description="Track your decision-making patterns, confidence trends, and AI model performance with personalized insights."
        keywords="decision dashboard, decision analytics, confidence tracking, AI insights"
      />
      <Navbar />
      <main className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-block mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">
                Analytics
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Decision Intelligence
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Track your decision patterns and discover insights to improve your process.
            </p>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-6 border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <p className="text-sm text-destructive">
                  Failed to load dashboard data. Please try again later.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
            </div>
          )}

          {/* Stats Content */}
          {stats && !isLoading && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <StatsOverview
                validationStats={stats.validation_stats}
                decisionStats={stats.decision_stats}
              />

              {/* Charts Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <ConfidenceTrend data={stats.confidence_trend} />
                <DecisionRatio stats={stats.decision_stats} />
              </div>

              {/* Bottom Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <ModelPerformance usage={stats.model_usage} />
                <InsightsPanel insights={insights} isPremium={isPremium} />
              </div>

              {/* Empty State CTA */}
              {stats.validation_stats.total_validations === 0 && (
                <Card className="glass-card mt-8">
                  <CardContent className="py-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 via-accent-cool/10 to-accent-warm/20" />
                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                      Start Building Your Decision Trail
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Create your first validation to see insights about your decision patterns and AI model performance.
                    </p>
                    <Button asChild size="lg">
                      <Link to="/validate">
                        Create First Validation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
