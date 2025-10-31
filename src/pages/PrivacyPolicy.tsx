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
              When you log in to your account, we store a session token (JWT) in your browser's local storage to maintain 
              your logged-in state. This token is technically necessary for authentication and is covered by § 25 Abs. 2 
              Nr. 2 TTDSG, as it is essential for providing the requested service.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (necessary for contract performance) and Art. 6(1)(f) GDPR 
              (legitimate interest in providing secure authentication).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Authentication (Login & Registration)</h2>
            <p className="text-muted-foreground mb-4">
              Our website offers a user authentication system that allows you to create an account and log in to access
              premium features. When you register, we collect the following personal data:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Email address</li>
              <li>Password (stored in hashed and encrypted form only)</li>
              <li>Timestamps (account creation date etc.)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong>
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                Art. 6(1)(b) GDPR – The processing is necessary for the performance of the contract (providing
                user-specific features and services).
              </li>
              <li>Art. 6(1)(f) GDPR – Our legitimate interest in offering secure and personalized services.</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Password Requirements</h3>
            <p className="text-muted-foreground mb-4">
              Passwords must be at least 8 characters long. While we recommend using strong passwords with a mix of 
              uppercase letters, lowercase letters, numbers, and symbols, the system enforces only the minimum length 
              requirement to balance security with user convenience.
            </p>
            
            <p className="text-muted-foreground mb-4">
              <strong>Email confirmation:</strong> To ensure the security of your account and verify your email address,
              we require you to confirm your email after registration by clicking on a confirmation link sent to your
              provided email address.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Backend infrastructure:</strong> User authentication and data storage are handled through a secure
              backend infrastructure. Authentication data are encrypted during transmission (SSL/TLS) and passwords are
              stored using industry-standard cryptographic hashing algorithms. The backend infrastructure is hosted on
              servers that comply with GDPR requirements, with data transfers to third countries secured by Standard
              Contractual Clauses (SCCs).
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Storage duration:</strong> Your account data is stored as long as your account remains active. You
              may delete your account at any time through your account settings or by contacting us directly. When you
              delete your account:
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
            <p className="text-muted-foreground mb-4">
              <strong>Account management:</strong> You can access your account information at any time by navigating to
              your profile page while logged in. This page displays your profile information, including your name, email
              address, and account creation date.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Account deletion:</strong> You have the right to delete your account and all associated personal
              data at any time. Our website provides a self-service account deletion feature accessible through your
              account settings. When you initiate account deletion:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                Your profile data (email, timestamps) is immediately and permanently deleted from our production
                database
              </li>
              <li>
                All authentication data (login credentials, session tokens) are invalidated and removed from active
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
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Email Hash Storage for Abuse Prevention</h3>
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
              Our website offers AI-powered features that provide personalized recommendations for business tools,
              software, strategies, and business ideas based on your stated business context and goals. These features 
              are available to registered users and require authentication.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>IMPORTANT DISCLAIMER:</strong> These features provide general recommendations and information for
              educational and informational purposes only. They do NOT constitute professional business consulting,
              legal advice, or personalized business strategy consultation. You should consult with qualified business
              advisors and legal professionals before making significant business decisions. Results may vary, and we
              make no guarantees regarding the effectiveness of recommended tools, strategies, or business ideas for 
              your specific business situation.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Business Tools Advisor</h3>
            <p className="text-muted-foreground mb-4">
              The Business Tools Advisor provides personalized recommendations for business tools, software, and 
              strategies based on your business profile.
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

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Business Ideas Advisor</h3>
            <p className="text-muted-foreground mb-4">
              The Business Ideas Advisor provides personalized business idea recommendations and startup concepts 
              based on your market interests and constraints.
            </p>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Data Processing for Business Ideas Analysis</h4>
            <p className="text-muted-foreground mb-4">
              When you use this feature, the following personal data is processed:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Business Profile Data (stated preferences):</strong>
                <ul className="list-disc pl-6 mt-2">
                  <li>Industry sector (e.g., technology, retail, healthcare, manufacturing, etc.)</li>
                  <li>Team size (solo, 2-10, 11-50, 51-200, 200+ employees)</li>
                  <li>Budget range for business startup (e.g., &lt;$100/month, $100-500/month, $500-2000/month, $2000+/month)</li>
                  <li>Business context (text description of market interests, target audience, or business ideas)</li>
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
            <p className="text-muted-foreground mb-4">
              The Business Ideas Advisor uses the same AI infrastructure as the Business Tools Advisor (Lovable AI 
              Gateway and Google AI models). All data protection safeguards, third-country transfer mechanisms, and 
              technical security measures described in section 4.1 apply equally to this feature.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Data storage:</strong> Your business ideas analysis history is stored separately in the 
              `business_ideas_history` database table and includes your business profile inputs (industry, team size, 
              budget range, business context) and the generated idea recommendations.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (contract performance) and Art. 6(1)(f) GDPR (legitimate 
              interest in providing innovative AI-powered features).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Combined Credit System</h3>
            <p className="text-muted-foreground mb-4">
              To ensure fair use and prevent abuse, both the Business Tools Advisor and Business Ideas Advisor share 
              a unified quota system. You can perform a combined total of 2 analyses per 24-hour period across both 
              features.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Credit tracking data processed:</strong>
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Total analysis count (combined counter for both tools and ideas advisors)</li>
              <li>Analysis window start timestamp (when the current 24-hour period began)</li>
              <li>Last analysis timestamp (most recent analysis request)</li>
              <li>User ID (to associate credit tracking with your account)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              The system automatically tracks your analysis count and enforces the 2-per-24-hour limit. Attempting to 
              perform additional analyses within the 24-hour window will result in an error message indicating when 
              the next analysis will be available.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Realtime synchronization:</strong> The application uses realtime database subscriptions to 
              synchronize your credit status across all features automatically. This ensures accurate quota enforcement 
              regardless of which feature you use.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (necessary for contract performance and fair use 
              enforcement) and Art. 6(1)(f) GDPR (legitimate interest in preventing abuse and ensuring equitable 
              service access for all users).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Notion Idea Board</h3>
            <p className="text-muted-foreground mb-4">
              The Notion Idea Board feature allows you to import, organize, and visualize AI-generated recommendations 
              from both the Business Tools Advisor and Business Ideas Advisor in a unified workspace interface.
            </p>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Data Processing</h4>
            <p className="text-muted-foreground mb-4">
              When you use the Notion Idea Board:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Data sources:</strong> The feature retrieves your existing analysis data from the 
                `business_tools_history` and `business_ideas_history` database tables
              </li>
              <li>
                <strong>Browser localStorage:</strong> Your imported recommendations and workspace preferences 
                (view mode, selected analyses) are stored locally in your web browser's localStorage to persist 
                your workspace state across sessions
              </li>
              <li>
                <strong>No server transmission:</strong> The Notion Idea Board state (imported recommendations, 
                organization preferences) is stored exclusively in your browser's localStorage and is NOT 
                transmitted to our servers
              </li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">localStorage Data</h4>
            <p className="text-muted-foreground mb-4">
              The following data is stored in your browser's localStorage:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Imported recommendation data (derived from your existing analyses)</li>
              <li>View mode state (landing, select, or display view)</li>
              <li>Workspace organization preferences</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Data persistence:</strong> localStorage data persists on your device until you manually clear 
              it using the "Clear All" button in the application or clear your browser's cache/storage.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>User control:</strong> You have full control over your Notion Idea Board data:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Clear all imported data at any time via the "Clear All" button</li>
              <li>Delete individual analyses from the board</li>
              <li>Clear browser localStorage through your browser settings</li>
              <li>Data is automatically cleared when you clear your browser cache</li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Purpose and Legal Basis</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Purpose:</strong> To provide a convenient workspace for organizing and visualizing your 
              AI-generated business recommendations without requiring server-side storage of workspace state.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong>
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Art. 6(1)(b) GDPR – Processing is necessary for the performance of the contract (providing the 
              workspace organization feature you requested)</li>
              <li>Art. 6(1)(f) GDPR – Legitimate interest in providing a user-friendly interface that enhances 
              your experience by persisting workspace preferences locally</li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Privacy Implications</h4>
            <p className="text-muted-foreground mb-4">
              Since Notion Idea Board data is stored exclusively in your browser's localStorage:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>The data never leaves your device</li>
              <li>We cannot access, view, or process your Notion Idea Board workspace state</li>
              <li>The data is only accessible from the specific browser and device where you use the feature</li>
              <li>Clearing browser data or using a different browser/device will reset your Notion Idea Board</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Data Storage and Retention (All AI Features)</h3>
            <p className="text-muted-foreground mb-4">
              <strong>AI Provider Retention:</strong> Google retains API request data for a limited period
              for abuse monitoring and security purposes, after which it is permanently deleted. Your input data is NOT
              used to train or improve Google's AI models.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Our Database Storage:</strong> Your analysis history is stored in our backend database in two 
              separate tables:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>business_tools_history:</strong> Business profile inputs (industry, team size, budget range, 
                business goals) and generated tool recommendations
              </li>
              <li>
                <strong>business_ideas_history:</strong> Business profile inputs (industry, team size, budget range, 
                business context) and generated idea recommendations
              </li>
              <li>Timestamps of all analyses</li>
              <li>Credit tracking data (analysis count, window start, last analysis timestamp)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Browser localStorage:</strong> Notion Idea Board workspace data is stored locally in your 
              browser and persists until cleared by you.
            </p>
            <p className="text-muted-foreground mb-4">
              This data remains stored as long as your account is active. You can:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>View your complete recommendation history at any time through your profile page</li>
              <li>Delete individual recommendation entries from either tools or ideas history</li>
              <li>Clear your Notion Idea Board workspace data using the "Clear All" button</li>
              <li>
                Delete your entire account, which permanently removes all recommendation history and credit tracking 
                data from our production database
              </li>
            </ul>

          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Email Communication</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Transactional Emails (Authentication System)</h3>
            <p className="text-muted-foreground mb-4">
              Our authentication system (operated through Lovable Cloud) sends the following essential transactional emails:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Email verification links after registration</li>
              <li>Password reset links</li>
              <li>Re-verification emails</li>
              <li>Account security notifications</li>
            </ul>
            
            <h4 className="text-lg font-semibold mb-2 mt-4">Email Service Provider</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> Supabase Auth (Supabase Inc., San Francisco, USA)
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Data processed:</strong> Email address, verification tokens, timestamps
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (necessary for contract performance - account creation and 
              authentication services)
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Third-country transfer:</strong> Data transfers to the USA are secured by Standard Contractual 
              Clauses (SCCs) approved by the European Commission. Supabase maintains GDPR-compliant data processing 
              practices and provides appropriate safeguards for international data transfers.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Your Rights:</strong> These transactional emails are essential for account security and cannot be 
              opted out of while maintaining an active account. They are necessary to provide the authentication service 
              you requested.
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
              the account settings. Upon account deletion, we will send one final confirmation email, after which no 
              further emails will be sent.
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
  <h2 className="text-2xl font-semibold mb-4">10. Affiliate Marketing (Impact.com / Shopify)</h2>
  <p className="text-muted-foreground mb-4">
    We participate in the affiliate program operated by Impact Tech, Inc. ("Impact.com"). Through this
    program, we include affiliate links to products or services offered by **Shopify**.
  </p>
  <p className="text-muted-foreground mb-4">
    When you click such a link, you are redirected to the partner website. Impact.com and/or **Shopify** may use cookies or similar technologies to track sales or sign-ups for commission purposes.
  </p>
  <p className="text-muted-foreground mb-4">
    We do not collect, store, or process any affiliate tracking data ourselves. Processing occurs exclusively
    on the partner's website.
  </p>
  <p className="text-muted-foreground mb-4">
    **Legal basis:** Art. 6(1)(a) GDPR – based on your consent given on the partner site.
  </p>
  <p className="text-muted-foreground mb-4">
    For details on data processing by Impact.com, please refer to:{" "}
    <a
      href="https://impact.com/privacy-policy/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      https://impact.com/privacy-policy/
    </a>
  </p>
</section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Categories of Personal Data</h2>
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
                Business profile data for Business Ideas Advisor (industry sector, team size, budget range, business 
                context and market interests)
              </li>
              <li>
                AI recommendation requests and responses:
                <ul className="list-disc pl-6 mt-2">
                  <li>Business tool recommendations, software suggestions, business strategies (Business Tools Advisor)</li>
                  <li>Business idea recommendations, startup concepts, market opportunities (Business Ideas Advisor)</li>
                  <li>Complete recommendation history for both features</li>
                </ul>
              </li>
              <li>
                Combined credit tracking data (total analysis count across both features, analysis window start 
                timestamp, last analysis timestamp, 24-hour usage limit enforcement data)
              </li>
              <li>
                Browser localStorage data (Notion Idea Board workspace state, imported recommendations, view mode 
                preferences – stored locally on your device only, not transmitted to our servers)
              </li>
              <li>
                Affiliate tracking data (only processed on Impact.com / Shopify websites, not on our
                servers)
              </li>
            </ul>
            <p className="text-muted-foreground mb-4 mt-4">
              <strong>Important Note on IP Addresses and AI Processing:</strong> When you use the AI-powered features 
              (Business Tools Advisor or Business Ideas Advisor), your business profile data is transmitted server-side 
              through our backend infrastructure (Supabase Edge Functions) to the Lovable AI Gateway.{" "}
              <strong>Your client IP address is NOT transmitted to Google AI</strong>. Only
              the IP address of our backend server is visible to the AI provider. This server-side architecture
              protects your privacy by ensuring that the AI provider cannot directly identify or track individual users by
              their IP addresses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Recipients of Personal Data</h2>
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
                <strong>AI service provider (for Business Tools Advisor and Business Ideas Advisor):</strong>
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    Lovable AI Gateway (operated by Lovable Labs Incorporated, Walnut, CA, USA) – acts as data processor
                    and intermediary service that routes requests from both AI features to:
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
                  <strong>Data minimization and security:</strong> AI requests from both the Business Tools Advisor and 
                  Business Ideas Advisor are processed through our backend (Supabase Edge Functions), which means Google 
                  AI receives only your business profile data (industry, team size, budget range, business goals or 
                  business context) without personal identifiers such as your name, email, or client IP address. Only 
                  the backend server's IP address is visible to Google. All transmissions are encrypted using TLS/SSL 
                  protocols.
                </p>
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
                <strong>Affiliate partners:</strong> Impact Tech, Inc. (Impact.com) and Shopify – tracking
                only occurs on their websites after you click affiliate links
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
            <h2 className="text-2xl font-semibold mb-4">13. Obligation to Provide Data</h2>
            <p className="text-muted-foreground mb-4">
              You are generally neither legally nor contractually obliged to provide personal data. Exception: Without
              the provision of technical data (e.g., your IP address), the website cannot be displayed (based on our
              legitimate interest according to Art. 6(1)(f) GDPR). Furthermore, to use our registration-required AI 
              features (Business Tools Advisor and Business Ideas Advisor), the provision of your email address and 
              your business profile data is mandatory, as this processing is necessary for the performance of the 
              contract (Art. 6(1)(b) GDPR). We cannot otherwise fulfill the contractually agreed-upon service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Automated Decision-Making / Profiling</h2>
            <p className="text-muted-foreground mb-4">
              <strong>AI-Powered Business Tools Advisor and Business Ideas Advisor:</strong> Our AI-powered features 
              (Business Tools Advisor and Business Ideas Advisor) use automated processing to generate educational 
              business recommendations, tool suggestions, and business idea concepts. However, this does NOT constitute 
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
            <h2 className="text-2xl font-semibold mb-4">15. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement technical and organizational measures to protect your data, including encryption (SSL/TLS),
              restricted server access, and regular security reviews by our hosting provider.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Your Rights</h2>
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
            <h2 className="text-2xl font-semibold mb-4">17. Browser-Based Data Storage (localStorage)</h2>
            <p className="text-muted-foreground mb-4">
              We use your web browser's localStorage feature to save your Notion Idea Board preferences and imported 
              recommendations locally on your device. This technology allows the application to remember your workspace 
              state across browser sessions without transmitting this data to our servers.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">What Data is Stored Locally</h3>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Imported recommendation data (derived from your existing analyses in the Business Tools Advisor and 
              Business Ideas Advisor)</li>
              <li>Notion Idea Board view mode state (whether you're in landing, select, or display view)</li>
              <li>Workspace organization preferences and selected analyses</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Purpose and Legal Basis</h3>
            <p className="text-muted-foreground mb-4">
              <strong>Purpose:</strong> Enhance user experience by persisting your Notion Idea Board workspace state 
              across sessions, eliminating the need to re-import and reorganize your recommendations each time you 
              visit the page.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(f) GDPR – Legitimate interest in providing a user-friendly 
              interface that improves usability and user experience.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">User Control and Data Management</h3>
            <p className="text-muted-foreground mb-4">
              You have full control over your localStorage data:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Clear via application:</strong> Use the "Clear All" button in the Notion Idea Board to 
                immediately delete all imported recommendations and reset your workspace
              </li>
              <li>
                <strong>Clear via browser settings:</strong> Access your browser's settings to clear localStorage, 
                site data, or cache
              </li>
              <li>
                <strong>Automatic clearing:</strong> localStorage data is automatically cleared when you clear your 
                browser's cache or site data
              </li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Privacy Implications</h3>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>No transmission to servers:</strong> localStorage data remains on your device and is never 
                transmitted to our servers
              </li>
              <li>
                <strong>Device-specific:</strong> The data is only accessible from the specific browser and device 
                where you use the Notion Idea Board
              </li>
              <li>
                <strong>We cannot access it:</strong> We have no access to view, modify, or process your localStorage 
                data
              </li>
              <li>
                <strong>Persistence:</strong> Data persists until you manually clear it or clear your browser data
              </li>
              <li>
                <strong>Cross-browser/device:</strong> Using a different browser or device will start with an empty 
                Notion Idea Board (no synchronization across devices)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">18. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time to comply with legal requirements or reflect changes
              in our services. The latest version is always available on this website.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Last updated:</strong> October 31, 2025
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
