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
      {/* Animated grid background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating accent shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent-cool/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent-warm/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
        
        {/* Animated line accents */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-primary/10 animate-line-flow" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-accent-cool/10 animate-line-flow" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-muted/20 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Problem-First Headline - SEO optimized H1 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight animate-scale-in">
            <span className="text-primary">
              Before You Decide,
            </span>
            <br />
            <span className="text-foreground">
              Ask Three Times
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Got a business question? Let GPT and Gemini look at it. You'll see where they agree – and where they don't. The real insights come with Premium.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              size="lg"
              className="text-base px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link to="/validate">{isPremium && user ? "Back to Validator" : "Try It Free"}</Link>
            </Button>
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="flex items-center gap-2 transition-all duration-300 hover:text-foreground group">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-dot-pulse" />
              Takes about 20 seconds
            </span>
            <span className="flex items-center gap-2 transition-all duration-300 hover:text-foreground group">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-warm animate-dot-pulse" style={{ animationDelay: "0.5s" }} />
              {isPremium && user ? "Premium access" : "No credit card needed"}
            </span>
            <span className="flex items-center gap-2 transition-all duration-300 hover:text-foreground group">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cool animate-dot-pulse" style={{ animationDelay: "1s" }} />
              2 free checks per day
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
