import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="relative min-h-[85vh] flex items-center justify-center bg-background py-20 sm:py-24 md:py-32"
      aria-label="Hero section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight text-foreground animate-scale-in">
            Unlock AI-Powered Business Insights
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Premium AI tools for website optimization and strategic business growth. Join now for unlimited analyses.
          </p>

          <div className="pt-4">
            <Button
              size="lg"
              className="text-lg px-12 py-6 h-auto transition-all duration-300 hover:scale-105 shadow-xl"
              asChild
            >
              <Link to="/pricing">
                Get Premium - $19.99/month
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Unlimited AI Analyses
            </span>
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Advanced Tools
            </span>
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Priority Support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
