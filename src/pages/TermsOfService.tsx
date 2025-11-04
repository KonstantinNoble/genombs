import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          ← Back to Home
        </Link>

        <div className="max-w-4xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-bold mb-2">Terms of Service (AGB)</h1>
          <p className="text-muted-foreground mb-8">Effective Date: {new Date().toLocaleDateString("de-DE")}</p>

          <div className="space-y-8">
            <section>
              <p className="text-muted-foreground mb-6">
                These Terms govern your use of synoptas. By creating an account, you agree to these Terms.
              </p>
            </section>

            {/* Section I - Scope */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">I. Geltungsbereich (Scope)</h2>

              <p className="mb-4">
                <strong>Operator:</strong> Muhammed Kagan Yilmaz, Aroser Allee 50, 13407 Berlin, Germany
                <br />
                <strong>Contact:</strong>{" "}
                <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                  mail@wealthconomy.com
                </a>
              </p>

              <p className="mb-4">
                These Terms apply to all users. You must be at least 18 years old to use our services. "Consumer" refers
                to individuals acting outside their trade or business (EU/EEA).
              </p>
            </section>

            {/* Section II - Registration */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">II. Registrierung (Registration)</h2>

              <p className="mb-4">To create an account, provide a valid email and password, then verify your email.</p>

              <p className="mb-4">You agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Provide accurate information</li>
                <li>Keep your credentials confidential</li>
                <li>Accept responsibility for account activities</li>
                <li>Notify us of unauthorized access immediately</li>
              </ul>

              <p className="mb-4">
                We reserve the right to refuse registration, particularly in cases of fraud or Terms violations.
              </p>
            </section>

            {/* Section III - Services */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">III. Leistungsumfang (Services)</h2>

              <p className="mb-4">
                We provide digital advisory tools including personalized recommendations, business analysis, and
                educational content. All users have access to website browsing and public content.
              </p>

              <div className="bg-destructive/10 border border-destructive rounded-lg p-4 my-4">
                <p className="font-bold mb-2">IMPORTANT DISCLAIMER</p>
                <p className="mb-2">
                  Our services are for <strong>informational and educational purposes only</strong>. They are NOT
                  professional advice (financial, legal, business consulting). We make no guarantees of results. You are
                  solely responsible for all business decisions and must consult qualified professionals before making
                  significant decisions.
                </p>
                <p>
                  AI outputs may be inaccurate, incomplete, or contextually inappropriate. We are not liable for
                  consequences arising from reliance on our recommendations.
                </p>
              </div>

              <p className="mb-4">
                <strong>Usage Limits:</strong> We implement fair usage limits (e.g., 2 analyses per 24 hours). Limits
                are displayed within the platform and may be adjusted with notice.
              </p>

              <p className="mb-4">
                <strong>Service Availability:</strong> We strive for reliable service but do not guarantee uninterrupted
                availability. Interruptions may occur due to maintenance, technical issues, or force majeure. We reserve
                the right to modify, suspend, or discontinue features with reasonable notice.
              </p>
            </section>

            {/* Section IV - Pricing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">IV. Preise (Pricing)</h2>

              <p className="mb-4">
                <strong>All services are currently free of charge</strong> (no subscription fees, no hidden costs, full
                access within usage limits).
              </p>

              <p className="mb-4">
                We may introduce paid features in the future. If so, you will be notified at least{" "}
                <strong>30 days in advance</strong>
                with clear pricing, and no automatic conversion to paid plans will occur without your explicit consent.
              </p>
            </section>

            {/* Section V - User Obligations */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">V. Nutzerpflichten (User Obligations)</h2>

              <p className="mb-4">
                <strong>Permitted Use:</strong> Lawful business purposes, personal research, education, and commercial
                use within our limits.
              </p>

              <p className="mb-4">
                <strong>Prohibited Activities:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Sharing account credentials or circumventing usage limits</li>
                <li>Reverse engineering or using automated scraping tools</li>
                <li>Uploading malicious code or impersonating others</li>
                <li>Illegal activities, abusing AI features, or violating third-party IP rights</li>
                <li>Unauthorized access or service disruption</li>
              </ul>

              <p className="mb-4">
                <strong>Your Content:</strong> You retain ownership of your input data. You grant us a limited license
                to process, store, and improve our services (anonymized). You are responsible for ensuring your inputs
                don't violate third-party rights.
              </p>

              <p className="mb-4">
                <strong>Enforcement:</strong> We may warn, temporarily suspend (7-30 days), or permanently terminate
                accounts for Terms violations. Serious violations result in immediate termination. You may appeal via
                mail@wealthconomy.com.
              </p>
            </section>

            {/* Section VI - Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VI. Haftung (Liability and Warranty)</h2>

              <p className="mb-4">
                <strong>Service Warranty:</strong> Services are provided "AS IS" and "AS AVAILABLE". We do not warrant
                error-free operation, accuracy of AI outputs, or that the platform meets your specific requirements. We
                disclaim all implied warranties.
              </p>

              <p className="mb-4">
                <strong>Unlimited Liability:</strong> We remain fully liable for intentional misconduct (Vorsatz), gross
                negligence (grobe Fahrlässigkeit), personal injury, violations of essential contractual obligations, and
                mandatory statutory liability.
              </p>

              <p className="mb-4">
                <strong>Limited Liability:</strong> For simple negligence regarding non-essential obligations, liability
                is limited to foreseeable, typical damages. We are not liable for indirect damages, loss of profits, or
                special damages unless arising from breach of essential obligations.
              </p>

              <p className="mb-4">
                <strong>Excluded Liability:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Business decisions or investments based on AI recommendations</li>
                <li>Lost profits, revenue, or business opportunities</li>
                <li>Data loss if backups were not maintained before account deletion</li>
                <li>Third-party services, affiliate links, force majeure events</li>
                <li>Unauthorized account access due to poor credential security</li>
                <li>Punitive or non-compensatory damages</li>
              </ul>

              <p className="mb-4">
                <strong>Your Obligation:</strong> You must independently verify AI recommendations, consult qualified
                professionals (lawyers, accountants, consultants) before making decisions, conduct due diligence, and
                notify us immediately of errors. Failure to do so may constitute contributory negligence.
              </p>

              <p className="mb-4">
                <strong>Indemnification:</strong> You agree to indemnify us from claims arising from your violation of
                these Terms, misuse of recommendations, or violation of third-party rights.
              </p>
            </section>

            {/* Section VII - Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VII. Kündigung (Termination)</h2>

              <p className="mb-4">
                Your contract continues indefinitely with no minimum commitment. You may terminate anytime via your
                Profile page ("Delete Account" button) or by emailing mail@wealthconomy.com. Termination is immediate.
              </p>

              <p className="mb-4">
                <strong>Account Deletion & Data:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Profile, analysis history, and credit tracking data are permanently deleted</li>
                <li>Local device data must be cleared manually via browser settings</li>
                <li>
                  <strong>Email Hash:</strong> A SHA-256 hash of your email is stored for <strong>24 hours</strong>{" "}
                  (GDPR Art. 6(1)(f)) to prevent abuse, then permanently deleted
                </li>
                <li>
                  <strong>Backups:</strong> Deleted data may remain in encrypted backups for a technically determined
                  period. Export important data before deletion.
                </li>
              </ul>

              <p className="mb-4">
                <strong>Our Termination Rights:</strong> We may terminate for cause (immediate) if you violate Terms, or
                without cause (30 days' notice).
              </p>

              <p className="mb-4">
                <strong>Effects:</strong> Upon termination, you lose account access, all personal data is deleted per
                GDPR Art. 17 (except legal retention obligations for paid services, if applicable), and
                liability/governing law provisions survive termination.
              </p>
            </section>

            {/* Section VIII - Right of Withdrawal */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VIII. Widerrufsrecht (Right of Withdrawal)</h2>

              <p className="mb-4">
                <strong>For EU/EEA Consumers Only:</strong> You have the right to withdraw from this contract within{" "}
                <strong>14 days</strong>
                from registration without giving a reason.
              </p>

              <p className="mb-4">
                To withdraw, send a clear statement to{" "}
                <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                  mail@wealthconomy.com
                </a>
                or Muhammed Kagan Yilmaz, Aroser Allee 50, 13407 Berlin, Germany before the 14-day period expires.
              </p>

              <div className="bg-muted/30 border border-border rounded-lg p-4 my-4 font-mono text-sm">
                <p className="font-semibold mb-2">Model Withdrawal Form</p>
                <p className="mb-2">
                  To: Muhammed Kagan Yilmaz, Aroser Allee 50, 13407 Berlin, Germany
                  <br />
                  Email: mail@wealthconomy.com
                </p>
                <p className="mb-2">
                  I/We (*) hereby withdraw from my/our (*) contract for Wealthconomy Platform Services.
                </p>
                <p className="mb-2">
                  Registered on: _______________
                  <br />
                  Email: _______________
                  <br />
                  Date: _______________
                </p>
                <p className="text-xs italic">(*) Delete as appropriate</p>
              </div>

              <p className="mb-4">
                <strong>Effects:</strong> If you withdraw, we reimburse all payments (currently free), delete your
                account, and terminate access. Using services during the withdrawal period does not eliminate your right
                (services not fully performed within 14 days).
              </p>

              <p className="mb-4">
                <strong>Exceptions:</strong> Right of withdrawal does not apply to fully performed services (with prior
                consent and acknowledgment) or business users.
              </p>
            </section>

            {/* Section IX - Final Provisions */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">IX. Schlussbestimmungen (Final Provisions)</h2>

              <p className="mb-4">
                <strong>Governing Law:</strong> German law applies (Federal Republic of Germany). For consumers,
                mandatory consumer protection laws of your habitual residence remain applicable. CISG is excluded.
                Jurisdiction: Berlin for business users; statutory jurisdiction for consumers.
              </p>

              <p className="mb-4">
                <strong>Dispute Resolution:</strong> Contact us at mail@wealthconomy.com before legal proceedings. EU
                consumers may use the ODR platform:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>

              <p className="mb-4">
                <strong>Amendments:</strong> We may modify these Terms only with justifiable reason (legal changes,
                technical improvements, new features, security). Notification via email <strong>6 weeks before</strong>{" "}
                changes take effect. You may object or terminate without penalty within 6 weeks. Non-objection =
                acceptance. Material changes require explicit consent.
              </p>

              <p className="mb-4">
                <strong>Severability:</strong> If any provision is invalid, remaining provisions stay in effect. Invalid
                provisions replaced by valid ones reflecting original intent.
              </p>

              <p className="mb-4">
                <strong>Entire Agreement:</strong> These Terms, together with our{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                and
                <Link to="/imprint" className="text-primary hover:underline ml-1">
                  Imprint
                </Link>
                , constitute the entire agreement. No verbal side agreements exist.
              </p>

              <p className="mb-4">
                <strong>Assignment:</strong> You may not assign these Terms. We may assign to affiliates or successors
                (30 days' notice if material impact).
              </p>

              <p className="mb-4">
                <strong>Contact:</strong> Muhammed Kagan Yilmaz, Aroser Allee 50, 13407 Berlin, Germany |{" "}
                <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                  mail@wealthconomy.com
                </a>
              </p>
            </section>

            {/* Final Statement */}
            <section className="bg-muted/30 border border-border rounded-lg p-6 mt-8">
              <h3 className="text-xl font-semibold mb-4">Acknowledgment</h3>
              <p className="mb-4">By creating an account and using the Wealthconomy platform, you acknowledge that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You have read and understood these Terms of Service in their entirety</li>
                <li>You agree to be legally bound by these Terms</li>
                <li>You understand that AI recommendations are informational only and not professional advice</li>
                <li>You accept the limitations of liability and warranty disclaimers</li>
                <li>You have had the opportunity to seek independent legal advice before agreeing to these Terms</li>
              </ul>
              <p className="mt-6 font-semibold">
                If you do not agree with any part of these Terms, please do not use our services.
              </p>
            </section>

            <div className="text-center mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString("de-DE")}
                <br />
                Version 1.0
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
