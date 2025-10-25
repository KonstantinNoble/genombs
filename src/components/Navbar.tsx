import { Link, useLocation } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <TrendingUp className="h-6 w-6 text-secondary" />
          <span className="text-xl font-bold font-serif">Wealthconomy</span>
        </Link>
        
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/blog" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/blog") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Blog
          </Link>
          <Button size="sm" className="bg-gradient-to-r from-secondary to-[hsl(36,100%,50%)] text-primary font-semibold hover:opacity-90 transition-opacity">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
