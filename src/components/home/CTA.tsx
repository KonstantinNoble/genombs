import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-12 sm:py-20 md:py-32 relative overflow-hidden bg-[radial-gradient(ellipse_at_bottom,hsl(280,70%,15%)_0%,hsl(220,70%,10%)_50%,hsl(220,80%,8%)_100%)]">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 30% 50%, hsl(280 85% 65%), transparent 50%), radial-gradient(circle at 70% 50%, hsl(340 85% 65%), transparent 50%)",
        }}
      />

      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[hsl(280,85%,65%)]/20 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute top-1/2 right-1/4 w-96 h-96 bg-[hsl(340,85%,65%)]/20 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[hsl(260,90%,60%)]/15 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(280,85%,65%,0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(280,85%,65%,0.08)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-10 animate-fade-in-up">
          <div className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-secondary/25 to-accent/25 border border-white/30 rounded-full text-white font-semibold text-xs sm:text-sm backdrop-blur-md shadow-[0_0_40px_hsl(280,85%,65%,0.4)]">
            🚀 Start Your Journey Today
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] px-4">
            <span className="text-white">Ready to </span>
            <span className="bg-gradient-to-r from-[hsl(260,90%,70%)] via-[hsl(280,85%,65%)] to-[hsl(340,85%,65%)] bg-clip-text text-transparent">
              Supercharge
            </span>
            <br />
            <span className="text-white">Your Business?</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto px-4 leading-relaxed">
            Join businesses already using AI to make smarter decisions. Start your free analysis now—no credit card, no
            commitment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-6 px-4">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-[hsl(260,90%,60%)] via-[hsl(280,85%,65%)] to-[hsl(340,85%,65%)] text-white font-bold hover:shadow-[0_0_80px_hsl(280,85%,65%/0.7)] hover:scale-105 transition-all duration-500 text-lg sm:text-xl md:text-2xl px-12 sm:px-14 py-7 sm:py-8 group relative overflow-hidden border border-white/30"
              asChild
            >
              <Link to="/business-tools">
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="ml-3 h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-300 group-hover:translate-x-2 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(340,85%,65%)] to-[hsl(260,90%,60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 sm:pt-6 text-white/60 text-xs sm:text-sm px-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Free Plan</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Instant Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
