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
            <p className="text-muted-foreground mb-4">
              <strong>Technically necessary cookies:</strong> We use a technically necessary session cookie
              ("session-id") to enable the basic functionality of our website (e.g., maintaining your session during
              navigation). This cookie does not store personal data beyond a randomly generated session identifier and
              is automatically deleted when you close your browser.
            </p>
            <p className="text-muted-foreground mb-4">
              The use of this cookie is based on our legitimate interest (Art. 6(1)(f) GDPR) in providing a functional
              and user-friendly website. In addition, this use is permitted under Section 25 (2) No. 2 TTDSG, as the
              cookie is technically necessary for the operation of the website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Authentication (Login & Registration)</h2>
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
            <p className="text-muted-foreground mb-4">
              <strong>Email confirmation:</strong> To ensure the security of your account and verify your email address,
              we require you to confirm your email after registration by clicking on a confirmation link sent to your
              provided email address.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Session management:</strong> When you log in, we store a session token (JWT) in your browser's
              local storage to maintain your logged-in state. This token is technically necessary for authentication and
              is covered by Section 25 (2) No. 2 TTDSG, as it is essential for providing the requested service.
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
                Data in automated backup systems (maintained by our hosting infrastructure for disaster recovery and
                system integrity) are retained for up to 90 days, after which they are automatically and permanently
                deleted
              </li>
              <li>
                During the backup retention period, these data cannot be accessed, restored, or used for any operational
                purposes
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
                Copies in automated backup systems (used solely for disaster recovery) are retained for up to 90 days
                and then permanently deleted. During this retention period, backup data cannot be accessed or restored
                for normal operations.
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Alternatively, you may also request account deletion by contacting us at mail@wealthconomy.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. AI-Powered Stock Analysis</h2>
            <p className="text-muted-foreground mb-4">
              Our website offers an AI-powered feature that provides general stock market information and educational
              examples based on your stated investment preferences. This feature is available to registered users and
              requires authentication.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-destructive">IMPORTANT DISCLAIMER:</strong> This feature provides general market
              information for educational purposes only. It does NOT constitute financial advice, investment
              recommendations, personalized financial consultation, or specific buy/sell instructions. You should
              consult with licensed financial advisors before making any investment decisions. Past performance does not
              guarantee future results, and all investments carry risk, including potential loss of principal.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Data Processing for Stock Analysis</h3>
            <p className="text-muted-foreground mb-4">
              When you use this feature, the following personal data is processed:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Investment Profile Data (stated preferences):</strong>
                <ul className="list-disc pl-6 mt-2">
                  <li>Risk tolerance (conservative, moderate, aggressive)</li>
                  <li>Market capitalization preference (small-cap, mid-cap, large-cap, mega-cap)</li>
                  <li>Preferred asset classes (stocks, bonds, ETFs, cryptocurrencies, commodities, real estate)</li>
                  <li>Volatility preference (low, medium, high)</li>
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
              USA) acts as an intermediary service that routes AI requests to external AI model providers. The gateway:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Receives your investment profile data from our backend (Supabase Edge Functions)</li>
              <li>Forwards the request to either Google AI or OpenAI models</li>
              <li>Returns the generated response to our backend</li>
              <li>Acts as a data processor under Art. 28 GDPR on behalf of our website</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Data Processing Agreement:</strong> A Data Processing Agreement (DPA) pursuant to Art. 28 GDPR has
              been concluded with Lovable Labs Incorporated covering all processing activities through the AI Gateway.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">AI Model Providers and Third-Country Transfers</h3>
            <p className="text-muted-foreground mb-4">
              To generate the educational stock examples, your investment profile data is transmitted through our
              backend infrastructure and the Lovable AI Gateway to one of the following AI service providers:
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
              request data for a limited period (typically 30 days) for abuse prevention and security monitoring
              purposes only.
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

            <h4 className="text-lg font-semibold mb-2 mt-4">OpenAI Models</h4>
            <p className="text-muted-foreground mb-4">
              <strong>Provider:</strong> OpenAI LLC, 3180 18th Street, San Francisco, CA 94110, USA
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Models:</strong> GPT-5, GPT-5 Mini, GPT-5 Nano
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis for third-country transfer:</strong> Art. 46 GDPR (Standard Contractual Clauses)
              <br />
              OpenAI LLC is NOT certified under the EU-U.S. Data Privacy Framework. Therefore, data transfers to OpenAI
              are safeguarded through Standard Contractual Clauses (SCCs) approved by the European Commission pursuant
              to Art. 46(2)(c) GDPR. These SCCs ensure an adequate level of data protection when processing data in the
              United States.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Data usage by OpenAI:</strong> According to OpenAI's API data usage policies, input data submitted
              through the API is not used to train or improve OpenAI's models unless you explicitly opt in. OpenAI
              retains API request data for 30 days for abuse and misuse monitoring purposes, after which it is
              automatically deleted.
            </p>
            <p className="text-muted-foreground mb-4">More information:</p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                OpenAI Privacy Policy:{" "}
                <a
                  href="https://openai.com/policies/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://openai.com/policies/privacy-policy
                </a>
              </li>
              <li>
                OpenAI API Data Usage:{" "}
                <a
                  href="https://openai.com/policies/api-data-usage-policies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  API Data Usage Policies
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
                the contract (providing the educational stock analysis feature you requested as a registered user)
              </li>
              <li>
                <strong>Legitimate interest:</strong> Art. 6(1)(f) GDPR – Our legitimate interest in providing
                innovative, AI-powered educational features to enhance user experience
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">
              By using the "Generate AI Analysis" feature as a logged-in user, you are requesting the contractual
              service of receiving educational stock market information based on your stated preferences. The processing
              is necessary to fulfill this service request.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Technical and Organizational Security Measures</h3>
            <p className="text-muted-foreground mb-4">
              We implement the following technical safeguards to protect your data during AI processing:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                <strong>Data minimization:</strong> Only the minimum necessary investment preference data is transmitted
                to AI providers. We do not transmit identifying information such as your name, email address, or IP
                address to the AI models.
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
                <strong>Pseudonymization:</strong> Your investment preferences are processed without direct personal
                identifiers, making it significantly more difficult for AI providers to link the data to your identity.
              </li>
              <li>
                <strong>Access controls:</strong> Strict authentication requirements ensure only authorized users can
                access the AI analysis feature.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Usage Limits and Fair Use</h3>
            <p className="text-muted-foreground mb-4">
              To ensure fair use and prevent abuse, each user can perform one AI analysis per 24-hour period. The system
              automatically tracks your last analysis timestamp and enforces this limit. Attempting to perform multiple
              analyses within 24 hours will result in an error message indicating when the next analysis will be
              available.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Data Storage and Retention</h3>
            <p className="text-muted-foreground mb-4">
              <strong>AI Provider Retention (Google):</strong> Google retains API request data for approximately 30 days
              for abuse monitoring and security purposes, after which it is permanently deleted. Your input data is NOT
              used to train or improve Google's AI models.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>AI Provider Retention (OpenAI):</strong> OpenAI retains API request data for 30 days for abuse and
              misuse monitoring purposes, after which it is automatically deleted. Your input data is NOT used to train
              or improve OpenAI's models unless you explicitly opt in (which is not applicable through our service).
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Local Storage (Our Database):</strong> Your analysis history is stored in our backend database and
              includes:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Your investment profile inputs (risk tolerance, market capitalization, asset class, volatility)</li>
              <li>The generated stock examples and general market information</li>
              <li>Timestamp of the analysis</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              This data remains stored as long as your account is active. You can:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>View your analysis history at any time through your profile page</li>
              <li>Delete individual analysis entries from your history</li>
              <li>
                Delete your entire account, which permanently removes all analysis history from our production database
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Realtime Updates</h3>
            <p className="text-muted-foreground mb-4">
              The application uses realtime database subscriptions to update your analysis limit status automatically
              when a new analysis becomes available (after 24 hours). This technical feature does not involve additional
              data processing beyond what is already described.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Hosting and Data Transfers</h2>
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
            <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
            <p className="text-muted-foreground mb-4">
              If you contact us (e.g., by email), we process the personal data you provide solely to respond to your
              inquiry. The processing is based on our legitimate interest (Art. 6(1)(f) GDPR) in handling such requests.
            </p>
            <p className="text-muted-foreground mb-4">
              We use IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Germany, as our email and hosting provider. Data
              are stored on servers within the European Union, and no data are transferred to third countries. A Data
              Processing Agreement pursuant to Art. 28 GDPR has been concluded with IONOS to ensure GDPR-compliant data
              handling.
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
            <h2 className="text-2xl font-semibold mb-4">7. External Links</h2>
            <p className="text-muted-foreground mb-4">
              Our website may contain links to external websites or social media platforms such as Twitter (X). When you
              click on these links, you will be redirected to the respective external platform. Please note that we have
              no control over how these third-party websites process your personal data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Affiliate Marketing (Impact.com / Simplify Wall Street)</h2>
            <p className="text-muted-foreground mb-4">
              We participate in the affiliate program operated by Impact Tech, Inc. ("Impact.com"). Through this
              program, we include affiliate links to products or services offered by Simplify Wall Street.
            </p>
            <p className="text-muted-foreground mb-4">
              When you click such a link, you are redirected to the partner website. Impact.com and/or Simplify Wall
              Street may use cookies or similar technologies to track sales or sign-ups for commission purposes.
            </p>
            <p className="text-muted-foreground mb-4">
              We do not collect, store, or process any affiliate tracking data ourselves. Processing occurs exclusively
              on the partner's website.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Legal basis:</strong> Art. 6(1)(a) GDPR – based on your consent given on the partner site.
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
            <h2 className="text-2xl font-semibold mb-4">9. Categories of Personal Data</h2>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Contact data (email address, if you contact us)</li>
              <li>User account data (email, user ID, timestamps)</li>
              <li>Authentication data (hashed passwords, session tokens, JWT tokens)</li>
              <li>
                Usage data (IP address, browser type, OS, referrer URL) – stored by our hosting provider Lovable.dev for
                technical purposes
              </li>
              <li>Technical connection data (server logs, encrypted SSL/TLS connections)</li>
              <li>
                Investment preferences (risk tolerance, market capitalization preference, asset class preferences,
                volatility preference)
              </li>
              <li>
                AI analysis requests and responses (educational stock examples with ticker symbols, sectors, general
                characteristics, factual information, general market analysis, and complete analysis history)
              </li>
              <li>Analysis limit tracking data (last analysis timestamp, 24-hour usage limit enforcement data)</li>
              <li>
                Affiliate tracking data (only processed on Impact.com / Simplify Wall Street websites, not on our
                servers)
              </li>
            </ul>
            <p className="text-muted-foreground mb-4 mt-4">
              <strong>Important Note on IP Addresses and AI Processing:</strong> When you use the AI-powered stock
              analysis feature, your personal investment data (risk tolerance, time horizon, etc.) is transmitted
              server-side through our backend infrastructure (Supabase Edge Functions) to the Lovable AI Gateway.{" "}
              <strong>Your client IP address is NOT transmitted to the AI providers (Google or OpenAI)</strong>. Only
              the IP address of our backend server is visible to the AI providers. This server-side architecture
              protects your privacy by ensuring that AI providers cannot directly identify or track individual users by
              their IP addresses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Recipients of Personal Data</h2>
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
                <strong>AI service providers (for educational stock market information only):</strong>
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    Lovable AI Gateway (operated by Lovable Labs Incorporated, Walnut, CA, USA) – acts as data processor
                    and intermediary service that routes requests to:
                  </li>
                  <li>
                    Google LLC (Mountain View, CA, USA) – Gemini 2.5 models (Pro, Flash, Flash Lite)
                    <br />
                    <em className="text-sm">
                      Third-country transfer basis: Art. 45 GDPR (EU-U.S. Data Privacy Framework adequacy decision)
                    </em>
                  </li>
                  <li>
                    OpenAI LLC (San Francisco, CA, USA) – GPT-5 models (GPT-5, GPT-5 Mini, GPT-5 Nano)
                    <br />
                    <em className="text-sm">
                      Third-country transfer basis: Art. 46 GDPR (Standard Contractual Clauses)
                    </em>
                  </li>
                </ul>
                <p className="mt-2 text-sm">
                  <strong>Data minimization and security:</strong> AI requests are processed through our backend
                  (Supabase Edge Functions), which means AI providers receive only your investment profile data (risk
                  tolerance, market capitalization, asset class, volatility) without personal identifiers such as your
                  name, email, or client IP address. Only the backend server's IP address is visible to AI providers.
                  All transmissions are encrypted using TLS/SSL protocols.
                </p>
              </li>
              <li>
                <strong>Email and domain provider:</strong> IONOS SE (Montabaur, Germany) – email communication
              </li>
              <li>
                <strong>Affiliate partners:</strong> Impact Tech, Inc. (Impact.com) and Simplify Wall Street – tracking
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
            <h2 className="text-2xl font-semibold mb-4">11. Obligation to Provide Data</h2>
            <p className="text-muted-foreground mb-4">
              You are not legally or contractually obliged to provide personal data when visiting our website. However,
              without certain technical data (e.g., IP address), the website cannot be displayed correctly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Automated Decision-Making / Profiling</h2>
            <p className="text-muted-foreground mb-4">
              AI-Powered Stock Analysis: Our AI-powered stock analysis feature uses automated processing to generate
              educational stock examples. However, this does NOT constitute automated decision-making within the meaning
              of Art. 22 GDPR because: 1. The results are purely informational and educational in nature 2. No legal
              effects or similarly significant effects arise for you 3. You retain full control over whether and how to
              use the suggestions 4. No binding decisions are made without human intervention Your right to object: You
              may object to the use of the AI analysis feature at any time by simply not using it or by deleting your
              account. No other automated decisions: Apart from the AI analysis feature described above, we do not
              engage in automated decision-making or profiling pursuant to Art. 22 GDPR.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement technical and organizational measures to protect your data, including encryption (SSL/TLS),
              restricted server access, and regular security reviews by our hosting provider.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Your Rights</h2>
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
                and all associated personal data at any time via your profile page. Please note that data in automated
                backup systems (maintained for disaster recovery) will be retained for up to 90 days before permanent
                deletion.
              </li>
              <li>
                <strong>Right to restriction of processing (Art. 18 GDPR)</strong> – You have the right to request the
                restriction of processing under certain circumstances.
              </li>
              <li>
                {" "}
                <strong> Right to object to automated processing (Art. 21 GDPR)</strong>
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
            <h2 className="text-2xl font-semibold mb-4">15. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time to comply with legal requirements or reflect changes
              in our services. The latest version is always available on this website.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Last updated:</strong> January 26, 2025
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
