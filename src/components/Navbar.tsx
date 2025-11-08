import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const validateSession = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      await supabase.auth.signOut();
      setUser(null);
      return;
    }

    // Check if profile still exists (GDPR deletion safety)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.log('Profile deleted - invalidating session');
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      await validateSession();
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        setTimeout(() => validateSession(), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 animate-fade-in-up">
        <Link to="/" className="flex items-center gap-3 transition-all duration-300 hover:scale-105 group">
          <div className="relative w-10 h-10 overflow-hidden transition-all duration-300 group-hover:rotate-12">
            <img 
              src={logo} 
              alt="Wealthconomy Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold font-sans text-primary">Wealthconomy</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 ${
              isActive("/") 
                ? "text-primary after:w-full" 
                : "text-muted-foreground after:w-0 hover:after:w-full hover:text-foreground"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/business-tools"
            className={`text-sm font-semibold transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 ${
              isActive("/business-tools") 
                ? "text-primary after:w-full" 
                : "text-muted-foreground after:w-0 hover:after:w-full hover:text-foreground"
            }`}
          >
            AI Services
          </Link>
          <Link 
            to="/notion-idea" 
            className={`text-sm font-semibold transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 ${
              isActive("/notion-idea") 
                ? "text-primary after:w-full" 
                : "text-muted-foreground after:w-0 hover:after:w-full hover:text-foreground"
            }`}
          >
            Notion Idea
          </Link>
          <Link 
            to="/blog" 
            className={`text-sm font-semibold transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 ${
              isActive("/blog") 
                ? "text-primary after:w-full" 
                : "text-muted-foreground after:w-0 hover:after:w-full hover:text-foreground"
            }`}
          >
            Blog
          </Link>
          {user ? (
            <Button
              size="sm"
              asChild
            >
              <Link to="/profile">Profile</Link>
            </Button>
          ) : (
            <Button
              size="sm"
              asChild
            >
              <Link to="/pricing">Get Premium</Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3 animate-fade-in">
            <Link
              to="/"
              className="block text-foreground font-semibold hover:text-primary hover:bg-primary/5 transition-all duration-300 py-2 px-3 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/business-tools"
              className="block text-foreground font-semibold hover:text-primary hover:bg-primary/5 transition-all duration-300 py-2 px-3 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              AI Services
            </Link>
            <Link
              to="/notion-idea"
              className="block text-foreground font-semibold hover:text-primary hover:bg-primary/5 transition-all duration-300 py-2 px-3 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Notion Idea
            </Link>
            <Link
              to="/blog"
              className="block text-foreground font-semibold hover:text-primary hover:bg-primary/5 transition-all duration-300 py-2 px-3 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            {user ? (
              <Button
                size="sm"
                className="w-full"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link to="/profile">Profile</Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="w-full"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link to="/pricing">Get Premium</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
