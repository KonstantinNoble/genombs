import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import auroraBackground from "@/assets/aurora-background-blurred.png";

const Hero = () => {
  const { user, isPremium } = useAuth();

  return (
    <section
      className="relative min-h-[85vh] flex items-center justify-center py-20 sm:py-24 md:py-32 overflow-hidden"
      aria-label="Hero section"
    >
      {/* Aurora background image with dynamic animation */}
      <div 
        className="absolute -inset-[20%] bg-cover bg-center bg-no-repeat animate-aurora-drift"
        style={{ 
          backgroundImage: `url(${auroraBackground})`,
        }}
      />
      {/* Animated glow overlay */}
      <div 
        className="absolute -inset-[20%] bg-cover bg-center bg-no-repeat animate-aurora-glow pointer-events-none"
        style={{ 
          backgroundImage: `url(${auroraBackground})`,
          mixBlendMode: 'screen',
          animationDelay: '4s',
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-background/40" />
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Problem-First Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight animate-scale-in">
            <span className="text-foreground">
              Stop Guessing{" "}
            </span>
            <span 
              className="text-neon-green drop-shadow-[0_0_20px_hsl(142_100%_50%/0.6)]"
            >
              What to Do Next.
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Get AI-powered strategies based on live market data. No more outdated generic advice. Turn your goals into a step-by-step action plan in under 2 minutes.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              size="lg"
              className="text-base px-8"
              asChild
            >
              <Link to="/business-tools">{isPremium && user ? "Go to Planner" : "Create Your Strategy"}</Link>
            </Button>

            {!(isPremium && user) && (
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8"
                asChild
              >
                <Link to="/ideas">Explore Business Ideas</Link>
              </Button>
            )}
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="flex items-center gap-2 transition-all duration-300 hover:text-foreground group">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-soft" />
              No more endless Googling
            </span>
            <span className="flex items-center gap-2 transition-all duration-300 hover:text-foreground group">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-warm animate-pulse-soft" style={{ animationDelay: "0.5s" }} />
              {isPremium && user ? "Premium Member" : "No more generic AI advice"}
            </span>
            <span className="flex items-center gap-2 transition-all duration-300 hover:text-foreground group">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cool animate-pulse-soft" style={{ animationDelay: "1s" }} />
              Get a real plan in 2 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
