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
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Effective Date: November 12, 2025</p>

          <div className="space-y-8">
            <section>
              <p className="text-muted-foreground mb-6">
                These Terms govern your use of Synoptas. By creating an account, you agree to these Terms.
              </p>
            </section>

            {/* Section I - Scope */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">I. Scope</h2>

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

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-4">
                <p className="font-semibold mb-2">⚡ Important Notice for Premium Subscriptions</p>
                <p className="mb-2">
                  For paid Premium subscriptions, <strong>Freemius, Inc.</strong> (351 King Street East, Suite 600, Toronto, ON M5A 0L6, Canada) acts as the <strong>Merchant of Record (MoR)</strong>.
                </p>
                <p className="mb-2">
                  This means: All purchase contracts for Premium features are concluded <strong>directly between you and Freemius</strong> – not with Synoptas/Muhammed Kagan Yilmaz.
                </p>
                <p>
                  For payment transactions, Freemius's terms additionally apply:{" "}
                  <a href="https://freemius.com/terms/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                    https://freemius.com/terms/
                  </a>
                </p>
              </div>
            </section>

            {/* Section II - Registration */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">II. Registration</h2>

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

              <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Linking Premium Purchases</h3>
              <p className="mb-4">
                If you purchase a Premium subscription <strong>before</strong> creating an account, you must register with the <strong>same email address</strong> used during the Freemius checkout. This is required for proper Premium status assignment.
              </p>
              <p className="mb-4">
                For issues with Premium linking, contact{" "}
                <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                  mail@wealthconomy.com
                </a>
              </p>
            </section>

            {/* Section III - Services */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">III. Services</h2>

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
                <strong>Usage Limits:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li><strong>Free Plan:</strong> 2 Standard Analyses per 24 hours (Deep Analysis not available)</li>
                <li><strong>Premium Plan:</strong> 6 Standard Analyses + 2 Deep Analyses per 24 hours</li>
              </ul>
              <p className="mb-4">
                Limits are subject to change – current values are displayed within the app. You will be notified of limit changes.
              </p>

              <p className="mb-4">
                <strong>Service Availability:</strong> We strive for reliable service but do not guarantee uninterrupted
                availability. Interruptions may occur due to maintenance, technical issues, or force majeure. We reserve
                the right to modify, suspend, or discontinue features with reasonable notice.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">III.A Premium Services</h3>

              <p className="mb-4">
                Premium users receive enhanced features:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>6 Standard Analyses per 24 hours (vs. 2 in Free Plan) - Business Tools Advisor, Business Ideas Advisor</li>
                <li>2 Deep Analyses per 24 hours (advanced AI-powered evaluations, not available in Free Plan)</li>
                <li>Future Premium-exclusive features (announced upon introduction)</li>
              </ul>

              <p className="mb-4">
                <strong>Feature Changes:</strong> We reserve the right to adjust, expand, or limit Premium features. Significant changes will be announced <strong>30 days in advance</strong> via email.
              </p>

              <p className="mb-4">
                <strong>Availability:</strong> Premium features are subject to the same availability clauses as free services (see above). We do not guarantee 100% uptime but strive for maximum reliability.
              </p>
            </section>

            {/* Section IV - Pricing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">IV. Pricing and Payment Terms</h2>
              
              <h3 className="text-xl font-semibold mb-3">4.1 Free Services</h3>
              <p className="mb-4">
                Basic features are available at no cost:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Website browsing and public content</li>
                <li>2 Standard Analyses per 24 hours</li>
                <li>Deep Analysis feature requires Premium subscription</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Premium Subscriptions</h3>
              
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 my-4">
                <p className="font-semibold mb-2">🔐 Important: Payment Processing by Freemius</p>
                <p>
                  Premium subscriptions are sold and processed by <strong>Freemius, Inc.</strong> as Merchant of Record (MoR). The purchase contract for Premium features is concluded between <strong>you and Freemius</strong> – NOT with Synoptas/Muhammed Kagan Yilmaz.
                </p>
              </div>
              
              <p className="mb-4">
                <strong>Premium Features:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>6 Standard Analyses per 24 hours (vs. 2 in Free Plan)</li>
                <li>2 Deep Analyses per 24 hours (not available in Free Plan)</li>
                <li>Advanced AI-powered evaluations with detailed implementation steps, ROI projections, and risk assessments</li>
                <li>Future Premium-exclusive features</li>
              </ul>
              
              <p className="mb-4">
                <strong>Payment Processing:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>All payments are processed by <strong>Freemius</strong> (credit card, PayPal, etc.)</li>
                <li>Freemius's payment terms apply: <a href="https://freemius.com/terms/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://freemius.com/terms/</a></li>
                <li>Prices are displayed during checkout (including VAT where applicable)</li>
                <li>Subscriptions renew automatically (monthly or annually depending on your choice)</li>
                <li>Invoices are sent by Freemius via email</li>
              </ul>
              
              <p className="mb-4">
                <strong>Price Changes:</strong> Freemius may adjust prices for future billing periods. You will be notified at least <strong>30 days in advance</strong> via email and may cancel before the price increase takes effect.
              </p>
              
              <p className="mb-4">
                <strong>Taxes:</strong> All prices are exclusive of applicable VAT/sales tax. Freemius automatically calculates the correct tax based on your location.
              </p>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Subscription Management and Billing</h3>
              
              <p className="mb-4">
                <strong>Activation:</strong> Premium features are activated within minutes after successful payment. For issues, contact mail@wealthconomy.com.
              </p>
              
              <p className="mb-4">
                <strong>Recurring Billing:</strong> Your subscription automatically renews at the end of each billing period (monthly/annually) until you cancel. Freemius automatically charges your payment method on file.
              </p>
              
              <p className="mb-4">
                <strong>Canceling Subscription:</strong> You can cancel your Premium subscription anytime through Freemius:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Via your Freemius customer account (link in purchase email)</li>
                <li>By email to Freemius support: <a href="https://freemius.com/contact/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://freemius.com/contact/</a></li>
              </ul>
              <p className="mb-4">
                After cancellation, your Premium access ends at the <strong>end of the paid period</strong>. No pro-rated refunds are provided unless legally required (see Right of Withdrawal).
              </p>
              
              <p className="mb-4">
                <strong>Failed Payments:</strong> If payment fails (e.g., expired credit card), Freemius will contact you via email. If payment is not corrected within 7 days, your Premium access will be deactivated (downgraded to Free Plan).
              </p>
              
              <p className="mb-4">
                <strong>Refunds:</strong> All refund requests (outside the Right of Withdrawal) must be directed to Freemius. Freemius decides on discretionary refunds according to their own policies.
              </p>
            </section>

            {/* Section V - User Obligations */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">V. User Obligations</h2>

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
              <h2 className="text-2xl font-semibold mb-4">VI. Liability and Warranty</h2>

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

              <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Liability for Third-Party Payment Processing</h3>
              <p className="mb-4">
                For all aspects of payment processing, invoicing, refunds, and data privacy regarding Premium subscriptions, <strong>Freemius, Inc.</strong> is responsible as Merchant of Record.
              </p>
              <p className="mb-4">
                <strong>We (Synoptas/Muhammed Kagan Yilmaz) are NOT liable for:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Payment errors, failed transactions, or billing issues</li>
                <li>Disputes regarding invoices, refunds, or cancellations</li>
                <li>Data privacy violations by Freemius's payment system</li>
                <li>Credit card fees or currency conversion costs</li>
                <li>Delays in Premium activation due to Freemius system errors</li>
              </ul>
              <p className="mb-4">
                All payment-related complaints must be directed to Freemius:{" "}
                <a href="https://freemius.com/contact/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  https://freemius.com/contact/
                </a>
              </p>
            </section>

            {/* Section VII - Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VII. Termination</h2>

              <p className="mb-4">
                Your contract to use the <strong>free platform</strong> continues indefinitely with no minimum commitment. You may terminate your <strong>Synoptas account</strong> anytime:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Via your Profile page ("Delete Account" button)</li>
                <li>By email to <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">mail@wealthconomy.com</a></li>
              </ul>
              <p className="mb-4">
                Termination is <strong>immediate</strong> – your account and all data are permanently deleted.
              </p>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 my-4">
                <p className="font-bold mb-2">⚠️ IMPORTANT for Premium Subscribers</p>
                <p className="mb-2">
                  Deleting your <strong>Synoptas account</strong> does <strong>NOT automatically cancel</strong> your <strong>Premium subscription with Freemius</strong>!
                </p>
                <p className="mb-2">
                  You must <strong>separately cancel your subscription through Freemius</strong> to stop future payments:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Via your Freemius customer account (link in purchase email)</li>
                  <li>By email to Freemius: <a href="https://freemius.com/contact/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://freemius.com/contact/</a></li>
                </ul>
                <p className="mt-2">
                  <strong>Otherwise, your subscription will continue and you will continue to be charged</strong> – even if you no longer have a Synoptas account!
                </p>
              </div>

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

              <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Effects of Termination on Premium Features</h3>
              <p className="mb-4">
                <strong>When deleting your Synoptas account:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You <strong>immediately</strong> lose access to all account features (free + Premium)</li>
                <li>Your Freemius subscription continues and continues to be charged</li>
                <li>You must separately cancel the subscription with Freemius</li>
                <li>Refunds for already paid fees are excluded (except statutory right of withdrawal)</li>
              </ul>

              <p className="mb-4">
                <strong>When canceling your Premium subscription (through Freemius):</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Your Synoptas account remains active (free features still usable)</li>
                <li>Premium access ends at the <strong>end of the paid period</strong></li>
                <li>Downgrade to Free Plan (2 Standard + 1 Deep Analysis per 24h)</li>
                <li>No pro-rated refund for unused Premium period</li>
              </ul>
            </section>

            {/* Section VIII - Right of Withdrawal */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VIII. Right of Withdrawal</h2>
              
              <h3 className="text-xl font-semibold mb-3">8.1 Right of Withdrawal for Free Services</h3>
              <p className="mb-4">
                Since basic platform usage is free of charge, there is no statutory right of withdrawal in the sense of distance selling law. However, you may cancel your account anytime according to Section VII.
              </p>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Right of Withdrawal for Premium Subscriptions (EU/EEA Consumers)</h3>
              
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 my-4">
                <p className="font-bold mb-2">🔐 Important: Right of Withdrawal Lies with Freemius</p>
                <p>
                  The statutory right of withdrawal for Premium purchases lies with <strong>Freemius, Inc.</strong> as Merchant of Record – <strong>NOT with Synoptas/Muhammed Kagan Yilmaz</strong>.
                </p>
              </div>
              
              <p className="mb-4">
                As an EU/EEA consumer, you have a <strong>14-day right of withdrawal</strong> from the purchase date for Premium subscriptions.
              </p>
              
              <p className="mb-4">
                <strong>How to exercise your right of withdrawal:</strong>
              </p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Send a clear statement to <strong>Freemius, Inc.</strong> (not to Synoptas)</li>
                <li>Use the Freemius contact form: <a href="https://freemius.com/contact/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://freemius.com/contact/</a></li>
                <li>Or send an email directly to Freemius support</li>
                <li>Include your <strong>order number</strong> and <strong>email address</strong></li>
              </ol>
              
              <div className="bg-muted/30 border border-border rounded-lg p-4 my-4 font-mono text-sm">
                <p className="font-semibold mb-2">Model Withdrawal Form</p>
                <p className="mb-2">
                  To: Freemius, Inc., 351 King Street East, Suite 600, Toronto, ON M5A 0L6, Canada
                  <br />
                  Contact: <a href="https://freemius.com/contact/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://freemius.com/contact/</a>
                </p>
                <p className="mb-2">
                  I/We (*) hereby withdraw from my/our (*) contract for the Premium subscription for Synoptas.
                </p>
                <p className="mb-2">
                  Ordered on: _______________
                  <br />
                  Order number: _______________
                  <br />
                  Email: _______________
                  <br />
                  Date: _______________
                </p>
                <p className="text-xs italic">(*) Delete as appropriate</p>
              </div>
              
              <p className="mb-4">
                <strong>Effects of withdrawal:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Freemius refunds all received payments within <strong>14 days</strong></li>
                <li>Your Premium access is terminated (downgraded to Free Plan)</li>
                <li>Your Synoptas account remains active (free features still usable)</li>
              </ul>
              
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 my-4">
                <p className="font-bold mb-2">⚠️ Loss of Right of Withdrawal</p>
                <p className="mb-2">
                  For digital content (Premium features), the right of withdrawal expires once you begin using the service <strong>AND</strong> expressly agree that you lose your right of withdrawal.
                </p>
                <p>
                  This is clearly communicated in the Freemius checkout process ("I agree that the service begins immediately and I lose my right of withdrawal").
                </p>
              </div>
              
              <p className="mb-4">
                <strong>Does not apply to:</strong> Business customers (B2B)
              </p>
            </section>

            {/* Section IX - Final Provisions */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">IX. Final Provisions</h2>

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

              <h3 className="text-xl font-semibold mb-3 mt-6">IX.A Dispute Resolution for Payment Issues</h3>

              <p className="mb-4">
                <strong>Distinction by topic area:</strong>
              </p>

              <div className="bg-muted/30 border border-border rounded-lg p-4 my-4">
                <p className="font-semibold mb-3">💳 Payment, Billing, and Refund Issues</p>
                <p className="mb-2">
                  Contact <strong>Freemius</strong>:{" "}
                  <a href="https://freemius.com/contact/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://freemius.com/contact/
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  (Examples: Incorrect billing, missing refund, credit card problems, invoice corrections)
                </p>
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4 my-4">
                <p className="font-semibold mb-3">🛠️ Service Quality, Features, Technical Issues</p>
                <p className="mb-2">
                  Contact <strong>us (Synoptas)</strong>:{" "}
                  <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                    mail@wealthconomy.com
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  (Examples: Premium features not working, analysis errors, account problems, privacy concerns)
                </p>
              </div>

              <p className="mb-4">
                EU consumers may also use the EU ODR platform for <strong>payment disputes</strong>:{" "}
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
              <p className="mb-4">By creating an account and using the Synoptas platform, you acknowledge that:</p>
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
                Last updated: November 12, 2025
                <br />
                Version 2.0 (Premium Update)
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
