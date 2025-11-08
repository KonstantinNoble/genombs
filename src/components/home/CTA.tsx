import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-20 sm:py-24 md:py-32 bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary">
            Start Your Premium Journey
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlimited AI analyses, advanced tools, and priority support for $19.99/month.
          </p>

          <div className="pt-4">
            <Button
              size="lg"
              className="text-lg px-12 py-6 h-auto transition-all duration-300 hover:scale-105 shadow-xl"
              asChild
            >
              <Link to="/pricing">
                Get Premium Access
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Cancel Anytime
            </span>
            <span className="flex items-center gap-2 font-medium">
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
