import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const CTA = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { ref, isVisible } = useScrollReveal();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session) {
        const { data } = await supabase
          .from('user_credits')
          .select('is_premium')
          .eq('user_id', session.user.id)
          .single();
        
        setIsPremium(data?.is_premium ?? false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        setTimeout(async () => {
          const { data } = await supabase
            .from('user_credits')
            .select('is_premium')
            .eq('user_id', session.user.id)
            .single();
          
          setIsPremium(data?.is_premium ?? false);
        }, 0);
      } else {
        setIsPremium(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section className="py-20 sm:py-24 md:py-32 bg-card/50 border-t border-border relative overflow-hidden">
      {/* Floating accent elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-32 h-32 rounded-full bg-primary/10 blur-2xl animate-float" style={{ top: '20%', left: '10%' }} />
        <div className="absolute w-24 h-24 rounded-full bg-accent-warm/10 blur-2xl animate-float-delayed" style={{ bottom: '20%', right: '15%' }} />
        <div className="absolute w-3 h-3 rounded-full bg-accent-cool animate-bounce-soft" style={{ top: '30%', right: '25%' }} />
        <div className="absolute w-2 h-2 rounded-full bg-primary animate-bounce-soft" style={{ bottom: '40%', left: '20%', animationDelay: '0.7s' }} />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={ref}
          className={`max-w-3xl mx-auto text-center space-y-8 scroll-reveal ${isVisible ? 'revealed' : ''}`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-primary">
            {isPremium && isLoggedIn ? "Continue Your Business Strategy" : "Ready to Stop Guessing and Start Executing?"}
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isPremium && isLoggedIn 
              ? "Access all your premium features including Deep Analysis with 6 phases, ROI projections, and competitor analysis."
              : "Get a clear action plan based on real market data. No more generic advice. No credit card required."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="text-base px-8"
              asChild
            >
              <Link to="/business-tools">
                {isPremium && isLoggedIn ? "Go to Planner" : "Start Free Analysis"}
              </Link>
            </Button>
            {!isPremium && (
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8"
                asChild
              >
                <Link to="/pricing">View Pricing</Link>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Real market data
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-warm" />
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cool" />
              Results in 2 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
