import { useIsMobile } from "@/hooks/use-mobile";
import synvertasLogo from "@/assets/synvertas-logo.png";

const DashboardIllustration = () => (
  <div className="w-full max-w-[280px] mx-auto">
    {/* Dashboard frame */}
    <div className="rounded-xl border border-border/60 bg-card/50 p-3 space-y-2.5">
      {/* Top bar */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        <div className="flex-1 h-2 rounded-full bg-muted/80 ml-2" />
      </div>

      {/* Two-column layout */}
      <div className="flex gap-2">
        {/* Left: Bar chart */}
        <div className="flex-1 rounded-lg border border-border/40 bg-background/50 p-2">
          <div className="h-1.5 w-8 rounded bg-muted-foreground/20 mb-2" />
          <div className="flex items-end gap-1 h-12">
            <div className="flex-1 rounded-t bg-primary/70 bar-fill-1" style={{ height: 0 }} />
            <div className="flex-1 rounded-t bg-primary/50 bar-fill-2" style={{ height: 0 }} />
            <div className="flex-1 rounded-t bg-primary/80 bar-fill-3" style={{ height: 0 }} />
            <div className="flex-1 rounded-t bg-primary/40 bar-fill-4" style={{ height: 0 }} />
            <div className="flex-1 rounded-t bg-primary/60 bar-fill-5" style={{ height: 0 }} />
          </div>
        </div>

        {/* Right: Radar chart */}
        <div className="w-20 rounded-lg border border-border/40 bg-background/50 p-2 flex items-center justify-center">
          <svg viewBox="0 0 60 60" className="w-full h-full">
            <circle cx="30" cy="30" r="22" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.4" />
            <circle cx="30" cy="30" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
            <circle cx="30" cy="30" r="8" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.2" />
            <polygon
              points="30,10 48,22 44,44 16,44 12,22"
              fill="hsl(var(--primary) / 0.15)"
              stroke="hsl(var(--primary) / 0.6)"
              strokeWidth="1"
              className="radar-shape"
            />
            {/* Sweep line */}
            <line x1="30" y1="30" x2="30" y2="8" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.6" className="radar-sweep-line" />
          </svg>
        </div>
      </div>

      {/* Bottom row: stat panels */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 rounded-md border border-border/30 bg-background/40 p-1.5">
            <div className="h-1 w-6 rounded bg-muted-foreground/15 mb-1" />
            <div className="h-2.5 w-8 rounded bg-primary/30 shimmer-bar" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const features = [
  "Competitor Benchmarking with live data",
  "AI-powered code & performance analysis",
  "Interactive improvement dashboards",
];

const MobileBlocker = () => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background overflow-y-auto overflow-x-hidden dot-grid">
      {/* Floating gradient orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-64 h-64 rounded-full bg-primary/8 blur-3xl orb-float-1" />
      <div className="absolute bottom-[-5%] right-[-15%] w-48 h-48 rounded-full bg-primary/6 blur-3xl orb-float-2" />

      <div className="relative flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full px-6 py-16">
        {/* Logo */}
        <img
          src={synvertasLogo}
          alt="Synvertas"
          className="h-8 object-contain mb-12 opacity-0 animate-fade-in"
          style={{ animationDelay: "0s", animationFillMode: "forwards" }}
        />

        {/* Headline */}
        <h1
          className="text-2xl font-semibold tracking-tight text-foreground text-center mb-4 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
        >
          Built for Desktop
        </h1>

        {/* Explanation */}
        <p
          className="text-muted-foreground text-[15px] leading-relaxed text-center mb-8 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          Synvertas delivers complex competitor dashboards, side-by-side benchmarks, and interactive data visualizations that require the full width of a desktop screen.
        </p>

        {/* Dashboard illustration */}
        <div
          className="w-full mb-10 opacity-0 animate-scale-in"
          style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
        >
          <DashboardIllustration />
        </div>

        {/* Feature list */}
        <div className="w-full border-t border-border/50 mb-10">
          {features.map((feature, i) => (
            <div
              key={i}
              className="py-3.5 border-b border-border/50 text-[14px] text-foreground/80 tracking-wide flex items-center gap-3 opacity-0 animate-fade-in"
              style={{ animationDelay: `${0.5 + i * 0.1}s`, animationFillMode: "forwards" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary dot-pulse-anim flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>

        {/* Domain hint */}
        <p
          className="text-sm text-muted-foreground text-center opacity-0 animate-fade-in"
          style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
        >
          Open <span className="font-medium text-foreground domain-glow">synvertas.com</span> on your computer to get started.
        </p>
      </div>
    </div>
  );
};

export default MobileBlocker;
