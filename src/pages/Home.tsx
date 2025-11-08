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
    // Handle magic link login from Whop Premium purchase
    const handleMagicLinkLogin = async () => {
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'magiclink') {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Check if user is premium
            const { data: userCredit } = await supabase
              .from('user_credits')
              .select('is_premium')
              .eq('user_id', session.user.id)
              .single();

            if (userCredit?.is_premium) {
              // Clean up URL first
              window.history.replaceState({}, document.title, window.location.pathname);
              
              // Check if password setup is required
              const passwordSetupRequired = session.user.user_metadata?.password_setup_required;
              
              if (passwordSetupRequired) {
                toast({
                  title: "Welcome Premium Member! ✨",
                  description: "Please set up your password to complete registration.",
                });
                
                setTimeout(() => {
                  navigate('/setup-password');
                }, 1500);
              } else {
                toast({
                  title: "Welcome Premium Member! ✨",
                  description: "You now have unlimited AI analyses. Let's get started!",
                });
                
                setTimeout(() => {
                  navigate('/business-tools');
                }, 2000);
              }
            } else {
              // Regular user login via magic link
              toast({
                title: "Welcome back!",
                description: "You're now logged in.",
              });
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        }
      }
    };

    handleMagicLinkLogin();
  }, [toast, navigate]);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Wealthconomy - AI Website Advisor | Tool Recommendations & Business Ideas for Websites</title>
        <meta 
          name="description" 
          content="Optimize your website with AI-powered tool recommendations and profitable business ideas. Screenshot analysis, website-specific strategies. Start free!" 
        />
        <meta name="keywords" content="AI Website Advisor, Website Tools, Website Business Ideas, Website Optimization, AI Website Analysis, Website Screenshot Analysis, Website Monetization, E-Commerce Tools, Blog Tools" />
        <link rel="canonical" href="https://wealthconomy.com/" />
      </Helmet>
      <WebPageSchema
        name="Wealthconomy - AI Website Advisor"
        description="Optimize your website with AI-powered tool recommendations and profitable business ideas. Screenshot analysis for website-specific strategies."
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
