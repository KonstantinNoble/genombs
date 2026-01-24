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
import { BarChart3, ArrowRight, AlertCircle } from "lucide-react";
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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Decision Intelligence
              </h1>
            </div>
            <p className="text-muted-foreground">
              Track your decision patterns and discover insights to improve your process.
            </p>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-6 border-destructive/50">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
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
                <Card className="glass-card">
                  <CardContent className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Start Building Your Decision Trail</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Create your first validation to see insights about your decision patterns and AI model performance.
                    </p>
                    <Button asChild>
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
