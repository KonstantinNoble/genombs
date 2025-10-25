import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-investment.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(222 47% 11% / 0.95), hsl(222 47% 11% / 0.7)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Build Wealth Through{" "}
            <span className="bg-gradient-to-r from-secondary to-[hsl(36,100%,50%)] bg-clip-text text-transparent">
              Intelligent Investing
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 font-light">
            Make the right investment decisions with expert guidance, proven strategies, and data-driven insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-secondary to-[hsl(36,100%,50%)] text-primary font-semibold hover:opacity-90 transition-all hover:scale-105 text-lg px-8"
            >
              Start Investing Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
