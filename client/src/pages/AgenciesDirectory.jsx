import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { formatPrice } from '../data/locations';
import api from '../lib/api';

export default function AgenciesDirectory() {
  useSEO({
    title: 'Real Estate Agencies in Kenya | Maeva',
    description: 'Browse verified real estate agencies in Kenya. Find trusted realtors to help you buy, sell or rent property across all 47 counties.',
  });

  const [agencies, setAgencies]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [inputVal, setInputVal]   = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/agencies', { params: { search } })
      .then(r => setAgencies(r.data))
      .finally(() => setLoading(false));
  }, [search]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(inputVal), 300);
    return () => clearTimeout(t);
  }, [inputVal]);

  return (
    <div className="pt-16 min-h-screen bg-gray-50 has-bottom-nav">
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Real Estate Agencies</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-7">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900">Real Estate Agencies in Kenya</h1>
          <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
            {loading
              ? 'Loading agencies…'
              : `${agencies.length} verified agenc${agencies.length !== 1 ? 'ies' : 'y'} across Kenya`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-7">

          {/* ── Main listing ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Search bar */}
            <div className="relative mb-5">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="input pl-9 bg-white text-sm"
                placeholder="Search agencies by name or company…"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
              />
              {inputVal && (
                <button onClick={() => setInputVal('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5 animate-pulse">
                    <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/5" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : agencies.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
                  </svg>
                </div>
                <p className="font-medium text-gray-700">No agencies found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {search ? `No results for "${search}" — try a different search` : 'No agencies are listed yet'}
                </p>
                {search && (
                  <button onClick={() => setInputVal('')} className="mt-4 text-sm text-primary font-medium hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {agencies.map(a => (
                  <AgencyRow key={a.id} agency={a} />
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────── */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-24">
              <h3 className="font-display text-base font-semibold text-gray-900 mb-3">
                Why work with a real estate agency?
              </h3>
              <ul className="space-y-3 mb-5">
                {[
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: 'Verified, licensed professionals' },
                  { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', text: 'Deep local area knowledge' },
                  { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Price negotiation expertise' },
                  { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', text: 'Help with legal paperwork' },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        {icon.split(' M').map((seg, i) => (
                          <path key={i} strokeLinecap="round" strokeLinejoin="round" d={i === 0 ? seg : 'M' + seg} />
                        ))}
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 leading-snug">{text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/listings" className="btn-primary w-full rounded-xl text-sm justify-center">
                Browse All Listings
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AgencyRow({ agency }) {
  const name = agency.company || agency.name;

  return (
    <Link
      to={`/realtors/${agency.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all group block tap-highlight"
    >
      {/* Logo / Avatar */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
        {agency.avatar ? (
          <img
            src={agency.avatar}
            alt={name}
            className="w-full h-full object-contain p-2"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-primary text-white flex items-center justify-center text-2xl font-bold rounded-xl">
            {name[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-primary transition-colors truncate">{name}</h2>

        {agency.main_county && (
          <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1 mt-0.5">
            <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Real Estate Agency in {agency.main_county}
          </p>
        )}

        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          <span className="font-medium text-gray-600">{agency.listing_count || 0}</span>
          {' '}active listing{agency.listing_count !== 1 ? 's' : ''}
          {agency.min_price && agency.max_price
            ? ` · ${formatPrice(agency.min_price)} – ${formatPrice(agency.max_price)}`
            : ''}
        </p>
      </div>

      {/* Arrow — always visible */}
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 group-hover:text-primary group-hover:bg-primary/10 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  );
}
