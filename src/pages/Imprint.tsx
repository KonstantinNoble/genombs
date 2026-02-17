import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const Imprint = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            ← Back to Home
          </Button>
        </Link>

        <article className="max-w-4xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-semibold mb-8">Imprint</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information according to § 5 TMG</h2>
            <p className="text-muted-foreground mb-2">Muhammed Kagan Yilmaz</p>
            <p className="text-muted-foreground mb-2">Aroser Allee 50</p>
            <p className="text-muted-foreground mb-2">13407 Berlin</p>
            <p className="text-muted-foreground mb-2">Germany</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground mb-2">Email: mail@wealthconomy.com</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">VAT Information</h2>
            <p className="text-muted-foreground mb-2">
              Small business according to § 19 UStG (German VAT Act) - No VAT ID required
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Responsible for Content</h2>
            <p className="text-muted-foreground mb-2">Muhammed Kagan Yilmaz</p>
            <p className="text-muted-foreground mb-2">Aroser Allee 50, 13407 Berlin, Germany</p>
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
