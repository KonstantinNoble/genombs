import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  // Desktop NavLink with underline hover effect
  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link 
      to={to} 
      className={`relative text-base font-medium transition-colors duration-200 py-1 group ${
        isActive(to) 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {/* Underline effect */}
      <span 
        className={`absolute bottom-0 left-0 h-0.5 bg-foreground transition-all duration-300 ${
          isActive(to) ? "w-full" : "w-0 group-hover:w-full"
        }`} 
      />
    </Link>
  );
  
  return (
    <>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm" 
          : "bg-background/60 backdrop-blur-md border-b border-transparent"
      }`}>
        <div className="container mx-auto flex h-20 items-center px-4">
          {/* Logo - Left */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-3 pr-8 border-r border-border">
              <div className="w-11 h-11 overflow-hidden rounded-xl">
                <img 
                  src={logo} 
                  alt="Synoptas Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold tracking-tight text-foreground">
                  Synoptas
                </span>
                <span className="text-xs font-medium text-muted-foreground -mt-0.5 tracking-wide uppercase">
                  AI Validation
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-8">
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
                className="bg-foreground text-background rounded-full px-6 py-2.5 text-base font-medium flex items-center gap-2 group hover:bg-foreground/90 hover:scale-105 hover:shadow-lg transition-all duration-200"
              >
                Profile
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <Link 
                to="/auth"
                className="bg-foreground text-background rounded-full px-6 py-2.5 text-base font-medium flex items-center gap-2 group hover:bg-foreground/90 hover:scale-105 hover:shadow-lg transition-all duration-200"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-auto p-2.5 rounded-xl text-foreground hover:bg-muted/50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Fullscreen Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/98 backdrop-blur-xl animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="relative h-full flex flex-col">
            {/* Close Button - Top Right */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-xl text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            {/* Logo - Centered */}
            <div className="flex flex-col items-center pt-4 pb-8 animate-fade-in">
              <div className="w-16 h-16 overflow-hidden rounded-2xl mb-3">
                <img 
                  src={logo} 
                  alt="Synoptas Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                Synoptas
              </span>
              <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                AI Validation
              </span>
            </div>
            
            {/* Separator */}
            <div className="w-24 h-px bg-border mx-auto mb-8" />
            
            {/* Navigation Links - Centered */}
            <div className="flex-1 flex flex-col items-center justify-start gap-2 px-8">
              <MobileNavLink to="/" onClick={() => setIsOpen(false)} delay={0}>
                Home
              </MobileNavLink>
              <MobileNavLink to="/validate" onClick={() => setIsOpen(false)} delay={1}>
                Features
              </MobileNavLink>
              <MobileNavLink to="/pricing" onClick={() => setIsOpen(false)} delay={2}>
                Pricing
              </MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setIsOpen(false)} delay={3}>
                Contact
              </MobileNavLink>

              {user && (
                <>
                  <MobileNavLink to="/teams" onClick={() => setIsOpen(false)} delay={4}>
                    Workspaces
                  </MobileNavLink>
                  <MobileNavLink to="/dashboard" onClick={() => setIsOpen(false)} delay={5}>
                    Dashboard
                  </MobileNavLink>
                </>
              )}
              
              {/* Team Switcher for mobile */}
              {showTeamSwitcher && (
                <div className="mt-4 w-full max-w-xs animate-fade-in" style={{ animationDelay: '150ms' }}>
                  <TeamSwitcher />
                </div>
              )}
            </div>
            
            {/* Separator */}
            <div className="w-24 h-px bg-border mx-auto my-6" />
            
            {/* CTA Button - Bottom */}
            <div className="px-6 pb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {user ? (
                <Link 
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-foreground text-background rounded-2xl py-4 text-lg font-medium flex items-center justify-center gap-2 group hover:bg-foreground/90 transition-all duration-200"
                >
                  Profile
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link 
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-foreground text-background rounded-2xl py-4 text-lg font-medium flex items-center justify-center gap-2 group hover:bg-foreground/90 transition-all duration-200"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Mobile NavLink with staggered animation
const MobileNavLink = ({ 
  to, 
  onClick, 
  children,
  delay = 0
}: { 
  to: string; 
  onClick: () => void; 
  children: React.ReactNode;
  delay?: number;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`text-2xl font-medium py-3 px-6 rounded-xl transition-all duration-200 animate-fade-in ${
        isActive 
          ? "text-foreground bg-muted/50" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      }`}
      style={{ animationDelay: `${delay * 50}ms` }}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Navbar;
