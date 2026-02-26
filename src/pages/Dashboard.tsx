import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/hooks/useStreak";
import { BadgeGallery } from "@/components/gamification/BadgeGallery";
import { AnalyticsOverview } from "@/components/gamification/AnalyticsOverview";
import { TodayVsAverage } from "@/components/gamification/TodayVsAverage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

/** Animates a number from 0 to `target` over `duration` ms */
function useCountUp(target: number, duration = 900, enabled = true) {
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
      // Ease-out cubic
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

const SECTIONS = [
  { num: "01", label: "Today vs Average" },
  { num: "02", label: "Analytics" },
  { num: "03", label: "Badges" },
];

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { streak } = useStreak(user?.id ?? null, true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);

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

  // Trigger entrance animation after mount
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  if (isLoading || !user) return null;

  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;
  const totalDays = streak?.total_active_days ?? 0;

  const streakStats = [
    {
      num: "01",
      label: "Current Streak",
      value: currentStreak,
      unit: "days",
      highlight: streak && currentStreak === longestStreak && currentStreak > 1 ? "Personal best" : null,
    },
    { num: "02", label: "Longest Streak", value: longestStreak, unit: "days", highlight: null },
    { num: "03", label: "Total Active Days", value: totalDays, unit: "days", highlight: null },
  ];

  return (
    <div className="min-h-screen bg-background/60">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Back link */}
        <Link
          to="/chat"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <span className="font-mono">←</span>
          Back to Analysis
        </Link>

        {/* Page Header — gradient title + shimmer divider */}
        <div
          className="mb-14 transition-all duration-500"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(10px)",
          }}
        >
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-foreground to-foreground bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-base text-muted-foreground mt-3 max-w-xl">
            Your performance metrics, streak history, and achievement progress — all in one place.
          </p>
          {/* Animated shimmer divider */}
          <div className="mt-8 h-px w-full overflow-hidden rounded-full">
            <div className="h-full w-full dashboard-shimmer-line" />
          </div>
        </div>

        {/* Streak Stats — single horizontal bar with dividers */}
        <div
          className="rounded-xl border border-border bg-card/80 backdrop-blur-sm mb-20 transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "100ms",
          }}
        >
          <div className="grid grid-cols-3 divide-x divide-border">
            {streakStats.map((stat, i) => {
              const animated = useCountUp(stat.value, 900, mounted);
              return (
                <div
                  key={stat.label}
                  className="p-6 text-center"
                >
                  <p className="text-xs text-muted-foreground/50 font-mono mb-1">{stat.num}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold font-mono tabular-nums text-foreground leading-none">
                    {animated}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">{stat.unit}</p>
                  {stat.highlight && (
                    <span className="inline-block mt-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 rounded-md dashboard-shimmer-badge">
                      {stat.highlight}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sections with mono-numbered headings */}
        {SECTIONS.map((section, sIdx) => (
          <section
            key={section.num}
            className="mb-20 transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transitionDelay: `${300 + sIdx * 50}ms`,
            }}
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-mono text-lg text-primary/40 select-none">{section.num}</span>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{section.label}</h2>
            </div>
            {/* Shimmer line under section header */}
            <div className="mb-6 h-px w-full overflow-hidden rounded-full">
              <div className="h-full w-full dashboard-shimmer-line" />
            </div>
            {sIdx === 0 && <TodayVsAverage userId={user.id} refreshKey={refreshKey} />}
            {sIdx === 1 && <AnalyticsOverview userId={user.id} refreshKey={refreshKey} />}
            {sIdx === 2 && <BadgeGallery userId={user.id} size="lg" />}
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
