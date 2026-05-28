import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const EFFECTIVE_DATE = '1 June 2026';

export default function CookiePolicy() {
  useSEO({ title: 'Cookie Policy | Maeva Kenya', description: 'Maeva Kenya cookie policy — what cookies and local storage data we use and why.' });
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
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-gray-500 text-sm">Effective date: <strong>{EFFECTIVE_DATE}</strong></p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files placed on your device when you visit a website. They allow the site to remember certain information about your visit, such as your login session or preferences. Maeva also uses browser <strong>localStorage</strong> — a similar technology that stores data directly in your browser without an expiry date — to keep you signed in between sessions.
            </p>
            <p>
              This policy explains exactly what data Maeva stores in your browser, why, and how you can control it.
            </p>
          </Section>

          <Section title="2. Data We Store in Your Browser">
            <p>Maeva stores the following data in your browser:</p>

            <DataTable rows={[
              {
                name: 'token',
                type: 'localStorage',
                purpose: 'Stores your JSON Web Token (JWT) authentication credential. This is what keeps you signed in across page refreshes and new browser sessions.',
                duration: 'Until you sign out or the token expires (typically 7 days)',
                essential: true,
              },
              {
                name: 'Session cookie (HTTP-only)',
                type: 'HTTP Cookie',
                purpose: 'Set by the Express server for secure session management on authenticated API requests.',
                duration: 'Browser session (deleted when browser is closed)',
                essential: true,
              },
            ]} />

            <p className="mt-4">
              We do <strong>not</strong> use advertising cookies, tracking pixels, or third-party analytics cookies from services like Google Analytics, Meta Pixel, or similar platforms.
            </p>
          </Section>

          <Section title="3. Why We Use These Technologies">
            <SubHeading>3.1 Authentication (Essential)</SubHeading>
            <p>
              The <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">token</code> stored in localStorage is your session credential. When you sign in, we generate a signed JWT that your browser sends with every API request so our server can verify your identity. Without this, you would be logged out on every page refresh.
            </p>
            <p>
              We chose localStorage over cookies for the auth token to avoid CSRF attack vectors in the API-first architecture. The token itself is cryptographically signed and cannot be forged.
            </p>

            <SubHeading>3.2 User Preferences (Functional)</SubHeading>
            <p>
              We may store lightweight preferences (such as your last selected county or property type filter) in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">sessionStorage</code> to improve your browsing experience within a single visit. This data is automatically cleared when you close the browser tab.
            </p>

            <SubHeading>3.3 What We Do Not Do</SubHeading>
            <ul>
              <li>We do <strong>not</strong> use Google Analytics, Meta Pixel, or any third-party tracking scripts</li>
              <li>We do <strong>not</strong> use advertising or retargeting cookies</li>
              <li>We do <strong>not</strong> sell your browsing behaviour to data brokers</li>
              <li>We do <strong>not</strong> use fingerprinting or supercookies</li>
            </ul>
          </Section>

          <Section title="4. Data Collected Automatically">
            <p>
              In addition to browser storage, our server logs the following data automatically when you make requests to Maeva:
            </p>
            <ul>
              <li><strong>IP address</strong> — used for rate limiting and security purposes. Not linked to user profiles or stored long-term.</li>
              <li><strong>User-agent string</strong> — your browser and operating system type, used for compatibility and security analysis.</li>
              <li><strong>Request timestamps</strong> — used for rate limiting and abuse detection.</li>
              <li><strong>Listing view counts</strong> — we increment a view counter when you open a listing page. This is aggregate, not personally identifiable.</li>
            </ul>
            <p>
              This server-side data is not shared with third parties and is retained for a maximum of <strong>90 days</strong> in server logs before automatic rotation.
            </p>
          </Section>

          <Section title="5. Managing Your Data">
            <SubHeading>5.1 Clearing your auth token</SubHeading>
            <p>
              You can sign out at any time via the navigation menu. This removes the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">token</code> from localStorage immediately. Alternatively, you can clear all site data from your browser's developer tools or settings.
            </p>

            <SubHeading>5.2 Browser settings</SubHeading>
            <p>
              All modern browsers allow you to view, delete, or block cookies and localStorage data:
            </p>
            <ul>
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
            </ul>
            <p>
              Note: blocking localStorage will prevent you from staying signed in to Maeva, as login persistence depends on token storage.
            </p>

            <SubHeading>5.3 Account deletion</SubHeading>
            <p>
              If you delete your Maeva account, all personal data associated with your account is removed from our databases in accordance with our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. Any tokens previously issued for your account are immediately invalidated.
            </p>
          </Section>

          <Section title="6. Legal Basis">
            <p>
              Our use of essential browser storage (the auth token) is based on <strong>contractual necessity</strong> — without it, we cannot provide the authenticated services you have requested. This processing is lawful under the <strong>Kenya Data Protection Act, 2019</strong>, Section 30(1)(b).
            </p>
            <p>
              Because we do not use non-essential cookies (analytics, advertising, etc.), we do not require your prior consent for our current browser storage practices. If we introduce non-essential cookies in the future, we will update this policy and implement a consent mechanism before setting any such cookies.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              We may update this Cookie Policy as our technology evolves or if we add new features that involve new forms of browser storage. Any material changes will be communicated to registered users by email and by updating the effective date above.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>For questions about this Cookie Policy, please contact:</p>
            <div className="bg-gray-50 rounded-xl p-5 text-sm space-y-1 not-prose">
              <p><strong>Maeva Real Estate Kenya</strong></p>
              <p>Email: <a href="mailto:privacy@maeva.co.ke" className="text-primary hover:underline">privacy@maeva.co.ke</a></p>
              <p>Support: <Link to="/support" className="text-primary hover:underline">maeva.co.ke/support</Link></p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function DataTable({ rows }) {
  return (
    <div className="not-prose overflow-x-auto mt-4 rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Type</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Purpose</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Duration</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Essential</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <tr key={i} className="bg-white">
              <td className="px-4 py-3 font-mono text-xs text-gray-800 whitespace-nowrap">{r.name}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.type}</td>
              <td className="px-4 py-3 text-gray-600 leading-snug">{r.purpose}</td>
              <td className="px-4 py-3 text-gray-500 text-xs leading-snug">{r.duration}</td>
              <td className="px-4 py-3">
                {r.essential ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Yes</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-medium">No</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
