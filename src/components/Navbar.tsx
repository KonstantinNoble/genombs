import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/external-client";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, ArrowRight } from "lucide-react";
import { TeamSwitcher } from "@/components/team/TeamSwitcher";

const logo = "/synoptas-favicon.png";

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Show team switcher on relevant pages
  const showTeamSwitcher = !!user;
  
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
      className={`text-sm font-medium transition-colors duration-200 ${
        isActive(to) 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground"
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
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo - Left */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center gap-3 pr-6 border-r border-border">
            <div className="w-9 h-9 overflow-hidden rounded-lg">
              <img 
                src={logo} 
                alt="Synoptas Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Synoptas
              </span>
              <span className="text-[10px] font-medium text-muted-foreground -mt-0.5 tracking-wide uppercase">
                AI Validation
              </span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation - Center */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-6">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/validate">Features</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          
          {user && <NavLink to="/teams">Workspaces</NavLink>}
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          
          {/* Team Switcher */}
          {showTeamSwitcher && (
            <TeamSwitcher />
          )}
        </div>
        
        {/* CTA Button - Right */}
        <div className="hidden md:flex items-center shrink-0">
          {user ? (
            <Link 
              to="/profile"
              className="bg-foreground text-background rounded-full px-5 py-2 text-sm font-medium flex items-center gap-2 group hover:bg-foreground/90 transition-all duration-200"
            >
              Profile
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link 
              to="/auth"
              className="bg-foreground text-background rounded-full px-5 py-2 text-sm font-medium flex items-center gap-2 group hover:bg-foreground/90 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
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
                <MobileNavLink to="/teams" onClick={() => setIsOpen(false)}>Workspaces</MobileNavLink>
                <MobileNavLink to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</MobileNavLink>
                
                {/* Mobile Team Switcher */}
                {showTeamSwitcher && (
                  <div className="py-2 px-4">
                    <TeamSwitcher />
                  </div>
                )}
                
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