import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex items-center justify-center">
            <span className="font-sans font-bold text-2xl text-primary">Synoptas</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-base sm:text-lg text-foreground text-center sm:text-left">Resources</h3>
              <nav className="flex flex-col space-y-3 items-center sm:items-start" aria-label="Resource links">
                <Link to="/how-to-write-a-business-plan" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">
                  → How to Write a Business Plan
                </Link>
                <Link to="/business-strategies-for-small-business" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">
                  → Business Strategies for Small Business
                </Link>
                <Link to="/market-research" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">
                  → AI Market Research
                </Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-base sm:text-lg text-foreground text-center sm:text-left">Legal</h3>
              <nav className="flex flex-col space-y-3 items-center sm:items-start" aria-label="Legal links">
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
            
            <div className="space-y-4">
              <h3 className="font-bold text-base sm:text-lg text-foreground text-center sm:text-left">Business</h3>
              <nav className="flex flex-col space-y-3 items-center sm:items-start" aria-label="Business links">
                <Link to="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">
                  → Business Inquiries
                </Link>
              </nav>
            </div>
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
