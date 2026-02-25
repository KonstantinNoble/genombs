import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/hooks/useStreak";
import { BadgeGallery } from "@/components/gamification/BadgeGallery";
import { AnalyticsOverview } from "@/components/gamification/AnalyticsOverview";
import { TodayVsAverage } from "@/components/gamification/TodayVsAverage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
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

  const streakCards: {
    label: string;
    value: number;
    unit: string;
    highlight: string | null;
    subtext: string | null;
  }[] = [
    {
      label: "Current Streak",
      value: currentStreak,
      unit: "days",
      highlight: streak && currentStreak === longestStreak && currentStreak > 1 ? "Personal best" : null,
      subtext: currentStreak === 0 ? "Run an analysis to start your streak" : null,
    },
    { label: "Longest Streak", value: longestStreak, unit: "days", highlight: null, subtext: null },
    { label: "Total Active Days", value: totalDays, unit: "days", highlight: null, subtext: null },
  ];

  return (
    <div className="min-h-screen bg-background/60">
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

        {/* Page Header — gradient title + shimmer divider */}
        <div
          className="mb-12 transition-all duration-500"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(10px)",
          }}
        >
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-foreground to-foreground bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Your performance at a glance.</p>
          {/* Animated shimmer divider */}
          <div className="mt-6 h-px w-full overflow-hidden rounded-full">
            <div className="h-full w-full dashboard-shimmer-line" />
          </div>
        </div>

        {/* Streak Stats — staggered slide-up */}
        <div className="grid grid-cols-3 gap-4 mb-14">
          {streakCards.map((card, i) => (
            <StreakCard key={card.label} card={card} index={i} mounted={mounted} isFirst={i === 0} />
          ))}
        </div>

        {/* Sections with mono-numbered headings */}
        {SECTIONS.map((section, sIdx) => (
          <section
            key={section.num}
            className="mb-14 transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transitionDelay: `${300 + sIdx * 50}ms`,
            }}
          >
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-mono text-xs text-primary/40 select-none">{section.num}</span>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{section.label}</h2>
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

/** Individual streak card with count-up animation */
function StreakCard({
  card,
  index,
  mounted,
  isFirst,
}: {
  card: { label: string; value: number; unit: string; highlight: string | null; subtext: string | null };
  index: number;
  mounted: boolean;
  isFirst: boolean;
}) {
  const animated = useCountUp(card.value, 900, mounted);
  const isActive = isFirst && card.value > 0;

  return (
    <div
      className={`relative rounded-xl border bg-card p-5 transition-all duration-700 hover:shadow-md hover:-translate-y-0.5 group
        ${isActive
          ? 'border-primary/30 hover:border-primary/50 hover:shadow-primary/10'
          : 'border-border hover:border-primary/30 hover:shadow-sm'
        }`}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${80 + index * 80}ms`,
      }}
    >
      {/* Active accent line on top */}
      {isActive && (
        <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{card.label}</p>
      <p className="text-4xl font-bold text-foreground tabular-nums leading-none">{animated}</p>
      <p className="text-xs text-muted-foreground mt-1">{card.unit}</p>
      {card.highlight && (
        <span className="inline-block mt-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 rounded-md dashboard-shimmer-badge">
          {card.highlight}
        </span>
      )}
      {card.subtext && <p className="text-xs text-muted-foreground/60 mt-2">{card.subtext}</p>}
    </div>
  );
}

export default Dashboard;
