import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'var(--gradient-hero)',
        }}
      />
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Start Building Your Wealth?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of investors who trust Wealthconomy to guide their investment journey.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-secondary to-[hsl(36,100%,50%)] text-primary font-semibold hover:opacity-90 transition-all hover:scale-105 text-lg px-8"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
