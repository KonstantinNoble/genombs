import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    <section className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-muted/50" />
      
      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-accent-cool/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={ref}
          className={`premium-card max-w-3xl mx-auto text-center rounded-3xl p-8 md:p-12 scroll-reveal ${isVisible ? 'revealed' : ''}`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            {isPremium && isLoggedIn ? "Your records are ready" : "Start Your First Decision Record"}
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {isPremium && isLoggedIn 
              ? "10 daily records. Full audit trails. Personal analytics dashboard. Stakeholder-ready exports."
              : "Two free records daily. No credit card required. Create your first audit trail in 20 seconds."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="btn-glow rounded-2xl px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link to="/validate">
                {isPremium && isLoggedIn ? "Open Decision Records" : "Document Your First Decision"}
              </Link>
            </Button>
            
            {isLoggedIn && (
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-8 py-6 text-lg font-medium border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link to="/dashboard" className="flex items-center gap-2">
                  View Your Analytics
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>Full audit trail</span>
            <span>No credit card needed</span>
            <span>Stakeholder-ready in 20 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;