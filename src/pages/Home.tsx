import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Pricing from "@/components/home/Pricing";
import CTA from "@/components/home/CTA";
import Footer from "@/components/Footer";
import { WebPageSchema } from "@/components/seo/StructuredData";


const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

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

    const checkPremiumStatus = async () => {
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

    handleEmailVerification();
    checkPremiumStatus();
    
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
  }, [toast, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Helmet>
        <title>Synoptas - AI Website Advisor | Tool Recommendations & Business Ideas for Websites</title>
        <meta 
          name="description" 
          content="Optimize your website with AI-powered tool recommendations and profitable business ideas. Screenshot analysis, website-specific strategies. Start free!" 
        />
        <meta name="keywords" content="AI Website Advisor, Website Tools, Website Business Ideas, Website Optimization, AI Website Analysis, Website Screenshot Analysis, Website Monetization, E-Commerce Tools, Blog Tools" />
        <link rel="canonical" href="https://synoptas.com/" />
      </Helmet>
      <WebPageSchema
        name="Synoptas - AI Website Advisor"
        description="Optimize your website with AI-powered tool recommendations and profitable business ideas. Screenshot analysis for website-specific strategies."
        url="https://synoptas.com/"
      />
      <Navbar />
      <main>
        <Hero />
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
