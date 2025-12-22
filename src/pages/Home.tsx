import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import ProductShowcase from "@/components/home/ProductShowcase";
import PainPoints from "@/components/home/PainPoints";
import WhySynoptas from "@/components/home/WhySynoptas";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import Pricing from "@/components/home/Pricing";
import CTA from "@/components/home/CTA";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { WebPageSchema, OrganizationSchema } from "@/components/seo/StructuredData";
import { useAuth } from "@/contexts/AuthContext";


const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const isLoggedIn = !!user;

  useEffect(() => {
    // Handle email verification redirect
    const handleEmailVerification = async () => {
      // Check if there's a hash fragment (email verification)
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        
        if (type === 'signup') {
          // Check if user is now logged in after verification
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Frontend fallback: Ensure profile and credits exist
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', session.user.id)
              .single();
            
            if (!profile) {
              console.log('Creating missing profile for user:', session.user.id);
              
              // Create profile
              await supabase.from('profiles').insert({
                id: session.user.id,
                email: session.user.email
              });
              
              // Create user credits
              await supabase.from('user_credits').insert({
                user_id: session.user.id
              });
            }
            
            toast({
              title: "Email verified!",
              description: "Your account has been activated. Welcome!",
            });
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    };

    handleEmailVerification();
  }, [toast, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEOHead
        title="AI Business Strategy Planner"
        description="Turn your business goals into actionable AI-powered strategies. Get personalized plans with real-time market research from 10-20+ sources. Free daily analyses!"
        keywords="AI business strategy, business planner, AI strategy generator, market research AI, business goals, actionable strategies, website analysis"
        canonical="/"
        ogImage="https://synoptas.com/favicon.png"
      />
      <OrganizationSchema
        name="Synoptas"
        url="https://synoptas.com"
        logo="https://synoptas.com/favicon.png"
        description="AI-powered business strategy planner with real-time market research"
      />
      <WebPageSchema
        name="Synoptas - AI Business Strategy Planner"
        description="Turn your business goals into actionable AI-powered strategies with real-time market research."
        url="https://synoptas.com/"
      />
      <Navbar />
      <main>
        <Hero />
        <ProductShowcase />
        <PainPoints />
        <WhySynoptas />
        <HowItWorks />
        <Features />
        
        {(!isLoggedIn || !isPremium) && (
          <div id="pricing-section">
            <Pricing />
          </div>
        )}
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
