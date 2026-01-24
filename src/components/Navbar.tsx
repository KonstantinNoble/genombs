import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, ArrowRight } from "lucide-react";

const logo = "/synoptas-favicon.png";

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  // Track scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateSession = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      await supabase.auth.signOut();
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
    }
  };

  useEffect(() => {
    if (user) {
      validateSession();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setTimeout(() => validateSession(), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [user]);

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link 
      to={to} 
      className={`text-sm font-medium transition-all duration-300 relative py-1.5 px-3 rounded-lg ${
        isActive(to) 
          ? "text-primary bg-primary/10" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {children}
    </Link>
  );
  
  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm" 
        : "bg-background/60 backdrop-blur-md border-b border-transparent"
    }`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent-cool/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-0.5 transition-all duration-300 group-hover:scale-105">
              <img 
                src={logo} 
                alt="Synoptas Logo" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
              Synoptas
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/70 -mt-0.5 tracking-wide uppercase">
              AI Validation
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/validate">Features</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          
          <div className="ml-4 pl-4 border-l border-border/50 flex items-center gap-2">
            {user ? (
              <Button
                size="sm"
                className="relative overflow-hidden group/btn"
                asChild
              >
                <Link to="/profile">
                  <span className="relative z-10">Profile</span>
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="relative overflow-hidden group/btn shadow-sm hover:shadow-md transition-shadow"
                asChild
              >
                <Link to="/auth" className="flex items-center gap-1.5">
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-1">
            <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
            <MobileNavLink to="/validate" onClick={() => setIsOpen(false)}>Features</MobileNavLink>
            <MobileNavLink to="/pricing" onClick={() => setIsOpen(false)}>Pricing</MobileNavLink>
            <MobileNavLink to="/contact" onClick={() => setIsOpen(false)}>Contact</MobileNavLink>

            {user ? (
              <>
                <MobileNavLink to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</MobileNavLink>
                <div className="pt-3 mt-3 border-t border-border/50">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                    asChild
                  >
                    <Link to="/profile">Profile</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-3 mt-3 border-t border-border/50">
                <Button
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link to="/auth">
                    Get Started
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const MobileNavLink = ({ 
  to, 
  onClick, 
  children 
}: { 
  to: string; 
  onClick: () => void; 
  children: React.ReactNode 
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`block font-medium transition-all duration-200 py-2.5 px-4 rounded-lg ${
        isActive 
          ? "text-primary bg-primary/10" 
          : "text-foreground hover:text-primary hover:bg-muted/50"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Navbar;