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
          <p className="text-muted-foreground mb-8">Effective Date: December 21, 2025 | Version 2.7</p>

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
                  For paid Premium subscriptions, <strong>Freemius, Inc.</strong> (251 Little Falls Drive, Wilmington,
                  Delaware 19808, USA) acts as the <strong>Merchant of Record (MoR)</strong>.
                </p>
                <p className="mb-2">
                  This means: All purchase contracts for Premium features are concluded{" "}
                  <strong>directly between you and Freemius</strong> – not with Synoptas/Muhammed Kagan Yilmaz.
                </p>
                <p>
                  For payment transactions, Freemius's own terms and conditions apply, which you accept during the
                  checkout process.
                </p>
              </div>
            </section>
            {/* Section II - Registration */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">II. Registration</h2>

              <p className="mb-4">
                To create an account, sign in with your Google account. Google OAuth handles authentication securely
                through Google's infrastructure.
              </p>

              <p className="mb-4">You agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Provide accurate information through your Google account</li>
                <li>Maintain the security of your Google account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access or security concerns</li>
              </ul>

              <p className="mb-4">
                We reserve the right to refuse registration, particularly in cases of fraud or Terms violations.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Linking Premium Purchases</h3>
              <p className="mb-4">
                If you purchase a Premium subscription <strong>before</strong> creating an account, you must register
                with the <strong>same email address</strong> used during the Freemius checkout. This is required for
                proper Premium status assignment.
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
                We provide AI-powered digital advisory tools that deliver personalized recommendations, strategic analysis, 
                and educational content based on your stated business context and objectives. All users have access to 
                website browsing and public content.
              </p>

              <div className="bg-destructive/10 border border-destructive rounded-lg p-4 my-4">
                <p className="font-bold mb-2">IMPORTANT DISCLAIMER</p>
                <p className="mb-2">
                  Our services are for <strong>informational and educational purposes only</strong>. They are NOT
                  professional advice (financial, legal, business consulting, advertising consulting). We make no guarantees 
                  of results. You are solely responsible for all business decisions and must consult qualified professionals 
                  before making significant decisions.
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
                <li>
                  <strong>Free Plan:</strong> Access to basic AI analysis features with daily usage limits
                </li>
                <li>
                  <strong>Premium Plan:</strong> Enhanced analysis capabilities with increased daily usage limits and access to advanced features
                </li>
              </ul>
              <p className="mb-4">
                Current usage limits and available features are always displayed within your account dashboard and on our{" "}
                <Link to="/pricing" className="text-primary hover:underline">Pricing page</Link>. 
                We reserve the right to adjust these limits with reasonable notice.
              </p>

              <p className="mb-4">
                <strong>Service Availability:</strong> We strive for reliable service but do not guarantee uninterrupted
                availability. Interruptions may occur due to maintenance, technical issues, or force majeure. We reserve
                the right to modify, suspend, or discontinue features with reasonable notice.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">III.A Premium Services</h3>

              <p className="mb-4">Premium users receive enhanced features:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Increased usage quotas for AI-powered analysis features</li>
                <li>Access to advanced analysis modes not available in the Free Plan</li>
                <li>Priority access to new features and capabilities</li>
                <li>Additional Premium-exclusive features as they become available</li>
              </ul>
              <p className="mb-4 text-sm text-muted-foreground">
                Current Premium features and limits are displayed in your account dashboard and during checkout.
              </p>

              <p className="mb-4">
                <strong>Feature Changes:</strong> We reserve the right to adjust, expand, or limit Premium features.
                Significant changes will be announced <strong>30 days in advance</strong> via email.
              </p>

              <p className="mb-4">
                <strong>Availability:</strong> Premium features are subject to the same availability clauses as free
                services (see above). We do not guarantee 100% uptime but strive for maximum reliability.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">III.B Dynamic Service Information</h3>
              <p className="mb-4">
                The specific features, usage limits, and capabilities of our services may be updated from time to time 
                to improve the platform and respond to user needs. Current information is always available:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li><strong>Usage limits:</strong> Displayed in your account dashboard</li>
                <li><strong>Available features:</strong> Shown on our <Link to="/pricing" className="text-primary hover:underline">Pricing page</Link> and within the application</li>
                <li><strong>Premium benefits:</strong> Detailed during checkout and in your account settings</li>
              </ul>
              <p className="mb-4">
                Material changes to Premium features or significant reductions in usage limits will be announced 
                <strong> 30 days in advance</strong> via email to affected users.
              </p>
            </section>
            {/* Section IV - Pricing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">IV. Pricing and Payment Terms</h2>

              <h3 className="text-xl font-semibold mb-3">4.1 Free Services</h3>
              <p className="mb-4">Basic features are available at no cost:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Website browsing and public content</li>
                <li>AI analysis features with daily usage limits (see account dashboard for current limits)</li>
                <li>Certain advanced features require a Premium subscription</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Premium Subscriptions</h3>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 my-4">
                <p className="font-semibold mb-2">🔐 Important: Payment Processing by Freemius</p>
                <p>
                  Premium subscriptions are sold and processed by <strong>Freemius, Inc.</strong> as Merchant of Record
                  (MoR). The purchase contract for Premium features is concluded between{" "}
                  <strong>you and Freemius</strong> – NOT with Synoptas/Muhammed Kagan Yilmaz.
                </p>
              </div>

              <p className="mb-4">
                <strong>Premium Features:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Enhanced analysis capabilities with higher usage quotas</li>
                <li>Access to advanced AI features not available in the Free Plan</li>
                <li>Comprehensive insights, detailed recommendations, and advanced strategic analysis capabilities</li>
                <li>Additional Premium-exclusive features as they become available</li>
              </ul>
              <p className="mb-4 text-sm text-muted-foreground">
                Current features and limits are displayed during checkout and in your account dashboard.
              </p>

              <p className="mb-4">
                <strong>Payment Processing:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  All payments are processed by <strong>Freemius</strong> (credit card, PayPal, etc.)
                </li>
                <li>Freemius's payment terms apply (accepted during checkout)</li>
                <li>Prices are displayed during checkout (including VAT where applicable)</li>
                <li>Subscriptions renew automatically </li>
                <li>Invoices are sent by Freemius via email</li>
              </ul>

              <p className="mb-4">
                <strong>Price Changes:</strong> Freemius may adjust prices for future billing periods. You will be
                notified at least <strong>30 days in advance</strong> via email and may cancel before the price increase
                takes effect.
              </p>

              <p className="mb-4">
                <strong>Taxes:</strong> All prices are exclusive of applicable VAT/sales tax. Freemius automatically
                calculates the correct tax based on your location.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Subscription Management and Billing</h3>

              <p className="mb-4">
                <strong>Activation:</strong> Premium features are activated within minutes after successful payment. For
                issues, contact mail@wealthconomy.com.
              </p>

              <p className="mb-4">
                <strong>Recurring Billing:</strong> Your subscription automatically renews at the end of each billing
                period (monthly/annually) until you cancel. Freemius automatically charges your payment method on file.
              </p>

              <p className="mb-4">
                <strong>Canceling Subscription:</strong> You can cancel your Premium subscription anytime through
                Freemius:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Via your Freemius customer account (access link provided in your purchase confirmation email)</li>
                <li>By contacting Freemius support through their customer portal</li>
              </ul>
              <p className="mb-4">
                After cancellation, your Premium access ends at the <strong>end of the paid period</strong>. No
                pro-rated refunds are provided unless legally required (see Right of Withdrawal).
              </p>

              <p className="mb-4">
                <strong>Failed Payments:</strong> If payment fails (e.g., expired credit card), Freemius will contact
                you via email.
              </p>

              <p className="mb-4">
                <strong>Refunds:</strong> Refund requests (outside the Right of Withdrawal) should be directed to{" "}
                <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                  mail@wealthconomy.com
                </a>
                . We (Synoptas/Muhammed Kagan Yilmaz) will review your request and decide whether a refund is appropriate 
                based on the circumstances. If approved, Freemius will execute the technical refund on our behalf. 
                Refunds are generally not provided for partially used subscription periods unless legally required or 
                exceptional circumstances apply.
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
            {/* Section V.A - Community Content */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">V.A Community Content (Business Ideas & Comments)</h2>

              <p className="mb-4">
                Our platform offers a Business Ideas Community where registered users can share business ideas, 
                provide feedback through ratings, and engage in discussions through comments and replies.
              </p>

              <div className="bg-destructive/10 border border-destructive rounded-lg p-4 my-4">
                <p className="font-bold mb-2">⚠️ PUBLIC VISIBILITY</p>
                <p>
                  <strong>All business ideas, comments, and replies you post are publicly visible</strong> to all users, including 
                  non-registered visitors. Your display name will be shown alongside your content. Do NOT share 
                  confidential information, trade secrets, or personal data.
                </p>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Business Ideas</h3>
              <p className="mb-4">
                <strong>Your Content Rights:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You retain all intellectual property rights to your posted ideas</li>
                <li>By posting, you grant us a non-exclusive, worldwide, royalty-free license to display and distribute your content on our platform</li>
                <li>You may delete your ideas at any time, which terminates this license</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Comments and Replies</h3>
              <p className="mb-4">
                Registered users can post comments on business ideas and reply to other comments. Comments support 
                nested discussions up to <strong>3 levels deep</strong>. All comments and replies are publicly visible.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You may delete your own comments and replies at any time</li>
                <li>When you delete a comment, all nested replies to that comment are also removed</li>
                <li>Comments on deleted ideas are automatically removed</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Usage Limits</h3>
              <p className="mb-4">
                To maintain quality discussions and prevent spam, the following rate limits apply:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li><strong>Business Ideas:</strong> 1 idea per 24 hours per user</li>
                <li><strong>Comments and Replies:</strong> 1 comment or reply per 10 hours per user</li>
              </ul>

              <p className="mb-4">
                <strong>Prohibited Content:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Spam, excessive self-promotion, or commercial advertisements</li>
                <li>Illegal, fraudulent, or misleading content</li>
                <li>Offensive, discriminatory, or hateful content</li>
                <li>Copyright-infringing material or third-party intellectual property violations</li>
                <li>Personal data of third parties without their consent</li>
                <li>Malicious links or phishing attempts</li>
              </ul>

              <p className="mb-4">
                <strong>URL Requirements:</strong> Website URLs must begin with <code className="bg-muted px-1 rounded">https://</code> and 
                not exceed 100 characters. Invalid URLs will be rejected.
              </p>

              <p className="mb-4">
                <strong>Rating Guidelines:</strong> Ratings should be fair, constructive, and based on the quality 
                and viability of the idea. Manipulation of ratings (fake accounts, coordinated voting) is prohibited.
              </p>

              <p className="mb-4">
                <strong>Moderation Rights:</strong> We reserve the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Remove any content (ideas, comments, replies) that violates these Terms without prior notice</li>
                <li>Warn, suspend, or terminate accounts that repeatedly violate community guidelines</li>
                <li>Modify or remove content that poses legal risks</li>
                <li>Delete comments and replies to maintain discussion coherence when parent content is removed</li>
              </ul>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 my-4">
                <p className="font-semibold mb-2">📋 Disclaimer for User-Generated Content</p>
                <p className="mb-3">
                  Business ideas, comments, and discussions shared by users represent their personal opinions and are not endorsed, verified, 
                  or guaranteed by Synoptas. We are not responsible for the accuracy, legality, or viability of 
                  user-generated content. Always conduct your own due diligence before acting on any ideas.
                </p>
                <p className="mb-3">
                  <strong>Platform Liability:</strong> As a platform operator, we are not obligated to proactively monitor 
                  user-generated content for potential legal violations. Pursuant to applicable hosting provider liability rules 
                  (particularly § 10 TMG / Art. 6 DSA), we only become responsible for unlawful content once we gain actual 
                  knowledge thereof and fail to remove it promptly.
                </p>
                <p>
                  <strong>Reporting Violations:</strong> If you encounter content that violates these Terms or applicable law, 
                  please report it to{" "}
                  <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                    mail@wealthconomy.com
                  </a>
                  . We will review the reported content and take appropriate action, including removal if warranted.
                </p>
              </div>
            </section>
            {/* Section VI - Liability */}
            {/* Section VI - Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VI. Liability and Warranty</h2>

              <p className="mb-4">
                <strong>Service Warranty:</strong> Services are provided "AS IS" and "AS AVAILABLE". We do not warrant
                error-free operation, accuracy of AI outputs, or that the platform meets your specific requirements. We
                disclaim all implied warranties.
              </p>

              {/* Start of revised legal clauses */}
              <h3 className="text-xl font-semibold mb-3">Liability Limits (Applicable Law: German Law)</h3>

              <p className="mb-4">
                <strong>Unlimited Liability:</strong> We shall be fully liable without limitation for damages resulting
                from <strong>intent (Vorsatz)</strong>, <strong>gross negligence (grobe Fahrlässigkeit)</strong>, injury
                to <strong>life, body or health</strong>, or in case of mandatory statutory liability (e.g., Product
                Liability Act).
              </p>

              <p className="mb-4">
                <strong>Limited Liability (Simple Negligence):</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  <strong>Breach of Essential Obligations (Kardinalpflichten):</strong> In case of a slightly negligent
                  breach of an <strong>essential contractual obligation</strong> (an obligation whose fulfillment is
                  essential for the proper execution of the contract and on whose compliance the user regularly relies
                  and is entitled to rely), our liability shall be limited to the amount of the{" "}
                  <strong>foreseeable, typical damage</strong> for this type of contract.
                </li>
                <li>
                  <strong>Breach of Non-Essential Obligations:</strong> Any other liability for damages caused by simple
                  negligence is **excluded**.
                </li>
              </ul>
              {/* End of revised legal clauses */}

              <p className="mb-4">
                <strong>Excluded Damages:</strong> We are not liable for indirect damages, consequential damages, loss
                of profits, loss of revenue, or special damages, unless these result from intent, gross negligence, or a
                breach of life, body, or health.
              </p>

              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Business decisions or investments based on AI recommendations</li>
                <li>Lost profits, revenue, or business opportunities (subject to the general limitation above)</li>
                <li>Data loss if backups were not maintained before account deletion</li>
                <li>Third-party services, external links, force majeure events</li>
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

              <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Customer Support and Payment Processing</h3>
              <p className="mb-4">
                <strong>Primary Contact for All Issues:</strong> For any questions, complaints, or support requests 
                (including payment-related matters), please contact us first at{" "}
                <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                  mail@wealthconomy.com
                </a>
                . We are your primary contact for customer support.
              </p>
              <p className="mb-4">
                <strong>Payment Processing:</strong> While <strong>Freemius, Inc.</strong> handles the technical 
                payment processing as Merchant of Record, we (Synoptas/Muhammed Kagan Yilmaz) remain responsible 
                for customer support, refund decisions, and resolving disputes.
              </p>
              <p className="mb-4">
                <strong>We (Synoptas/Muhammed Kagan Yilmaz) are NOT liable for:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Technical payment processing errors caused by Freemius's systems</li>
                <li>Data privacy violations by Freemius's payment infrastructure</li>
                <li>Credit card fees or currency conversion costs charged by payment providers</li>
                <li>Delays in payment processing due to third-party banking systems</li>
              </ul>
              <p className="mb-4">
                <strong>Note:</strong> Only technical issues specific to Freemius's payment system infrastructure 
                (e.g., checkout system errors) may need to be forwarded to Freemius. For all other matters, 
                we will handle your request directly.
              </p>
            </section>
            {/* Section VII - Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VII. Termination</h2>

              <p className="mb-4">
                Your contract to use the <strong>free platform</strong> continues indefinitely with no minimum
                commitment. You may terminate your <strong>Synoptas account</strong> anytime:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Via your Profile page ("Delete Account" button)</li>
                <li>
                  By email to{" "}
                  <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                    mail@wealthconomy.com
                  </a>
                </li>
              </ul>
              <p className="mb-4">
                Termination is <strong>immediate</strong> – your account and all data are permanently deleted.
              </p>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 my-4">
                <p className="font-bold mb-2">⚠️ IMPORTANT for Premium Subscribers</p>
                <p className="mb-2">
                  Deleting your <strong>Synoptas account</strong> does <strong>NOT automatically cancel</strong> your{" "}
                  <strong>Premium subscription with Freemius</strong>!
                </p>
                <p className="mb-2">
                  You must <strong>separately cancel your subscription through Freemius</strong> to stop future
                  payments:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Via your Freemius customer account (access link provided in your purchase confirmation email)</li>
                  <li>By contacting Freemius support through their customer portal</li>
                </ul>
                <p className="mt-2">
                  <strong>Otherwise, your subscription will continue and you will continue to be charged</strong> – even
                  if you no longer have a Synoptas account!
                </p>
              </div>

              <p className="mb-4">
                <strong>Account Deletion & Data:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Profile data, complete analysis history from all services, and credit tracking data are permanently deleted</li>
                <li><strong>Business Ideas:</strong> All your posted ideas and ratings are permanently deleted</li>
                <li><strong>Ratings on your ideas:</strong> Ratings from other users on your ideas are also deleted</li>
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
                <li>
                  You <strong>immediately</strong> lose access to all account features (free + Premium)
                </li>
                <li>Your Freemius subscription continues and continues to be charged</li>
                <li>You must separately cancel the subscription with Freemius</li>
                <li>Refunds for already paid fees are excluded (except statutory right of withdrawal)</li>
              </ul>

              <p className="mb-4">
                <strong>When canceling your Premium subscription (through Freemius):</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Your Synoptas account remains active (free features still usable)</li>
                <li>
                  Premium access ends at the <strong>end of the paid period</strong>
                </li>
                <li>Downgrade to Free Plan (with reduced usage limits and limited feature access)</li>
                <li>No pro-rated refund for unused Premium period</li>
              </ul>
            </section>
            {/* Section VIII - Right of Withdrawal */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VIII. Right of Withdrawal</h2>

              <h3 className="text-xl font-semibold mb-3">8.1 Right of Withdrawal for Free Services</h3>
              <p className="mb-4">
                Since basic platform usage is free of charge, there is no statutory right of withdrawal in the sense of
                distance selling law. However, you may cancel your account anytime according to Section VII.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">
                8.2 Right of Withdrawal for Premium Subscriptions (EU/EEA Consumers)
              </h3>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 my-4">
                <p className="font-bold mb-2">🔐 Important: Right of Withdrawal</p>
                <p>
                  As an EU/EEA consumer, you have a statutory <strong>14-day right of withdrawal</strong> from the 
                  purchase date for Premium subscriptions. Since Freemius, Inc. acts as Merchant of Record, the 
                  withdrawal must ultimately be processed through Freemius. However, we will assist you with the process.
                </p>
              </div>

              <p className="mb-4">
                <strong>How to exercise your right of withdrawal:</strong>
              </p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>
                  <strong>Recommended:</strong> Contact us at{" "}
                  <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                    mail@wealthconomy.com
                  </a>{" "}
                  with your withdrawal request. We will process it on your behalf and coordinate with Freemius.
                </li>
                <li>
                  <strong>Alternative:</strong> Contact Freemius directly through their customer portal 
                  (access link provided in your purchase confirmation email)
                </li>
                <li>
                  <strong>Written notice:</strong> You may also send a written withdrawal notice to: 
                  Freemius, Inc., 251 Little Falls Drive, Wilmington, Delaware 19808, USA
                </li>
                <li>
                  Include your <strong>order number</strong> and <strong>email address</strong> in any withdrawal request
                </li>
              </ol>

              <div className="bg-muted/30 border border-border rounded-lg p-4 my-4 font-mono text-sm">
                <p className="font-semibold mb-2">Model Withdrawal Form</p>
                <p className="mb-2">
                  To: Muhammed Kagan Yilmaz, Aroser Allee 50, 13407 Berlin, Germany
                  <br />
                  Email: mail@wealthconomy.com
                </p>
                <p className="mb-2">
                  I/We (*) hereby withdraw from my/our (*) contract for the Premium subscription for Synoptas.
                </p>
                <p className="mb-2">
                  Ordered on: _______________
                  <br />
                  Order number: _______________
                  <br />
                  Name of consumer(s): _______________
                  <br />
                  Address of consumer(s): _______________
                  <br />
                  Email: _______________
                  <br />
                  Date: _______________
                  <br />
                  Signature (only for paper form): _______________
                </p>
                <p className="text-xs italic">(*) Delete as appropriate</p>
              </div>

              <p className="mb-4">
                <strong>Effects of withdrawal:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  Freemius refunds all received payments within <strong>14 days</strong>
                </li>
                <li>Your Premium access is terminated (downgraded to Free Plan)</li>
                <li>Your Synoptas account remains active (free features still usable)</li>
              </ul>

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

              <h3 className="text-xl font-semibold mb-3 mt-6">IX.A Customer Support and Dispute Resolution</h3>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-4">
                <p className="font-semibold mb-3">📧 Primary Contact for ALL Issues</p>
                <p className="mb-2">
                  Contact <strong>us (Synoptas)</strong> first for any questions, complaints, or support requests:{" "}
                  <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                    mail@wealthconomy.com
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  Including: Payment questions, billing issues, refund requests, Premium features, technical problems, 
                  account issues, privacy concerns, and general inquiries
                </p>
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4 my-4">
                <p className="font-semibold mb-3">⚙️ Technical Freemius System Issues Only</p>
                <p className="mb-2">
                  Contact <strong>Freemius</strong> directly only for technical checkout system errors 
                  (e.g., payment form not loading, Freemius website issues)
                </p>
                <p className="text-sm text-muted-foreground">
                  Access via customer portal (link in your purchase confirmation email)
                </p>
              </div>

              <p className="mb-4">
                EU consumers may also use the EU ODR platform for disputes:{" "}
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
                Last updated: December 21, 2025
                <br />
                Version 2.7 (Business Ideas Community Update)
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
