import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-12 sm:py-20 md:py-32 relative overflow-hidden bg-gradient-to-br from-[hsl(220,70%,15%)] via-[hsl(220,60%,20%)] to-[hsl(220,70%,15%)]">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 30% 50%, hsl(45 98% 58%), transparent 50%), radial-gradient(circle at 70% 50%, hsl(340 85% 65%), transparent 50%)",
        }}
      />

      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-1/2 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-[hsl(340,85%,65%)]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-10 animate-fade-in-up">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary/20 border border-secondary/40 rounded-full text-secondary font-medium text-xs sm:text-sm backdrop-blur-sm">
            Start Your Journey Today
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight px-4">
            Ready to{" "}
            <span className="bg-gradient-to-r from-secondary via-[hsl(30,100%,60%)] to-[hsl(340,85%,65%)] bg-clip-text text-transparent">
              Supercharge
            </span>{" "}
            Your Business?
          </h2>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto px-4">
            Join businesses already using AI to make smarter decisions. Start your free analysis now—no credit card, no
            commitment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4 px-4">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-secondary via-[hsl(30,100%,60%)] to-[hsl(340,85%,65%)] text-primary font-bold hover:shadow-[0_0_50px_hsl(45,98%,58%/0.5)] hover:scale-110 transition-all duration-300 text-base sm:text-lg md:text-xl px-10 sm:px-12 py-6 sm:py-7 group relative overflow-hidden"
              asChild
            >
              <Link to="/business-tools">
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:translate-x-2 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(30,100%,60%)] to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
