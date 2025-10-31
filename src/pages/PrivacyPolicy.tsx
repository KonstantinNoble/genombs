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
            <h2 className="text-2xl font-semibold mb-4">1. Controller & Contact</h2>
            <p className="text-muted-foreground mb-4">
              <strong>Data Controller:</strong> Muhammed Kagan Yilmaz, Aroser Allee 50, 13407 Berlin, Germany
              <br />
              Email: mail@wealthconomy.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Server Logs</h3>
            <p className="text-muted-foreground mb-4">
              When you visit our website, we collect: IP address, pages visited, browser type, date/time of access, 
              referrer URL.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(f) GDPR (legitimate interest in security and stability).
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Account Data</h3>
            <p className="text-muted-foreground mb-4">
              When you register: Email address, password (encrypted), account creation date.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (contract performance).
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 AI Analysis Data</h3>
            <p className="text-muted-foreground mb-4">
              When you use our AI features: Industry, team size, budget range, business goals/context, generated 
              recommendations, timestamps.
            </p>
            <p className="text-muted-foreground mb-4">
              Your input is processed through Lovable AI Gateway (USA) and Google AI (USA) to generate recommendations. 
              Data transfers are secured by EU-U.S. Data Privacy Framework (Art. 45 GDPR). Google does not use your 
              data to train AI models.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (contract performance).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Cookies & Local Storage</h2>
            <p className="text-muted-foreground mb-4">
              We use localStorage (not cookies) to keep you logged in. This is technically necessary and covered by 
              § 25 Abs. 2 Nr. 2 TTDSG.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Notion Idea Board:</strong> Your workspace data is stored only in your browser's localStorage and 
              never transmitted to our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Lovable AI Gateway</h3>
            <p className="text-muted-foreground mb-4">
              Operated by Lovable Labs Incorporated (USA). Routes AI requests to Google. Data Processing Agreement 
              pursuant to Art. 28 GDPR in place.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Google AI (Gemini Models)</h3>
            <p className="text-muted-foreground mb-4">
              Provider: Google LLC (USA). Certified under EU-U.S. Data Privacy Framework. Retains API data for ~30 days 
              for security, then deletes it.
            </p>
            <p className="text-muted-foreground mb-4">
              More info:{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Privacy Policy
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              Your data is stored while your account is active. When you delete your account:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Data is immediately removed from production systems</li>
              <li>Automated backups are retained temporarily for disaster recovery, then permanently deleted</li>
              <li>Email hash stored for 25 hours to prevent accidental duplicate registration</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights (GDPR)</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Correction:</strong> Correct inaccurate data</li>
              <li><strong>Deletion:</strong> Delete your account and data (via account settings or email)</li>
              <li><strong>Restriction:</strong> Limit processing under certain conditions</li>
              <li><strong>Data portability:</strong> Receive your data in a structured format</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interest</li>
              <li><strong>Complaint:</strong> Lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Contact us at mail@wealthconomy.com to exercise your rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We use encryption (SSL/TLS), password hashing, access controls, and secure backend infrastructure to 
              protect your data. Your IP address is not shared with AI providers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy and will notify you of significant changes.
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
