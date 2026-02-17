import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { WebPageSchema } from "@/components/seo/StructuredData";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Contact – We're Happy to Help"
        description="Got a question? Running into something? Drop us a line. We usually reply within a day."
        keywords="contact, support, help, feedback"
        canonical="/contact"
      />
      <WebPageSchema
        name="Contact | Synvertas"
        description="Questions or feedback? We're here to help."
        url="https://synvertas.com/contact"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Questions, feedback, or business inquiries — we're here to help.
          </p>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">Email us at</p>
            <a 
              href="mailto:mail@wealthconomy.com"
              className="text-2xl md:text-3xl font-semibold text-primary hover:underline transition-all duration-300 block"
            >
              mail@wealthconomy.com
            </a>
            <p className="text-sm text-muted-foreground mt-6">
              We typically respond within 24–48 hours.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
