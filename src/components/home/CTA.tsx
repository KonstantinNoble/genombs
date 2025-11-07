import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-20 sm:py-24 md:py-32 bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary">
            Ready to Get Started?
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join businesses making smarter decisions with AI. Start your free analysis now—no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="text-base px-8 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to="/website-tools">
                Get Started
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Free Plan
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              No Credit Card
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Instant Access
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
