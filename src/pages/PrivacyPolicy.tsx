import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Data Collection</h2>
            <p className="text-muted-foreground mb-4">
              We collect information that you provide directly to us, including when you create an account, 
              make investments, or contact our support team. This may include your name, email address, 
              and financial information necessary for investment purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use of Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to provide, maintain, and improve our services, 
              process your transactions, send you technical notices and support messages, 
              and communicate with you about products, services, and events.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to protect your personal data 
              against unauthorized or unlawful processing, accidental loss, destruction, or damage. 
              All data is encrypted and stored securely.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to access, correct, or delete your personal information at any time. 
              You can also request data portability or object to certain processing activities. 
              Contact us to exercise these rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy, please contact us at privacy@investment.com
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
