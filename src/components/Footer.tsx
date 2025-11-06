import { Link } from "react-router-dom";
import logo from "@/assets/synoptas-logo.png";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 overflow-hidden">
              <img 
                src={logo} 
                alt="Synoptas Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-sans font-bold text-xl text-primary">Synoptas</span>
          </div>
          
          <div className="space-y-4">
            <div className="mb-4 text-center">
              <h3 className="font-bold text-base sm:text-lg text-foreground">Legal</h3>
            </div>
            <nav className="flex flex-col space-y-3 items-center" aria-label="Legal links">
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
            © {new Date().getFullYear()} Synoptas. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
