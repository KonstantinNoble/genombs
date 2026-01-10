import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { WebPageSchema } from "@/components/seo/StructuredData";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Contact Us"
        description="Get in touch with Synoptas. We're here to help with your AI-powered business strategy needs."
        keywords="contact, support, Synoptas, business strategy, help"
        canonical="/contact"
      />
      <WebPageSchema
        name="Contact Us | Synoptas"
        description="Get in touch with Synoptas for AI-powered business strategy support."
        url="https://synoptas.com/contact"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Questions, feedback, or business inquiries – we're here to help.
          </p>
          
          <Card className="p-8 md:p-12 border-border bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              
              <div>
                <p className="text-muted-foreground mb-2">Email us at</p>
                <a 
                  href="mailto:mail@wealthconomy.com"
                  className="text-2xl md:text-3xl font-semibold text-primary hover:underline transition-all duration-300"
                >
                  mail@wealthconomy.com
                </a>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                We typically respond within 24-48 hours.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
