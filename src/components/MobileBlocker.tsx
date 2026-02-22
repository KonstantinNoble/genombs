import { useIsMobile } from "@/hooks/use-mobile";
import synvertasLogo from "@/assets/synvertas-logo.png";

const MobileBlocker = () => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background overflow-y-auto overflow-x-hidden">
      <div className="relative flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full px-6 py-16">
        {/* Logo */}
        <img src={synvertasLogo} alt="Synvertas" className="h-8 object-contain mb-12 opacity-80" />

        {/* Headline */}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-center mb-4">
          Built for Desktop
        </h1>

        {/* Explanation */}
        <p className="text-muted-foreground text-[15px] leading-relaxed text-center mb-10">
          Synvertas delivers complex competitor dashboards, side-by-side benchmarks, and interactive data visualizations that require the full width of a desktop screen to work effectively.
        </p>

        {/* Feature list */}
        <div className="w-full border-t border-border/50 mb-10">
          {[
            "Competitor Benchmarking with live data",
            "AI-powered code & performance analysis",
            "Interactive improvement dashboards",
          ].map((feature, i) => (
            <div
              key={i}
              className="py-3.5 border-b border-border/50 text-[14px] text-foreground/80 tracking-wide"
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Domain hint */}
        <p className="text-sm text-muted-foreground text-center">
          Open <span className="font-medium text-foreground">synvertas.com</span> on your computer to get started.
        </p>
      </div>
    </div>
  );
};

export default MobileBlocker;
