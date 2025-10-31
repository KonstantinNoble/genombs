import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> January 31, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Service Provider & Scope</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Provider:</strong> Muhammed Kagan Yilmaz, Aroser Allee 50, 13407 Berlin, Germany
                <br />
                Email: mail@wealthconomy.com
              </p>
              <p className="text-muted-foreground mb-4">
                These Terms govern your use of Wealthconomy.com and its AI-powered business analysis services. By creating 
                an account or using our services, you agree to these Terms. You must be at least 18 years old.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Registration & Account</h2>
              <p className="text-muted-foreground mb-4">
                To use our AI features, you must register with a valid email address and password (minimum 8 characters). 
                You must confirm your email address to activate your account. You are responsible for keeping your login 
                credentials confidential.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Services & Limitations</h2>
              <p className="text-muted-foreground mb-4">
                We provide AI-powered business tool recommendations and business idea suggestions based on your input. 
                Our services are currently <strong>free of charge</strong>.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Usage Limits:</strong> You can perform 2 analyses per 25-hour period (combined across all features).
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Important Disclaimer:</strong> Our AI recommendations are for informational purposes only and do 
                NOT constitute professional business or legal advice. Results may vary. We make no guarantees regarding 
                the effectiveness of recommended tools or strategies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Your Obligations</h2>
              <ul className="text-muted-foreground mb-4 list-disc pl-6">
                <li>Provide accurate information during registration and use</li>
                <li>Do not misuse or attempt to circumvent usage limits</li>
                <li>Do not use our services for illegal purposes</li>
                <li>Do not attempt to reverse-engineer or exploit our AI systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Liability</h2>
              <p className="text-muted-foreground mb-4">
                We provide our services "as is" without warranties. We are liable for damages caused by intent or gross 
                negligence. For slight negligence, liability is limited to foreseeable, typical damages. This does not 
                affect mandatory liability (e.g., for personal injury).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Termination & Account Deletion</h2>
              <p className="text-muted-foreground mb-4">
                You may delete your account at any time through your account settings. Upon deletion, your data is 
                immediately removed from our production systems. Copies in automated backups are retained temporarily 
                for disaster recovery, then permanently deleted.
              </p>
              <p className="text-muted-foreground mb-4">
                We may terminate accounts that violate these Terms with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Right of Withdrawal (EU Consumers)</h2>
              <p className="text-muted-foreground mb-4">
                As a consumer in the EU, you have a 14-day right of withdrawal starting from the date you confirm your 
                email address during registration. To exercise this right, send an email to mail@wealthconomy.com or 
                delete your account within this period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We may update these Terms with reasonable notice. Continued use of our services after changes take effect 
                constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
              <p className="text-muted-foreground mb-4">
                These Terms are governed by German law. For consumers, mandatory consumer protection laws of your country 
                of residence may apply.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact & Support</h2>
              <p className="text-muted-foreground mb-4">
                For questions or support, contact us at: mail@wealthconomy.com
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
