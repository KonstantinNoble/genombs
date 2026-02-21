import { useIsMobile } from "@/hooks/use-mobile";
import { Monitor, Zap, Target, LayoutDashboard, ArrowRight } from "lucide-react";
import synvertasLogo from "@/assets/synvertas-logo.png";

const MobileBlocker = () => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background overflow-y-auto overflow-x-hidden p-6 md:p-8">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />

      <div className="relative flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full py-12">
        {/* Logo and Intro */}
        <div className="text-center mb-10 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
          <img src={synvertasLogo} alt="Synvertas" className="h-10 object-contain mx-auto mb-6" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
            Your AI Workspace
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            We've designed a powerful analytics engine that requires a full desktop screen to unleash its full potential.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="w-full space-y-4 mb-10">
          <FeatureCard
            icon={<Target className="w-5 h-5 text-primary" />}
            title="Competitor Benchmarking"
            description="Compare your site directly against your toughest competitors in real-time."
            delay="delay-[150ms]"
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-chart-4" />}
            title="Deep Code Analysis"
            description="Our AI scans your GitHub repositories for performance and structural flaws."
            delay="delay-[300ms]"
          />
          <FeatureCard
            icon={<LayoutDashboard className="w-5 h-5 text-chart-2" />}
            title="360° AI Dashboard"
            description="Actionable improvement tasks matched with technical solutions."
            delay="delay-[450ms]"
          />
        </div>

        {/* Call to Action Container */}
        <div className="w-full p-6 rounded-2xl bg-card border border-primary/20 shadow-lg shadow-primary/5 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[600ms]">
          <Monitor className="h-12 w-12 text-primary/80 mx-auto mb-4" />
          <h2 className="font-semibold text-lg text-foreground mb-2">Switch to Desktop</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Log in to <span className="font-medium text-foreground">genombs.com</span> on your computer to start analyzing.
          </p>
          <div className="relative inline-flex group w-full">
            <div className="absolute transition-all duration-1000 opacity-30 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-70 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
            <button className="relative w-full inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white transition-all duration-200 bg-primary font-display rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-xl shadow-primary/20">
              Got it!
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both ${delay}`}>
      <div className="shrink-0 p-2.5 rounded-lg bg-background border border-border/50 shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-[15px] text-foreground mb-1">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-snug">{description}</p>
      </div>
    </div>
  );
}

export default MobileBlocker;
