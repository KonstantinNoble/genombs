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
          <p className="text-muted-foreground mb-8">Effective Date: December 8, 2025 | Version 2.6</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction and Controller Information</h2>
            <p className="text-muted-foreground mb-4">
              We appreciate your interest in our website. This Privacy Policy explains how we handle personal data when
              you visit our website.
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
              When you log in to your account via Google OAuth, we store a session token in your browser's local storage to maintain 
              your logged-in state. This token originates from Google's authentication service and is technically necessary for 
              authentication. This is covered by § 25 Abs. 2 Nr. 2 TTDSG, as it is essential for providing the requested service.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (necessary for contract performance) and Art. 6(1)(f) GDPR 
              (legitimate interest in providing secure authentication).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Authentication (Google OAuth)</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Authentication Method</h3>
            <p className="text-muted-foreground mb-4">
              Our website uses Google OAuth exclusively for user authentication. This means you log in using your existing 
              Google account instead of creating a separate password for our website. This authentication method offers 
              enhanced security through Google's infrastructure and provides a seamless login experience.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Why Google OAuth?</strong>
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Enhanced security through Google's proven authentication infrastructure</li>
              <li>No need to remember additional passwords</li>
              <li>Two-factor authentication and advanced security features from Google</li>
              <li>Streamlined login process across devices</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Data Received from Google</h3>
            <p className="text-muted-foreground mb-4">
              When you authenticate via Google OAuth, we receive the following data from your Google account:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><strong>Email address</strong> (required) – Used as your primary account identifier and for communications</li>
              <li><strong>Name</strong> (optional) – If provided by your Google profile, used for personalization</li>
              <li><strong>Google User ID</strong> – A unique identifier from Google to link your account</li>
              <li><strong>Profile picture URL</strong> (optional) – If available from your Google account</li>
              <li><strong>Timestamps</strong> – Account creation date and last login time</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              We do NOT receive or store your Google password. Authentication is handled entirely by Google's secure 
              infrastructure.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Legal Basis</h3>
            <p className="text-muted-foreground mb-4">
              The processing of your Google OAuth data is based on:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Art. 6(1)(b) GDPR</strong> – Processing is necessary for the performance of the contract. 
                Authentication is required to provide you with user-specific features and services.
              </li>
              <li>
                <strong>Art. 6(1)(f) GDPR</strong> – Our legitimate interest in offering secure, convenient, and 
                personalized services while protecting user accounts against unauthorized access.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Google as Third Party</h3>
            <p className="text-muted-foreground mb-4">
              <strong>Service provider:</strong> Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Data transfer to USA:</strong> When you use Google OAuth, your authentication data is processed 
              by Google LLC in the United States. This involves a data transfer to a third country outside the European 
              Economic Area (EEA).
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis for third-country transfer:</strong> Art. 45 GDPR (Adequacy Decision)
              <br />
              Google LLC is certified under the EU-U.S. Data Privacy Framework (DPF). The European Commission has 
              recognized the DPF as providing an adequate level of data protection equivalent to EU law. Therefore, 
              data transfers to Google for authentication purposes are based on the adequacy decision pursuant to 
              Art. 45 GDPR and do not require additional safeguards such as Standard Contractual Clauses.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Google Privacy Policy:</strong>{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://policies.google.com/privacy
              </a>
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Google DPF Certification:</strong>{" "}
              <a
                href="https://www.dataprivacyframework.gov/s/participant-search/participant-detail?id=a2zt000000001L5AAI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Data Privacy Framework
              </a>
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.5 Backend Infrastructure</h3>
            <p className="text-muted-foreground mb-4">
              User authentication and data storage are handled through a secure backend infrastructure. All authentication 
              data and OAuth tokens are encrypted during transmission using industry-standard SSL/TLS protocols. The 
              backend infrastructure is hosted on servers that comply with GDPR requirements, with data transfers to 
              third countries secured through appropriate safeguards including adequacy decisions and Standard 
              Contractual Clauses (SCCs) where applicable.
            </p>
            <h3 className="text-xl font-semibold mb-3 mt-6">4.6 Storage Duration</h3>
            <p className="text-muted-foreground mb-4">
              Your account data is stored as long as your account remains active. You may delete your account at any 
              time through your account settings or by contacting us directly. When you delete your account:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Your personal data is immediately and permanently removed from our production database</li>
              <li>
                Copies in automated backup systems (maintained by our hosting provider for disaster recovery) are 
                retained for a technically determined period and then permanently deleted. We do not have direct 
                control over the backup infrastructure or retention periods, which are determined by our hosting 
                provider's technical capabilities.
              </li>
              <li>
                During the backup retention period, these data cannot be accessed, restored, or used for any operational
                purposes
              </li>
              <li>
                <strong>Important:</strong> We strongly recommend that you download and save your own copies of any 
                important data before deleting your account, as we cannot guarantee recovery after deletion.
              </li>
              <li>Legal retention obligations may require us to keep certain records beyond this period</li>
            </ul>
            <h3 className="text-xl font-semibold mb-3 mt-6">4.7 Account Management</h3>
            <p className="text-muted-foreground mb-4">
              You can access your account information at any time by navigating to your profile page while logged in. 
              This page displays your profile information, including your email address and account creation date.
            </p>
            <h3 className="text-xl font-semibold mb-3 mt-6">4.8 Account Deletion</h3>
            <p className="text-muted-foreground mb-4">
              You have the right to delete your account and all associated personal data at any time. Our website 
              provides a self-service account deletion feature accessible through your account settings. When you 
              initiate account deletion:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                Your profile data (email, name, timestamps) is immediately and permanently deleted from our production
                database
              </li>
              <li>
                All authentication data (Google OAuth tokens, session tokens) are invalidated and removed from active
                systems
              </li>
              <li>The deletion is irreversible and cannot be undone once processed</li>
              <li>You will be automatically logged out and redirected to the homepage</li>
              <li>
                The deletion process uses a secure cascade mechanism to ensure no personal data remains accessible in
                our production systems
              </li>
              <li>
                Copies in automated backup systems (used solely for disaster recovery) are retained for a technically 
                determined period and then permanently deleted. We do not have direct control over the backup 
                infrastructure or retention periods. During this retention period, backup data cannot be accessed or 
                restored for normal operations.
              </li>
              <li>
                <strong>Recommendation:</strong> Please download your data before deletion if you need to retain it, 
                as recovery cannot be guaranteed after account deletion.
              </li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">4.9 Email Hash Storage for Abuse Prevention</h3>
            <p className="text-muted-foreground mb-4">
              To prevent abuse and protect against accidental re-registration, we create a cryptographic hash (SHA-256) 
              of your email address and store it temporarily for up to 24 hours after account deletion. This hash is a 
              one-way encryption that cannot be reversed to reveal your email address.
            </p>
            <p className="text-muted-foreground mb-4">
              During this period (up to 24 hours), the same email address cannot be used to create a new account. This prevents:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Accidental duplicate registrations immediately after deletion</li>
              <li>Abuse of free trial or quota systems through repeated account creation</li>
              <li>Confusion from rapid account deletion and recreation cycles</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              After this period, the hash is automatically deleted from our systems, and the email address becomes 
              available for registration again.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(f) GDPR – Legitimate interest in preventing abuse, maintaining 
              system integrity, and protecting against accidental duplicate registrations.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Data minimization:</strong> We use SHA-256 cryptographic hashing instead of storing plain email 
              addresses, ensuring that the stored hash cannot be used to identify you or be reversed to obtain your 
              email address.
            </p>
            
            <p className="text-muted-foreground mb-4 mt-6">
              Alternatively, you may also request account deletion by contacting us at mail@wealthconomy.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. AI-Powered Features</h2>
            <p className="text-muted-foreground mb-4">
              Our website offers an AI-powered advisory service that analyzes your business context, objectives, and requirements 
              to provide personalized strategic recommendations. This feature is available to registered users and requires 
              authentication.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>IMPORTANT DISCLAIMER:</strong> These features provide general recommendations and information for
              educational and informational purposes only. They do NOT constitute professional business consulting,
              legal advice, advertising consulting, or personalized business strategy consultation. You should consult with 
              qualified business advisors, marketing professionals, and legal professionals before making significant business 
              decisions. Results may vary, and we make no guarantees regarding the effectiveness of recommended tools, strategies, 
              advertising campaigns, or business ideas for your specific business situation.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Business Tools Advisor</h3>
            <p className="text-muted-foreground mb-4">
              The Business Tools Advisor analyzes your business profile to provide personalized recommendations for 
              business tools, software solutions, and strategic approaches tailored to your industry, team size, budget, 
              and business objectives.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Data Processing for Business Tools Analysis</h3>
            <p className="text-muted-foreground mb-4">
              When you use this feature, the following personal data is processed:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Business Profile Data (stated preferences):</strong>
                <ul className="list-disc pl-6 mt-2">
                  <li>Industry sector (e.g., technology, retail, healthcare, manufacturing, etc.)</li>
                  <li>Team size (solo, 2-10, 11-50, 51-200, 200+ employees)</li>
                  <li>
                    Budget range for business tools (e.g., &lt;$100/month, $100-500/month, $500-2000/month,
                    $2000+/month)
                  </li>
                  <li>Business goals and objectives (text description of what you want to achieve)</li>
                </ul>
              </li>
              <li>
                <strong>User Account Data:</strong>
                <ul className="list-disc pl-6 mt-2">
                  <li>User ID (to manage your analysis history and daily usage limit)</li>
                  <li>Timestamps (date and time of analysis requests)</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Role of Lovable AI Gateway</h3>
            <p className="text-muted-foreground mb-4">
              The Lovable AI Gateway (operated by Lovable Labs Incorporated, 340 S Lemon Ave #9828, Walnut, CA 91789,
              USA) acts as an intermediary service that routes AI requests to Google's AI models. The gateway:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Receives your business profile data from our backend (Supabase Edge Functions)</li>
              <li>Forwards the request to Google AI models</li>
              <li>Returns the generated response to our backend</li>
              <li>Acts as a data processor under Art. 28 GDPR on behalf of our website</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Data Processing Agreement:</strong> A Data Processing Agreement (DPA) pursuant to Art. 28 GDPR has
              been concluded with Lovable Labs Incorporated covering all processing activities through the AI Gateway.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">AI Model Provider and Third-Country Transfer</h3>
            <p className="text-muted-foreground mb-4">
              To generate business tool recommendations, your business profile data is transmitted through our
              backend infrastructure and the Lovable AI Gateway to Google AI:
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Google AI Models</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Models:</strong> Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.5 Flash Lite
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis for third-country transfer:</strong> Art. 45 GDPR (Adequacy Decision)
              <br />
              Google LLC is certified under the EU-U.S. Data Privacy Framework (DPF). The European Commission has
              recognized the DPF as providing an adequate level of data protection equivalent to EU law. Therefore, data
              transfers to Google for AI processing are based on the adequacy decision pursuant to Art. 45 GDPR and do
              not require additional safeguards such as Standard Contractual Clauses.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Data usage by Google:</strong> According to Google Cloud's API data usage policies, input data
              submitted through the Gemini API is not used to train or improve Google's models. Google retains API
              request data for a limited period for abuse prevention and security monitoring purposes only.
            </p>
            <p className="text-muted-foreground mb-4">More information:</p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                Google Privacy Policy:{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://policies.google.com/privacy
                </a>
              </li>
              <li>
                Google DPF Certification:{" "}
                <a
                  href="https://www.dataprivacyframework.gov/s/participant-search/participant-detail?id=a2zt000000001L5AAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Data Privacy Framework
                </a>
              </li>
              <li>
                Google Cloud API Data Usage:{" "}
                <a
                  href="https://cloud.google.com/terms/service-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Cloud Terms
                </a>
              </li>
            </ul>

            <p className="text-muted-foreground mb-4 mt-4">
              <strong>Lovable AI Gateway Documentation:</strong>{" "}
              <a
                href="https://docs.lovable.dev/features/ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://docs.lovable.dev/features/ai
              </a>
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Purpose and Legal Basis</h3>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Primary legal basis:</strong> Art. 6(1)(b) GDPR – Processing is necessary for the performance of
                the contract (providing the business tools recommendation feature you requested as a registered user)
              </li>
              <li>
                <strong>Legitimate interest:</strong> Art. 6(1)(f) GDPR – Our legitimate interest in providing
                innovative, AI-powered business recommendation features to enhance user experience
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              By using the "Get Recommendations" feature as a logged-in user, you are requesting the contractual service
              of receiving personalized business tool and strategy recommendations based on your stated business context
              and goals. The processing is necessary to fulfill this service request.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Technical and Organizational Security Measures</h3>
            <p className="text-muted-foreground mb-4">
              We implement the following technical safeguards to protect your data during AI processing:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Data minimization:</strong> Only the minimum necessary business profile data is transmitted to
                AI providers. We do not transmit identifying information such as your name, email address, or IP address
                to the AI models.
              </li>
              <li>
                <strong>Encryption in transit:</strong> All data transmissions between our backend, the Lovable AI
                Gateway, and AI providers are encrypted using industry-standard TLS/SSL encryption protocols.
              </li>
              <li>
                <strong>Server-side processing:</strong> AI requests are routed through our backend infrastructure
                (Supabase Edge Functions), ensuring that your client IP address is NOT visible to AI providers. Only the
                backend server's IP address is transmitted.
              </li>
              <li>
                <strong>Pseudonymization:</strong> Your business profile data is processed without direct personal
                identifiers, making it significantly more difficult for AI providers to link the data to your identity.
              </li>
              <li>
                <strong>Access controls:</strong> Strict authentication requirements ensure only authorized users can
                access the AI analysis feature.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Credit System and Usage Quotas</h3>
            <p className="text-muted-foreground mb-4">
              To ensure fair use and prevent abuse, the Business Tools Advisor uses a quota system. The available limits depend on your account type:
            </p>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Standard Users (Free)</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>2 standard analyses per 24-hour period</li>
              <li>Deep analysis mode is not available for free users</li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Premium Users</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>6 standard analyses + 2 deep analyses per 24-hour period</li>
              <li>Access to advanced deep analysis features</li>
              <li>Premium status is managed via the <code className="text-sm">is_premium</code> flag in our database</li>
            </ul>
            
            <p className="text-muted-foreground mb-4">
              <strong>Credit tracking data processed:</strong>
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li><code className="text-sm">standard_analysis_count</code> – Number of standard analyses</li>
              <li><code className="text-sm">deep_analysis_count</code> – Number of deep analyses (premium only)</li>
              <li><code className="text-sm">analysis_window_start</code> – When the current 24-hour period began</li>
              <li>Last analysis timestamp</li>
              <li>Premium status flag (<code className="text-sm">is_premium</code> boolean)</li>
              <li>Freemius Customer ID and Subscription ID (optional external reference for premium subscriptions)</li>
              <li>User ID (to associate credit tracking with your account)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (necessary for contract performance and fair use 
              enforcement) and Art. 6(1)(f) GDPR (legitimate interest in preventing abuse and ensuring equitable 
              service access for all users).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Premium Subscriptions and Payment Processing (Freemius)</h3>
            <p className="text-muted-foreground mb-4">
              We offer premium subscription plans that provide enhanced features and extended usage limits. Payment 
              processing and subscription management are handled exclusively by our payment partner.
            </p>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Merchant of Record</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Freemius, Inc.</strong> (251 Little Falls Drive, Wilmington, Delaware 19808, USA) acts as the Merchant of Record for all 
              premium subscriptions and payment processing. This means Freemius is the seller of record and handles 
              all payment-related matters including:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Payment processing and transaction handling</li>
              <li>VAT/tax compliance (including EU VAT)</li>
              <li>Invoice generation and delivery</li>
              <li>Refund processing and management</li>
              <li>Payment data security and PCI compliance</li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Data Processed by Freemius</h4>
            <p className="text-muted-foreground mb-4">
              When you purchase a premium subscription, Freemius processes the following data:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Email address (to identify your account and send purchase confirmations)</li>
              <li>Name (if provided during checkout)</li>
              <li>Payment information (credit card details, PayPal account - processed securely by Freemius)</li>
              <li>Billing address (for tax compliance purposes)</li>
              <li>Subscription ID and Customer ID (assigned by Freemius)</li>
              <li>Transaction data (purchase date, amount, subscription status, renewal dates)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Important:</strong> We do NOT store or have access to your payment card details. Payment 
              information is processed and secured entirely by Freemius using industry-standard PCI DSS compliance.
            </p>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Webhook Data Processing and Security</h4>
            <p className="text-muted-foreground mb-4">
              To activate and manage your premium status, our system receives encrypted webhook notifications from 
              Freemius about subscription events (e.g., new purchase, renewal, cancellation, refund). These webhooks 
              contain:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Event ID (unique identifier for each webhook event)</li>
              <li>Event type (e.g., "purchase.completed", "subscription.activated", "subscription.cancelled")</li>
              <li>Subscription and Customer IDs (to link the payment to your account)</li>
              <li>Email address (to identify which user account to update)</li>
              <li>HMAC-SHA256 signature (cryptographic verification to prevent tampering)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Security measures:</strong>
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Signature verification:</strong> Every webhook is cryptographically verified using HMAC-SHA256 
                to ensure it genuinely comes from Freemius and has not been tampered with
              </li>
              <li>
                <strong>Event deduplication:</strong> Webhook Event IDs are stored for 30 days to prevent replay 
                attacks and ensure each event is processed only once
              </li>
              <li>
                <strong>Encrypted transmission:</strong> All webhook data is transmitted over secure HTTPS connections
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Based on these webhook events, your premium status in our database is automatically activated, renewed, 
              or deactivated as appropriate.
            </p>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Data Stored in Our Database</h4>
            <p className="text-muted-foreground mb-4">
              After receiving a verified webhook from Freemius, we store the following data in our database:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Premium status flag (<code className="text-sm">is_premium</code> boolean)</li>
              <li>Freemius Customer ID (external reference linking to your Freemius account)</li>
              <li>Webhook Event IDs (stored for 30 days for deduplication, then automatically deleted)</li>
              <li>Event processing timestamps</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Pending Premium Records:</strong> If you purchase a premium subscription before creating an 
              account on our platform, your premium status is stored in a pending table 
              (<code className="text-sm">pending_premium</code>) until you register with the same email address 
              used during checkout. Once you log in for the first time, the premium status is automatically activated.
            </p>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Art. 6(1)(b) GDPR</strong> – Processing is necessary for the performance of the contract 
                (providing premium subscription services you purchased)
              </li>
              <li>
                <strong>Art. 6(1)(f) GDPR</strong> – Legitimate interest in secure payment processing, fraud prevention, 
                and accurate subscription management
              </li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Third-Country Data Transfer</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Service provider:</strong> Freemius, Inc., 251 Little Falls Drive, Wilmington, Delaware 19808, USA
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis for data transfer:</strong> Art. 46(2)(c) GDPR – Standard Contractual Clauses (SCCs)
            </p>
            <p className="text-muted-foreground mb-4">
              Data transfers to Freemius in the United States are safeguarded by Standard Contractual Clauses approved 
              by the European Commission. Freemius has also concluded a Data Processing Agreement (DPA) pursuant to 
              Art. 28 GDPR ensuring GDPR-compliant data handling.
            </p>
            <p className="text-muted-foreground mb-4">
              For more information about Freemius's data protection practices, please refer to the Freemius Privacy Policy and Terms of Service, which are made available to you during the checkout process and in your purchase confirmation email.
            </p>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Storage Duration</h4>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Premium status data:</strong> Stored as long as your subscription is active. After 
                cancellation or expiration, the premium flag is deactivated but the Freemius Customer ID may be 
                retained for legal and accounting purposes (e.g., tax compliance, dispute resolution)
              </li>
              <li>
                <strong>Webhook Event IDs:</strong> Automatically deleted after 30 days (security measure for 
                deduplication)
              </li>
              <li>
                <strong>Pending Premium Records:</strong> Stored until account activation or manual cleanup
              </li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Refunds and Withdrawal Rights</h4>
            <p className="text-muted-foreground mb-4">
              As Freemius acts as the Merchant of Record, they are responsible for processing refunds and handling 
              withdrawal requests in accordance with EU consumer protection laws.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>EU Withdrawal Right:</strong> Under EU law, you have a standard 14-day withdrawal right for 
              online purchases. The specific refund policy (e.g., 7 days, 14 days, 30 days) depends on the 
              subscription plan and is displayed during checkout.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>How to request a refund:</strong> Refund requests must be submitted directly to Freemius 
              through their customer portal or support channels. We do not process refunds ourselves as Freemius is the seller of record.
            </p>
            <p className="text-muted-foreground mb-4">
              Contact information for Freemius is provided in your purchase confirmation email and accessible through your Freemius customer account.
            </p>


            <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Data Storage and Retention</h3>
            <p className="text-muted-foreground mb-4">
              <strong>AI Provider Retention:</strong> Google retains API request data for a limited period
              for abuse monitoring and security purposes, after which it is permanently deleted. Your input data is NOT
              used to train or improve Google's AI models.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Our Database Storage:</strong> Your <strong>10 most recent</strong> analysis entries are stored in our backend database:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>business_tools_history:</strong> Business profile inputs (industry, team size, budget range, 
                business goals, analysis mode) and generated tool recommendations
              </li>
              <li>
                <strong>user_credits:</strong> Credit tracking data including analysis counters, window start timestamps, 
                premium status, and subscription information
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Automatic cleanup:</strong> To ensure optimal performance and manage storage, we automatically 
              retain only your <strong>10 most recent</strong> analysis entries. When you create a new analysis and already 
              have 10 stored entries, the oldest entry is automatically deleted to maintain this limit.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Your control:</strong> You can:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>View your 10 most recent analyses at any time through your profile page</li>
              <li>Delete individual analysis entries from your history</li>
              <li>
                Delete your entire account, which permanently removes all analysis history, credit tracking data, 
                and all associated personal data from our production database
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Backup retention:</strong> Deleted data may remain in encrypted backup systems (maintained by our 
              hosting provider for disaster recovery) for a technically determined period beyond account deletion. During 
              this period, backup data cannot be accessed or restored for normal operations. We recommend downloading your 
              data before account deletion if you need to retain it.
            </p>

          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Email Communication</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Transactional Emails</h3>
            <p className="text-muted-foreground mb-4">
              We send emails that are essential for your use of the service. These include:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Account security notifications</li>
              <li>Payment confirmations and receipts (sent by Freemius)</li>
              <li>Subscription status updates (sent by Freemius)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Note:</strong> Email verification during registration is not required because we use Google OAuth for authentication, which verifies your email address through Google's secure infrastructure.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal Basis:</strong> These emails are necessary for contract fulfillment (GDPR Art. 6(1)(b))
              or legitimate security interests (GDPR Art. 6(1)(f)).
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Opt-Out:</strong> You cannot opt out of transactional emails as they are essential for the service.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Administrative Service Updates (Resend)</h3>
            <p className="text-muted-foreground mb-4">
              For important service communications, we use Resend (Plus Five Five, Inc., USA) to send:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Terms of Service updates</li>
              <li>Privacy Policy changes</li>
              <li>Critical service announcements</li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Data Processed by Resend</h4>
            <p className="text-muted-foreground mb-4">
              When we send service update notifications through Resend, the following data is transmitted:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Your email address (recipient address)</li>
              <li>Your name/username (if included in the notification)</li>
              <li>Email content (service update notifications)</li>
              <li>Technical metadata (timestamps, delivery status)</li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">GDPR Compliance and Data Protection</h4>
            <p className="text-muted-foreground mb-4">
              Resend is fully GDPR-compliant and provides strong data protection guarantees:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Data Processing Agreement (DPA):</strong> We have a Data Processing Agreement with Resend 
                that includes Standard Contractual Clauses (SCCs) approved by the European Commission for data transfers 
                to the United States
              </li>
              <li>
                <strong>EU-US Data Privacy Framework (DPF):</strong> Resend is certified under the EU-US Data Privacy 
                Framework and the UK Extension to the EU-US DPF (certified March 2025), providing additional safeguards 
                for transatlantic data transfers
              </li>
              <li>
                <strong>SOC 2 Compliance:</strong> Resend maintains SOC 2 Type II certification, ensuring robust 
                security controls and data protection measures
              </li>
              <li>
                <strong>Limited data retention:</strong> Resend retains email delivery data only for operational 
                purposes and deletes it according to their data retention policies
              </li>
              <li>
                <strong>No data sharing:</strong> Resend does not sell or share your data with third parties for 
                marketing purposes
              </li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Legal Basis for Processing</h4>
            <p className="text-muted-foreground mb-4">
              The processing of your email address and related data for service update notifications is based on:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Art. 6(1)(c) GDPR – Legal obligation:</strong> For mandatory privacy policy notifications 
                required under GDPR
              </li>
              <li>
                <strong>Art. 6(1)(f) GDPR – Legitimate interest:</strong> We have a legitimate interest in keeping 
                users informed about significant changes to Terms of Service and service announcements that affect 
                your rights or service functionality
              </li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Your Rights</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Important note:</strong> Service update emails are sent only when legally required or when 
              significant changes affect your rights. These cannot be opted out of while maintaining an active account. These are
              transactional emails required for the service, not marketing communications.
            </p>
            <p className="text-muted-foreground mb-4">
              If you do not wish to receive administrative emails, your only option is to delete your account through 
              the account settings.
            </p>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Third-Party Links</h4>
            <p className="text-muted-foreground mb-4">
              For more information about Resend's data protection practices:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <a 
                  href="https://resend.com/legal/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Resend Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="https://resend.com/legal/dpa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Resend Data Processing Agreement (DPA)
                </a>
              </li>
              <li>
                <a 
                  href="https://resend.com/security/gdpr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Resend GDPR Compliance
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Hosting and Data Transfers</h2>
            <p className="text-muted-foreground mb-4">
              Our website is hosted by Lovable Labs Incorporated (lovable.dev). This may involve the transfer of data to
              servers located outside the European Union (e.g., in the United States). The transfer is based on Standard
              Contractual Clauses (SCCs) approved by the European Commission, which ensure an adequate level of data
              protection.
            </p>
            <p className="text-muted-foreground mb-4">
              Lovable.dev engages third-party sub-processors to operate its infrastructure, including Supabase (backend
              database and authentication services), Cloudflare (content delivery network), and others. These
              sub-processors are bound by GDPR-compliant agreements. A current list is maintained at
              https://lovable.dev/privacy. Data transfers to third countries (such as the United States) are safeguarded
              by Standard Contractual Clauses (SCCs).
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Data Processing Agreement (DPA):</strong> We have concluded a Data Processing Agreement pursuant
              to Art. 28 GDPR with Lovable Labs Incorporated, which covers all data processing activities including
              those performed by Lovable's sub-processors, to ensure GDPR-compliant data handling.
            </p>
            <p className="text-muted-foreground mb-4">
              More information:{" "}
              <a
                href="https://lovable.dev/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://lovable.dev/privacy
              </a>
            </p>
            <p className="text-muted-foreground mb-4">
              SSL/TLS encryption is used to secure communication and protect transmitted data. You can recognize an
              encrypted connection by "https://" and the padlock symbol in your browser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p className="text-muted-foreground mb-4">
              If you contact us (e.g., by email), we process the personal data you provide solely to respond to your
              inquiry. The processing is based on our legitimate interest (Art. 6(1)(f) GDPR) in handling such requests.
            </p>
            <p className="text-muted-foreground mb-4">
              We use IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Germany, as our email provider for general 
              correspondence. Data are stored on servers within the European Union, and no data are transferred to 
              third countries. A Data Processing Agreement pursuant to Art. 28 GDPR has been concluded with IONOS to 
              ensure GDPR-compliant data handling.
            </p>
            <p className="text-muted-foreground mb-4">
              Once your request has been completed, your data will be deleted unless legal obligations require
              retention.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Contact information:</strong>
              <br />
              Muhammed Kagan Yilmaz
              <br />
              Aroser Allee 50, 13407 Berlin, Germany
              <br />
              Email: mail@wealthconomy.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. External Links</h2>
            <p className="text-muted-foreground mb-4">
              Our website may contain links to external websites or social media platforms such as Twitter (X). When you
              click on these links, you will be redirected to the respective external platform. Please note that we have
              no control over how these third-party websites process your personal data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Categories of Personal Data</h2>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Contact data (email address, if you contact us)</li>
              <li>User account data (email, user ID, timestamps)</li>
              <li>Authentication data (hashed passwords, session tokens, JWT tokens)</li>
              <li>
                Email hash data (SHA-256 cryptographic hash of deleted account email addresses, stored temporarily 
                for up to 24 hours to prevent abuse and accidental re-registration)
              </li>
              <li>
                Usage data (IP address, browser type, OS, referrer URL) – stored by our hosting provider Lovable.dev for
                technical purposes
              </li>
              <li>Technical connection data (server logs, encrypted SSL/TLS connections)</li>
              <li>
                Business profile data for Business Tools Advisor (industry sector, team size, budget range, business 
                goals and objectives)
              </li>
              <li>
                AI recommendation requests and responses:
                <ul className="list-disc pl-6 mt-2">
                  <li>Business tool recommendations, software suggestions, business strategies (Business Tools Advisor)</li>
                  <li>Complete recommendation history</li>
                </ul>
              </li>
              <li>
                Credit tracking data:
                <ul className="list-disc pl-6 mt-2">
                  <li>Standard analysis count (number of standard-depth analyses)</li>
                  <li>Deep analysis count (number of premium-depth analyses)</li>
                  <li>Analysis window start timestamp (when the current 24-hour period began)</li>
                  <li>Last analysis timestamp (most recent analysis request)</li>
                  <li>Premium status flag (<code className="text-sm">is_premium</code> boolean)</li>
                </ul>
              </li>
              <li>
                Premium subscription data:
                <ul className="list-disc pl-6 mt-2">
                  <li>Premium status flag (<code className="text-sm">is_premium</code> boolean)</li>
                  <li>Freemius Customer ID (external reference for premium subscriptions)</li>
                  <li>Standard and deep analysis counts (for quota management)</li>
                  <li>Analysis window tracking data</li>
                </ul>
              </li>
              <li>
                Webhook processing data (for premium subscriptions):
                <ul className="list-disc pl-6 mt-2">
                  <li>Event IDs (stored for 30 days for deduplication and security)</li>
                  <li>Event types (e.g., purchase, renewal, cancellation, refund)</li>
                  <li>Processing timestamps</li>
                  <li>HMAC-SHA256 signatures (for cryptographic verification)</li>
                </ul>
              </li>
            </ul>
            <p className="text-muted-foreground mb-4 mt-4">
              <strong>Important Note on IP Addresses and AI Processing:</strong> When you use the AI-powered features 
              (Business Tools Advisor), your business profile data is transmitted server-side
              through our backend infrastructure (Supabase Edge Functions) to the Lovable AI Gateway.{" "}
              <strong>Your client IP address is NOT transmitted to Google AI</strong>. Only
              the IP address of our backend server is visible to the AI provider. This server-side architecture
              protects your privacy by ensuring that the AI provider cannot directly identify or track individual users by
              their IP addresses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Recipients of Personal Data</h2>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Hosting provider:</strong> Lovable Labs Incorporated (lovable.dev) – hosts website, manages
                infrastructure, and processes technical connection data (IP addresses, server logs)
              </li>
              <li>
                <strong>Backend services:</strong> Operated by Lovable.dev and their GDPR-compliant sub-processors
                including Supabase (database, authentication, serverless functions, realtime subscriptions)
              </li>
              <li>
                <strong>AI service provider (for Business Tools Advisor):</strong>
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    Lovable AI Gateway (operated by Lovable Labs Incorporated, Walnut, CA, USA) – acts as data processor
                    and intermediary service that routes AI requests to:
                  </li>
                  <li>
                    Google LLC (Mountain View, CA, USA) – Gemini 2.5 models (Pro, Flash, Flash Lite)
                    <br />
                    <em className="text-sm">
                      Third-country transfer basis: Art. 45 GDPR (EU-U.S. Data Privacy Framework adequacy decision)
                    </em>
                  </li>
                </ul>
                <p className="mt-2 text-sm">
                  <strong>Data minimization and security:</strong> AI requests are processed through our backend 
                  (Supabase Edge Functions), which means Google AI receives only your business profile data 
                  (industry, team size, budget range, business goals) without personal identifiers such as your 
                  name, email, or client IP address. Only the backend server's IP address is visible to Google. 
                  All transmissions are encrypted using TLS/SSL protocols.
                </p>
              </li>
              <li>
                <strong>Payment processor and Merchant of Record:</strong> Freemius, Inc. (Wilmington, Delaware, USA)
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    Processes payment transactions, manages premium subscriptions, handles refunds
                  </li>
                  <li>
                    Acts as seller of record for all premium purchases
                  </li>
                  <li>
                    Sends webhook notifications to activate/deactivate premium status
                  </li>
                  <li>
                    <strong>Data transferred:</strong> Email address, name (if provided), payment information, 
                    subscription/customer IDs, transaction data
                  </li>
                  <li>
                    <strong>Third-country transfer basis:</strong> Art. 46(2)(c) GDPR (Standard Contractual Clauses)
                  </li>
                  <li>
                    <strong>DPA:</strong> Data Processing Agreement concluded pursuant to Art. 28 GDPR
                  </li>
                  <li>
                    <strong>Privacy Policy:</strong> Available during checkout and in your purchase confirmation email
                  </li>
                </ul>
              </li>
              <li>
                <strong>Administrative email service provider:</strong> Resend (Plus Five Five, Inc., USA) – 
                transactional and administrative email delivery (account notifications, security alerts, password 
                resets). Certified under EU-US Data Privacy Framework, GDPR-compliant with DPA and Standard 
                Contractual Clauses
              </li>
              <li>
                <strong>Email providers:</strong>
                <ul className="list-disc pl-6 mt-2">
                  <li>IONOS SE (Montabaur, Germany) – general correspondence</li>
                  <li>Resend (Plus Five Five Inc., USA) – service update notifications</li>
                </ul>
              </li>
              <li>
                <strong>Authentication email provider:</strong> Supabase Auth (Supabase Inc., USA) – transactional 
                emails (as part of Lovable Cloud hosting)
              </li>
              <li>
                <strong>Public authorities:</strong> Only if legally required by applicable law
              </li>
            </ul>
            <p className="text-muted-foreground mb-4 mt-4">
              All third-party processors are bound by GDPR-compliant Data Processing Agreements (DPAs) or Standard
              Contractual Clauses (SCCs) where data is transferred to third countries outside the European Economic
              Area.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Obligation to Provide Data</h2>
            <p className="text-muted-foreground mb-4">
              You are generally neither legally nor contractually obliged to provide personal data. Exception: Without
              the provision of technical data (e.g., your IP address), the website cannot be displayed (based on our
              legitimate interest according to Art. 6(1)(f) GDPR). Furthermore, to use our registration-required AI 
              feature (Business Tools Advisor), the provision of your email address and your business profile data 
              is mandatory, as this processing is necessary for the performance of the contract (Art. 6(1)(b) GDPR). 
              We cannot otherwise fulfill the contractually agreed-upon service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Automated Decision-Making / Profiling</h2>
            <p className="text-muted-foreground mb-4">
              <strong>AI-Powered Business Tools Advisor:</strong> Our AI-powered feature 
              (Business Tools Advisor) uses automated processing to generate educational 
              business recommendations and tool suggestions. However, this does NOT constitute
              automated decision-making within the meaning of Art. 22 GDPR because:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>The results are purely informational and educational in nature</li>
              <li>No legal effects or similarly significant effects arise for you</li>
              <li>You retain full control over whether and how to use the suggestions</li>
              <li>No binding decisions are made without human intervention</li>
              <li>The recommendations serve only as guidance and do not determine any outcomes automatically</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Your right to object:</strong> You may object to the use of the AI features at any time by 
              simply not using them or by deleting your account.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>No other automated decisions:</strong> Apart from the AI features described above, we do not 
              engage in automated decision-making or profiling pursuant to Art. 22 GDPR.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement technical and organizational measures to protect your data, including encryption (SSL/TLS),
              restricted server access, and regular security reviews by our hosting provider.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">14.1 Storage Duration for Specific Data Categories</h3>
            <p className="text-muted-foreground mb-4">
              Different categories of personal data are stored for different periods depending on their purpose and 
              legal requirements:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Profile and Account Data:</strong> Stored as long as your account remains active. Permanently 
                deleted when you delete your account (subject to backup retention periods as described in Section 4.6).
              </li>
              <li>
                <strong>Analysis History:</strong> Only your <strong>10 most recent</strong> business tools analyses are 
                retained. Older entries are automatically deleted when new analyses are created. You can also manually 
                delete individual entries at any time.
              </li>
              <li>
                <strong>User Credits and Quota Data:</strong> Analysis counts, window start timestamps, and last 
                analysis timestamps are stored as long as your account is active. Deleted when you delete your account.
              </li>
              <li>
                <strong>Premium Status:</strong> Premium status flag and Freemius Customer ID are stored as long as 
                your subscription is active. After subscription expiration or cancellation, the premium flag is 
                deactivated, but the Customer ID may be retained for legal and accounting purposes (e.g., tax 
                compliance, dispute resolution) in accordance with applicable statutory retention periods.
              </li>
              <li>
                <strong>Webhook Event IDs:</strong> Event IDs used for webhook deduplication are automatically deleted 
                after 30 days. This is a security measure to prevent replay attacks while minimizing data storage.
              </li>
              <li>
                <strong>Pending Premium Records:</strong> If you purchase a premium subscription before creating an 
                account, your premium status is stored in the <code className="text-sm">pending_premium</code> table 
                until you register and activate your account. These records may be manually cleaned up periodically if 
                unclaimed.
              </li>
              <li>
                <strong>Email Hashes (Account Deletion):</strong> SHA-256 cryptographic hashes of deleted account 
                email addresses are stored for up to 24 hours to prevent abuse and accidental re-registration. 
                Automatically deleted after this period.
              </li>
              <li>
                <strong>Server Log Files:</strong> Technical log files (IP addresses, browser data, access times) are 
                stored only for as long as necessary to ensure website stability and security, then automatically 
                deleted or anonymized by our hosting provider.
              </li>
              <li>
                <strong>Contact Correspondence:</strong> Email correspondence with our support is stored only as long 
                as necessary to handle your inquiry, then deleted unless legal retention obligations apply.
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Legal Retention Obligations:</strong> In certain cases, we may be legally required to retain 
              specific data for longer periods (e.g., tax records, accounting data, payment records). When applicable 
              statutory retention periods apply, we will retain the necessary data only for the legally required 
              duration and then permanently delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the following rights under the GDPR:</p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Right of access (Art. 15 GDPR)</strong> – You have the right to obtain confirmation as to
                whether personal data concerning you is being processed and, if so, to access that data.
              </li>
              <li>
                <strong>Right to rectification (Art. 16 GDPR)</strong> – You have the right to obtain the rectification
                of inaccurate personal data and to have incomplete personal data completed.
              </li>
              <li>
                <strong>Right to erasure / "Right to be forgotten" (Art. 17 GDPR)</strong> – You may delete your account
                and all associated personal data at any time via your profile page. Please note:
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    Copies in automated backup systems (maintained for disaster recovery) are retained for a 
                    technically determined period and then permanently deleted. We do not have direct control over the 
                    backup infrastructure or retention periods, which are determined by our hosting provider's 
                    technical capabilities.
                  </li>
                  <li>
                    We recommend downloading your data before deletion if you need to retain it.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Right to restriction of processing (Art. 18 GDPR)</strong> – You have the right to request the
                restriction of processing under certain circumstances.
              </li>
              <li>
                <strong>Right to data portability (Art. 20 GDPR)</strong> – You have the right to receive your personal
                data in a structured, commonly used, and machine-readable format.
              </li>
              <li>
                <strong>Right to object (Art. 21 GDPR)</strong> – You have the right to object to the processing of your
                personal data on grounds relating to your particular situation.
              </li>
              <li>
                <strong>Right to lodge a complaint with a supervisory authority (Art. 77 GDPR)</strong> – You have the
                right to file a complaint with a data protection supervisory authority.
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              You may withdraw any consent you have given for the processing of your personal data at any time with
              future effect. The withdrawal does not affect the lawfulness of the processing carried out before the
              withdrawal.
            </p>
            <p className="text-muted-foreground mb-4">
              You may file a complaint, for example, with:
              <br />
              <strong>Berlin Commissioner for Data Protection and Freedom of Information</strong>
              <br />
              Alt-Moabit 59–61
              <br />
              10555 Berlin, Germany
              <br />
              Email: mailbox@datenschutz-berlin.de
              <br />
              Website:{" "}
              <a
                href="https://www.datenschutz-berlin.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://www.datenschutz-berlin.de
              </a>
            </p>
          </section>


          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time to comply with legal requirements or reflect changes
              in our services. The latest version is always available on this website.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Last updated:</strong> December 8, 2025
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
