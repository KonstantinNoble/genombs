import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/external-client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { WebPageSchema, OrganizationSchema } from "@/components/seo/StructuredData";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  useEffect(() => {
    const handleEmailVerification = async () => {
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        
        if (type === 'signup') {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', session.user.id)
              .single();
            
            if (!profile) {
              await supabase.from('profiles').insert({
                id: session.user.id,
              });
              
              await supabase.from('user_credits').insert({
                user_id: session.user.id
              });
            }
            
            toast({
              title: "Email verified!",
              description: "Your account has been activated. Welcome!",
            });
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    };

    handleEmailVerification();
  }, [toast, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <SEOHead
        title="Synoptas"
        description="Synoptas – Coming soon. A smarter way to make decisions."
        keywords="synoptas, decision making, AI"
        canonical="/"
        ogImage="https://synoptas.com/synoptas-favicon.png"
      />
      <OrganizationSchema
        name="Synoptas"
        url="https://synoptas.com"
        logo="https://synoptas.com/synoptas-favicon.png"
        description="Synoptas – Coming soon."
      />
      <WebPageSchema
        name="Synoptas"
        description="Synoptas – Coming soon. A smarter way to make decisions."
        url="https://synoptas.com/"
      />
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-24 text-center space-y-8 max-w-2xl">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground leading-tight">
            Something new is coming
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            We're building something exciting. Stay tuned.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isLoggedIn ? (
              <Button size="lg" asChild>
                <Link to="/profile">
                  Go to Profile
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
