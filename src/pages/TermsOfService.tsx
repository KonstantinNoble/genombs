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
          <h1 className="text-4xl font-bold mb-2">Terms of Service (AGB)</h1>
          <p className="text-muted-foreground mb-8">
            Effective Date: {new Date().toLocaleDateString("de-DE")}
          </p>

          <div className="space-y-8">
            <section>
              <p className="text-muted-foreground mb-6">
                These Terms of Service ("Terms") govern your access to and use of the Wealthconomy platform ("Platform", "Service", or "we"). 
                By creating an account or using our services, you agree to be bound by these Terms. Please read them carefully.
              </p>
            </section>

            {/* Section I */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">I. Geltungsbereich und Vertragspartner (Scope and Contracting Parties)</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">1.1 Platform Operator</h3>
              <p className="mb-4">
                This platform is operated by:<br />
                <strong>Muhammed Kagan Yilmaz</strong><br />
                Aroser Allee 50<br />
                13407 Berlin<br />
                Germany
              </p>
              <p className="mb-4">
                Contact: <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">mail@wealthconomy.com</a>
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">1.2 Scope of Application</h3>
              <p className="mb-4">
                These Terms apply to all users of the Wealthconomy platform, including both visitors and registered users. 
                By accessing or using our services, you enter into a binding agreement with Muhammed Kagan Yilmaz.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">1.3 User Definitions</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>"User"</strong> refers to any person accessing the Platform, whether registered or not.</li>
                <li><strong>"Registered User"</strong> refers to users who have created an account and can access AI-powered features.</li>
                <li><strong>"Consumer"</strong> (Verbraucher) refers to individuals acting for purposes outside their trade, business, craft, or profession (relevant for EU/EEA residents).</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">1.4 Platform Purpose</h3>
              <p className="mb-4">
                Wealthconomy provides digital advisory services and tools to support business decision-making. 
                Our platform is designed for informational and educational purposes only.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">1.5 Age Requirement</h3>
              <p className="mb-4">
                Users must be at least 18 years old to create an account. Users under 18 may only use the service with verifiable parental or guardian consent.
              </p>
            </section>

            {/* Section II */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">II. Vertragsschluss und Registrierung (Contract Formation and Registration)</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Registration Process</h3>
              <p className="mb-4">To access our services, you must create an account by:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Providing a valid email address</li>
                <li>Creating a secure password</li>
                <li>Verifying your email address through our confirmation process</li>
              </ul>
              <p className="mb-4">
                All accounts require email authentication. Anonymous access may be restricted.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 User Obligations</h3>
              <p className="mb-4">By creating an account, you agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the confidentiality of your login credentials</li>
                <li>Accept responsibility for all activities conducted under your account</li>
                <li>Not share your account with others</li>
                <li>Immediately notify us of any unauthorized access or security breaches</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Contract Formation</h3>
              <p className="mb-4">
                A binding contract is formed upon successful registration. By creating an account, you explicitly agree to these Terms of Service. 
                We reserve the right to refuse registration without providing reasons, particularly in cases of suspected fraud or Terms violations.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Account Security</h3>
              <p className="mb-4">
                You are solely responsible for maintaining the security of your password. We implement industry-standard security measures 
                to protect your data in compliance with applicable data protection laws, including GDPR Article 32 (Security of Processing).
              </p>
              <p className="mb-4">
                However, no security system is completely impenetrable, and you bear responsibility for your account's security.
              </p>
            </section>

            {/* Section III */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">III. Leistungsumfang und Bereitstellung (Service Scope and Provision)</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Free Services</h3>
              <p className="mb-4">All users have access to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Website browsing and navigation</li>
                <li>Blog content and educational resources</li>
                <li>Public informational pages</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Advisory Services</h3>
              <p className="mb-4">
                We provide digital advisory tools and services that may include, but are not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Personalized recommendations based on your business parameters and inputs</li>
                <li>Analysis and evaluation of business opportunities</li>
                <li>Visualization and organization tools for managing recommendations</li>
                <li>Educational content and resources</li>
              </ul>
              <p className="mb-4">
                <strong>Important Disclaimer:</strong> All services are provided for informational and educational purposes only. 
                Our recommendations do NOT constitute professional business consulting, investment advice, financial advice, or legal counsel. 
                You should consult qualified professionals before making business decisions.
              </p>
              <p className="mb-4">
                <strong>Data Processing:</strong> We process your inputs to generate personalized recommendations. Some data may be 
                stored locally on your device or on our secure servers, depending on the specific service feature.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Usage Limits</h3>
              <p className="mb-4">
                We may implement reasonable usage limits to ensure fair access and service quality for all users. 
                These limits may include restrictions on the number of requests, analyses, or features accessed within specific time periods.
              </p>
              <p className="mb-4">
                Current usage limits are displayed within the platform. We reserve the right to adjust these limits with reasonable notice.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Service Availability</h3>
              <p className="mb-4">
                We strive to provide reliable service, but we do not guarantee uninterrupted availability. Service interruptions may occur due to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Planned maintenance (we will provide advance notice when possible)</li>
                <li>Emergency maintenance or technical issues</li>
                <li>Circumstances beyond our reasonable control</li>
                <li>Force majeure events (natural disasters, pandemics, war, etc.)</li>
                <li>Third-party service provider outages</li>
              </ul>
              <p className="mb-4">
                We are not liable for service interruptions caused by circumstances beyond our reasonable control.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.5 Service Modifications</h3>
              <p className="mb-4">We reserve the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Modify, suspend, or discontinue any service feature</li>
                <li>Update our systems and technologies to improve service quality</li>
                <li>Adjust usage limits, features, and functionality</li>
                <li>Add new features or services</li>
              </ul>
              <p className="mb-4">
                Material changes affecting your rights will be communicated via email with reasonable advance notice. 
                Continued use of the service after changes become effective constitutes acceptance of the modifications.
              </p>
            </section>

            {/* Section IV */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">IV. Preise und Zahlungsbedingungen (Prices and Payment Terms)</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Current Pricing</h3>
              <p className="mb-4">
                <strong>All services are currently provided completely free of charge.</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>No subscription fees</li>
                <li>No hidden costs</li>
                <li>No payment information required</li>
                <li>Full access to all AI-powered features within usage limits</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Future Paid Services</h3>
              <p className="mb-4">
                We reserve the right to introduce paid features, premium tiers, or subscription plans in the future. If we do:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Registered users will be notified at least <strong>30 days in advance</strong></li>
                <li>Clear pricing will be displayed before any payment obligation arises</li>
                <li>Currently free features may remain free or become part of paid plans</li>
                <li>No automatic conversion to paid plans will occur without your explicit consent</li>
                <li>You will have the option to continue with free features (if available) or upgrade to paid plans</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Taxes</h3>
              <p className="mb-4">
                If paid services are introduced, all prices will be stated inclusive of applicable VAT/sales tax where required by law. 
                Users may be responsible for additional local taxes depending on their jurisdiction.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Billing (Future Provision)</h3>
              <p className="mb-4">
                If and when paid services are introduced, we will provide clear information about:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Accepted payment methods</li>
                <li>Billing cycles (monthly, annual, etc.)</li>
                <li>Automatic renewal terms</li>
                <li>Cancellation and refund policies</li>
              </ul>
            </section>

            {/* Section V */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">V. Rechte und Pflichten des Nutzers (User Rights and Obligations)</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Permitted Use</h3>
              <p className="mb-4">You may use our services for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Lawful business purposes</li>
                <li>Personal research and education</li>
                <li>Commercial use within the scope of our services and usage limits</li>
                <li>Informing business decisions (subject to our disclaimers)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Prohibited Activities</h3>
              <p className="mb-4">You may NOT:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Share or sell your account access credentials</li>
                <li>Attempt to circumvent usage limits or technical restrictions</li>
                <li>Reverse engineer, decompile, or disassemble any part of the platform</li>
                <li>Use automated tools (bots, scrapers) to extract data systematically</li>
                <li>Upload malicious code, viruses, or harmful software</li>
                <li>Impersonate other users or entities</li>
                <li>Use the service for illegal activities or to violate any laws</li>
                <li>Abuse AI features by generating offensive, discriminatory, or harmful content</li>
                <li>Violate intellectual property rights of third parties</li>
                <li>Attempt unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the service or servers</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.3 User-Generated Content</h3>
              <p className="mb-4">
                You retain full ownership of all data you input into our platform (business goals, context descriptions, industry information, etc.). 
                By using our services, you grant us a limited license to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Process your input data to provide AI-powered recommendations</li>
                <li>Store your data securely in our database</li>
                <li>Use your data to improve our services (in aggregated, anonymized form only)</li>
              </ul>
              <p className="mb-4">
                You are responsible for ensuring that your inputs do not violate third-party rights, including intellectual property, 
                confidentiality obligations, or privacy rights.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Fair Use Policy</h3>
              <p className="mb-4">
                Usage limits are designed to ensure fair access for all users. We monitor for unusual usage patterns and reserve the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Investigate suspected abuse or circumvention attempts</li>
                <li>Temporarily suspend accounts displaying abusive patterns</li>
                <li>Permanently terminate accounts engaged in systematic abuse</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.5 Account Suspension and Termination</h3>
              <p className="mb-4">
                We reserve the right to suspend or terminate your account if you violate these Terms. Depending on the severity:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Warning:</strong> First-time minor violations may result in a warning</li>
                <li><strong>Temporary Suspension:</strong> Repeated or moderate violations may result in temporary account suspension (7-30 days)</li>
                <li><strong>Permanent Termination:</strong> Serious violations (illegal activity, security threats, systematic abuse) may result in immediate permanent termination without prior notice</li>
              </ul>
              <p className="mb-4">
                You will be notified of suspensions or terminations when feasible. You may appeal decisions by contacting mail@wealthconomy.com.
              </p>
            </section>

            {/* Section VI */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VI. Haftung und Gewährleistung (Liability and Warranty)</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Service Disclaimer - CRITICAL NOTICE</h3>
              <div className="bg-destructive/10 border border-destructive rounded-lg p-6 my-6">
                <p className="font-bold text-lg mb-4">IMPORTANT: PLEASE READ CAREFULLY</p>
                <p className="mb-4">
                  <strong>All recommendations and services provided by our platform are for informational and educational purposes only.</strong>
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <strong>NOT Professional Advice:</strong> Our services are NOT financial advice, investment advice, legal advice, 
                    business consulting, or any form of professional advisory service. They should not be relied upon as a substitute for professional consultation.
                  </li>
                  <li>
                    <strong>No Guarantee of Results:</strong> We make no representations, warranties, or guarantees that using our services will result in 
                    business success, profitability, revenue growth, or any specific outcome.
                  </li>
                  <li>
                    <strong>Your Responsibility:</strong> You are solely responsible for all business decisions you make. You must conduct your own thorough due diligence, 
                    research, and analysis before implementing any recommendations.
                  </li>
                  <li>
                    <strong>Consult Qualified Professionals:</strong> Before making significant business decisions, financial commitments, or legal arrangements, 
                    you should consult qualified professionals including lawyers, certified accountants, licensed financial advisors, and business consultants.
                  </li>
                  <li>
                    <strong>Service Limitations:</strong> Our services may produce outputs that are inaccurate, incomplete, outdated, biased, 
                    or contextually inappropriate. Technology cannot account for all variables in your specific situation.
                  </li>
                  <li>
                    <strong>No Liability for Outputs:</strong> We are not liable for any business decisions, investments, losses, damages, or consequences 
                    arising from your reliance on or implementation of our recommendations.
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Service Warranty</h3>
              <p className="mb-4">
                Our services are provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis. To the maximum extent permitted by law:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We do not warrant that services will be error-free, uninterrupted, or completely secure</li>
                <li>We do not warrant the accuracy, completeness, reliability, or timeliness of AI outputs</li>
                <li>We do not warrant that the platform will meet your specific requirements or expectations</li>
                <li>We disclaim all implied warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Limitation of Liability</h3>

              <h4 className="text-lg font-semibold mb-2 mt-4">6.3.1 Unlimited Liability</h4>
              <p className="mb-4">We remain fully liable without limitation for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Intentional misconduct (Vorsatz) by us or our representatives</li>
                <li>Gross negligence (grobe Fahrlässigkeit) by us or our representatives</li>
                <li>Personal injury, bodily harm, or death caused by our negligence</li>
                <li>Violations of essential contractual obligations (Kardinalspflichten)</li>
                <li>Mandatory statutory liability that cannot be contractually excluded (e.g., product liability laws)</li>
              </ul>

              <h4 className="text-lg font-semibold mb-2 mt-4">6.3.2 Limited Liability</h4>
              <p className="mb-4">For simple negligence (einfache Fahrlässigkeit):</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Liability is limited to foreseeable, typical damages that could reasonably be expected at the time of contract formation</li>
                <li>Liability is limited to the value of the contract (currently €0 for free services; if paid services are introduced, up to €100 per user per year)</li>
                <li>We are not liable for indirect damages, consequential damages, loss of profits, loss of data (if backups were not maintained), or special damages</li>
              </ul>

              <h4 className="text-lg font-semibold mb-2 mt-4">6.3.3 Excluded Liability</h4>
              <p className="mb-4">We are NOT liable for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Business decisions, investments, or strategies implemented based on AI recommendations</li>
                <li>Lost profits, revenue, business opportunities, contracts, or anticipated savings</li>
                <li>Data loss if you failed to maintain backups or use our data export features</li>
                <li>Damages caused by third-party services, tools, or platforms</li>
                <li>Damages caused by your violation of these Terms</li>
                <li>
    Damages caused by third-party services, tools, or platforms, including damages arising from the use of products or services offered via Affiliate-Links or damages resulting from external communication service providers like Brevo (formerly Sendinblue).
  </li>
                <li>Damages caused by force majeure events (wars, natural disasters, pandemics, government actions, internet outages, etc.)</li>
                <li>Damages from unauthorized access to your account due to your failure to maintain credential security</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.4 Third-Party Services</h3>
              <p className="mb-4">
                We may use third-party services to provide our platform functionality. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Third-party service availability, uptime, or performance</li>
                <li>The accuracy or quality of third-party outputs</li>
                <li>Changes to third-party capabilities, terms, or pricing</li>
              </ul>
              <p className="mb-4">
                When we transfer data to third-party processors, we ensure compliance with applicable data protection regulations. 
                Third-party providers' own terms and privacy policies apply to their processing activities.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.5 Indemnification</h3>
              <p className="mb-4">
                You agree to indemnify, defend, and hold harmless Muhammed Kagan Yilmaz, his affiliates, employees, and agents from any claims, 
                liabilities, damages, losses, costs, or expenses (including reasonable legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your violation of these Terms of Service</li>
                <li>Your use or misuse of our AI recommendations</li>
                <li>Your violation of any third-party rights (intellectual property, privacy, etc.)</li>
                <li>Any business decisions or actions you take based on our service</li>
              </ul>
            </section>

            {/* Section VII */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VII. Vertragslaufzeit und Kündigung (Contract Duration and Termination)</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Contract Duration</h3>
              <p className="mb-4">
                Your contract with us begins upon registration and continues for an indefinite period until terminated by either party. 
                There is no minimum commitment period, and you may terminate at any time.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.2 User Termination Rights</h3>
              <p className="mb-4">
                You may terminate your account at any time without notice and without providing a reason by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Logging into your Profile page</li>
                <li>Clicking the "Delete Account" button</li>
                <li>Confirming the deletion in the dialog prompt</li>
              </ul>
              <p className="mb-4">
                Termination is effective immediately upon confirmation. You may also contact us at mail@wealthconomy.com to request account deletion.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.3 Account Deletion Process and Data Retention</h3>
              <p className="mb-4">
                When you delete your account, the following data is <strong>permanently and irrevocably deleted</strong>:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your profile information</li>
                <li>All analysis and usage history</li>
                <li>Credit tracking data</li>
                <li>Any other personal data associated with your account</li>
              </ul>

              <p className="mb-4"><strong>Local Device Data:</strong></p>
              <p className="mb-4">
                Data stored locally on your device is not automatically deleted when you delete your account. 
                You can clear this data manually through your browser settings or by using any "clear data" functions provided within the platform.
              </p>

              <p className="mb-4"><strong>Email Hash Temporary Retention (Anti-Abuse Measure):</strong></p>
              <p className="mb-4">
                To prevent abuse and accidental duplicate registrations, we create a cryptographic SHA-256 hash of your email address upon account deletion. 
                This hash:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Is a one-way cryptographic hash that <strong>cannot be reversed</strong> to reveal your email address</li>
                <li>Is stored for exactly <strong>24 hours</strong></li>
                <li>Prevents the same email address from being used for registration during the 24-hour period</li>
                <li>Is automatically and permanently deleted after 24 hours</li>
                <li>After deletion, your email becomes available for new account registration</li>
              </ul>
              <p className="mb-4">
                Legal basis for temporary hash storage: GDPR Article 6(1)(f) - Legitimate interest in preventing service abuse and accidental duplicate accounts.
              </p>

              <p className="mb-4"><strong>Backup Retention:</strong></p>
              <p className="mb-4">
                Deleted data may remain in encrypted backups for up to <strong>90 days</strong> for disaster recovery purposes. 
                After 90 days, all backup copies are permanently overwritten and unrecoverable.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.4 Platform Termination Rights</h3>
              <p className="mb-4">We reserve the right to terminate or suspend your account:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>For Cause (Immediate):</strong> If you violate these Terms, engage in illegal activities, or pose a security threat, we may terminate immediately without prior notice</li>
                <li><strong>Without Cause (30 Days' Notice):</strong> We may terminate your account for any reason or no reason with 30 days' advance written notice via email</li>
              </ul>
              <p className="mb-4">
                In cases of serious violations (fraud, hacking attempts, illegal content), we may suspend your account immediately pending investigation.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.5 Effects of Termination</h3>
              <p className="mb-4">Upon termination (whether by you or us):</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You immediately lose access to all services and your account</li>
                <li>All your personal data is deleted in accordance with GDPR Article 17 (Right to Erasure), subject to legal retention obligations</li>
                <li>We are not obligated to provide copies of your data after termination (export data beforehand if needed)</li>
                <li>Any outstanding contractual obligations remain in effect (e.g., if paid services existed, outstanding payments would still be due)</li>
                <li>Sections of these Terms that by their nature should survive termination (liability limitations, indemnification, governing law) continue to apply</li>
              </ul>

              <p className="mb-4"><strong>Legal Retention Obligations:</strong></p>
              <p className="mb-4">
                If you are using our services for business purposes and we are required by law to retain certain records (e.g., tax documentation under German § 147 AO or § 257 HGB), 
                we will retain only the minimum data required for the legally mandated period (typically 6-10 years for invoices and business records). 
                This exception applies only if paid services are introduced and you make payments.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.6 Data Export Before Termination</h3>
              <p className="mb-4">
                Before deleting your account, we recommend exporting any data you wish to retain. 
                You can view and save your data through the user interface or by using any export features provided within the platform.
              </p>
            </section>

            {/* Section VIII */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">VIII. Widerrufsrecht (Right of Withdrawal - for Consumers)</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Applicability</h3>
              <p className="mb-4">
                This section applies exclusively to <strong>consumers (Verbraucher)</strong> in the European Union and European Economic Area. 
                A consumer is an individual acting for purposes outside their trade, business, craft, or profession.
              </p>
              <p className="mb-4">
                If you are a business user (Unternehmer) using our services for commercial purposes, the right of withdrawal does not apply to you.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Right of Withdrawal</h3>
              <div className="bg-muted/30 border border-border rounded-lg p-6 my-6">
                <p className="font-semibold mb-4">Widerrufsbelehrung (Withdrawal Instruction)</p>
                <p className="mb-4">
                  As a consumer, you have the right to withdraw from this contract within <strong>14 days</strong> without giving any reason.
                </p>
                <p className="mb-4">
                  The withdrawal period expires <strong>14 days from the day of contract conclusion</strong> (the day you complete your account registration).
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.3 Exercising the Right of Withdrawal</h3>
              <p className="mb-4">
                To exercise your right of withdrawal, you must inform us of your decision to withdraw from this contract by a clear statement. 
                You can contact us:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>By email:</strong> mail@wealthconomy.com</li>
                <li><strong>By mail:</strong> Muhammed Kagan Yilmaz, Aroser Allee 50, 13407 Berlin, Germany</li>
              </ul>
              <p className="mb-4">
                You may use the model withdrawal form provided below (Section 8.6), but it is not mandatory. Any clear statement of your intention to withdraw is sufficient.
              </p>
              <p className="mb-4">
                To meet the withdrawal deadline, it is sufficient for you to send your communication concerning your exercise of the right of withdrawal 
                before the 14-day withdrawal period has expired.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.4 Effects of Withdrawal</h3>
              <p className="mb-4">
                If you withdraw from this contract within the 14-day period:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We will reimburse to you all payments received from you, if any (currently, all services are free, so no reimbursement applies)</li>
                <li>Reimbursement will be made without undue delay, and not later than 14 days after we receive your withdrawal notification</li>
                <li>We will use the same payment method you used for the initial transaction unless you expressly agree otherwise</li>
                <li>You will not incur any fees as a result of the reimbursement</li>
                <li>Your account will be terminated and all your data will be deleted (as described in Section 7.3)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.5 Early Commencement of Services</h3>
              <p className="mb-4">
                If you request that the provision of our services begin immediately upon registration (rather than waiting until the 14-day withdrawal period expires), 
                you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You have expressly requested early performance of the contract</li>
                <li>If paid services exist and you use them during the withdrawal period, you may be required to pay a proportionate amount for services already provided up to the point you communicate your withdrawal</li>
                <li>You lose your right of withdrawal once the service has been fully performed, if performance began with your prior express consent and acknowledgment that you will lose your right of withdrawal once the contract is fully performed</li>
              </ul>
              <p className="mb-4">
                <strong>Note:</strong> For our current free AI advisory services with usage limits (2 analyses per 24 hours), using the services during the withdrawal period 
                does not eliminate your right to withdraw, as the services are not "fully performed" within 14 days.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.6 Model Withdrawal Form</h3>
              <div className="bg-muted/30 border border-border rounded-lg p-6 my-6 font-mono text-sm">
                <p className="font-semibold mb-4">Muster-Widerrufsformular (Model Withdrawal Form)</p>
                <p className="mb-4">
                  To:<br />
                  Muhammed Kagan Yilmaz<br />
                  Aroser Allee 50<br />
                  13407 Berlin<br />
                  Germany<br />
                  Email: mail@wealthconomy.com
                </p>
                <p className="mb-4">
                  I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract for the provision of the following service:
                </p>
                <p className="mb-4">
                  Service: Wealthconomy Platform Services (AI-powered business advisory tools)
                </p>
                <p className="mb-4">
                  Registered on (date): _______________
                </p>
                <p className="mb-4">
                  Email address used for registration: _______________
                </p>
                <p className="mb-4">
                  Date of this withdrawal notice: _______________
                </p>
                <p className="mb-4">
                  Signature (only if submitting on paper): _______________
                </p>
                <p className="text-xs italic mt-4">
                  (*) Delete as appropriate or fill in as applicable
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.7 Exceptions to the Right of Withdrawal</h3>
              <p className="mb-4">
                The right of withdrawal does not apply in the following cases (per EU Directive 2011/83/EU, Article 16):
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Services that have been fully performed, if performance began with your prior express consent and your acknowledgment that you lose your right of withdrawal once we have fully performed</li>
                <li>Digital content not supplied on a tangible medium, if performance has begun with your prior express consent and acknowledgment that you thereby lose your right of withdrawal</li>
                <li>Contracts concluded with business users (non-consumers)</li>
              </ul>
            </section>

            {/* Section IX */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">IX. Schlussbestimmungen (Final Provisions)</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">9.1 Governing Law</h3>
              <p className="mb-4">
                These Terms of Service and the entire legal relationship between you and us are governed by the laws of the <strong>Federal Republic of Germany</strong>, 
                without regard to its conflict of law provisions.
              </p>
              <p className="mb-4">
                <strong>For Consumers:</strong> This choice of law does not affect the application of mandatory provisions of the law of the country in which you have your habitual residence.
              </p>
              <p className="mb-4">
                The <strong>United Nations Convention on Contracts for the International Sale of Goods (CISG)</strong> is expressly excluded and does not apply to these Terms.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">9.2 Jurisdiction and Venue</h3>
              <p className="mb-4"><strong>For Business Users (B2B):</strong></p>
              <p className="mb-4">
                If you are a merchant (Kaufmann), a legal entity under public law, or a special fund under public law, or if you do not have a general place of jurisdiction in Germany, 
                the exclusive place of jurisdiction for all disputes arising from this contract is <strong>Berlin, Germany</strong>.
              </p>
              <p className="mb-4"><strong>For Consumers (B2C):</strong></p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>The statutory place of jurisdiction applies</li>
                <li>We are obligated to bring actions against you only at your place of residence</li>
                <li>Mandatory consumer protection jurisdiction rules remain applicable</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">9.3 Dispute Resolution and Alternative Dispute Resolution</h3>
              <p className="mb-4">
                Before initiating any legal proceedings, we encourage you to contact us to resolve disputes informally:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Email: mail@wealthconomy.com</li>
                <li>Subject line: "Dispute Resolution"</li>
                <li>We commit to responding within 14 business days</li>
              </ul>
              <p className="mb-4"><strong>EU Online Dispute Resolution Platform:</strong></p>
              <p className="mb-4">
                The European Commission provides an Online Dispute Resolution (ODR) platform for EU consumers at: 
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="mb-4">
                While we are not legally obligated to participate in alternative dispute resolution proceedings before a consumer arbitration board, 
                we are generally willing to engage in good-faith negotiations to resolve consumer complaints.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">9.4 Amendments to These Terms</h3>
              <p className="mb-4">
                We reserve the right to modify or update these Terms of Service at any time. When we make changes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We will notify registered users via email at least <strong>30 days before</strong> the changes take effect</li>
                <li>The notification email will include a summary of material changes and a link to the updated Terms</li>
                <li>The "Effective Date" at the top of this document will be updated</li>
                <li>We will maintain an archive of previous versions for reference</li>
              </ul>
              <p className="mb-4">
                <strong>Your Options:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>If you do not agree with the updated Terms, you may terminate your account at any time during the 30-day notice period without penalty</li>
                <li>If you continue to use our services after the effective date of the updated Terms, you are deemed to have accepted the changes</li>
                <li>For material changes that significantly affect your rights, we may require your explicit consent</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">9.5 Severability</h3>
              <p className="mb-4">
                If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>The invalidity of that provision does not affect the validity or enforceability of the remaining provisions</li>
                <li>The invalid provision will be replaced by a valid provision that most closely reflects the original intent and economic effect</li>
                <li>All other provisions of these Terms remain in full force and effect</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">9.6 Entire Agreement</h3>
              <p className="mb-4">
                These Terms of Service, together with our Privacy Policy (accessible at /privacy-policy) and Imprint (accessible at /imprint), 
                constitute the entire agreement between you and Muhammed Kagan Yilmaz regarding your use of the Wealthconomy platform.
              </p>
              <p className="mb-4">
                These Terms supersede all prior or contemporaneous agreements, understandings, negotiations, or representations, whether written or oral, 
                regarding the subject matter herein.
              </p>
              <p className="mb-4">
                No verbal agreements, side letters, or informal understandings exist between you and us unless explicitly documented in writing and signed by both parties.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">9.7 Assignment and Transfer</h3>
              <p className="mb-4">
                <strong>Your Rights:</strong> You may not assign, transfer, or delegate your rights or obligations under these Terms without our prior written consent.
              </p>
              <p className="mb-4">
                <strong>Our Rights:</strong> We may assign or transfer these Terms and all related rights and obligations to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>An affiliate or subsidiary company</li>
                <li>A successor entity in the event of a merger, acquisition, corporate reorganization, or sale of substantially all assets</li>
              </ul>
              <p className="mb-4">
                If such an assignment materially affects your rights or obligations, we will notify you at least 30 days in advance.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">9.8 Language</h3>
              <p className="mb-4">
                These Terms of Service are provided in English. Translations into other languages may be provided for your convenience.
              </p>
              <p className="mb-4">
                In the event of any conflict, discrepancy, or inconsistency between the English version and any translated version, 
                the <strong>English version shall prevail</strong> and govern.
              </p>
              <p className="mb-4">
                For EU users: If your local law requires contracts to be in your national language, we will provide certified translations upon request.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">9.9 Contact for Legal Matters</h3>
              <p className="mb-4">
                For all legal inquiries, questions about these Terms, or notices:
              </p>
              <p className="mb-4">
                <strong>Muhammed Kagan Yilmaz</strong><br />
                Aroser Allee 50<br />
                13407 Berlin<br />
                Germany
              </p>
              <p className="mb-4">
                Email: <a href="mailto:mail@wealthconomy.com" className="text-primary hover:underline">mail@wealthconomy.com</a>
              </p>
              <p className="mb-4">
                For GDPR-related requests (data access, deletion, portability), please also see our Privacy Policy at /privacy-policy.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">9.10 References to Other Legal Documents</h3>
              <p className="mb-4">
                These Terms of Service should be read in conjunction with the following documents, which are incorporated by reference:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> - 
                  Details how we collect, use, and protect your personal data (GDPR compliance)
                </li>
                <li>
                  <Link to="/imprint" className="text-primary hover:underline">Imprint (Impressum)</Link> - 
                  Legal entity information and contact details
                </li>
              </ul>
            </section>

            {/* Final Statement */}
            <section className="bg-muted/30 border border-border rounded-lg p-6 mt-8">
              <h3 className="text-xl font-semibold mb-4">Acknowledgment</h3>
              <p className="mb-4">
                By creating an account and using the Wealthconomy platform, you acknowledge that:
              </p>
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
                Last updated: {new Date().toLocaleDateString("de-DE")}<br />
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
