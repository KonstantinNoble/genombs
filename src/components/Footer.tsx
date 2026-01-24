import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-background">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-lg mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mb-10">
            <span className="font-sans font-bold text-2xl text-foreground">Synoptas</span>
          </div>
          
          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide text-center sm:text-left">Legal</h3>
              <nav className="flex flex-col space-y-3 items-center sm:items-start" aria-label="Legal links">
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Terms of Service
                </Link>
                <Link to="/imprint" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Imprint
                </Link>
              </nav>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide text-center sm:text-left">Business</h3>
              <nav className="flex flex-col space-y-3 items-center sm:items-start" aria-label="Business links">
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Business Inquiries
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/80 to-transparent mb-8" />
          
          {/* Bottom section */}
          <div className="flex flex-col items-center gap-5">
            <a 
              href="https://x.com/Synoptas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-foreground transition-colors duration-300"
              aria-label="Follow us on X"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 fill-current"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} Synoptas. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
