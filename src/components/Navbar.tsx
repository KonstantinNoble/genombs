import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/external-client";
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
    window.addEventListener('scroll', handleScroll, { passive: true });
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

  // Handle swipe to close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    (e.currentTarget as HTMLElement).dataset.touchStartX = String(touch.clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const startX = Number((e.currentTarget as HTMLElement).dataset.touchStartX || 0);
    const diffX = touch.clientX - startX;
    
    // If swiped right by more than 100px, close menu
    if (diffX > 100) {
      setIsOpen(false);
    }
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

  // Desktop NavLink with green hover and click animation
  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link 
      to={to} 
      className={`relative text-base font-medium transition-all duration-200 py-1.5 group active:scale-95 ${
        isActive(to) 
          ? "text-primary" 
          : "text-muted-foreground hover:text-primary"
      }`}
    >
      {children}
      {/* Green underline effect */}
      <span 
        className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
          isActive(to) ? "w-full" : "w-0 group-hover:w-full"
        }`} 
      />
    </Link>
  );
  
  return (
    <>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 pt-4 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm pt-0" 
          : "bg-background/60 backdrop-blur-md border-b border-transparent"
      }`}>
        <div className="container mx-auto flex h-18 items-center px-4">
          {/* Logo - Left */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2.5 pr-6 border-r border-border">
              <div className="w-10 h-10 overflow-hidden rounded-lg">
                <img 
                  src={logo} 
                  alt="Synoptas Logo" 
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  Synoptas
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-7">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/pricing">Pricing</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
          
          {/* CTA Button - Right */}
          <div className="hidden md:flex items-center shrink-0">
            {user ? (
              <Link 
                to="/profile"
                className="bg-foreground text-background rounded-full px-5 py-2 text-sm font-medium flex items-center gap-2 group hover:bg-foreground/90 hover:scale-105 hover:shadow-lg transition-all duration-200 min-h-[44px]"
              >
                Profile
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <Link 
                to="/auth"
                className="bg-foreground text-background rounded-full px-5 py-2 text-sm font-medium flex items-center gap-2 group hover:bg-foreground/90 hover:scale-105 hover:shadow-lg transition-all duration-200 min-h-[44px]"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-auto p-3 rounded-xl text-foreground hover:bg-muted/50 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Fullscreen Overlay Menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] md:hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/98 backdrop-blur-xl animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="relative h-full flex flex-col safe-bottom">
            {/* Close Button - Top Right */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-xl text-foreground hover:bg-muted/50 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
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
            </div>
            
            {/* Separator */}
            <div className="w-24 h-px bg-border mx-auto mb-8" />
            
            {/* Navigation Links - Centered */}
            <div className="flex-1 flex flex-col items-center justify-start gap-2 px-8">
              <MobileNavLink to="/" onClick={() => setIsOpen(false)} delay={0}>
                Home
              </MobileNavLink>
              <MobileNavLink to="/pricing" onClick={() => setIsOpen(false)} delay={user ? 3 : 1}>
                Pricing
              </MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setIsOpen(false)} delay={user ? 3 : 2}>
                Contact
              </MobileNavLink>
            </div>
            
            {/* Separator */}
            <div className="w-24 h-px bg-border mx-auto my-6" />
            
            {/* CTA Button - Bottom */}
            <div className="px-6 pb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {user ? (
                <Link 
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-foreground text-background rounded-2xl py-4 text-lg font-medium flex items-center justify-center gap-2 group hover:bg-foreground/90 transition-all duration-200 min-h-[56px]"
                >
                  Profile
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link 
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-foreground text-background rounded-2xl py-4 text-lg font-medium flex items-center justify-center gap-2 group hover:bg-foreground/90 transition-all duration-200 min-h-[56px]"
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
      className={`text-2xl font-medium py-4 px-6 rounded-xl transition-all duration-200 animate-fade-in min-h-[56px] flex items-center justify-center ${
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
