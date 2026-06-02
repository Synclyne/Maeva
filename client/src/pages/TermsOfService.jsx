import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const EFFECTIVE_DATE = '1 June 2026';

export default function TermsOfService() {
  useSEO({ title: 'Terms of Service | Maeva Kenya', description: 'Maeva Kenya terms of service — the rules and conditions governing use of the platform.' });
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
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Effective date: <strong>{EFFECTIVE_DATE}</strong></p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using the Maeva Real Estate Kenya platform ("<strong>Maeva</strong>", "<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>") at <strong>maeva.co.ke</strong>, you agree to be bound by these Terms of Service ("<strong>Terms</strong>"). If you do not agree to these Terms, please discontinue use immediately.
            </p>
            <p>
              These Terms are governed by the laws of Kenya, including the <strong>Kenya Information and Communications Act</strong>, the <strong>Data Protection Act, 2019</strong>, and the <strong>Consumer Protection Act, 2012</strong>.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <ul>
              <li>You must be at least <strong>18 years of age</strong> to create an account or use any features of this platform.</li>
              <li>By registering, you confirm that all information you provide is accurate, complete, and current.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>One person may not maintain more than one active account unless expressly permitted by Maeva.</li>
            </ul>
          </Section>

          <Section title="3. User Roles">
            <SubHeading>3.1 Clients (Buyers & Renters)</SubHeading>
            <p>
              Clients may browse property listings, save favourites to their Wishlist, submit enquiries to agents, and manage their account profile. Clients do not have access to listing management tools.
            </p>
            <SubHeading>3.2 Realtors / Agents</SubHeading>
            <p>
              Realtors may post property listings, manage existing listings, view enquiries from prospective buyers and renters, and maintain an agency profile. By posting a listing, you represent that you have the legal authority to market that property.
            </p>
            <SubHeading>3.3 Administrators</SubHeading>
            <p>
              Maeva administrators manage the platform, review listing requests, handle support tickets, and may remove content that violates these Terms.
            </p>
          </Section>

          <Section title="4. Listing Rules">
            <p>All property listings posted on Maeva must comply with the following rules:</p>
            <ul>
              <li><strong>Accuracy:</strong> All listing details (price, location, size, features) must be truthful and not misleading.</li>
              <li><strong>Ownership / Authority:</strong> You must own the property or have written authority from the owner to list it.</li>
              <li><strong>No duplicates:</strong> The same property may not be listed multiple times by the same agent.</li>
              <li><strong>Photos:</strong> All uploaded images must be of the actual property being listed. Stock photos that misrepresent the property are prohibited.</li>
              <li><strong>Pricing:</strong> Prices must be stated in Kenyan Shillings (KES) or another clearly indicated currency and must reflect genuine market values.</li>
              <li><strong>Prohibited listings:</strong> Listings for properties involved in fraud, illegal activity, or in dispute may be removed without notice.</li>
            </ul>
            <p>
              Maeva reserves the right to remove, suspend, or modify any listing that violates these rules at our sole discretion and without prior notice.
            </p>
          </Section>

          <Section title="5. Enquiries and Communications">
            <p>
              When you submit an enquiry through Maeva, your name, email address, and phone number are shared with the listing agent. Maeva is not a party to the transaction between buyers, renters, and agents. We facilitate the connection but are not responsible for the conduct of either party.
            </p>
            <p>
              You agree not to use the enquiry system to send spam, solicitations, or any content unrelated to the property being enquired about.
            </p>
          </Section>

          <Section title="6. No Financial or Legal Advice">
            <p>
              <strong>Maeva is a property listing platform, not a financial adviser, investment adviser, or legal adviser.</strong> Nothing on this platform constitutes financial advice, investment advice, legal advice, or a recommendation to buy, sell, rent, or invest in any property. Property values can fall as well as rise.
            </p>
            <p>
              Before entering into any property transaction you should independently:
            </p>
            <ul>
              <li>Conduct your own due diligence, including a <strong>title deed search</strong> at the relevant Land Registry</li>
              <li>Engage a qualified and licensed <strong>advocate/lawyer</strong> to review any contracts</li>
              <li>Obtain an independent <strong>property valuation</strong> from a registered valuer</li>
              <li>Seek independent <strong>financial and tax advice</strong> relevant to your circumstances</li>
            </ul>
          </Section>

          <Section title="7. Agent Licensing &amp; Compliance">
            <p>
              In Kenya, estate agents are required to be registered with the <strong>Estate Agents Registration Board (EARB)</strong> under the Estate Agents Act (Cap. 533). By registering as a realtor on Maeva, you represent and warrant that:
            </p>
            <ul>
              <li>You hold a valid EARB registration certificate (or are employed by a registered firm) where required by law</li>
              <li>You will maintain any required professional indemnity insurance</li>
              <li>You will comply with all applicable professional codes of conduct and regulations</li>
              <li>You have written authority from the property owner to market and list any property you post</li>
            </ul>
            <p>
              Maeva reserves the right to request proof of registration and to remove listings or suspend accounts of agents who cannot demonstrate compliance.
            </p>
          </Section>

          <Section title="8. Anti-Money Laundering &amp; Financial Crime">
            <p>
              Real estate is recognised internationally as a vehicle for money laundering and financial crime. Maeva is committed to compliance with Kenya's <strong>Proceeds of Crime and Anti-Money Laundering Act (POCAMLA), 2009</strong>, the <strong>Prevention of Terrorism Act, 2012</strong>, and applicable Financial Action Task Force (FATF) recommendations.
            </p>
            <p>By using Maeva, you agree that:</p>
            <ul>
              <li>All funds used in connection with any property transaction are from legitimate sources</li>
              <li>You will not use Maeva to facilitate, disguise, or conceal the proceeds of crime</li>
              <li>You will not make or receive payments on behalf of undisclosed third parties</li>
              <li>You will cooperate fully with any AML/KYC verification requests from Maeva, agents, or legal authorities</li>
            </ul>
            <p>
              Maeva reserves the right to suspend accounts, report suspicious activity to the relevant authorities (including the <strong>Financial Reporting Centre (FRC) Kenya</strong>), and cooperate with law enforcement investigations without prior notice to the user concerned.
            </p>
          </Section>

          <Section title="9. Non-Discrimination &amp; Equal Opportunity">
            <p>
              Maeva operates in accordance with the <strong>Constitution of Kenya, 2010 (Article 27)</strong> and all applicable anti-discrimination laws. All property listings and services on this platform must be offered on an equal basis without discrimination on the grounds of:
            </p>
            <ul>
              <li>Race, colour, ethnic or social origin, or nationality</li>
              <li>Sex, gender, gender identity, or sexual orientation</li>
              <li>Age, pregnancy, or disability status</li>
              <li>Religion or belief</li>
              <li>Marital or family status</li>
              <li>HIV/AIDS status</li>
              <li>Political opinion</li>
            </ul>
            <p>
              Listings that contain discriminatory language, restrictions, or preferences based on the above protected characteristics will be removed without notice. Agents and users who engage in discriminatory conduct may have their accounts permanently terminated.
            </p>
          </Section>

          <Section title="10. Prohibited Conduct">
            <p>You agree not to:</p>
            <ul>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Impersonate any person or entity</li>
              <li>Use automated tools (bots, scrapers) to access the platform without prior written consent from Maeva</li>
              <li>Attempt to gain unauthorised access to any part of the platform or its servers</li>
              <li>Engage in price manipulation, bid rigging, or any other anti-competitive behaviour</li>
              <li>Harass, threaten, or intimidate other users or Maeva staff</li>
              <li>Use the platform to conduct any illegal activity under Kenyan law</li>
            </ul>
          </Section>

          <Section title="11. Intellectual Property">
            <p>
              All platform content created by Maeva — including the Maeva name, logo, design, code, and editorial content — is the exclusive property of Maeva Real Estate Kenya and is protected by applicable copyright and trademark laws.
            </p>
            <p>
              By uploading property images or content to Maeva, you grant Maeva a non-exclusive, royalty-free, worldwide licence to display and use that content for the purposes of operating and promoting the platform, for as long as the listing remains active.
            </p>
          </Section>

          <Section title="12. Disclaimer of Warranties">
            <p>
              Maeva is provided on an "<strong>as-is</strong>" and "<strong>as-available</strong>" basis. We do not verify the accuracy of all listing information submitted by realtors. Maeva makes no warranty that:
            </p>
            <ul>
              <li>Listing information is accurate, complete, or current at any given time</li>
              <li>The platform will be uninterrupted, error-free, or free of viruses</li>
              <li>Any transaction facilitated through the platform will be completed successfully</li>
            </ul>
            <p>
              Users are advised to conduct their own due diligence — including independent property valuations, title deed searches, and legal advice — before entering into any property transaction.
            </p>
          </Section>

          <Section title="13. Limitation of Liability">
            <p>
              To the maximum extent permitted by Kenyan law, Maeva and its affiliates, directors, and employees shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform, including but not limited to loss of profits, loss of data, property damage, or personal injury.
            </p>
            <p>
              Maeva's total aggregate liability to any user for any claim arising under these Terms shall not exceed the amount paid by that user to Maeva in the 12-month period preceding the claim, or KES 5,000, whichever is lower.
            </p>
          </Section>

          <Section title="14. Account Termination">
            <p>
              Maeva reserves the right to suspend or permanently terminate your account at any time, with or without notice, if we determine that you have violated these Terms, engaged in fraudulent activity, or for any other reason at our sole discretion.
            </p>
            <p>
              You may delete your account at any time by contacting us at <a href="mailto:support@maeva.co.ke" className="text-primary hover:underline">support@maeva.co.ke</a>. Upon deletion, your listings will be removed and your personal data will be handled in accordance with our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </Section>

          <Section title="15. Third-Party Services">
            <p>
              Maeva integrates with third-party services including Supabase (database and storage), Vercel (hosting), and email delivery providers. These services are governed by their own terms and privacy policies. Maeva is not responsible for the practices of these third parties.
            </p>
            <p>
              Links to external websites (including agent company websites) are provided for convenience only and do not constitute endorsement by Maeva.
            </p>
          </Section>

          <Section title="16. Changes to Terms">
            <p>
              Maeva may update these Terms at any time. We will provide at least <strong>14 days' notice</strong> of material changes by emailing registered users and posting a notice on the platform. Continued use of Maeva after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="17. Governing Law &amp; Disputes">
            <p>
              These Terms are governed by and construed in accordance with the laws of the <strong>Republic of Kenya</strong>. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Kenya.
            </p>
            <p>
              If you are located in the EU, you may also have access to alternative dispute resolution (ADR) mechanisms in your jurisdiction, which you may use instead of, or before, initiating court proceedings.
            </p>
            <p>
              Before initiating legal proceedings, you agree to first attempt to resolve any dispute informally by contacting Maeva at <a href="mailto:support@maeva.co.ke" className="text-primary hover:underline">support@maeva.co.ke</a> and allowing us 30 days to respond.
            </p>
          </Section>

          <Section title="18. Contact">
            <p>For questions about these Terms, please contact:</p>
            <div className="bg-gray-50 rounded-xl p-5 text-sm space-y-1 not-prose">
              <p><strong>Maeva Real Estate Kenya</strong></p>
              <p>Email: <a href="mailto:legal@maeva.co.ke" className="text-primary hover:underline">legal@maeva.co.ke</a></p>
              <p>Support: <Link to="/support" className="text-primary hover:underline">maeva.co.ke/support</Link></p>
              <p>Nairobi, Kenya</p>
            </div>
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
