import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { TrendingUp, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 animate-fade-in-up">
        <Link to="/" className="flex items-center gap-2 transition-all duration-300 hover:scale-105 group">
          <TrendingUp className="h-6 w-6 text-secondary transition-transform duration-300 group-hover:rotate-12" />
          <span className="text-xl font-bold font-serif bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Wealthconomy</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-secondary after:transition-all after:duration-300 ${
              isActive("/") 
                ? "text-primary after:w-full" 
                : "text-muted-foreground after:w-0 hover:after:w-full"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/blog" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-secondary after:transition-all after:duration-300 ${
              isActive("/blog") 
                ? "text-primary after:w-full" 
                : "text-muted-foreground after:w-0 hover:after:w-full"
            }`}
          >
            Blog
          </Link>
          <Link 
            to="/stock-analysis" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-secondary after:transition-all after:duration-300 ${
              isActive("/stock-analysis") 
                ? "text-primary after:w-full" 
                : "text-muted-foreground after:w-0 hover:after:w-full"
            }`}
          >
            AI Analysis
          </Link>
          {user ? (
            <Link to="/profile">
              <Button size="sm" className="bg-gradient-to-r from-secondary to-[hsl(38,100%,50%)] text-primary font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-to-r from-secondary to-[hsl(38,100%,50%)] text-primary font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
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
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 space-y-4 animate-fade-in">
            <Link
              to="/"
              className="block text-foreground hover:text-secondary transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/blog"
              className="block text-foreground hover:text-secondary transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/stock-analysis"
              className="block text-foreground hover:text-secondary transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              AI Analysis
            </Link>
            {user ? (
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-secondary to-[hsl(38,100%,50%)] text-primary font-semibold">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-secondary to-[hsl(38,100%,50%)] text-primary font-semibold">
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
