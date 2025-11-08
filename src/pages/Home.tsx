import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CTA from "@/components/home/CTA";

import Footer from "@/components/Footer";
import { WebPageSchema } from "@/components/seo/StructuredData";

const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
    <div className="min-h-screen">
      <Helmet>
        <title>Wealthconomy - AI Website Advisor | Tool-Empfehlungen & Geschäftsideen für Websites</title>
        <meta 
          name="description" 
          content="Optimiere deine Website mit KI-gestützten Tool-Empfehlungen und profitablen Geschäftsideen. Screenshot-Analyse, Website-spezifische Strategien. Kostenlos starten!" 
        />
        <meta name="keywords" content="AI Website Advisor, Website Tools, Website Geschäftsideen, Website Optimierung, KI Website Analyse, Website Screenshot Analyse, Website Monetarisierung, E-Commerce Tools, Blog Tools" />
        <link rel="canonical" href="https://wealthconomy.com/" />
      </Helmet>
      <WebPageSchema
        name="Wealthconomy - AI Website Advisor"
        description="Optimiere deine Website mit KI-gestützten Tool-Empfehlungen und profitablen Geschäftsideen. Screenshot-Analyse für Website-spezifische Strategien."
        url="https://wealthconomy.com/"
      />
      <Navbar />
      <main>
      <Hero />
      <Features />
      <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
