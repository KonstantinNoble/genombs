import { Link, useLocation } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 animate-fade-in-up">
        <Link to="/" className="flex items-center gap-2 transition-all duration-300 hover:scale-105 group">
          <TrendingUp className="h-6 w-6 text-secondary transition-transform duration-300 group-hover:rotate-12" />
          <span className="text-xl font-bold font-serif bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Wealthconomy</span>
        </Link>
        
        <div className="flex items-center gap-8">
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
          <Button size="sm" className="bg-gradient-to-r from-secondary to-[hsl(38,100%,50%)] text-primary font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
