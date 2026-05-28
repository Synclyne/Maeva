import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const SOCIALS = [
  {
    label: 'X (Twitter)', href: 'https://twitter.com/maevakenya',
    icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>,
  },
  {
    label: 'Instagram', href: 'https://instagram.com/maevakenya',
    icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>,
  },
  {
    label: 'LinkedIn', href: 'https://linkedin.com/company/maevakenya',
    icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>,
  },
  {
    label: 'Facebook', href: 'https://facebook.com/maevakenya',
    icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>,
  },
];

export default function Footer() {
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    api.get('/listings/popular-areas?limit=5')
      .then(r => setAreas(r.data))
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg width="30" height="30" viewBox="0 0 34 34" fill="none"><rect width="34" height="34" rx="8" fill="#1D3F88"/><path d="M17 7L27 15V27H21V21H13V27H7V15L17 7Z" fill="white"/></svg>
              <span className="font-display text-xl font-semibold">Maeva</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-5">Kenya's trusted real estate platform. Buy, rent or list property across all 47 counties.</p>
            <div className="flex gap-2">
              {SOCIALS.map(({ label, href, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{icon}</svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Properties</h4>
            <ul className="space-y-2.5">
              {[
                ['Houses for Sale',    '/listings?transaction=sale&type=house'],
                ['Apartments to Rent', '/listings?transaction=rent&type=apartment'],
                ['Land for Sale',      '/listings?type=land'],
                ['Commercial',         '/listings?type=commercial'],
                ['All Listings',       '/listings'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-white/50 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Popular Areas</h4>
            <ul className="space-y-2.5">
              {areas.length > 0
                ? areas.map(({ county, area }) => (
                    <li key={`${county}-${area}`}>
                      <Link
                        to={`/listings?county=${encodeURIComponent(county)}&area=${encodeURIComponent(area)}`}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {county} — {area}
                      </Link>
                    </li>
                  ))
                : /* skeleton while loading */
                  [...Array(5)].map((_, i) => (
                    <li key={i} className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                  ))
              }
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                ['About Us',       '#'],
                ['Our Agencies',   '/agencies'],
                ['Market Insights', '/blog'],
                ['Post a Listing', '/post-listing'],
                ['Compare Properties', '/compare'],
                ['Support',        '/support'],
                ['Privacy Policy', '/privacy'],
                ['Terms of Service', '/terms'],
              ].map(([label, to]) => (
                <li key={label}>
                  {to.startsWith('/') ? (
                    <Link to={to} className="text-sm text-white/50 hover:text-white transition-colors">{label}</Link>
                  ) : (
                    <a href={to} className="text-sm text-white/50 hover:text-white transition-colors">{label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Maeva Real Estate Kenya. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link to="/terms"   className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms</Link>
            <Link to="/cookies" className="text-xs text-white/30 hover:text-white/60 transition-colors">Cookies</Link>
            <Link to="/support" className="text-xs text-white/30 hover:text-white/60 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
