import { Link } from "react-router-dom";
import { Scale } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md">
              <img 
                src={logo} 
                alt="Wealthconomy Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif font-bold text-xl bg-gradient-to-r from-primary via-secondary to-primary/80 bg-clip-text text-transparent">Wealthconomy</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center shadow-sm">
                <Scale className="h-4 w-4 text-secondary" />
              </div>
              <h3 className="font-bold text-base sm:text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Legal</h3>
            </div>
            <nav className="flex flex-col space-y-3 items-center" aria-label="Legal links">
              <Link to="/about" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">
                → About
              </Link>
              <Link to="/privacy-policy" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">
                → Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">
                → Terms of Service
              </Link>
              <Link to="/imprint" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">
                → Imprint
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border/50 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} Wealthconomy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
