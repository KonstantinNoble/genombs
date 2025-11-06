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
            AI-Powered Business Tool Recommendations
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get personalized tool recommendations and strategic insights tailored to your industry, team size, and growth goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="text-base px-8 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to="/business-tools">
                Start Free Analysis
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 transition-all duration-300 hover:scale-105 hover:bg-primary/5 hover:border-primary"
              asChild
            >
              <Link to="/notion-idea">
                Get Business Ideas
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Free Daily Analysis
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
