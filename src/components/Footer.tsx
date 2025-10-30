import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">About</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Your trusted AI-powered platform for transforming your business through intelligent insights and recommendations.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Legal</h3>
            <nav className="flex flex-col space-y-2" aria-label="Legal links">
              <Link to="/privacy-policy" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/imprint" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Imprint
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} Wealthconomy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
