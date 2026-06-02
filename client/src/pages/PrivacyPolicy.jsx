import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const EFFECTIVE_DATE = '1 June 2026';

export default function PrivacyPolicy() {
  useSEO({ title: 'Privacy Policy | Maeva Kenya', description: 'Maeva Kenya privacy policy — how we collect, use and protect your personal data.' });
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div className="pt-16 min-h-screen bg-gray-50 has-bottom-nav">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Back to Home
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Effective date: <strong>{EFFECTIVE_DATE}</strong></p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <Section title="1. Introduction">
            <p>
              Maeva Real Estate Kenya ("<strong>Maeva</strong>", "<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>") operates the website <strong>maeva.co.ke</strong> and related services. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our platform.
            </p>
            <p>
              By accessing or using Maeva, you agree to this Privacy Policy. If you do not agree, please discontinue use of the platform. This policy is governed by the <strong>Kenya Data Protection Act, 2019</strong> and related regulations.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect information you provide directly and information generated automatically through your use of our platform.</p>
            <SubHeading>2.1 Information you provide</SubHeading>
            <ul>
              <li><strong>Account information:</strong> Full name, email address, phone number, and password when you register.</li>
              <li><strong>Profile information:</strong> Company/agency name, profile photo or logo (for realtors).</li>
              <li><strong>Listing information:</strong> Property details, images, location, price, and description when you post a listing.</li>
              <li><strong>Enquiry information:</strong> Name, email, phone number, and message when you submit an enquiry about a property.</li>
              <li><strong>Support information:</strong> Details you provide when contacting our support team.</li>
            </ul>
            <SubHeading>2.2 Information collected automatically</SubHeading>
            <ul>
              <li><strong>Usage data:</strong> Pages visited, listings viewed, search queries, and time spent on the platform.</li>
              <li><strong>Device information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
              <li><strong>Cookies:</strong> We use session cookies for authentication and analytics cookies (see Section 7).</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use your personal information for the following purposes:</p>
            <ul>
              <li>To create and manage your account</li>
              <li>To facilitate property listings, searches, and enquiries</li>
              <li>To connect buyers, renters, and sellers with verified real estate agents</li>
              <li>To process and respond to support requests</li>
              <li>To send transactional emails (account confirmation, password resets, enquiry notifications)</li>
              <li>To improve our platform through analytics and user feedback</li>
              <li>To detect and prevent fraud, spam, and abuse</li>
              <li>To comply with legal obligations under Kenyan law</li>
            </ul>
            <p>
              We do <strong>not</strong> use your data for automated decision-making or profiling that produces legal or similarly significant effects.
            </p>
          </Section>

          <Section title="4. How We Share Your Information">
            <p>We do not sell your personal data. We may share information in the following limited circumstances:</p>
            <ul>
              <li><strong>With real estate agents:</strong> When you submit an enquiry, your name, email, and phone number are shared with the agent you contacted.</li>
              <li><strong>With service providers:</strong> We work with trusted third-party services for email delivery (Nodemailer/SMTP), hosting, and analytics. These providers are contractually bound to protect your data.</li>
              <li><strong>For legal compliance:</strong> We may disclose information where required by Kenyan law, court order, or government authority.</li>
              <li><strong>Business transfers:</strong> In the event of a merger or acquisition, your information may be transferred as part of business assets, subject to continued protection under this policy.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your personal information for as long as your account is active or as needed to provide services. Specifically:
            </p>
            <ul>
              <li><strong>Account data:</strong> Retained until you delete your account, plus 30 days for recovery.</li>
              <li><strong>Listing data:</strong> Active listings are retained until you remove them. Expired or deleted listings are purged after 90 days.</li>
              <li><strong>Enquiry data:</strong> Retained for 12 months, then anonymised.</li>
              <li><strong>Support tickets:</strong> Retained for 24 months after resolution.</li>
            </ul>
          </Section>

          <Section title="6. Legal Basis for Processing">
            <p>We process your personal data only where we have a valid legal basis. Depending on the activity, we rely on:</p>
            <ul>
              <li><strong>Contract performance (Art. 6(1)(b) GDPR / KDPA s.30(1)(b)):</strong> Processing necessary to provide the services you requested — authentication, listing management, enquiry delivery.</li>
              <li><strong>Legitimate interests (Art. 6(1)(f) GDPR / KDPA s.30(1)(f)):</strong> Security monitoring, fraud prevention, rate limiting, and platform analytics. We have assessed that these interests do not override your rights.</li>
              <li><strong>Legal obligation (Art. 6(1)(c) GDPR / KDPA s.30(1)(c)):</strong> Compliance with Kenyan law, court orders, or regulatory requirements.</li>
              <li><strong>Consent:</strong> Where required (e.g., optional marketing communications), we will obtain your explicit prior consent. You may withdraw consent at any time.</li>
            </ul>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the following rights over your personal data. These apply regardless of where you are located; specific additional rights for EU, California, and South African residents are noted below.</p>
            <ul>
              <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to rectification:</strong> Correct inaccurate or incomplete data.</li>
              <li><strong>Right to erasure ("right to be forgotten"):</strong> Request deletion of your personal data, subject to legal retention obligations.</li>
              <li><strong>Right to restriction:</strong> Request that we limit processing of your data in certain circumstances.</li>
              <li><strong>Right to object:</strong> Object to processing based on legitimate interests or for direct marketing at any time.</li>
              <li><strong>Right to portability:</strong> Receive your data in a structured, machine-readable format (JSON or CSV on request).</li>
              <li><strong>Right to withdraw consent:</strong> Where we rely on consent, you may withdraw it at any time without affecting processing already carried out.</li>
            </ul>
            <p>To exercise any of these rights, contact <a href="mailto:privacy@maeva.co.ke" className="text-primary hover:underline">privacy@maeva.co.ke</a>. We will respond within <strong>30 days</strong> (extendable by a further 60 days for complex requests with notice).</p>

            <SubHeading>7.1 EU/EEA Residents — GDPR</SubHeading>
            <p>
              If you are located in the European Union or European Economic Area, the General Data Protection Regulation (GDPR) (EU) 2016/679 applies to our processing of your data. In addition to the rights above, you have the right to lodge a complaint with your local supervisory authority. A list of EU data protection authorities is available at <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">edpb.europa.eu</a>.
            </p>
            <p>
              Our primary data centre is located in the EU (Frankfurt, Germany — Supabase eu-central-1). No transfer to a third country with inadequate protection occurs. Where data is processed by sub-processors in other regions, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission.
            </p>

            <SubHeading>7.2 California Residents — CCPA / CPRA</SubHeading>
            <p>
              If you are a California resident, the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA) grants you additional rights:
            </p>
            <ul>
              <li><strong>Right to Know:</strong> The categories and specific pieces of personal information collected about you.</li>
              <li><strong>Right to Delete:</strong> Deletion of personal information we have collected (subject to exceptions).</li>
              <li><strong>Right to Opt-Out of Sale:</strong> We do <strong>not sell</strong> personal information. We do not share personal information for cross-context behavioural advertising.</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights.</li>
              <li><strong>Right to Correct:</strong> Correct inaccurate personal information we hold about you.</li>
            </ul>
            <p>To exercise CCPA rights, contact <a href="mailto:privacy@maeva.co.ke" className="text-primary hover:underline">privacy@maeva.co.ke</a>. We will verify your identity before processing requests.</p>

            <SubHeading>7.3 South African Residents — POPIA</SubHeading>
            <p>
              If you are located in South Africa, the Protection of Personal Information Act, 2013 (POPIA) applies. You have rights of access, correction, deletion, and objection substantially equivalent to those listed above. You may also lodge a complaint with the <strong>Information Regulator (South Africa)</strong> at <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">justice.gov.za/inforeg</a>.
            </p>

            <SubHeading>7.4 UK Residents — UK GDPR</SubHeading>
            <p>
              The UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018 apply to UK residents. Your rights are equivalent to those under EU GDPR. You may lodge a complaint with the <strong>Information Commissioner's Office (ICO)</strong> at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a>.
            </p>
          </Section>

          <Section title="8. International Data Transfers">
            <p>Maeva uses the following third-party infrastructure providers, which may process your data in their respective locations:</p>
            <ul>
              <li><strong>Supabase (database &amp; storage):</strong> EU region — Frankfurt, Germany (AWS eu-central-1). Supabase is GDPR-compliant and provides a Data Processing Agreement (DPA).</li>
              <li><strong>Vercel (hosting &amp; CDN):</strong> Global edge network. Vercel is GDPR-compliant and provides a DPA. Data at rest is processed in the US; Vercel relies on Standard Contractual Clauses for EU data transfers.</li>
              <li><strong>Email delivery (Nodemailer/SMTP):</strong> Transactional emails (password resets, enquiry notifications) are sent via our configured SMTP provider. No marketing emails are sent without consent.</li>
            </ul>
            <p>
              All sub-processors are contractually bound to process data only on our instructions, maintain appropriate security measures, and not use your data for their own purposes.
            </p>
          </Section>

          <Section title="9. Cookies &amp; Browser Storage">
            <p>
              We use only <strong>essential</strong> browser storage — a JWT authentication token in localStorage to keep you signed in. We do <strong>not</strong> use analytics cookies, advertising cookies, tracking pixels, or any third-party cookies. For full details see our <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
            </p>
          </Section>

          <Section title="10. Data Security">
            <p>
              We implement industry-standard security measures including: TLS/HTTPS encryption in transit, bcrypt password hashing (cost factor 10), JWT-based stateless authentication, rate limiting on authentication endpoints, HTTP security headers (X-Frame-Options, X-Content-Type-Options, CSP), Row-Level Security on all database tables, and restricted database access. However, no method of transmission over the internet is 100% secure.
            </p>
            <p>
              We operate a responsible disclosure programme. If you discover a security vulnerability, please report it to <a href="mailto:security@maeva.co.ke" className="text-primary hover:underline">security@maeva.co.ke</a>. We commit to acknowledging reports within 48 hours and resolving critical issues within 30 days.
            </p>
          </Section>

          <Section title="11. Children's Privacy">
            <p>
              Maeva is strictly for users aged <strong>18 and over</strong>. We do not knowingly collect personal data from anyone under 18. In the EU, we do not knowingly collect data from anyone under 16. If you believe a minor has provided us with data, please contact <a href="mailto:privacy@maeva.co.ke" className="text-primary hover:underline">privacy@maeva.co.ke</a> and we will delete it promptly. This policy is consistent with the U.S. Children's Online Privacy Protection Act (COPPA), EU GDPR Article 8, and Kenya Data Protection Act s.25.
            </p>
          </Section>

          <Section title="12. Third-Party Links">
            <p>
              Our platform may contain links to third-party websites (e.g., agent company websites, Google Maps, social media). We are not responsible for the privacy practices of these external sites and encourage you to review their own privacy policies before providing any personal information.
            </p>
          </Section>

          <Section title="13. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of material changes via email with at least <strong>14 days' notice</strong> and by updating the effective date at the top of this page. For non-material changes, notice will be provided by updating the date only.
            </p>
          </Section>

          <Section title="14. Contact &amp; Supervisory Authorities">
            <p>For questions, data requests, or complaints regarding this Privacy Policy:</p>
            <div className="bg-gray-50 rounded-xl p-5 text-sm space-y-1 not-prose">
              <p><strong>Maeva Real Estate Kenya — Data Controller</strong></p>
              <p>Email: <a href="mailto:privacy@maeva.co.ke" className="text-primary hover:underline">privacy@maeva.co.ke</a></p>
              <p>Support: <Link to="/support" className="text-primary hover:underline">maeva.co.ke/support</Link></p>
              <p>Nairobi, Kenya</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">You have the right to lodge a complaint with your local data protection authority:</p>
            <ul className="text-sm text-gray-500">
              <li><strong>Kenya:</strong> Office of the Data Protection Commissioner (ODPC) — <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">odpc.go.ke</a></li>
              <li><strong>EU/EEA:</strong> Your national supervisory authority — <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">edpb.europa.eu</a></li>
              <li><strong>UK:</strong> Information Commissioner's Office — <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a></li>
              <li><strong>South Africa:</strong> Information Regulator — <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">justice.gov.za/inforeg</a></li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function SubHeading({ children }) {
  return <p className="font-semibold text-gray-800 mt-4 mb-1">{children}</p>;
}
