import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-investment.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      <div 
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(0 0% 9% / 0.97), hsl(0 0% 9% / 0.85)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
            Build Wealth Through{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-secondary via-[hsl(38,100%,50%)] to-secondary bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent">
                Intelligent Investing
              </span>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-light animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
            Make the right investment decisions with expert guidance, proven strategies, and data-driven insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-secondary to-[hsl(38,100%,50%)] text-primary font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg px-8 group"
            >
              Start Investing Today
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 text-lg px-8 transition-all duration-300 hover:scale-105"
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
