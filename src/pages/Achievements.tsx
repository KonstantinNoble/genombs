import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/hooks/useStreak";
import { BadgeGallery } from "@/components/gamification/BadgeGallery";
import { AnalyticsOverview } from "@/components/gamification/AnalyticsOverview";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Achievements = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { streak } = useStreak(user?.id ?? null, true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const onFocus = () => setRefreshKey((k) => k + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (isLoading || !user) return null;

  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;
  const totalDays = streak?.total_active_days ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Back link */}
        <Link
          to="/chat"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis
        </Link>

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Achievements</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your progress and milestones.</p>
        </div>

        {/* Streak Stats — plain data, no hero icon */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Streak</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">{currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">days</p>
            {streak && currentStreak === longestStreak && currentStreak > 1 && (
              <span className="inline-block mt-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 rounded-md">
                Personal best
              </span>
            )}
            {currentStreak === 0 && (
              <p className="text-xs text-muted-foreground/60 mt-2">Run an analysis to start your streak</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Longest Streak</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">{longestStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Active Days</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">{totalDays}</p>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </div>
        </div>

        {/* Analytics Overview */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Analytics</h2>
          <AnalyticsOverview userId={user.id} refreshKey={refreshKey} />
        </section>

        {/* Badges Section */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Badges</h2>
          <BadgeGallery userId={user.id} size="lg" />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Achievements;
