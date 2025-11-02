import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import logo from "@/assets/logo.jpg";

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
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 animate-fade-in-up">
        <Link to="/" className="flex items-center gap-3 transition-all duration-300 hover:scale-105 group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
            <img 
              src={logo} 
              alt="Wealthconomy Logo" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <span className="text-xl font-bold font-serif bg-gradient-to-r from-primary via-secondary to-primary/80 bg-clip-text text-transparent">Wealthconomy</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-300 ${
              isActive("/") 
                ? "text-primary after:w-full shadow-sm" 
                : "text-muted-foreground after:w-0 hover:after:w-full hover:text-foreground"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/business-tools"
            className={`text-sm font-semibold transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-300 ${
              isActive("/business-tools") 
                ? "text-primary after:w-full shadow-sm" 
                : "text-muted-foreground after:w-0 hover:after:w-full hover:text-foreground"
            }`}
          >
            Business AI
          </Link>
          <Link 
            to="/notion-idea" 
            className={`text-sm font-semibold transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-300 ${
              isActive("/notion-idea") 
                ? "text-primary after:w-full shadow-sm" 
                : "text-muted-foreground after:w-0 hover:after:w-full hover:text-foreground"
            }`}
          >
            Notion Idea
          </Link>
          <Link 
            to="/blog" 
            className={`text-sm font-semibold transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-300 ${
              isActive("/blog") 
                ? "text-primary after:w-full shadow-sm" 
                : "text-muted-foreground after:w-0 hover:after:w-full hover:text-foreground"
            }`}
          >
            Blog
          </Link>
          {user ? (
            <Link to="/profile">
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-elegant hover:shadow-hover hover:scale-105 transition-all duration-300">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-to-r from-secondary to-secondary/80 text-primary font-semibold shadow-elegant hover:shadow-hover hover:scale-105 transition-all duration-300">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm shadow-lg">
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
              Business AI
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
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-elegant hover:shadow-hover transition-all duration-300">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-secondary to-secondary/80 text-primary font-semibold shadow-elegant hover:shadow-hover transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
