import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const VALUES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: 'Verified Listings',
    desc: 'Every property is reviewed before going live. No ghost listings, no duplicate posts — just real opportunities.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253"/>
      </svg>
    ),
    title: 'All 47 Counties',
    desc: 'From Nairobi to Turkana, Mombasa to Kisumu — Maeva covers every corner of Kenya.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
      </svg>
    ),
    title: 'Safe & Compliant',
    desc: 'Built on Kenya\'s Data Protection Act 2019, POCAMLA, and EARB agent regulations — your data and transactions are protected.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"/>
      </svg>
    ),
    title: 'Market Insights',
    desc: 'County-level guides, price trends, and editorial content to help you buy, rent, or invest with confidence.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
      </svg>
    ),
    title: 'Trusted Agents',
    desc: 'Registered realtors with verified profiles, EARB-compliant listings, and transparent contact details.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-6 3.75H9m1.5-12.75h.375a1.125 1.125 0 010 2.25H10.5V8.25z"/>
      </svg>
    ),
    title: 'Mobile First',
    desc: 'Designed for Kenyan users on the go — fast, installable as a PWA, and works on any device or connection speed.',
  },
];

const STATS = [
  { value: '47', label: 'Counties covered' },
  { value: '100%', label: 'Free to search' },
  { value: '24h', label: 'Listing review time' },
  { value: '2025', label: 'Founded' },
];

export default function About() {
  useSEO({
    title: 'About Us | Maeva Kenya',
    description: 'Learn about Maeva — Kenya\'s trusted real estate platform connecting buyers, renters, and agents across all 47 counties.',
  });

  return (
    <div className="pt-16 min-h-screen bg-white has-bottom-nav">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium mb-6">
            Kenya's #1 Real Estate Platform
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight mb-5">
            Property search,<br className="hidden sm:block" /> reimagined for Kenya
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Maeva connects Kenyan buyers, renters, and property agents on a platform built around trust, transparency, and local expertise.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/listings" className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors text-sm">
              Browse Properties
            </Link>
            <Link to="/support" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors text-sm">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-3xl font-bold text-primary">{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Finding property in Kenya has always been complicated — opaque pricing, unverified agents, and listings scattered across WhatsApp groups and noticeboards. Maeva exists to change that.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              We built a centralised platform where every listing is reviewed, every agent is identifiable, and every buyer has access to the same information. Whether you're looking for a bedsitter in Nairobi or a plot in Kisumu, Maeva gives you the full picture.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We are committed to operating fully within Kenya's legal framework — including the Estate Agents Act, the Data Protection Act 2019, POCAMLA, and the Constitution's anti-discrimination provisions — so you can transact with confidence.
            </p>
          </div>
          <div className="bg-primary-pale rounded-3xl p-8 space-y-5">
            {[
              ['For Buyers & Renters', 'Search, compare and save properties. Direct contact with verified agents. No middlemen, no hidden fees.'],
              ['For Agents & Realtors', 'List properties, manage enquiries, and build a verified agency profile — all from one dashboard.'],
              ['For the Market', 'County guides, market insights, and editorial content that make property decisions easier for everyone.'],
            ].map(([title, body]) => (
              <div key={title} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{title}</div>
                  <div className="text-gray-600 text-sm mt-0.5">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-semibold text-gray-900 mb-3">What sets us apart</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Six pillars that guide how we build and operate Maeva.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary-pale text-primary flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Legal commitment ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-primary rounded-3xl p-8 sm:p-12 text-white">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4">Built for trust, built for Kenya</h2>
          <p className="text-white/75 leading-relaxed mb-6 max-w-2xl">
            Real estate is one of the highest-value decisions a person makes. We take that responsibility seriously. Maeva is designed to comply with Kenyan law at every layer — from how we store your data to how we verify agents.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              ['KDPA 2019', 'Data protection & user privacy'],
              ['EARB Compliance', 'Agent licensing & verification'],
              ['POCAMLA 2009', 'Anti-money laundering measures'],
            ].map(([law, note]) => (
              <div key={law} className="bg-white/10 rounded-xl px-4 py-3">
                <div className="font-semibold text-sm">{law}</div>
                <div className="text-white/60 text-xs mt-0.5">{note}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/privacy" className="text-sm font-medium text-white/80 hover:text-white underline underline-offset-2">Privacy Policy</Link>
            <span className="text-white/30">·</span>
            <Link to="/terms" className="text-sm font-medium text-white/80 hover:text-white underline underline-offset-2">Terms of Service</Link>
            <span className="text-white/30">·</span>
            <Link to="/support" className="text-sm font-medium text-white/80 hover:text-white underline underline-offset-2">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100 py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">Ready to find your next property?</h2>
          <p className="text-gray-500 mb-8">Thousands of listings across Kenya, updated daily by verified agents.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/listings" className="btn-primary rounded-xl px-8 py-3 text-sm font-semibold">Browse Listings</Link>
            <Link to="/agencies" className="btn-outline rounded-xl px-8 py-3 text-sm font-semibold">Find an Agent</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
