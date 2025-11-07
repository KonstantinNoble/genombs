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
        <title>Wealthconomy - AI-Powered Business Intelligence & Tools</title>
        <meta 
          name="description" 
          content="Transform your business with AI-powered insights. Get personalized tool recommendations, business analysis, and strategic guidance. Start free today - no credit card required." 
        />
        <meta name="keywords" content="AI business tools, business intelligence, AI recommendations, business analysis, productivity tools, business strategy, startup tools, business automation" />
        <link rel="canonical" href="https://wealthconomy.com/" />
      </Helmet>
      <WebPageSchema
        name="Wealthconomy - AI-Powered Business Intelligence"
        description="Transform your business with AI-powered insights. Get personalized tool recommendations, business analysis, and strategic guidance."
        url="https://wealthconomy.com/"
      />
      <Navbar />
      <main>
      <Hero />
      <div className="container mx-auto px-4 pt-8 pb-4">
        <ShopifyAffiliateBanner />
      </div>
      <Features />
      <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
