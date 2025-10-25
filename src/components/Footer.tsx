import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">About</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted investment platform for growing your wealth through intelligent stock investing.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/imprint" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Imprint
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Wealthconomy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
