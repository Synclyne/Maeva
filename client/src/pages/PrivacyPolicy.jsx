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

          <Section title="6. Your Rights">
            <p>Under the Kenya Data Protection Act, 2019, you have the following rights:</p>
            <ul>
              <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to rectification:</strong> Correct inaccurate or incomplete data.</li>
              <li><strong>Right to erasure:</strong> Request deletion of your personal data (subject to legal obligations).</li>
              <li><strong>Right to restriction:</strong> Request that we limit processing of your data in certain circumstances.</li>
              <li><strong>Right to object:</strong> Object to processing of your data for direct marketing.</li>
              <li><strong>Right to portability:</strong> Receive your data in a structured, machine-readable format.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at <a href="mailto:privacy@maeva.co.ke" className="text-primary hover:underline">privacy@maeva.co.ke</a>. We will respond within 30 days.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>We use the following types of cookies:</p>
            <ul>
              <li><strong>Essential cookies:</strong> Required for authentication and security. Cannot be disabled.</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors use the platform (e.g., page views, popular listings). You may opt out by adjusting your browser settings.</li>
            </ul>
            <p>We do not use advertising or tracking cookies from third-party ad networks.</p>
          </Section>

          <Section title="8. Data Security">
            <p>
              We implement industry-standard security measures including HTTPS encryption, hashed passwords (bcrypt), JWT-based authentication, and rate limiting on sensitive endpoints. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p>
              If you discover a security vulnerability, please report it responsibly to <a href="mailto:security@maeva.co.ke" className="text-primary hover:underline">security@maeva.co.ke</a>.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              Maeva is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal data, we will delete it promptly.
            </p>
          </Section>

          <Section title="10. Third-Party Links">
            <p>
              Our platform may contain links to third-party websites (e.g., agent company websites, social media). We are not responsible for the privacy practices of these external sites and encourage you to review their privacy policies.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of material changes via email and by updating the effective date at the top of this page. Continued use of Maeva after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>If you have questions about this Privacy Policy or how we handle your data, please contact:</p>
            <div className="bg-gray-50 rounded-xl p-5 text-sm space-y-1 not-prose">
              <p><strong>Maeva Real Estate Kenya</strong></p>
              <p>Email: <a href="mailto:privacy@maeva.co.ke" className="text-primary hover:underline">privacy@maeva.co.ke</a></p>
              <p>Support: <Link to="/support" className="text-primary hover:underline">maeva.co.ke/support</Link></p>
              <p>Nairobi, Kenya</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              You also have the right to lodge a complaint with the <strong>Office of the Data Protection Commissioner (ODPC)</strong> Kenya if you believe your rights have been violated.
            </p>
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
