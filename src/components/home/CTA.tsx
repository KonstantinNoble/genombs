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
    <section className="py-20 sm:py-24 md:py-32 border-t border-border relative overflow-hidden bg-muted/30">
      {/* Top fade transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-background/60 pointer-events-none z-[1]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={ref}
          className={`max-w-3xl mx-auto text-center space-y-8 scroll-reveal ${isVisible ? 'revealed' : ''}`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-primary">
            {isPremium && isLoggedIn ? "Ready when you are" : "Give it a shot"}
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isPremium && isLoggedIn 
              ? "Your 20 daily checks are waiting. Full insights, competitor context, long-term outlook."
              : "Two free checks a day. No credit card. See if it helps you think through decisions."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="text-base px-8"
              asChild
            >
              <Link to="/validate">
                {isPremium && isLoggedIn ? "Open Validator" : "Try It Free"}
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              GPT + Gemini Pro + Flash
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-warm" />
              No signup required
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cool" />
              About 20 seconds
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
