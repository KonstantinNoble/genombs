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
              account settings page (/account). When you initiate account deletion:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>
                Your profile data (name, email, timestamps) is immediately and permanently deleted from our production
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
              <li>User account data (email, timestamps)</li>
              <li>Authentication data (hashed passwords, session tokens)</li>
              <li>Usage data (IP address, browser type, OS, referrer URL)</li>
              <li>Technical connection data (server logs)</li>
              <li>Affiliate tracking data (only on Impact.com / Simplify Wall Street websites)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Recipients of Personal Data</h2>
            <ul className="text-muted-foreground mb-4 list-disc pl-6">
              <li>Hosting provider: Lovable.dev</li>
              <li>
                Backend services (operated by Lovable.dev and their GDPR-compliant sub-processors including Supabase)
              </li>
              <li>Email and domain provider: IONOS SE</li>
              <li>Affiliate partners: Impact Tech, Inc. (Impact.com) and Simplify Wall Street</li>
              <li>Public authorities, if legally required</li>
            </ul>
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
              No automated decision-making or profiling according to Article 22 GDPR takes place.
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
              <strong>Last updated:</strong> October 25, 2025
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
