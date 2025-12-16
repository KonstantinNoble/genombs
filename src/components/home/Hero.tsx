import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user, isPremium } = useAuth();

  const scrollToHowItWorks = () => {
    const section = document.getElementById("how-it-works");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-[85vh] flex items-center justify-center py-20 sm:py-24 md:py-32 overflow-hidden"
      aria-label="Hero section"
    >
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 animate-fade-in" />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(var(--primary-rgb),0.15),transparent_40%)] animate-pulse"
        style={{ animationDuration: "4s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(var(--primary-rgb),0.1),transparent_40%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Benefit-Driven Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight animate-scale-in">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-fade-in bg-[length:200%_auto] transition-all duration-300">
              Turn Your Business Goals Into a Clear Action Plan
            </span>
          </h1>


          <div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              size="lg"
              className="text-base px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
              asChild
            >
              <Link to="/business-tools">{isPremium && user ? "Go to Planner" : "Create Your Strategy"}</Link>
            </Button>

            {!(isPremium && user) && (
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:border-primary hover:shadow-lg hover:shadow-primary/30"
                onClick={scrollToHowItWorks}
              >
                See How It Works
              </Button>
            )}
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="flex items-center gap-2 transition-all duration-300 hover:text-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-2 transition-all duration-300 hover:text-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.5s" }} />
              {isPremium && user ? "Premium Member" : "2 Free Analyses Daily"}
            </span>
            <span className="flex items-center gap-2 transition-all duration-300 hover:text-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "1s" }} />
              Results in Under 2 Minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
