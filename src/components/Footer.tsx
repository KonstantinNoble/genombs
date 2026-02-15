import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-background safe-bottom">
      {/* Top border line */}
      <div className="absolute inset-x-0 top-0 h-px bg-border" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-lg mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mb-10">
            <span className="font-sans font-bold text-2xl text-foreground">Synvertas</span>
          </div>
          
          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide text-center sm:text-left">Legal</h3>
              <nav className="flex flex-col space-y-3 items-center sm:items-start" aria-label="Legal links">
                <Link 
                  to="/privacy-policy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-[44px] flex items-center"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/terms-of-service" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-[44px] flex items-center"
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/imprint" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-[44px] flex items-center"
                >
                  Imprint
                </Link>
              </nav>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide text-center sm:text-left">Business</h3>
              <nav className="flex flex-col space-y-3 items-center sm:items-start" aria-label="Business links">
                <Link 
                  to="/pricing" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-[44px] flex items-center"
                >
                  Pricing
                </Link>
                <Link 
                  to="/contact" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-[44px] flex items-center"
                >
                  Contact
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Divider */}
          <div className="w-full h-px bg-border mb-8" />
          
          {/* Bottom section */}
          <div className="flex flex-col items-center">
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} Synvertas. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
