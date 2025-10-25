import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
            Ready to Discover Your Next Investment?
          </h2>
          <p className="text-xl text-muted-foreground">
            Get your first AI-powered stock analysis free. No credit card required.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-secondary to-[hsl(38,100%,50%)] text-primary font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg px-8 group"
            asChild
          >
            <Link to="/stock-analysis">
              Get Free Analysis Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
