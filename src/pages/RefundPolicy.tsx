import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const RefundPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Refund Policy | Wealthconomy</title>
        <meta 
          name="description" 
          content="Wealthconomy refund policy and right of withdrawal for digital services. Learn about our 14-day withdrawal right and refund process." 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            
            <h1 className="text-4xl font-bold mb-2 text-foreground">Refund Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <article className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Right of Withdrawal</h2>
              <p className="text-foreground/80 leading-relaxed">
                As a consumer in the European Union, you have the right to withdraw from this contract within 14 days without giving any reason.
              </p>
              <p className="text-foreground/80 leading-relaxed mt-4">
                The withdrawal period will expire after 14 days from the day of the conclusion of the contract.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Digital Services</h2>
              <p className="text-foreground/80 leading-relaxed">
                By using our AI-powered business intelligence service, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                <li>The service is delivered immediately upon registration</li>
                <li>For paid services, you expressly agree to waive your right of withdrawal for immediate access to digital content</li>
                <li>Used credits and AI analyses cannot be refunded once consumed</li>
                <li>Access to the service begins immediately after account activation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Free Service</h2>
              <p className="text-foreground/80 leading-relaxed">
                Our current service is provided free of charge with usage limits (2 AI analyses per day). As no payment is required, no refunds are applicable for the free service tier.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Future Paid Services</h2>
              <p className="text-foreground/80 leading-relaxed">
                Should we introduce paid plans in the future:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                <li>Refund requests must be submitted within 14 days of purchase</li>
                <li>Refunds will only be processed for unused credits/services</li>
                <li>The refund process will be initiated within 14 business days of approval</li>
                <li>Refunds will be issued to the original payment method</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. How to Request a Refund</h2>
              <p className="text-foreground/80 leading-relaxed">
                To request a refund (when applicable for future paid services), please:
              </p>
              <ol className="list-decimal pl-6 mt-4 space-y-2 text-foreground/80">
                <li>Send an email to: support@wealthconomy.com</li>
                <li>Include your account email and order/transaction ID</li>
                <li>Provide a brief reason for your refund request</li>
                <li>Allow up to 14 business days for processing</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Exceptions</h2>
              <p className="text-foreground/80 leading-relaxed">
                The following are not eligible for refunds:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                <li>AI analyses that have already been generated and delivered</li>
                <li>Credits that have been used or consumed</li>
                <li>Services accessed after the 14-day withdrawal period</li>
                <li>Accounts suspended or terminated due to Terms of Service violations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Contact Information</h2>
              <p className="text-foreground/80 leading-relaxed">
                For questions regarding refunds or our refund policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-foreground/80">
                  <strong>Email:</strong> support@wealthconomy.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Changes to This Policy</h2>
              <p className="text-foreground/80 leading-relaxed">
                We reserve the right to update this Refund Policy at any time. Changes will be effective immediately upon posting to this page. We encourage you to review this policy periodically for any updates.
              </p>
            </section>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default RefundPolicy;
