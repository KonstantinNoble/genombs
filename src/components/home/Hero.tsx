import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const Hero = () => {
  const { user, isPremium } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden noise-overlay"
      aria-label="Hero section"
    >
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary large orb */}
        <div 
          className="gradient-orb absolute -top-1/4 -right-1/4 w-[600px] h-[600px] md:w-[800px] md:h-[800px] opacity-60"
          style={{ animationDelay: '0s' }}
        />
        
        {/* Secondary orb */}
        <div 
          className="gradient-orb absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] opacity-40"
          style={{ 
            animationDelay: '-7s',
            background: 'radial-gradient(circle at center, hsl(var(--accent-cool) / 0.2) 0%, hsl(var(--accent-cool) / 0.05) 40%, transparent 60%)'
          }}
        />

        {/* Small accent orb */}
        <div 
          className="gradient-orb absolute top-1/3 left-1/4 w-[200px] h-[200px] md:w-[300px] md:h-[300px] opacity-30 hidden sm:block"
          style={{ 
            animationDelay: '-12s',
            animationDuration: '25s'
          }}
        />
      </div>

      {/* Animated Diagonal Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div 
          className="animated-line absolute top-1/4 w-[200%] rotate-[25deg]"
          style={{ animationDelay: '0s', animationDuration: '8s' }}
        />
        <div 
          className="animated-line absolute top-1/2 w-[200%] rotate-[25deg]"
          style={{ animationDelay: '-2s', animationDuration: '10s' }}
        />
        <div 
          className="animated-line absolute top-3/4 w-[200%] rotate-[25deg]"
          style={{ animationDelay: '-4s', animationDuration: '12s' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">

          {/* Main Headline */}
          <h1 
            className={`hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="text-primary">Before You Decide,</span>
            <br />
            <span className="text-foreground">Ask Three Times</span>
          </h1>

          {/* Subheadline */}
          <p 
            className={`text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Got a business question? Let multiple AI models analyze it. 
            See where they agree – and where they don't.
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <Button 
              size="lg" 
              asChild 
              className="btn-glow rounded-2xl px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Link to="/validate">
                {isPremium && user ? "Back to Validator" : "Try It Free"}
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              asChild 
              className="rounded-2xl px-8 py-6 text-lg font-semibold glow-hover transition-all duration-300"
            >
              <a href="#how-it-works">
                See How It Works
              </a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div 
            className={`flex flex-wrap items-center justify-center gap-6 sm:gap-10 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="text-sm sm:text-base text-muted-foreground">
              Takes about 20 seconds
            </span>
            <span className="text-sm sm:text-base text-muted-foreground">
              {isPremium && user ? "Premium access" : "No credit card needed"}
            </span>
            <span className="text-sm sm:text-base text-muted-foreground">
              2 free checks per day
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Fade Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;