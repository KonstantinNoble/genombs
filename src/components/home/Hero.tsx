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
      {/* Animated Background - Solid colors with floating elements */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary colored circles */}
        <div 
          className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float"
          style={{ top: '10%', left: '10%' }}
        />
        <div 
          className="absolute w-96 h-96 rounded-full bg-accent-warm/10 blur-3xl animate-float-delayed"
          style={{ top: '50%', right: '5%' }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full bg-accent-cool/10 blur-3xl animate-float"
          style={{ bottom: '10%', left: '30%', animationDelay: '2s' }}
        />
        
        {/* Small floating dots */}
        <div className="absolute w-3 h-3 rounded-full bg-primary animate-bounce-soft" style={{ top: '20%', left: '25%' }} />
        <div className="absolute w-2 h-2 rounded-full bg-accent-warm animate-bounce-soft" style={{ top: '40%', right: '20%', animationDelay: '0.5s' }} />
        <div className="absolute w-4 h-4 rounded-full bg-accent-cool animate-bounce-soft" style={{ bottom: '30%', left: '15%', animationDelay: '1s' }} />
        <div className="absolute w-2 h-2 rounded-full bg-primary animate-bounce-soft" style={{ top: '60%', right: '35%', animationDelay: '1.5s' }} />
        
        {/* Rotating ring */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full border border-primary/10 animate-spin-slow"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Problem-First Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight animate-scale-in">
            <span className="text-foreground">
              Stop Guessing What to Do Next.
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
