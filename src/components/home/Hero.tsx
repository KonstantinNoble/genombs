import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user, isPremium } = useAuth();

  return (
    <section
      className="relative min-h-[85vh] flex items-center justify-center py-20 sm:py-24 md:py-32 overflow-hidden"
      aria-label="Hero section"
    >
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Problem-First Headline - SEO optimized H1 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight animate-scale-in">
            <span className="bg-gradient-to-r from-primary via-[hsl(160_70%_35%)] to-[hsl(120_80%_40%)] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              AI Business Plan Generator
            </span>
            <br />
            <span className="text-foreground">
              From Ideas to Actionable Strategy
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Learn how to make a business plan in minutes, not days. Our AI business plan generator creates growth strategies tailored for small business owners – powered by live market research.
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
