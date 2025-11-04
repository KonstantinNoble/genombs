import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background py-12 sm:py-16 md:py-0"
      aria-label="Hero section"
    >
      {/* Clean minimal background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 bg-muted border border-border rounded-full text-muted-foreground font-medium text-xs sm:text-sm mb-6 animate-fade-in-up">
            Powered by Advanced AI Technology
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] animate-fade-in-up px-4 text-foreground"
            style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          >
            Transform Your Business
            <br />
            <span className="text-muted-foreground">
              With AI Intelligence
            </span>
          </h1>

          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground font-light max-w-3xl mx-auto animate-fade-in-up px-4 leading-relaxed"
            style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
          >
            Get personalized AI business tool recommendations and strategic insights tailored to your industry, team
            size, and growth goals. Start your analysis today.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4 sm:pt-6 animate-fade-in-up px-4"
            style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
          >
            <Button
              size="lg"
              className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all text-base sm:text-lg px-10 sm:px-12 py-6 sm:py-7"
              asChild
            >
              <Link to="/business-tools">
                Start Free Analysis
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-2 border-border bg-background font-semibold hover:bg-muted transition-all text-base sm:text-lg px-10 sm:px-12 py-6 sm:py-7"
              asChild
            >
              <Link to="/notion-idea">
                Get Business Ideas
              </Link>
            </Button>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-6 sm:pt-8 text-muted-foreground text-xs sm:text-sm animate-fade-in-up px-4"
            style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}
          >
            <span>No Credit Card Required</span>
            <span className="hidden sm:inline">•</span>
            <span>Free Daily Analysis</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
