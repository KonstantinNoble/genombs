import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background/60">
      <SEOHead
        title="Privacy Policy"
        description="Privacy policy and data protection information."
        noindex={true}
      />
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            ← Back to Home
          </Button>
        </Link>

        <article className="max-w-4xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-semibold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Effective Date: February 28, 2026 | Version 8.3</p>

          {/* Section 1: Controller Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction and Controller Information</h2>
            <p className="text-muted-foreground mb-4">
              We appreciate your interest in our website. This Privacy Policy explains how we handle personal data when
              you visit our website and use our platform.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Data Controller (as defined in the GDPR):</strong>
              <br />
              Muhammed Kagan Yilmaz
              <br />
              Aroser Allee 50, 13407 Berlin, Germany
              <br />
              Email: mail@wealthconomy.com
            </p>
            <p className="text-muted-foreground mb-4">
              No data protection officer has been appointed, as the legal requirements under Article 37 GDPR do not
              apply.
            </p>
          </section>

          {/* Section 2: Server Log Files */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Data Collection When Visiting This Website</h2>
            <p className="text-muted-foreground mb-4">
              When you visit our website for informational purposes only, we collect only the data your browser
              automatically transmits to our web server ("server log files"), including:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Visited page(s)</li>
              <li>Date and time of access</li>
              <li>Amount of data transmitted</li>
              <li>Source/Referrer URL</li>
              <li>Browser type and version</li>
              <li>Operating system used</li>
              <li>IP address (possibly anonymized)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              The processing is based on our legitimate interest (Art. 6(1)(f) GDPR) in ensuring the stability and
              security of our website.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Storage duration:</strong> Server log files are stored only for as long as necessary to ensure the
              stability, security, and proper functioning of the website, and are then automatically deleted or
              anonymized.
            </p>
          </section>

          {/* Section 3: Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Our website uses cookies to provide essential functionality and maintain your user session. Below we 
              explain what cookies are used and for what purpose:
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Session Cookie</h3>
            <p className="text-muted-foreground mb-4">
              <strong>Cookie name:</strong> session-id
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Purpose:</strong> This technically necessary session cookie enables the basic functionality of our 
              website, such as maintaining your browsing session during navigation and keeping you logged in while using 
              the platform.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Data stored:</strong> The cookie contains only a randomly generated session identifier and does not 
              store any personal data beyond this technical reference.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Storage duration:</strong> This cookie is automatically deleted when you close your browser 
              (session cookie).
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> The use of this cookie is based on our legitimate interest (Art. 6(1)(f) GDPR) 
              in providing a functional and user-friendly website. In addition, this use is permitted under § 25 Abs. 2 
              Nr. 2 TTDSG, as the cookie is technically necessary for the operation of the website.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Authentication Session Management</h3>
            <p className="text-muted-foreground mb-4">
              When you log in to your account (via email/password or Google OAuth), we store a session token in your browser's local storage to maintain 
              your logged-in state. This token is technically necessary for 
              authentication. This is covered by § 25 Abs. 2 Nr. 2 TTDSG, as it is essential for providing the requested service.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (necessary for contract performance) and Art. 6(1)(f) GDPR 
              (legitimate interest in providing secure authentication).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Third-Party Service Cookies</h3>
            <p className="text-muted-foreground mb-4">
              When you actively use certain features of our website, such as logging in via Google or completing a 
              purchase through our payment providers, these third-party services may set cookies on your device. These 
              cookies are strictly necessary for the functionality you explicitly requested.
            </p>
            <p className="text-muted-foreground mb-4">
              Since you initiate these services through your own action (clicking "Login" or "Checkout"), these cookies 
              qualify as technically necessary under <strong>§ 25 Abs. 2 Nr. 2 TDDDG</strong> (German Telecommunications 
              Digital Services Data Protection Act, formerly TTDSG) and do not require separate consent.
            </p>
            
            <p className="text-muted-foreground mb-4">
              <strong>The following third-party services may set cookies:</strong>
            </p>
            
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-muted-foreground border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Service Provider</th>
                    <th className="border border-border p-3 text-left font-semibold">When Set</th>
                    <th className="border border-border p-3 text-left font-semibold">Purpose</th>
                    <th className="border border-border p-3 text-left font-semibold">Legal Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3"><strong>Google</strong></td>
                    <td className="border border-border p-3">When you click "Login with Google"</td>
                    <td className="border border-border p-3">Authentication, session security</td>
                    <td className="border border-border p-3">Art. 6(1)(b) GDPR, § 25 Abs. 2 Nr. 2 TDDDG</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Stripe</strong></td>
                    <td className="border border-border p-3">When processing card payments (via Freemius)</td>
                    <td className="border border-border p-3">Secure payment, fraud prevention</td>
                    <td className="border border-border p-3">Art. 6(1)(b) GDPR, Art. 6(1)(f) GDPR</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>PayPal</strong></td>
                    <td className="border border-border p-3">When you select PayPal payment (via Freemius)</td>
                    <td className="border border-border p-3">Secure payment processing, authentication</td>
                    <td className="border border-border p-3">Art. 6(1)(b) GDPR, Art. 6(1)(f) GDPR</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground mb-4">
              <strong>Fraud Prevention:</strong> Payment providers (Stripe, PayPal) may also process data for fraud 
              prevention purposes. This processing is based on our and the payment providers' legitimate interests in 
              preventing fraudulent transactions (<strong>Art. 6(1)(f) GDPR</strong>).
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Third-Party Privacy Policies:</strong> For detailed information about cookies and data processing 
              by these providers, please refer to their respective privacy policies:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Stripe Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  PayPal Privacy Policy
                </a>
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Freemius Checkout (No Cookies on This Website)</h3>
            <p className="text-muted-foreground mb-4">
              When you click to purchase a Premium subscription, you are redirected to the external 
              Freemius checkout page (checkout.freemius.com) in a new browser tab. This is a direct 
              link redirect, not an embedded popup or script.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Important:</strong> Since the checkout process takes place entirely on the Freemius 
              website (not on our website), <strong>no Freemius cookies or tracking scripts are set on 
              our website</strong>. Any cookies set by Freemius during checkout are stored under the 
              Freemius domain and are subject to the{" "}
              <a href="https://freemius.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Freemius Privacy Policy
              </a>.
            </p>
            <p className="text-muted-foreground mb-4">
              This approach was specifically chosen to minimize third-party tracking on our website and 
              avoid the need for cookie consent banners related to payment processing.
            </p>

            <p className="text-muted-foreground mb-4">
              You can manage cookies through your browser settings. However, please note that blocking these cookies 
              may prevent you from using the associated features (login, payment processing).
            </p>
          </section>

          {/* Section 4: User Authentication */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Authentication</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Authentication Methods Overview</h3>
            <p className="text-muted-foreground mb-4">
              Our website offers two authentication methods for user accounts:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Email/Password Authentication:</strong> Register with your email address and a password of your choice</li>
              <li><strong>Google OAuth:</strong> Log in using your existing Google account</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Both methods provide secure access to your account. If you register with email/password and 
              later sign in with Google using the same email address, your accounts will be automatically 
              linked for your convenience.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Email/Password Registration</h3>
            <p className="text-muted-foreground mb-4">
              When you register using email and password, the following data is collected and processed:
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Collected</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Email Address:</strong> Used as your primary account identifier, for sending 
                confirmation and password reset emails, and for communications
              </li>
              <li>
                <strong>Password:</strong> Stored exclusively in hashed form using industry-standard 
                bcrypt algorithm. We NEVER store your password in plain text and cannot retrieve or 
                view your original password.
              </li>
              <li>
                <strong>Timestamps:</strong> Account creation date and last login time
              </li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Email Verification</h4>
            <p className="text-muted-foreground mb-4">
              After registration, you will receive a confirmation email to verify your email address. 
              This verification step ensures:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>You have access to the email address you provided</li>
              <li>Protection against unauthorized account creation using your email</li>
              <li>A secure and verified communication channel between us and you</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              The confirmation email contains a secure, time-limited link that expires after 1 hour.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Password Requirements and Security</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Minimum 8 characters required</li>
              <li>Passwords are hashed using bcrypt before storage</li>
              <li>Password comparison is performed using constant-time algorithms to prevent timing attacks</li>
              <li>Failed login attempts are not rate-limited at the individual account level, but registration attempts are (see Section 4.10)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Password Reset</h4>
            <p className="text-muted-foreground mb-4">
              If you forget your password, you can request a password reset via the "Forgot password?" link. 
              The process works as follows:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>You enter your email address on the password reset page</li>
              <li>If an account exists with that email, a password reset link is sent</li>
              <li>The reset link is valid for 1 hour</li>
              <li>Password reset requests are rate-limited to 1 request per hour per email address to prevent abuse</li>
              <li>The rate limit countdown is displayed in the user interface</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Note:</strong> If you registered using Google OAuth, password reset is not available. 
              Please use "Sign in with Google" instead.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis for Email/Password Authentication</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the 
                contract (providing authentication services required to access your account)
              </li>
              <li>
                <strong>Art. 6(1)(f) GDPR:</strong> Legitimate interest in secure account management 
                and protection against unauthorized access
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Transactional Email Service (Resend)</h3>
            <p className="text-muted-foreground mb-4">
              We use Resend as our transactional email service provider to send authentication-related 
              emails, including account confirmation emails and password reset emails.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Transmitted to Resend</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Your email address (recipient of the email)</li>
              <li>Email content (confirmation link or password reset link)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Sender Domain</h4>
            <p className="text-muted-foreground mb-4">
              Authentication emails are sent from <strong>noreply@wealthconomy.com</strong>.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Provider Information</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> Resend, Inc.
              <br />
              <strong>Location:</strong> United States
              <br />
              <strong>Privacy Policy:</strong>{" "}
              <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://resend.com/legal/privacy-policy
              </a>
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Transfer to Third Countries</h4>
            <p className="text-muted-foreground mb-4">
              Resend is based in the United States. Data transfers to the USA are conducted in compliance 
              with GDPR requirements using appropriate safeguards:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>EU-U.S. Data Privacy Framework (DPF) pursuant to Art. 45 GDPR (Resend is DPF-certified)</li>
              <li>Standard Contractual Clauses (SCCs) pursuant to Art. 46(2)(c) GDPR as supplementary safeguard</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the 
              contract (sending confirmation and password reset emails as part of the authentication service).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Google OAuth</h3>
            <p className="text-muted-foreground mb-4">
              When you choose to log in with Google, we use Google OAuth 2.0 for authentication.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Received from Google</h4>
            <p className="text-muted-foreground mb-4">
              When you authorize login via Google, we receive:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Email address:</strong> Used as your account identifier</li>
              <li><strong>Name:</strong> May be used for personalization (display name)</li>
              <li><strong>Profile picture URL:</strong> May be displayed in your profile</li>
              <li><strong>OAuth tokens:</strong> Used temporarily for authentication verification</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Provider Information</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> Google LLC
              <br />
              <strong>Location:</strong> 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA
              <br />
              <strong>Privacy Policy:</strong>{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://policies.google.com/privacy
              </a>
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Transfer to Third Countries</h4>
            <p className="text-muted-foreground mb-4">
              Google is based in the United States. Data transfers are conducted in compliance with GDPR 
              requirements based on:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>EU-U.S. Data Privacy Framework (DPF) - Google LLC is certified</li>
              <li>Standard Contractual Clauses (SCCs) as additional safeguard</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the 
              contract when you choose to authenticate via Google.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.5 Account Deletion</h3>
            <p className="text-muted-foreground mb-4">
              You can delete your account at any time through the Profile settings. When you request 
              account deletion:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Your account and all associated personal data are permanently deleted</li>
              <li>All associated account data is permanently deleted</li>
              <li>Your email address is hashed (using SHA-256) and stored for 24 hours to prevent immediate re-registration abuse</li>
              <li>After 24 hours, the email hash is automatically deleted</li>
              <li>This deletion is irreversible</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">24-Hour Block for Deleted Accounts</h4>
            <p className="text-muted-foreground mb-4">
              To prevent abuse (e.g., repeatedly creating and deleting accounts to reset usage limits), 
              we implement a 24-hour cooling-off period. During this time:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>You cannot register a new account with the same email address</li>
              <li>You cannot log in with Google OAuth using the same email address</li>
              <li>Only a SHA-256 hash of your email is stored (your actual email is not retained)</li>
              <li>The hash is automatically deleted after 24 hours by a scheduled cleanup job</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(f) GDPR (legitimate interest in preventing system abuse 
              and ensuring fair usage of our services).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.6 Registration Rate Limiting</h3>
            <p className="text-muted-foreground mb-4">
              To prevent abuse and protect our platform from automated attacks, registration attempts 
              are rate-limited.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Rate Limits</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>3 registration attempts per hour</strong> per IP address (for email/password registration)</li>
              <li>Google OAuth logins are not subject to IP-based rate limiting</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Stored for Rate Limiting</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>IP address hash:</strong> Your IP address is hashed using SHA-256 before storage (your actual IP is not stored)</li>
              <li><strong>Email hash:</strong> A hash of the attempted email address (to detect repeated attempts)</li>
              <li><strong>Timestamp:</strong> When the registration attempt occurred</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Automatic Cleanup</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>IP hashes are automatically deleted after 2 hours</li>
              <li>Email hashes are automatically deleted after 24 hours</li>
              <li>Cleanup is performed by an automated hourly job</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(f) GDPR:</strong> Legitimate interest in protecting our platform from abuse, 
              automated attacks, and ensuring service availability for legitimate users.
            </p>
          </section>

          {/* Section 5: Premium Subscription */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Premium Subscription and Payment Processing</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Subscription Overview</h3>
            <p className="text-muted-foreground mb-4">
               We offer a Premium subscription at $14.99/month that provides enhanced features 
               and capabilities.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Payment Processing via Freemius</h3>
            <p className="text-muted-foreground mb-4">
              Payment processing is handled by Freemius, a third-party payment and subscription management platform.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Transmitted to Freemius</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Your email address (for payment receipts and subscription management)</li>
              <li>Payment details (handled directly by Freemius; we do not receive or store payment card details)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Received from Freemius (via Webhooks)</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Freemius customer ID</li>
              <li>Freemius subscription ID</li>
              <li>Subscription status (active, cancelled, expired)</li>
              <li>Billing cycle (monthly)</li>
              <li>Next payment date</li>
              <li>Subscription end date</li>
              <li>Auto-renewal status</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Provider Information</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> Freemius, Inc.
              <br />
              <strong>Location:</strong> United States
              <br />
              <strong>Privacy Policy:</strong>{" "}
              <a href="https://freemius.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://freemius.com/privacy/
              </a>
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the 
              subscription contract.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Subscription Status Synchronization</h3>
            <p className="text-muted-foreground mb-4">
              Your premium status is synchronized automatically via webhooks from Freemius:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>subscription.created:</strong> Activates premium when you subscribe</li>
              <li><strong>payment.created:</strong> Confirms payment and extends subscription</li>
              <li><strong>subscription.cancelled:</strong> Marks auto-renewal as disabled (premium remains active until end date)</li>
              <li><strong>payment.refund:</strong> Immediately deactivates premium</li>
              <li><strong>subscription.renewal.failed.last:</strong> Deactivates premium after final failed renewal attempt</li>
            </ul>
          </section>

          {/* Section 6: Email Communication */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Email Communication</h2>
            
            <p className="text-muted-foreground mb-4">
              We send transactional emails that are necessary for the operation of your account:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Account confirmation emails</li>
              <li>Password reset emails</li>
              <li>Important account notifications</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              These emails are sent via Resend from <strong>noreply@wealthconomy.com</strong>.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (necessary for contract performance).
            </p>
            <p className="text-muted-foreground mb-4">
              We do not send marketing emails. All email communication is strictly transactional and 
              related to the operation of your account.
            </p>
          </section>

          {/* Section 7: Hosting */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Hosting and Infrastructure</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Website Hosting</h3>
            <p className="text-muted-foreground mb-4">
              Our website frontend is hosted on infrastructure provided by Lovable. Backend services including 
              database, authentication, and edge functions are provided directly by Supabase, Inc.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Provider Information</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> Supabase, Inc. (Direct Integration)
              <br />
              <strong>Location:</strong> Infrastructure distributed globally with EU data centers
              <br />
              <strong>Privacy Policy:</strong>{" "}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://supabase.com/privacy
              </a>
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(f) GDPR:</strong> Legitimate interest in providing a reliable, secure, and 
              performant hosting infrastructure.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Data Processing Agreement</h3>
            <p className="text-muted-foreground mb-4">
              We have concluded a Data Processing Agreement (DPA / Auftragsverarbeitungsvertrag) with Supabase, Inc. 
              in accordance with Art. 28 GDPR. This agreement ensures that Supabase processes personal data 
              exclusively on our behalf and in compliance with our instructions.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>The DPA covers:</strong>
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Technical and organizational measures for data security</li>
              <li>Sub-processor management and notification obligations</li>
              <li>Data subject rights assistance</li>
              <li>Data deletion upon contract termination</li>
              <li>Audit rights and compliance verification</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Supabase's DPA is available at:{" "}
              <a href="https://supabase.com/legal/dpa" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://supabase.com/legal/dpa
              </a>
            </p>
          </section>

          {/* Section 8: Website Crawling and Analysis */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Website Crawling and Analysis</h2>
            <p className="text-muted-foreground mb-4">
              Our platform allows you to analyze websites by entering their URLs. When you initiate a website 
              analysis, the following data processing takes place:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Website Crawling via Firecrawl</h3>
            <p className="text-muted-foreground mb-4">
              To extract the content of the website you submit for analysis, we use the Firecrawl API. 
              This service crawls the specified URL and returns the website content in a structured format.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Transmitted to Firecrawl</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>The URL you entered for analysis</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Received from Firecrawl</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Raw HTML content of the crawled page</li>
              <li>Markdown representation of the page content</li>
              <li>List of links found on the page</li>
              <li>Screenshot of the page (stored in our file storage for display purposes)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Provider Information</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> Firecrawl, Inc.
              <br />
              <strong>Location:</strong> United States
              <br />
              <strong>Privacy Policy:</strong>{" "}
              <a href="https://www.firecrawl.dev/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://www.firecrawl.dev/privacy
              </a>
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Transfer to Third Countries</h4>
            <p className="text-muted-foreground mb-4">
              Firecrawl is based in the United States. Data transfers are conducted in compliance with GDPR 
              requirements using Standard Contractual Clauses (SCCs) pursuant to Art. 46(2)(c) GDPR.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Data Stored from Analysis</h3>
            <p className="text-muted-foreground mb-4">
              The following data is stored in our database as a result of the analysis:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>The URL you submitted</li>
              <li>Crawled website content (Markdown format)</li>
              <li>AI-generated website profile (name, target audience, USP, CTAs, strengths, weaknesses)</li>
              <li>Scores in 5 categories: Findability, Mobile Usability, Offer Clarity, Trust & Proof, Conversion Readiness</li>
              <li>Screenshot of the analyzed website</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              This data is associated with your user account and the conversation in which the analysis was initiated.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the contract 
              (providing the website analysis service you requested).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.3 GitHub Repository Code Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Users may submit a public GitHub repository URL to perform an AI-powered code analysis 
              ("Deep Code Analysis"). This feature evaluates the source code of a publicly accessible 
              repository in combination with the associated website analysis.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Transmitted to GitHub</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>The repository URL (accessed via the public GitHub API without authentication)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Received from GitHub</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>File tree of the repository (up to 100 files)</li>
              <li>Source code of selected files (up to 15 files, max. 30,000 characters total)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Transmitted to AI Providers</h4>
            <p className="text-muted-foreground mb-4">
              The following data is sent to the selected AI provider (same providers as listed in Section 9) 
              for code evaluation:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Repository name</li>
              <li>Associated website URL</li>
              <li>File tree structure</li>
              <li>Source code snippets from selected files</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Stored</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>AI-generated code analysis results, including scores for: Code Quality, Security, Performance, Accessibility, Maintainability, and SEO</li>
              <li>Detected technologies, strengths, weaknesses, and recommendations</li>
              <li>The GitHub repository URL</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Note:</strong> Only publicly accessible repository data is retrieved. Private repositories 
              cannot be analyzed. No GitHub authentication tokens or credentials are used or stored.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Provider Information</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> GitHub, Inc. (a subsidiary of Microsoft Corporation)
              <br />
              <strong>Location:</strong> 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA
              <br />
              <strong>Privacy Policy:</strong>{" "}
              <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                GitHub Privacy Statement
              </a>
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Transfer to Third Countries</h4>
            <p className="text-muted-foreground mb-4">
              GitHub, Inc. is based in the United States. Data transfers are conducted in compliance with 
              GDPR requirements based on the EU-U.S. Data Privacy Framework (DPF) — GitHub/Microsoft is 
              certified under the DPF (adequacy decision pursuant to Art. 45 GDPR).
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the contract 
              (providing the code analysis service you requested).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.4 Gamification and Activity Tracking</h3>
            <p className="text-muted-foreground mb-4">
              Our platform includes gamification features to encourage regular engagement with the service. 
              These features track your activity and reward consistent usage with visual achievements.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Collected</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Streak Data:</strong> Current streak count, longest streak, last active day, total number of active days</li>
              <li><strong>Badge Data:</strong> Unlocked achievement badges with the timestamp of when each badge was earned</li>
            </ul>

            <p className="text-muted-foreground mb-4">
              This data is stored in dedicated database tables (<code>user_streaks</code> and <code>user_badges</code>) 
              and is associated with your user account. Streaks are updated only when you successfully complete a 
              website analysis, not on every page visit.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Deletion</h4>
            <p className="text-muted-foreground mb-4">
              All gamification data is permanently deleted when you delete your account. The deletion is performed 
              as part of the cascading account deletion process described in Section 12.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the contract 
              (gamification features are an integral part of the service).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.5 Public Score Pages (Opt-in)</h3>
            <p className="text-muted-foreground mb-4">
              Premium users can optionally publish their website analysis results as a publicly accessible 
              page on our platform (e.g., synvertas.com/scores/example-com). This is an explicit opt-in feature — 
              no data is published without your active consent.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Published</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>The analyzed website URL</li>
              <li>Overall website score</li>
              <li>Category scores (Findability, Mobile, Offer, Trust, Conversion)</li>
              <li>Strengths identified during analysis</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data NOT Published</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Weaknesses or improvement suggestions</li>
              <li>Raw analysis markdown</li>
              <li>Code analysis results</li>
              <li>Chat messages or conversation history</li>
              <li>Your email address or account information</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">User Control</h4>
            <p className="text-muted-foreground mb-4">
              You can unpublish any score page at any time. Unpublishing immediately removes the public page 
              and returns a 404 error for anyone visiting the URL. When you delete your account, all published 
              score pages are automatically and permanently removed as part of the cascading account deletion 
              process described in Section 12.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Publication Usage Tracking</h4>
            <p className="text-muted-foreground mb-4">
              We track the number of publish actions per month in a <code>publish_usage</code> table to enforce 
              the monthly limit of 5 publications per Premium user. This table stores: your user ID, the 
              associated website profile ID, the action type, and a timestamp. This data is permanently deleted 
              when you delete your account.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(a) GDPR:</strong> Your explicit consent via the opt-in publish toggle. You can 
              withdraw consent at any time by unpublishing the score page.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the contract 
              (providing the public score page feature as part of the Premium subscription).
            </p>
          </section>

          {/* Section 9: AI-Powered Data Processing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. AI-Powered Data Processing</h2>
            <p className="text-muted-foreground mb-4">
              Our platform uses artificial intelligence (AI) to analyze websites and provide insights. 
              AI processing is a core component of our service. All AI processing takes place server-side 
              in our backend functions — no data is sent directly from your browser to AI providers.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.1 AI Providers Used</h3>
            <p className="text-muted-foreground mb-4">
              Depending on your selected AI model, data is processed by one of the following providers:
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-muted-foreground border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Provider</th>
                    <th className="border border-border p-3 text-left font-semibold">Models Used</th>
                    <th className="border border-border p-3 text-left font-semibold">Location</th>
                    <th className="border border-border p-3 text-left font-semibold">Transfer Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3"><strong>Google LLC</strong></td>
                    <td className="border border-border p-3">Gemini Flash</td>
                    <td className="border border-border p-3">USA</td>
                    <td className="border border-border p-3">DPF (Art. 45 GDPR)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>OpenAI, Inc.</strong></td>
                    <td className="border border-border p-3">GPT-4o-mini, GPT-4o</td>
                    <td className="border border-border p-3">USA</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c) GDPR)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Anthropic, PBC</strong></td>
                    <td className="border border-border p-3">Claude Sonnet</td>
                    <td className="border border-border p-3">USA</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c) GDPR)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Perplexity AI, Inc.</strong></td>
                    <td className="border border-border p-3">Sonar Pro</td>
                    <td className="border border-border p-3">USA</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c) GDPR)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.2 Data Transmitted to AI Providers</h3>
            <p className="text-muted-foreground mb-4">
              The following data may be transmitted to the selected AI provider for processing:
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">For Website Analysis</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Crawled website content (Markdown, up to 30,000 characters)</li>
              <li>Extracted SEO metadata (title, description, headings, Open Graph tags)</li>
              <li>List of internal and external links</li>
              <li>The URL of the analyzed website</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">For AI Chat</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Your chat messages (questions you ask about the analysis)</li>
              <li>Previous messages in the conversation (for context)</li>
              <li>Website profile data from completed analyses (as context for answers)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.3 What Is NOT Transmitted</h3>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Your email address or account information</li>
              <li>Your IP address</li>
              <li>Payment or subscription data</li>
              <li>Any API keys or authentication credentials</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.4 Data Retention by AI Providers</h3>
            <p className="text-muted-foreground mb-4">
              We use the AI providers' APIs in a way that minimizes data retention on their side. 
              Data sent via API calls is generally not used to train the providers' models. Please refer 
              to each provider's privacy policy for their specific data retention practices:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  OpenAI Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Anthropic Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://www.perplexity.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Perplexity AI Privacy Policy
                </a>
              </li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the contract 
              (providing the AI-powered analysis and chat service you requested).
            </p>
          </section>

          {/* Section 10: Google PageSpeed Insights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Google PageSpeed Insights</h2>
            <p className="text-muted-foreground mb-4">
              As part of the website analysis, we use the Google PageSpeed Insights API to provide 
              objective technical performance metrics for the analyzed website.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Transmitted to Google</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>The URL of the website being analyzed</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Received from Google</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Performance score</li>
              <li>Accessibility score</li>
              <li>Best Practices score</li>
              <li>SEO score</li>
              <li>Core Web Vitals (Largest Contentful Paint, Cumulative Layout Shift, First Contentful Paint, Total Blocking Time)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              These metrics are stored alongside the website profile in our database and displayed 
              in the analysis dashboard.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Provider Information</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> Google LLC
              <br />
              <strong>Location:</strong> 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA
              <br />
              <strong>Privacy Policy:</strong>{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://policies.google.com/privacy
              </a>
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the contract 
              (providing technical website performance data as part of the analysis service you requested).
            </p>
          </section>

          {/* Section 11: Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Form and Email Inquiries</h2>
            <p className="text-muted-foreground mb-4">
              If you contact us via email (mail@wealthconomy.com), the data you provide (your email address, 
              name if provided, and the content of your message) will be stored and processed for the purpose 
              of handling your inquiry.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Storage duration:</strong> We retain your inquiry until the matter is resolved, plus 
              any legally required retention period for business correspondence.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong>
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Art. 6(1)(b) GDPR:</strong> If your inquiry relates to a contract or pre-contractual measures
              </li>
              <li>
                <strong>Art. 6(1)(f) GDPR:</strong> Legitimate interest in responding to inquiries and providing support
              </li>
            </ul>
          </section>

          {/* Section 12: External Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. External Links</h2>
            <p className="text-muted-foreground mb-4">
              Our website may contain links to external websites. We have no control over the content or 
              privacy practices of these external sites and accept no responsibility for them. Please review 
              the privacy policies of any external websites you visit.
            </p>
          </section>

          {/* Section 13: Categories of Personal Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Categories of Personal Data Processed</h2>
            <p className="text-muted-foreground mb-4">
              The following categories of personal data may be processed through our platform:
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-muted-foreground border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Category</th>
                    <th className="border border-border p-3 text-left font-semibold">Examples</th>
                    <th className="border border-border p-3 text-left font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3"><strong>Account Data</strong></td>
                    <td className="border border-border p-3">Email address, hashed password, OAuth tokens</td>
                    <td className="border border-border p-3">Authentication and account management</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Usage Data</strong></td>
                    <td className="border border-border p-3">Credits used, timestamps, premium status</td>
                    <td className="border border-border p-3">Service limits and subscription management</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Technical Data</strong></td>
                    <td className="border border-border p-3">IP address (hashed), browser info, session tokens</td>
                    <td className="border border-border p-3">Security, rate limiting, session management</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Payment Data</strong></td>
                    <td className="border border-border p-3">Freemius IDs, subscription status, billing cycle</td>
                    <td className="border border-border p-3">Payment and subscription management</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Analysis Data</strong></td>
                    <td className="border border-border p-3">Submitted URLs, crawled website content, AI-generated scores and profiles, screenshots, GitHub repository source code, AI-generated code analysis scores</td>
                    <td className="border border-border p-3">Website analysis and scoring service</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Chat Data</strong></td>
                    <td className="border border-border p-3">Chat messages, conversation history</td>
                    <td className="border border-border p-3">AI-powered contextual assistance</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Gamification Data</strong></td>
                    <td className="border border-border p-3">Activity streaks, unlocked badges, active day counts</td>
                    <td className="border border-border p-3">User engagement tracking and achievement system</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 14: Recipients of Personal Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Recipients of Personal Data</h2>
            <p className="text-muted-foreground mb-4">
              Your personal data may be shared with the following categories of recipients:
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-muted-foreground border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Recipient</th>
                    <th className="border border-border p-3 text-left font-semibold">Purpose</th>
                    <th className="border border-border p-3 text-left font-semibold">Data Shared</th>
                    <th className="border border-border p-3 text-left font-semibold">Transfer Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3"><strong>Google LLC</strong></td>
                    <td className="border border-border p-3">OAuth authentication, AI processing (Gemini), PageSpeed API</td>
                    <td className="border border-border p-3">OAuth data, website content, URLs</td>
                    <td className="border border-border p-3">DPF (Art. 45)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>OpenAI, Inc.</strong></td>
                    <td className="border border-border p-3">AI-powered website analysis and chat</td>
                    <td className="border border-border p-3">Website content, chat messages</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Anthropic, PBC</strong></td>
                    <td className="border border-border p-3">AI-powered website analysis and chat</td>
                    <td className="border border-border p-3">Website content, chat messages</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Perplexity AI, Inc.</strong></td>
                    <td className="border border-border p-3">AI-powered website analysis and chat</td>
                    <td className="border border-border p-3">Website content, chat messages</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Firecrawl, Inc.</strong></td>
                    <td className="border border-border p-3">Website crawling</td>
                    <td className="border border-border p-3">URLs submitted for analysis</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Supabase, Inc.</strong></td>
                    <td className="border border-border p-3">Hosting, database, authentication (with DPA per Art. 28 GDPR)</td>
                    <td className="border border-border p-3">All stored data</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Resend, Inc.</strong></td>
                    <td className="border border-border p-3">Transactional emails</td>
                    <td className="border border-border p-3">Email address</td>
                    <td className="border border-border p-3">DPF (Art. 45)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Freemius, Inc.</strong></td>
                    <td className="border border-border p-3">Payment processing</td>
                    <td className="border border-border p-3">Email, payment details</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>GitHub, Inc. (Microsoft)</strong></td>
                    <td className="border border-border p-3">Code repository access for analysis</td>
                    <td className="border border-border p-3">Repository URLs</td>
                    <td className="border border-border p-3">DPF (Art. 45)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground mb-4">
              We do not sell your personal data to third parties.
            </p>
          </section>

          {/* Section 15: Obligation to Provide Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Obligation to Provide Personal Data</h2>
            <p className="text-muted-foreground mb-4">
              The provision of personal data is partially required by law or may result from contractual 
              provisions. Specifically:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Email address:</strong> Required for account creation and authentication. Without 
                providing an email address, you cannot create an account or use our services.
              </li>
              <li>
                <strong>Payment information:</strong> Required only if you wish to subscribe to Premium. 
                Free users are not required to provide payment information.
              </li>
            </ul>
          </section>

          {/* Section 16: Automated Decision-Making */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Automated Decision-Making and Profiling</h2>
            <p className="text-muted-foreground mb-4">
              Our platform uses AI to generate website scores, profiles, and recommendations. This AI processing 
              is a core part of the service you use. However, these AI-generated outputs are <strong>informational 
              and advisory only</strong> — they do not produce any legal effects or similarly significant effects 
              concerning you as defined in Art. 22 GDPR.
            </p>
            <p className="text-muted-foreground mb-4">
              Specifically:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Website scores and improvement suggestions are generated by AI models based on the crawled website content</li>
              <li>These results are not used to make decisions about your access, rights, or contractual relationship</li>
              <li>You are free to follow, ignore, or disagree with any AI-generated recommendation</li>
              <li>No profiling of your person takes place — the analysis is focused on the website content you submit</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              We do not engage in automated individual decision-making with legal or similarly significant effects 
              as defined in Art. 22 GDPR.
            </p>
          </section>

          {/* Section 17: Storage Duration */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">17. Storage Duration</h2>
            <p className="text-muted-foreground mb-4">
              We store your personal data only for as long as necessary for the purposes for which it was collected:
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-muted-foreground border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Data Category</th>
                    <th className="border border-border p-3 text-left font-semibold">Retention Period</th>
                    <th className="border border-border p-3 text-left font-semibold">Deletion Trigger</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Account data</td>
                    <td className="border border-border p-3">Until account deletion</td>
                    <td className="border border-border p-3">User-initiated deletion</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Website analysis data</td>
                    <td className="border border-border p-3">Until conversation or account deletion</td>
                    <td className="border border-border p-3">User-initiated deletion</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Chat messages</td>
                    <td className="border border-border p-3">Until conversation or account deletion</td>
                    <td className="border border-border p-3">User-initiated deletion</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Registration attempts (IP hash)</td>
                    <td className="border border-border p-3">2 hours</td>
                    <td className="border border-border p-3">Automatic cleanup</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Registration attempts (email hash)</td>
                    <td className="border border-border p-3">24 hours</td>
                    <td className="border border-border p-3">Automatic cleanup</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Deleted account email hash</td>
                    <td className="border border-border p-3">24 hours</td>
                    <td className="border border-border p-3">Automatic cleanup (daily job)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Payment event identifiers</td>
                    <td className="border border-border p-3">Indefinitely (deduplication)</td>
                    <td className="border border-border p-3">Fraud prevention and duplicate payment detection</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Gamification data</td>
                    <td className="border border-border p-3">Until account deletion</td>
                    <td className="border border-border p-3">User-initiated deletion</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Publication usage data</td>
                    <td className="border border-border p-3">Until account deletion</td>
                    <td className="border border-border p-3">User-initiated deletion (cascading)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground mb-4">
              When you delete your account, all associated data is permanently deleted, 
              except for the temporary email hash used to prevent immediate re-registration (deleted after 24 hours).
            </p>
          </section>

          {/* Section 18: Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">18. Your Rights Under GDPR</h2>
            <p className="text-muted-foreground mb-4">
              Under the General Data Protection Regulation (GDPR), you have the following rights regarding 
              your personal data:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.1 Right of Access (Art. 15 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to obtain confirmation as to whether personal data concerning you is being 
              processed. If so, you have the right to access that data and receive information about the 
              processing.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.2 Right to Rectification (Art. 16 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to request correction of inaccurate personal data and, where applicable, 
              completion of incomplete personal data.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.3 Right to Erasure (Art. 17 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to request deletion of your personal data under certain conditions. You 
              can delete your account at any time through the Profile settings, which will permanently 
              erase all your data.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.4 Right to Restriction of Processing (Art. 18 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to request restriction of processing under certain conditions, for example, 
              if you contest the accuracy of the data.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.5 Right to Data Portability (Art. 20 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to receive your personal data in a structured, commonly used, and 
              machine-readable format and to transmit that data to another controller.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.6 Right to Object (Art. 21 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to object to processing based on legitimate interests (Art. 6(1)(f) GDPR). 
              We will cease processing unless we demonstrate compelling legitimate grounds that override 
              your interests.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.7 Right to Withdraw Consent (Art. 7(3) GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              Where processing is based on consent, you have the right to withdraw 
              consent at any time. Withdrawal does not affect the lawfulness of processing before withdrawal.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.8 Right to Lodge a Complaint (Art. 77 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to lodge a complaint with a supervisory authority. The responsible 
              supervisory authority for us is:
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Berliner Beauftragte für Datenschutz und Informationsfreiheit</strong>
              <br />
              Alt-Moabit 59-61
              <br />
              10555 Berlin, Germany
              <br />
              Email: mailbox@datenschutz-berlin.de
              <br />
              Website:{" "}
              <a href="https://www.datenschutz-berlin.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.datenschutz-berlin.de
              </a>
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.9 Exercising Your Rights</h3>
            <p className="text-muted-foreground mb-4">
              To exercise any of these rights, please contact us at:
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Email:</strong> mail@wealthconomy.com
            </p>
            <p className="text-muted-foreground mb-4">
              We will respond to your request within one month. In complex cases, this period may be 
              extended by two additional months, in which case we will inform you of the extension.
            </p>
          </section>

          {/* Section 19: Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">19. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our services, 
              legal requirements, or operational practices. Changes will be indicated by updating the 
              "Effective Date" and version number at the top of this document.
            </p>
            <p className="text-muted-foreground mb-4">
              For significant changes that materially affect how we process your personal data, we may 
              also notify you via email or through a prominent notice on our website.
            </p>
            <p className="text-muted-foreground mb-4">
              We encourage you to review this Privacy Policy periodically to stay informed about our 
              data practices.
            </p>
          </section>

          {/* Version History */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Version History</h2>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Version 8.3 (February 28, 2026):</strong> Added Public Score Pages (Opt-in) section (Section 8.5) covering opt-in publication of website scores, published data, user controls, and publication usage tracking. Updated storage duration table (Section 17) with publication usage data.</li>
              <li><strong>Version 8.2 (February 21, 2026):</strong> Added Gamification and Activity Tracking section (Section 8.4) covering streaks and badges. Updated data categories table (Section 13) and storage duration table (Section 17) with gamification data.</li>
              <li><strong>Version 8.1 (February 19, 2026):</strong> Corrected data transfer basis for OpenAI (SCCs instead of DPF). Updated Resend transfer basis to DPF. Corrected Supabase transfer basis to SCCs.</li>
              <li><strong>Version 8.0 (February 19, 2026):</strong> Added GitHub Repository Code Analysis (Deep Code Analysis) feature documentation (Section 8.3). Added GitHub, Inc. (Microsoft) as data recipient. Updated analysis data categories to include source code and code analysis scores.</li>
              <li><strong>Version 7.0 (February 14, 2026):</strong> Added sections for Website Crawling (Firecrawl), AI-Powered Data Processing (Google Gemini, OpenAI, Anthropic, Perplexity), and Google PageSpeed Insights. Updated recipients and data categories tables. Corrected automated decision-making section to reflect active AI usage. Removed non-existent marketing emails section. Renumbered all sections.</li>
              <li><strong>Version 6.0 (February 8, 2026):</strong> Platform update – removed feature-specific sections (Multi-AI Validation, Team Workspaces, Business Context, Dashboard Statistics, Decision Audit Records, Experiment Workflow) pending new service implementation. Simplified data categories, recipients, and retention tables accordingly. Renumbered all sections.</li>
              <li><strong>Version 5.9 (February 1, 2026):</strong> Corrected Business Context section – basic profile fields available to all registered users; only Website URL input and website scanning via Firecrawl is Premium-exclusive.</li>
              <li><strong>Version 5.0 (January 21, 2026):</strong> Added Anthropic and Perplexity AI providers. Documented Lovable AI Gateway. Added web search functionality disclosure.</li>
              <li><strong>Version 4.0 (January 17, 2026):</strong> Complete rewrite for Multi-AI Validation Platform.</li>
            </ul>
          </section>

          <section className="mb-8 border-t border-border pt-8">
            <p className="text-muted-foreground text-center">
              Last updated: February 28, 2026
              <br />
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">
                mail@wealthconomy.com
              </a>
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
