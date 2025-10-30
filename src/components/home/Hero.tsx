import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(220,70%,10%)] via-[hsl(220,70%,15%)] to-[hsl(220,60%,20%)]"
      aria-label="Hero section"
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[hsl(340,85%,65%)]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-full text-secondary font-medium mb-4 animate-fade-in-up backdrop-blur-sm">
            Powered by Advanced AI Technology
          </div>

          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          >
            Transform Your Business{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-secondary via-[hsl(30,100%,60%)] to-[hsl(340,85%,65%)] bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent">
                With AI Intelligence
              </span>
            </span>
          </h1>

          <p
            className="text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
          >
            Discover the perfect tools for your business. Get personalized AI recommendations tailored to your industry,
            team size, and growth ambitions—in seconds.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-fade-in-up"
            style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-secondary via-[hsl(30,100%,60%)] to-[hsl(340,85%,65%)] text-primary font-bold hover:shadow-[0_0_40px_hsl(45,98%,58%/0.4)] hover:scale-110 transition-all duration-300 text-lg px-10 py-6 group relative overflow-hidden"
              asChild
            >
              <Link to="/business-tools">
                <span className="relative z-10">Start Free Analysis</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(30,100%,60%)] to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </Button>
          </div>

          <div
            className="flex items-center justify-center gap-8 pt-8 text-white/60 text-sm animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Free Daily Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
