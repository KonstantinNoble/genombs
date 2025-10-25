import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-[hsl(220,35%,96%)] via-background to-[hsl(220,35%,96%)]">
      <div 
        className="absolute inset-0 opacity-8"
        style={{
          background: 'radial-gradient(circle at 50% 50%, hsl(45 98% 58%), transparent 70%)',
        }}
      />
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Start Building Your Wealth?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of investors who trust Wealthconomy to guide their investment journey.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-secondary to-[hsl(38,100%,50%)] text-primary font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg px-8 group"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
