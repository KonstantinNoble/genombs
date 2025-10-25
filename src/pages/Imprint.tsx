import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const Imprint = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <article className="max-w-4xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-bold mb-8">Imprint</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
            <p className="text-muted-foreground mb-2">Investment Platform Inc.</p>
            <p className="text-muted-foreground mb-2">123 Finance Street</p>
            <p className="text-muted-foreground mb-2">New York, NY 10001</p>
            <p className="text-muted-foreground mb-2">United States</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground mb-2">Email: info@investment.com</p>
            <p className="text-muted-foreground mb-2">Phone: +1 (555) 123-4567</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Regulatory Information</h2>
            <p className="text-muted-foreground mb-4">
              Investment Platform Inc. is registered with the Securities and Exchange Commission (SEC) 
              under registration number SEC-12345.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Responsible for Content</h2>
            <p className="text-muted-foreground mb-2">John Smith, CEO</p>
            <p className="text-muted-foreground mb-2">Investment Platform Inc.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
            <p className="text-muted-foreground mb-4">
              The European Commission provides a platform for online dispute resolution (ODR): 
              https://ec.europa.eu/consumers/odr/. We are not obligated to participate in dispute 
              resolution procedures before consumer arbitration boards, but are generally willing to do so.
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
};

export default Imprint;
