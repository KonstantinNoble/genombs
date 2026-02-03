import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import DecisionFlowAnimation from "./DecisionFlowAnimation";

const Hero = () => {
  const { user, isPremium } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Elegant background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/6 w-[600px] h-[600px] rounded-full opacity-25"
          style={{ 
            background: 'radial-gradient(circle at center, hsl(142 76% 36% / 0.2), transparent 60%)',
            filter: 'blur(80px)',
            animation: 'float 25s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle at center, hsl(220 76% 55% / 0.15), transparent 60%)',
            filter: 'blur(80px)',
            animation: 'float 30s ease-in-out infinite reverse'
          }}
        />
        
        <div 
          className="absolute top-1/3 left-0 w-2/3 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(142 76% 36% / 0.12), transparent)',
            animation: 'line-flow 8s ease-in-out infinite'
          }}
        />
        
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Subtle top accent */}
          <div 
            className={`mb-8 transition-all duration-700 delay-75 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="text-subtitle tracking-widest text-primary/80">
              For Founding Teams Without a Board
            </span>
          </div>

          {/* Main Headline */}
          <h1 
            className={`hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Stop making{" "}
            <span className="relative inline-block">
              <span className="text-primary">bad decisions.</span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            className={`text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            No board to pressure-test your strategy? Get structured AI perspectives in 60 seconds – see where they agree, where they disagree, and what you might be missing.
          </p>

          {/* Decision Flow Animation */}
          <div 
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <DecisionFlowAnimation />
          </div>

          {/* CTA Button */}
          <div 
            className={`flex items-center justify-center mb-12 transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <Button 
              size="lg" 
              asChild 
              className="btn-glow rounded-2xl px-10 py-7 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <Link to={user ? "/validate" : "/auth"} className="flex items-center gap-2">
                {isPremium && user ? "Back to Your Analyses" : "Try It Free"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div 
            className={`flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-muted-foreground/70 transition-all duration-700 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span>Second Opinions</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>Risk Check</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>Decision History</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;