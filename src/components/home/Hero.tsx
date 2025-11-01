import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,hsl(280,70%,15%)_0%,hsl(220,70%,10%)_50%,hsl(220,80%,8%)_100%)] py-12 sm:py-16 md:py-0"
      aria-label="Hero section"
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[hsl(280,85%,65%)]/20 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[hsl(340,85%,65%)]/20 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[hsl(260,90%,60%)]/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(280,85%,65%,0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(280,85%,65%,0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/40 rounded-full text-white font-semibold text-xs sm:text-sm mb-6 animate-fade-in-up backdrop-blur-md shadow-[0_0_30px_hsl(280,85%,65%,0.3)]">
            ✨ Powered by Advanced AI Technology
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] animate-fade-in-up px-4"
            style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          >
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
              Transform Your Business
            </span>
            <br />
            <span className="bg-gradient-to-r from-[hsl(260,90%,70%)] via-[hsl(280,85%,65%)] to-[hsl(340,85%,65%)] bg-clip-text text-transparent">
              With AI Intelligence
            </span>
          </h1>

          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 font-light max-w-3xl mx-auto animate-fade-in-up px-4 leading-relaxed"
            style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
          >
            Get personalized AI business tool recommendations and strategic insights tailored to your industry,
            team size, and growth goals. Start your free analysis today—no credit card required.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4 sm:pt-6 animate-fade-in-up px-4"
            style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
          >
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-[hsl(260,90%,60%)] via-[hsl(280,85%,65%)] to-[hsl(340,85%,65%)] text-white font-bold hover:shadow-[0_0_60px_hsl(280,85%,65%/0.6)] hover:scale-105 transition-all duration-500 text-base sm:text-lg px-10 sm:px-12 py-6 sm:py-7 group relative overflow-hidden border border-white/20"
              asChild
            >
              <Link to="/business-tools">
                <span className="relative z-10">Start Free Analysis</span>
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:translate-x-2 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(340,85%,65%)] to-[hsl(260,90%,60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-2 border-white/40 bg-white/5 text-white font-semibold hover:bg-white/10 hover:border-white/60 hover:scale-105 transition-all duration-500 text-base sm:text-lg px-10 sm:px-12 py-6 sm:py-7 group backdrop-blur-lg"
              asChild
            >
              <Link to="/notion-idea">
                <Lightbulb className="mr-2 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:rotate-12 group-hover:text-[hsl(280,85%,65%)]" />
                <span>Get Business Ideas</span>
              </Link>
            </Button>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-6 sm:pt-8 text-white/60 text-xs sm:text-sm animate-fade-in-up px-4"
            style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span>Free Daily Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
