import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            ← Back to Home
          </Button>
        </Link>

        <article className="max-w-4xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Effective Date: January 24, 2026 | Version 5.4</p>

          {/* Section 1: Controller Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction and Controller Information</h2>
            <p className="text-muted-foreground mb-4">
              We appreciate your interest in our website. This Privacy Policy explains how we handle personal data when
              you visit our website and use our Multi-AI Validation Platform.
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
              <li>Standard Contractual Clauses (SCCs) pursuant to Art. 46(2)(c) GDPR</li>
              <li>EU-U.S. Data Privacy Framework (DPF) certification where applicable</li>
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
              <li>All your validation analyses, experiments, tasks, and checkpoints are deleted (via database CASCADE)</li>
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

          {/* Section 5: Multi-AI Validation Platform */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Multi-AI Validation Platform</h2>
            <p className="text-muted-foreground mb-4">
              Our core service is the Multi-AI Validation Platform, which analyzes your business decisions 
              and questions using multiple AI models in parallel to provide comprehensive, validated recommendations.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Multi-AI Validation Service</h3>
            <p className="text-muted-foreground mb-4">
              When you submit a validation request, your prompt is analyzed by three AI models simultaneously:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>OpenAI GPT-5 Mini</strong> (with GPT-5-nano as automatic fallback for reliability)</li>
              <li><strong>Google Gemini 3 Pro</strong></li>
              <li><strong>Google Gemini 3 Flash</strong> (also performs meta-evaluation/synthesis)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Processed</h4>
            <p className="text-muted-foreground mb-4">
              For each validation request, the following data is processed:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Your prompt:</strong> The business question or decision you want validated (maximum 500 characters)</li>
              <li><strong>Risk tolerance preference:</strong> A value from 1-5 indicating your risk tolerance</li>
              <li><strong>Analysis style preference:</strong> A value from 1-5 indicating your preferred analysis style (conservative to creative)</li>
              <li><strong>User ID:</strong> Your authenticated user identifier (to associate results with your account)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Stored</h4>
            <p className="text-muted-foreground mb-4">
              After processing, the following data is stored in our database:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Your original prompt</li>
              <li>Your risk and creativity preferences</li>
              <li>The responses from each AI model (GPT, Gemini Pro, Gemini Flash)</li>
              <li>The meta-evaluation results (consensus points, majority opinions, dissenting views)</li>
              <li>The final synthesized recommendation</li>
              <li>Overall confidence score</li>
              <li>Processing time</li>
              <li>Timestamp of the analysis</li>
              <li>Model weights (optional user-defined influence percentages for each selected AI model)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">AI Model Providers</h4>
            <h4 className="text-lg font-semibold mb-2 mt-4">Base Models (Available to All Users)</h4>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-muted-foreground border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Provider</th>
                    <th className="border border-border p-3 text-left font-semibold">Model</th>
                    <th className="border border-border p-3 text-left font-semibold">Location</th>
                    <th className="border border-border p-3 text-left font-semibold">Data Transfer Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3"><strong>OpenAI</strong> (via Lovable AI Gateway)</td>
                    <td className="border border-border p-3">GPT-5 Mini</td>
                    <td className="border border-border p-3">United States</td>
                    <td className="border border-border p-3">Art. 46(2)(c) GDPR (SCCs)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Google LLC</strong> (via Lovable AI Gateway)</td>
                    <td className="border border-border p-3">Gemini 3 Flash</td>
                    <td className="border border-border p-3">United States</td>
                    <td className="border border-border p-3">Art. 45 GDPR (EU-US DPF Adequacy)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Anthropic PBC</strong></td>
                    <td className="border border-border p-3">Claude Sonnet 4</td>
                    <td className="border border-border p-3">United States</td>
                    <td className="border border-border p-3">Art. 46(2)(c) GDPR (SCCs)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Perplexity AI, Inc.</strong></td>
                    <td className="border border-border p-3">Sonar Pro (with web search)</td>
                    <td className="border border-border p-3">United States</td>
                    <td className="border border-border p-3">Art. 46(2)(c) GDPR (SCCs)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-lg font-semibold mb-2 mt-4">Premium Models (Available to Premium Subscribers Only)</h4>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-muted-foreground border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Provider</th>
                    <th className="border border-border p-3 text-left font-semibold">Model</th>
                    <th className="border border-border p-3 text-left font-semibold">Location</th>
                    <th className="border border-border p-3 text-left font-semibold">Data Transfer Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3"><strong>Google LLC</strong> (via Lovable AI Gateway)</td>
                    <td className="border border-border p-3">Gemini 3 Pro Preview</td>
                    <td className="border border-border p-3">United States</td>
                    <td className="border border-border p-3">Art. 45 GDPR (EU-US DPF Adequacy)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Perplexity AI, Inc.</strong></td>
                    <td className="border border-border p-3">Sonar Reasoning Pro (with enhanced web search)</td>
                    <td className="border border-border p-3">United States</td>
                    <td className="border border-border p-3">Art. 46(2)(c) GDPR (SCCs)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-lg font-semibold mb-2 mt-4">API Gateway Services</h4>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-muted-foreground border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Provider</th>
                    <th className="border border-border p-3 text-left font-semibold">Purpose</th>
                    <th className="border border-border p-3 text-left font-semibold">Location</th>
                    <th className="border border-border p-3 text-left font-semibold">Data Transfer Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3"><strong>Lovable AI Gateway</strong></td>
                    <td className="border border-border p-3">API routing for OpenAI and Google models</td>
                    <td className="border border-border p-3">European Union</td>
                    <td className="border border-border p-3">No third-country transfer (EU-based)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-lg font-semibold mb-2 mt-4">Web Search Functionality</h4>
            <p className="text-muted-foreground mb-4">
              Certain AI models (Perplexity Sonar Pro and Sonar Reasoning Pro) perform automated web searches 
              to provide up-to-date market data and industry information in their analyses. When you use these models:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Your validation prompt is used as the basis for web searches</li>
              <li>Relevant web content is retrieved and incorporated into the AI analysis</li>
              <li>Source URLs are provided as citations in the response</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              This web search functionality is integral to providing current and grounded business recommendations.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Third-Party AI Provider Privacy Policies</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  OpenAI Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google Privacy Policy
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
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for the performance of the 
                contract (providing the AI validation service you requested)
              </li>
              <li>
                <strong>Art. 6(1)(f) GDPR:</strong> Legitimate interest in providing accurate and reliable 
                AI-powered business recommendations
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Validation Limits and Usage Tracking</h3>
            <p className="text-muted-foreground mb-4">
              To ensure fair usage and service sustainability, validation requests are subject to daily limits:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Free users:</strong> 2 validations per 24-hour rolling window</li>
              <li><strong>Premium users ($26.99/month):</strong> 10 validations per 24-hour rolling window</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Stored for Usage Tracking</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>validation_count:</strong> Number of validations used in the current 24-hour window</li>
              <li><strong>validation_window_start:</strong> Timestamp when the current 24-hour window began</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              The 24-hour window resets automatically when you make a new request after the previous window has expired.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary to enforce the terms of service 
              and subscription limits.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Validation History</h3>
            <p className="text-muted-foreground mb-4">
              Your validation history is automatically managed to optimize storage:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Retention limit:</strong> Only your 10 most recent analyses are retained</li>
              <li><strong>Automatic cleanup:</strong> When loading your history, older analyses (beyond the 10 most recent) are automatically deleted along with any associated experiments</li>
              <li><strong>Manual deletion:</strong> You can delete individual analyses at any time through the platform interface</li>
              <li><strong>Cascade deletion:</strong> When an analysis is deleted, all associated experiments, tasks, and checkpoints are automatically deleted (database CASCADE)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for providing the validation 
              history feature as part of the service.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Experiment Workflow</h3>
            <p className="text-muted-foreground mb-4">
              You can convert validation results into structured experiments to track decision implementation. 
              This feature helps you move from analysis to action with clear accountability.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Processed and Stored</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Decision question:</strong> The specific question you're testing (maximum 300 characters)</li>
              <li><strong>Hypothesis:</strong> Your expected outcome (maximum 300 characters)</li>
              <li><strong>Experiment duration:</strong> The planned length of your experiment in days</li>
              <li><strong>Success metrics:</strong> Configurable metrics with target values and weights for scoring</li>
              <li><strong>Tasks:</strong> Individual action items with outcomes (positive/negative/neutral evidence)</li>
              <li><strong>Scorecard results:</strong> 1-10 ratings for each success metric</li>
              <li><strong>Final decision:</strong> GO or NO-GO determination</li>
              <li><strong>Decision rationale:</strong> Your reasoning for the final decision (maximum 300 characters)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Experiment Lifecycle</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Experiments are linked to their parent validation analysis</li>
              <li>Only one active experiment can exist per validation</li>
              <li>Experiments are permanently deleted when completed (not archived)</li>
              <li>Experiments are automatically deleted when the parent analysis is deleted (CASCADE)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for providing the experiment 
                tracking feature as part of the service
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.5 Premium Features and Gating</h3>
            <p className="text-muted-foreground mb-4">
              Premium subscribers receive enhanced analysis output:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Free users:</strong> Limited to 1 recommendation and 2 action items per analysis</li>
              <li><strong>Premium users:</strong> Receive 4-5 recommendations, 5-7 action items, plus exclusive sections (strategic alternatives, long-term outlook, competitor insights)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Premium status is determined by your subscription status stored in the user_credits table.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.6 Decision Audit Records (Premium)</h3>
            <p className="text-muted-foreground mb-4">
              Premium subscribers can create auditable decision records that document their acknowledgment 
              of decision ownership. This feature provides legal documentation for compliance and 
              accountability purposes.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Data Processed and Stored</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Decision title:</strong> First 100 characters of your validation prompt</li>
              <li><strong>Decision context:</strong> Full validation prompt text</li>
              <li><strong>Ownership confirmation status:</strong> Whether you confirmed decision ownership</li>
              <li><strong>Confirmation timestamp:</strong> When confirmation was submitted</li>
              <li><strong>Export metadata:</strong> PDF export count and timestamps</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Audit Log</h4>
            <p className="text-muted-foreground mb-4">
              Each confirmation creates an audit log entry containing:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Action performed ("confirmed")</li>
              <li>Actor ID (your user identifier)</li>
              <li>Timestamp of the action</li>
              <li>Metadata (which acknowledgment statements were confirmed)</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">PDF Generation</h4>
            <p className="text-muted-foreground mb-4">
              Decision audit reports are generated locally in your browser using client-side PDF rendering. 
              The PDF file is never transmitted to our servers – it is created and downloaded directly to 
              your device.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Art. 6(1)(b) GDPR:</strong> Processing is necessary for contract performance 
                (providing the decision documentation feature as part of Premium service)
              </li>
              <li>
                <strong>Art. 6(1)(f) GDPR:</strong> Legitimate interest in providing legally defensible 
                documentation for business decisions
              </li>
            </ul>
          </section>

          {/* Section 5.7: Dashboard Statistics */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-3 mt-6">5.7 Dashboard Statistics</h3>
            <p className="text-muted-foreground mb-4">
              Your personal Dashboard displays aggregated statistics derived from your stored validation 
              analyses, including model usage frequency, confidence score trends, and AI agreement rates. 
              This data is calculated from already stored validation data (as described in Section 5.1) 
              and is not shared with third parties.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (contract performance).
            </p>
          </section>

          {/* Section 6: Premium Subscription */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Premium Subscription and Payment Processing</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Subscription Overview</h3>
            <p className="text-muted-foreground mb-4">
              We offer a Premium subscription at $26.99/month that provides enhanced validation limits 
              and more detailed analysis output.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Payment Processing via Freemius</h3>
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

            <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Subscription Status Synchronization</h3>
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

          {/* Section 7: Email Communication */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Email Communication</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Transactional Emails</h3>
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

            <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Marketing Emails (Optional)</h3>
            <p className="text-muted-foreground mb-4">
              With your explicit consent, we may send you marketing communications about new features, 
              tips for using the platform, and special offers.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Consent collection:</strong> Marketing consent is requested during your first login 
              via an optional, unchecked-by-default checkbox. You are never automatically subscribed.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Consent management:</strong> You can withdraw your consent at any time through your 
              Profile settings.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Data stored:</strong>
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Marketing consent status (true/false)</li>
              <li>Timestamp when consent was given or withdrawn</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(a) GDPR (consent).
            </p>
          </section>

          {/* Section 8: Hosting */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Hosting and Infrastructure</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Website Hosting</h3>
            <p className="text-muted-foreground mb-4">
              Our website is hosted on infrastructure provided by Lovable (Lovable Cloud), which utilizes 
              Supabase for backend services including database, authentication, and edge functions.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Provider Information</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> Supabase, Inc. (via Lovable Cloud)
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
          </section>

          {/* Section 9: Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Form and Email Inquiries</h2>
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

          {/* Section 10: External Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. External Links</h2>
            <p className="text-muted-foreground mb-4">
              Our website may contain links to external websites. We have no control over the content or 
              privacy practices of these external sites. Please refer to their respective privacy policies.
            </p>
          </section>

          {/* Section 11: Categories of Personal Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Categories of Personal Data Processed</h2>
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
                    <td className="border border-border p-3"><strong>Validation Data</strong></td>
                    <td className="border border-border p-3">Prompts (max 500 chars), risk/creativity preferences</td>
                    <td className="border border-border p-3">Multi-AI validation service</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>AI Responses</strong></td>
                    <td className="border border-border p-3">GPT-5 Mini, Gemini 2.5 Flash, Gemini 3 Pro, Claude Sonnet 4, Sonar Pro, Sonar Reasoning Pro responses, meta-evaluation</td>
                    <td className="border border-border p-3">Providing comprehensive analysis</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Experiment Data</strong></td>
                    <td className="border border-border p-3">Hypotheses, tasks, outcomes, scorecard ratings, decisions</td>
                    <td className="border border-border p-3">Decision tracking and accountability</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Usage Data</strong></td>
                    <td className="border border-border p-3">Validation counts, timestamps, premium status</td>
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
                    <td className="border border-border p-3"><strong>Decision Records</strong> (Premium)</td>
                    <td className="border border-border p-3">Ownership confirmations, decision context, export metadata, audit logs</td>
                    <td className="border border-border p-3">Legal documentation and decision accountability</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 12: Recipients of Personal Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Recipients of Personal Data</h2>
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
                    <td className="border border-border p-3"><strong>Lovable AI Gateway</strong></td>
                    <td className="border border-border p-3">AI API routing</td>
                    <td className="border border-border p-3">Validation prompts</td>
                    <td className="border border-border p-3">EU (no transfer)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>OpenAI</strong> (via Lovable AI Gateway)</td>
                    <td className="border border-border p-3">AI validation analysis</td>
                    <td className="border border-border p-3">Validation prompts, preferences</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Google LLC</strong> (via Lovable AI Gateway)</td>
                    <td className="border border-border p-3">AI validation, OAuth</td>
                    <td className="border border-border p-3">Validation prompts, OAuth data</td>
                    <td className="border border-border p-3">DPF (Art. 45)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Anthropic</strong></td>
                    <td className="border border-border p-3">AI validation analysis</td>
                    <td className="border border-border p-3">Validation prompts, preferences</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Perplexity AI</strong></td>
                    <td className="border border-border p-3">AI validation with web research</td>
                    <td className="border border-border p-3">Validation prompts, preferences</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Supabase</strong></td>
                    <td className="border border-border p-3">Hosting, database</td>
                    <td className="border border-border p-3">All stored data</td>
                    <td className="border border-border p-3">DPF (Art. 45)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Resend</strong></td>
                    <td className="border border-border p-3">Transactional emails</td>
                    <td className="border border-border p-3">Email address</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3"><strong>Freemius</strong></td>
                    <td className="border border-border p-3">Payment processing</td>
                    <td className="border border-border p-3">Email, payment details</td>
                    <td className="border border-border p-3">SCCs (Art. 46(2)(c))</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground mb-4">
              We do not sell your personal data to third parties.
            </p>
          </section>

          {/* Section 13: Obligation to Provide Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Obligation to Provide Personal Data</h2>
            <p className="text-muted-foreground mb-4">
              The provision of personal data is partially required by law or may result from contractual 
              provisions. Specifically:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Email address:</strong> Required for account creation and authentication. Without 
                providing an email address, you cannot create an account or use the validation services.
              </li>
              <li>
                <strong>Validation prompt:</strong> Required to receive AI-powered analysis. Without 
                submitting your question, we cannot provide recommendations.
              </li>
              <li>
                <strong>Payment information:</strong> Required only if you wish to subscribe to Premium. 
                Free users are not required to provide payment information.
              </li>
            </ul>
          </section>

          {/* Section 14: Automated Decision-Making */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Automated Decision-Making and Profiling</h2>
            <p className="text-muted-foreground mb-4">
              Our Multi-AI Validation Platform uses artificial intelligence to analyze your business questions 
              and provide recommendations. This constitutes automated processing but NOT automated decision-making 
              with legal effects as defined in Art. 22 GDPR, because:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>The AI provides recommendations and analysis, not binding decisions</li>
              <li>You retain full control over whether to act on any recommendation</li>
              <li>The output does not produce legal effects or similarly significantly affect you</li>
              <li>The analysis is advisory in nature and requires your human judgment for implementation</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">How the AI Processing Works</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>You select exactly 3 AI models from the available options and assign influence weights (10-80% each)</li>
              <li>Your prompt is sent to all three selected models simultaneously</li>
              <li>Available models include: GPT-5 Mini, Gemini 2.5 Flash, Claude Sonnet 4, Perplexity Sonar Pro (base); Gemini 3 Pro Preview, Sonar Reasoning Pro (premium)</li>
              <li>Each model provides independent analysis based on the prompt and your preferences</li>
              <li>A synthesis AI process (meta-evaluation by Gemini 2.5 Flash) combines the responses, respecting your assigned weights</li>
              <li>The system identifies consensus points, majority opinions, and dissenting views</li>
              <li>A final recommendation is generated based on this weighted multi-model analysis</li>
            </ul>

            <p className="text-muted-foreground mb-4">
              <strong>Transparency:</strong> You can see the individual responses from each AI model, 
              allowing you to understand how the final recommendation was derived.
            </p>
          </section>

          {/* Section 15: Storage Duration */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Storage Duration</h2>
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
                    <td className="border border-border p-3">Validation analyses</td>
                    <td className="border border-border p-3">10 most recent retained</td>
                    <td className="border border-border p-3">Automatic cleanup or manual deletion</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Experiments</td>
                    <td className="border border-border p-3">Until completion or deletion</td>
                    <td className="border border-border p-3">User completes/deletes experiment</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Usage counters</td>
                    <td className="border border-border p-3">24-hour rolling window</td>
                    <td className="border border-border p-3">Automatic reset after 24 hours</td>
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
                    <td className="border border-border p-3">Decision records (Premium)</td>
                    <td className="border border-border p-3">Until account deletion</td>
                    <td className="border border-border p-3">User-initiated or CASCADE on account deletion</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Decision audit logs (Premium)</td>
                    <td className="border border-border p-3">Until account deletion</td>
                    <td className="border border-border p-3">CASCADE when parent decision record is deleted</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground mb-4">
              When you delete your account, all associated data is permanently deleted, including 
              decision records and their associated audit logs (database CASCADE), except for the 
              temporary email hash used to prevent immediate re-registration (deleted after 24 hours).
            </p>
          </section>

          {/* Section 16: Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Your Rights Under GDPR</h2>
            <p className="text-muted-foreground mb-4">
              Under the General Data Protection Regulation (GDPR), you have the following rights regarding 
              your personal data:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">16.1 Right of Access (Art. 15 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to obtain confirmation as to whether personal data concerning you is being 
              processed. If so, you have the right to access that data and receive information about the 
              processing.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">16.2 Right to Rectification (Art. 16 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to request correction of inaccurate personal data and, where applicable, 
              completion of incomplete personal data.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">16.3 Right to Erasure (Art. 17 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to request deletion of your personal data under certain conditions. You 
              can delete your account at any time through the Profile settings, which will permanently 
              erase all your data.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">16.4 Right to Restriction of Processing (Art. 18 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to request restriction of processing under certain conditions, for example, 
              if you contest the accuracy of the data.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">16.5 Right to Data Portability (Art. 20 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to receive your personal data in a structured, commonly used, and 
              machine-readable format and to transmit that data to another controller.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">16.6 Right to Object (Art. 21 GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to object to processing based on legitimate interests (Art. 6(1)(f) GDPR). 
              We will cease processing unless we demonstrate compelling legitimate grounds that override 
              your interests.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">16.7 Right to Withdraw Consent (Art. 7(3) GDPR)</h3>
            <p className="text-muted-foreground mb-4">
              Where processing is based on consent (e.g., marketing emails), you have the right to withdraw 
              consent at any time. Withdrawal does not affect the lawfulness of processing before withdrawal.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">16.8 Right to Lodge a Complaint (Art. 77 GDPR)</h3>
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

            <h3 className="text-xl font-semibold mb-3 mt-6">16.9 Exercising Your Rights</h3>
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

          {/* Section 17: Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">17. Changes to This Privacy Policy</h2>
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
              <li><strong>Version 5.4 (January 24, 2026):</strong> Added model weights to data stored list. Added Dashboard Statistics section (5.7). Corrected Gemini model name to "Gemini 3 Flash".</li>
              <li><strong>Version 5.3 (January 23, 2026):</strong> Added Decision Audit Records section (5.6) documenting Premium decision ownership confirmation feature, audit logging, and client-side PDF generation. Updated data categories and retention tables.</li>
              <li><strong>Version 5.2 (January 21, 2026):</strong> Corrected Berlin Data Protection Authority address (Alt-Moabit 59-61). Updated Recipients table: removed OpenRouter, added Lovable AI Gateway, Anthropic, and Perplexity AI. Updated AI model names in data categories.</li>
              <li><strong>Version 5.1 (January 21, 2026):</strong> Removed obsolete database tables and edge functions (Business Tools Advisor, Ads Advisor, Firecrawl). Cleaned up version history to reflect current platform scope.</li>
              <li><strong>Version 5.0 (January 21, 2026):</strong> Added Anthropic (Claude Sonnet 4) and Perplexity AI (Sonar Pro, Sonar Reasoning Pro) providers. Documented Lovable AI Gateway. Added web search functionality disclosure. Updated model selection and weighting documentation.</li>
              <li><strong>Version 4.0 (January 17, 2026):</strong> Complete rewrite for Multi-AI Validation Platform. Added documentation for multi-model AI validation, experiment workflow, and updated data processing practices.</li>
            </ul>
          </section>

          <section className="mb-8 border-t border-border pt-8">
            <p className="text-muted-foreground text-center">
              Last updated: January 24, 2026
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
