import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/external-client";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ArrowRight } from "lucide-react";

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
    <section className="py-24 sm:py-28 md:py-36 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-muted/40 pointer-events-none" />
      
      {/* Elegant background orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle at center, hsl(142 76% 36% / 0.3), transparent 60%)',
          filter: 'blur(80px)'
        }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-15 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle at center, hsl(220 76% 55% / 0.25), transparent 60%)',
          filter: 'blur(80px)'
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={ref}
          className={`premium-card premium-glow max-w-3xl mx-auto text-center rounded-3xl p-10 md:p-14 scroll-reveal ${isVisible ? 'revealed' : ''}`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5">
            {isPremium && isLoggedIn ? "Your analyses are ready" : "Get Your First Analysis"}
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {isPremium && isLoggedIn 
              ? "10 daily analyses. Consensus & dissent scores. Personal analytics. PDF exports on demand."
              : "Two free analyses daily. No credit card required. Results in 60 seconds."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              size="lg"
              className="btn-glow rounded-2xl px-10 py-7 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              asChild
            >
              <Link to="/validate">
                {isPremium && isLoggedIn ? "Open Your Analyses" : "Start Free Analysis"}
              </Link>
            </Button>
            
            {isLoggedIn && (
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-10 py-7 text-lg font-medium border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-500 hover:-translate-y-1"
                asChild
              >
                <Link to="/dashboard" className="flex items-center gap-2">
                  View Your Analytics
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground/80">
            <span>Consensus & Dissent Scores</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>No credit card needed</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>Results in 60 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;