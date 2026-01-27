import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/external-client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import PainPoints from "@/components/home/PainPoints";
import WhySynoptas from "@/components/home/WhySynoptas";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import Pricing from "@/components/home/Pricing";
import FAQ from "@/components/home/FAQ";
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
        title="Document Decisions Before You Commit"
        description="Document your decision process with multiple AI perspectives. Auditable, exportable, stakeholder-ready. For founders, investors, and regulated teams."
        keywords="decision documentation, audit trail, due diligence, compliance, decision records, liability protection"
        canonical="/"
        ogImage="https://synoptas.com/synoptas-favicon.png"
      />
      <OrganizationSchema
        name="Synoptas"
        url="https://synoptas.com"
        logo="https://synoptas.com/synoptas-favicon.png"
        description="Decision documentation platform for founders, investors, and regulated teams"
      />
      <WebPageSchema
        name="Synoptas – Document Your Decision Process"
        description="Create auditable decision records with multiple AI perspectives. Stakeholder-ready documentation for important decisions."
        url="https://synoptas.com/"
      />
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <WhySynoptas />
        <HowItWorks />
        <Features />
        
        {(!isLoggedIn || !isPremium) && (
          <div id="pricing-section">
            <Pricing />
          </div>
        )}
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
