import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { formatPrice, timeAgo } from '../data/locations';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=80&h=60&fit=crop';

/* Tiny SVG icon helper used in the tab bar */
function TabIcon({ d }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      {d.split(' M').map((seg, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  );
}

export default function AdminDashboard() {
  useSEO({ title: 'Admin Dashboard', description: 'Maeva admin panel' });

  const [tab, setTab] = useState('listings');
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const [openTickets, setOpenTickets] = useState(0);

  useEffect(() => {
    if (stats?.openTickets !== undefined) setOpenTickets(stats.openTickets);
  }, [stats]);

  const tabs = [
    { id: 'listings',  label: 'Listings',  icon: <TabIcon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" /> },
    { id: 'users',     label: 'Users',     icon: <TabIcon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" /> },
    { id: 'agencies',  label: 'Agencies',  icon: <TabIcon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />, badge: stats?.pendingVerifications },
    { id: 'enquiries', label: 'Enquiries', icon: <TabIcon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />, badge: stats?.unreadEnquiries },
    { id: 'partners',  label: 'Partners',  icon: <TabIcon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
    { id: 'support',   label: 'Support',   icon: <TabIcon d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />, badge: openTickets },
    { id: 'mylistings', label: 'My Listings', icon: <TabIcon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
    { id: 'homepage',  label: 'Homepage',   icon: <TabIcon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { id: 'stats',     label: 'Stats',      icon: <TabIcon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50 has-bottom-nav">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Manage listings, users and platform content</p>
          </div>
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">Admin</span>
        </div>

        {/* Quick stats row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Listings', val: stats.totalListings, sub: `${stats.activeListings} active`,
                color: 'bg-blue-50 text-blue-600',
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" /> },
              { label: 'Total Users', val: stats.totalUsers, sub: `${stats.realtors} realtors · ${stats.clients} clients`,
                color: 'bg-purple-50 text-purple-600',
                icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></> },
              { label: 'Total Views', val: stats.totalViews.toLocaleString(), sub: 'across all listings',
                color: 'bg-amber-50 text-amber-600',
                icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> },
              { label: 'Enquiries', val: stats.totalEnquiries, sub: `${stats.unreadEnquiries} unread`,
                color: 'bg-green-50 text-green-600',
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /> },
            ].map(({ label, val, icon, sub, color }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{icon}</svg>
                </div>
                <div className="font-display text-2xl font-semibold text-gray-900">{val}</div>
                <div className="text-xs text-gray-500 font-medium">{label}</div>
                <div className="text-xs text-gray-400">{sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab bar — scrolls horizontally on mobile */}
        <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto scrollbar-hide w-full sm:w-fit">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={tab === t.id}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${tab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(' ')[0]}</span>
                {t.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {t.badge > 9 ? '9+' : t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === 'listings'  && <AdminListings  onAction={fetchStats} />}
        {tab === 'users'     && <AdminUsers     onAction={fetchStats} />}
        {tab === 'agencies'  && <AdminAgencies  onAction={fetchStats} />}
        {tab === 'enquiries' && <AdminEnquiries onAction={fetchStats} />}
        {tab === 'partners'   && <AdminPartners />}
        {tab === 'support'    && <AdminSupport onBadgeChange={setOpenTickets} />}
        {tab === 'mylistings' && <AdminMyListings />}
        {tab === 'homepage'   && <AdminHomepage />}
        {tab === 'stats'      && <AdminStats stats={stats} />}
      </div>
    </div>
  );
}

const BADGE_OPTIONS = ['Featured', 'Premium', 'Hot', 'Verified', 'New', 'Sponsored'];
const BADGE_STYLES  = {
  'Featured':  'bg-yellow-400 text-yellow-900',
  'Premium':   'bg-purple-600 text-white',
  'Hot':       'bg-red-500 text-white',
  'Verified':  'bg-green-500 text-white',
  'New':       'bg-blue-500 text-white',
  'Sponsored': 'bg-gray-600 text-white',
};
const BADGE_ICONS = { 'Featured':'★','Premium':'◆','Hot':'▲','Verified':'✓','New':'+','Sponsored':'↗' };

/* ── Feature Modal ───────────────────────────────────────── */
function FeatureModal({ listing, onConfirm, onClose }) {
  const [badge, setBadge]               = useState(listing.badge || 'Featured');
  const [featuredUntil, setFeaturedUntil] = useState(listing.featured_until ? listing.featured_until.slice(0,10) : '');
  const [rank, setRank]                 = useState(listing.featured_rank || 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <h3 className="font-display text-lg font-semibold text-gray-900">Feature This Listing</h3>

        {/* Badge picker */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Badge Type</label>
          <div className="flex flex-wrap gap-2">
            {BADGE_OPTIONS.map(b => (
              <button key={b} type="button" onClick={() => setBadge(b)}
                className={`badge transition-all border-2 ${badge === b ? `${BADGE_STYLES[b]} border-transparent scale-105 shadow` : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {BADGE_ICONS[b] && <span className="mr-0.5">{BADGE_ICONS[b]}</span>}{b}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Until */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Featured Until (optional)</label>
          <input type="date" className="input text-sm" value={featuredUntil} onChange={e => setFeaturedUntil(e.target.value)}
            min={new Date().toISOString().slice(0,10)} />
          <p className="text-xs text-gray-400 mt-1">Leave blank to feature indefinitely</p>
        </div>

        {/* Rank */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Priority Rank (1–10)</label>
          <input type="number" min="1" max="10" className="input text-sm" value={rank} onChange={e => setRank(Number(e.target.value))} />
          <p className="text-xs text-gray-400 mt-1">Higher = appears first among featured listings</p>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5 rounded-xl text-sm">Cancel</button>
          <button onClick={() => onConfirm({ badge, featured_until: featuredUntil || null, featured_rank: rank })}
            className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            Apply Feature
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Listings tab ────────────────────────────────────────── */
function AdminListings({ onAction }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [busy, setBusy]         = useState(null);
  const [featureTarget, setFeatureTarget] = useState(null); // listing being featured

  const fetch = useCallback(() => {
    setLoading(true);
    api.get('/admin/listings', { params: { search, status, page, limit: 15 } })
      .then(r => { setListings(r.data.listings); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleFeatureClick = (listing) => {
    if (listing.is_featured) {
      // Already featured — just toggle off immediately
      setBusy(listing.id + '-feat');
      api.patch(`/admin/listings/${listing.id}/feature`)
        .then(() => { fetch(); onAction(); })
        .catch(() => {})
        .finally(() => setBusy(null));
    } else {
      // Not featured — open modal to pick badge/until/rank
      setFeatureTarget(listing);
    }
  };

  const confirmFeature = async (opts) => {
    if (!featureTarget) return;
    setBusy(featureTarget.id + '-feat');
    setFeatureTarget(null);
    await api.patch(`/admin/listings/${featureTarget.id}/feature`, opts).catch(() => {});
    fetch(); onAction(); setBusy(null);
  };
  const toggleStatus = async (id) => {
    setBusy(id + '-stat');
    await api.patch(`/admin/listings/${id}/status`).catch(() => {});
    fetch(); onAction(); setBusy(null);
  };
  const hardDelete = async (id) => {
    if (!confirm('Permanently delete this listing? This cannot be undone.')) return;
    setBusy(id + '-del');
    await api.delete(`/admin/listings/${id}`).catch(() => {});
    fetch(); onAction(); setBusy(null);
  };

  return (
    <div>
      {/* Feature modal */}
      {featureTarget && (
        <FeatureModal
          listing={featureTarget}
          onConfirm={confirmFeature}
          onClose={() => setFeatureTarget(null)}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <input className="input pl-8 text-sm" placeholder="Search listings…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <select className="input text-sm w-36" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Suspended</option>
        </select>
      </div>

      <div className="text-xs text-gray-400 mb-3">{total} listing{total !== 1 ? 's' : ''} found</div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {listings.map(l => (
            <div key={l.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${!l.is_active ? 'opacity-60' : ''}`}>
              <div className="relative">
                <img src={l.images?.[0] || PLACEHOLDER} alt="" className="w-full h-36 object-cover" onError={e => { e.target.src = PLACEHOLDER; }} />
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  {l.is_featured === 1 && <span className="badge bg-yellow-400 text-yellow-900 text-[10px]">Featured</span>}
                  <span className={`badge text-[10px] ${l.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{l.is_active ? 'Active' : 'Suspended'}</span>
                </div>
              </div>
              <div className="p-3">
                <div className="font-semibold text-gray-900 text-sm mb-0.5 line-clamp-1">{l.title}</div>
                <div className="text-primary font-bold text-sm mb-1">{formatPrice(l.price, l.price_period)}</div>
                <div className="text-xs text-gray-400 mb-2">{l.area}, {l.county} · {l.agent_name}</div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Link to={`/listings/${l.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></Link>
                  <Link to={`/post-listing/${l.id}`} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></Link>
                  <button onClick={() => handleFeatureClick(l)} disabled={busy === l.id + '-feat'} className={`p-1.5 rounded-lg disabled:opacity-40 ${l.is_featured ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}><svg className="w-4 h-4" fill={l.is_featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg></button>
                  <button onClick={() => toggleStatus(l.id)} disabled={busy === l.id + '-stat'} className={`p-1.5 rounded-lg disabled:opacity-40 ${l.is_active ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{l.is_active ? <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/> : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>}</svg></button>
                  <button onClick={() => hardDelete(l.id)} disabled={busy === l.id + '-del'} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-40"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Property','Agent','Price','Location','Views','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listings.map(l => (
                  <tr key={l.id} className={`hover:bg-gray-50/50 transition-colors ${!l.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={l.images?.[0] || PLACEHOLDER} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0" onError={e => { e.target.src = PLACEHOLDER; }} />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate max-w-[160px]">{l.title}</div>
                          <div className="text-xs text-gray-400 flex gap-1 flex-wrap">
                            <span>{l.type}</span>
                            {l.is_featured === 1 && <span className="text-yellow-500">Featured</span>}
                            {l.featured_requested === 1 && l.is_featured !== 1 && <span className="text-purple-500 font-medium">Feature Requested</span>}
                            {l.accept_enquiries === 0 && <span className="text-orange-500">No Enquiries</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      <div>{l.agent_name}</div>
                      <div className="text-gray-400">{l.agent_company}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{formatPrice(l.price, l.price_period)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{l.area}, {l.county}</td>
                    <td className="px-4 py-3 text-gray-500">{l.views}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${l.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{l.is_active ? 'Active' : 'Suspended'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/listings/${l.id}`} title="View" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></Link>
                        <Link to={`/post-listing/${l.id}`} title="Edit" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></Link>
                        <button onClick={() => handleFeatureClick(l)} disabled={busy === l.id + '-feat'} title={l.is_featured ? 'Remove featured' : 'Feature'} className={`p-1.5 rounded-lg disabled:opacity-40 transition-colors ${l.is_featured ? `${BADGE_STYLES[l.badge] || BADGE_STYLES['Featured']} opacity-90` : 'hover:bg-yellow-50 text-gray-400 hover:text-yellow-600'}`}><svg className="w-4 h-4" fill={l.is_featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg></button>
                        <button onClick={() => toggleStatus(l.id)} disabled={busy === l.id + '-stat'} title={l.is_active ? 'Suspend' : 'Activate'} className={`p-1.5 rounded-lg disabled:opacity-40 ${l.is_active ? 'hover:bg-orange-50 text-gray-400 hover:text-orange-600' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{l.is_active ? <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/> : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>}</svg></button>
                        <button onClick={() => hardDelete(l.id)} disabled={busy === l.id + '-del'} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-40"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}

/* ── Users tab ───────────────────────────────────────────── */
function AdminUsers({ onAction }) {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [role, setRole]           = useState('all');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [busy, setBusy]           = useState(null);
  const [avatarTarget, setAvatarTarget] = useState(null); // { id, name, avatar }
  const [avatarUrl, setAvatarUrl] = useState('');

  const fetch = useCallback(() => {
    setLoading(true);
    api.get('/admin/users', { params: { search, role, page, limit: 15 } })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [search, role, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleStatus = async (id) => {
    setBusy(id);
    await api.patch(`/admin/users/${id}/status`).catch(() => {});
    fetch(); onAction(); setBusy(null);
  };

  const openAvatar = (u) => { setAvatarTarget(u); setAvatarUrl(u.avatar || ''); };
  const saveAvatar = async () => {
    if (!avatarTarget) return;
    await api.patch(`/admin/users/${avatarTarget.id}/avatar`, { avatar: avatarUrl.trim() || null }).catch(() => {});
    setAvatarTarget(null);
    fetch();
  };

  return (
    <div>
      {/* Avatar modal */}
      {avatarTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAvatarTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold text-gray-900">Set Agency Logo</h3>
            <p className="text-sm text-gray-500">Set a logo image URL for <strong>{avatarTarget.company || avatarTarget.name}</strong>. This shows on their agency profile page.</p>
            {avatarUrl && (
              <div className="flex justify-center py-2">
                <img src={avatarUrl} alt="preview" className="max-h-16 max-w-[160px] object-contain border border-gray-100 rounded-xl p-2"
                  onError={e => { e.target.style.opacity = '0.3'; }} />
              </div>
            )}
            <input className="input text-sm" placeholder="https://example.com/logo.png" value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)} autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setAvatarTarget(null)} className="flex-1 btn-outline rounded-xl text-sm">Cancel</button>
              <button onClick={saveAvatar} className="flex-1 btn-primary rounded-xl text-sm">Save Logo</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <input className="input pl-8 text-sm" placeholder="Search users…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <select className="input text-sm w-36" value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
          <option value="all">All Roles</option>
          <option value="realtor">Realtors</option>
          <option value="client">Clients</option>
        </select>
      </div>

      <div className="text-xs text-gray-400 mb-3">{total} user{total !== 1 ? 's' : ''}</div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User','Role','Phone / Company','Joined','Status','Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className={`hover:bg-gray-50/50 ${!u.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openAvatar(u)} title="Set agency logo"
                          className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 hover:ring-2 hover:ring-primary/30 transition-all">
                          {u.avatar
                            ? <img src={u.avatar} alt={u.name} className="w-full h-full object-contain p-0.5 bg-white" />
                            : <div className="w-full h-full bg-primary text-white flex items-center justify-center text-sm font-bold">{u.name[0].toUpperCase()}</div>
                          }
                        </button>
                        <div>
                          <div className="font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.role === 'realtor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div>{u.phone || '—'}</div>
                      {u.company && <div className="text-gray-400">{u.company}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{timeAgo(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(u.id)} disabled={busy === u.id}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                          u.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}>
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Enquiries tab ───────────────────────────────────────── */
function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);

  const fetch = useCallback(() => {
    setLoading(true);
    api.get('/admin/enquiries', { params: { page, limit: 15 } })
      .then(r => { setEnquiries(r.data.enquiries); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No enquiries yet.</div>
      ) : (
        <div className="space-y-3">
          {enquiries.map(e => (
            <div key={e.id} className={`bg-white rounded-2xl p-5 border shadow-sm ${e.is_read ? 'border-gray-100' : 'border-primary/30 bg-primary-pale/20'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{e.sender_name}
                    {!e.is_read && <span className="ml-2 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">NEW</span>}
                  </div>
                  <div className="text-sm text-gray-500">{e.sender_email}{e.sender_phone ? ` · ${e.sender_phone}` : ''}</div>
                </div>
                <div className="text-xs text-gray-400">{timeAgo(e.created_at)}</div>
              </div>
              <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">"{e.message}"</p>
              <div className="mt-2 text-xs text-gray-400">
                Re: <Link to={`/listings/${e.listing_id}`} className="text-primary hover:underline">{e.listing_title}</Link>
                {' '}&mdash; {e.area}, {e.county}
              </div>
            </div>
          ))}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Partners tab ───────────────────────────────────────── */
const DEFAULT_COLORS = ['#007A3D','#C8102E','#1B3A6B','#005B7F','#1E3A6E','#E32222','#00A651','#F47920','#0A9A6E','#2C2C2C','#1A56DB','#0F766E'];

function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', category: '', color: '#1A56DB', row_num: 1, logo_url: '' });
  const [saving, setSaving]     = useState(false);
  const [busy, setBusy]         = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/partners')
      .then(r => setPartners(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const addPartner = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) return;
    setSaving(true);
    await api.post('/admin/partners', { ...form, logo_url: form.logo_url.trim() || null }).catch(() => {});
    setForm({ name: '', category: '', color: '#1A56DB', row_num: 1, logo_url: '' });
    setShowForm(false);
    load();
    setSaving(false);
  };

  const togglePartner = async (id) => {
    setBusy(id + '-t');
    await api.patch(`/admin/partners/${id}/toggle`).catch(() => {});
    load(); setBusy(null);
  };

  const deletePartner = async (id) => {
    if (!confirm('Remove this partner from the homepage?')) return;
    setBusy(id + '-d');
    await api.delete(`/admin/partners/${id}`).catch(() => {});
    load(); setBusy(null);
  };

  const row1     = partners.filter(p => p.row_num === 1);
  const row2     = partners.filter(p => p.row_num === 2);
  const visible  = partners.filter(p => p.is_active).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-gray-900">Homepage Partners</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {partners.length} partner{partners.length !== 1 ? 's' : ''} total &mdash; <span className="text-green-600 font-medium">{visible} visible</span> on homepage
          </p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className={`btn-primary text-sm rounded-xl px-5 py-2.5 ${showForm ? 'bg-gray-500 hover:bg-gray-600' : ''}`}
        >
          {showForm ? '✕ Cancel' : '+ Add Partner'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addPartner} className="bg-white rounded-2xl border border-primary/20 shadow-sm p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">New Partner</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Name *</label>
              <input className="input text-sm" placeholder="e.g. KCB Group" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Category *</label>
              <input className="input text-sm" placeholder="e.g. Banking, Real Estate" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Colour picker */}
            <div>
              <label className="label">Brand Colour</label>
              <div className="flex items-center gap-3 mt-1">
                <input type="color" value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-11 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                <span className="font-mono text-sm text-gray-500">{form.color}</span>
              </div>
              {/* Preset swatches */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {DEFAULT_COLORS.map(c => (
                  <button key={c} type="button" title={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-6 h-6 rounded-md border-2 transition-all ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {/* Row selector */}
            <div>
              <label className="label">Scroll Row</label>
              <div className="flex gap-2 mt-1">
                {[1, 2].map(r => (
                  <button key={r} type="button" onClick={() => setForm(f => ({ ...f, row_num: r }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      form.row_num === r
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'
                    }`}>
                    Row {r} {r === 1 ? '▶ top' : '◀ bottom'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Row 1 scrolls left, Row 2 scrolls right</p>
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="label">Logo Image URL <span className="normal-case font-normal text-gray-400">(optional — replaces the colour badge)</span></label>
            <input className="input text-sm" placeholder="https://example.com/logo.png"
              value={form.logo_url}
              onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} />
          </div>

          {/* Live preview */}
          {form.name && (
            <div>
              <label className="label">Card Preview</label>
              <div className="inline-flex bg-white rounded-xl border border-gray-100 shadow-sm items-center justify-center overflow-hidden"
                style={{ minWidth: form.logo_url ? '140px' : '160px', height: '72px', padding: form.logo_url ? '10px 16px' : '10px 20px' }}>
                {form.logo_url ? (
                  <img src={form.logo_url} alt={form.name} className="max-h-11 max-w-[120px] object-contain"
                    onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: form.color }}>
                      {form.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{form.name}</div>
                      <div className="text-xs text-gray-400">{form.category || 'Category'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving}
              className="btn-primary rounded-xl px-6 disabled:opacity-50">
              {saving ? 'Adding…' : '+ Add Partner'}
            </button>
          </div>
        </form>
      )}

      {/* Partner lists */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {[[1, row1, 'Row 1 — scrolls left (top)', '▶'], [2, row2, 'Row 2 — scrolls right (bottom)', '◀']].map(
            ([rowNum, rows, label, arrow]) => (
              <div key={rowNum}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{arrow}</span>
                  <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    {rows.length} {rows.length === 1 ? 'partner' : 'partners'}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {rows.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                      No partners in this row — add one above and select Row {rowNum}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {rows.map(p => (
                        <div key={p.id}
                          className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${!p.is_active ? 'opacity-40' : 'hover:bg-gray-50/60'}`}>
                          {/* Badge / Logo */}
                          <div className="w-14 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                            {p.logo_url ? (
                              <img src={p.logo_url} alt={p.name} className="max-h-8 max-w-[52px] object-contain p-1"
                                onError={e => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm rounded-xl"
                                style={{ backgroundColor: p.color }}>
                                {p.name[0]}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.category}</div>
                          </div>

                          {/* Color swatch */}
                          <div className="w-5 h-5 rounded border border-gray-200 shrink-0 hidden sm:block"
                            style={{ backgroundColor: p.color }} title={p.color} />

                          {/* Visibility badge */}
                          <span className={`badge text-xs shrink-0 hidden sm:inline-flex ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.is_active ? '👁 Visible' : '🚫 Hidden'}
                          </span>

                          {/* Actions */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            {/* Toggle visibility */}
                            <button
                              onClick={() => togglePartner(p.id)}
                              disabled={busy === p.id + '-t'}
                              title={p.is_active ? 'Hide from homepage' : 'Show on homepage'}
                              className={`p-2 rounded-lg disabled:opacity-40 transition-colors ${
                                p.is_active
                                  ? 'hover:bg-orange-50 text-gray-400 hover:text-orange-600'
                                  : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                              }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                {p.is_active ? (
                                  <>
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                  </>
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
                                )}
                              </svg>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => deletePartner(p.id)}
                              disabled={busy === p.id + '-d'}
                              title="Remove partner"
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-40 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ── Support tab ─────────────────────────────────────────── */
const STATUS_META = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-700' },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-500' },
};
/* SVG icons keyed by support category */
const CAT_SVG = {
  'General Inquiry': <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  'Listing Issue':   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
  'Account Problem': <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  'Bug Report':      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  'Payment Issue':   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  'Feature Request': <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
  'Other':           <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/></svg>,
};

function AdminSupport({ onBadgeChange }) {
  const toast = useToast();
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [statusCounts, setStatusCounts] = useState({});
  const [expanded, setExpanded] = useState(null);   // ticket id with detail open
  const [busy, setBusy]         = useState(null);
  const [notesDraft, setNotesDraft] = useState({});  // { [id]: string }

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/support', { params: { status: statusFilter, search, page, limit: 15 } })
      .then(r => {
        setTickets(r.data.tickets);
        setTotal(r.data.total);
        setPages(r.data.pages);
        setStatusCounts(r.data.statusCounts || {});
        onBadgeChange?.(r.data.statusCounts?.open || 0);
      })
      .finally(() => setLoading(false));
  }, [statusFilter, search, page, onBadgeChange]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const updateTicket = async (id, payload) => {
    setBusy(id);
    try {
      await api.patch(`/admin/support/${id}`, payload);
      if (payload.status) toast.success(`Ticket marked as ${STATUS_META[payload.status]?.label}`);
      else if (payload.admin_notes !== undefined) toast.success('Notes saved');
      load();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Update failed');
    } finally {
      setBusy(null);
    }
  };

  const deleteTicket = async (id) => {
    if (!confirm('Permanently delete this support ticket?')) return;
    setBusy(id + '-del');
    try {
      await api.delete(`/admin/support/${id}`);
      toast.success('Ticket deleted');
      if (expanded === id) setExpanded(null);
      load();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Delete failed');
    } finally {
      setBusy(null);
    }
  };

  const STATUS_OPTS = ['all', 'open', 'in_progress', 'resolved', 'closed'];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-gray-900">Support Tickets</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} ticket{total !== 1 ? 's' : ''}
            {statusCounts.open > 0 && <span className="ml-1 text-blue-600 font-medium">· {statusCounts.open} open</span>}
          </p>
        </div>
        <input
          className="input text-sm w-56"
          placeholder="Search tickets…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit flex-wrap">
        {STATUS_OPTS.map(s => {
          const cnt = s === 'all' ? total : (statusCounts[s] || 0);
          return (
            <button key={s} onClick={() => setStatusFilter(s)} aria-pressed={statusFilter === s}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'All' : STATUS_META[s]?.label}
              {cnt > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  s === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                }`}>{cnt}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <p className="font-medium">No tickets found</p>
          <p className="text-sm mt-1">{statusFilter !== 'all' ? 'Try a different status filter' : 'No support requests yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                {/* Category icon */}
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  {CAT_SVG[t.category] || CAT_SVG['Other']}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm truncate">{t.subject}</span>
                    <span className={`badge text-xs shrink-0 ${STATUS_META[t.status]?.color}`}>
                      {STATUS_META[t.status]?.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-x-3">
                    <span>{t.name} · {t.email}</span>
                    <span className="text-gray-300">·</span>
                    <span>{t.category}</span>
                    <span className="text-gray-300">·</span>
                    <span>{new Date(t.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {t.user_name && <span className="text-primary">· {t.user_name} ({t.user_role})</span>}
                  </div>
                </div>

                <svg
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded === t.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>

              {/* Expanded detail */}
              {expanded === t.id && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
                  {/* Message */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Message</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">{t.message}</p>
                  </div>

                  {/* Status change */}
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Change Status:</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                        <button
                          key={s}
                          disabled={t.status === s || busy === t.id}
                          onClick={() => updateTicket(t.id, { status: s })}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${
                            t.status === s
                              ? `${STATUS_META[s].color} border-transparent cursor-default`
                              : 'bg-white border-gray-200 text-gray-600 hover:border-primary/40 hover:text-primary'
                          }`}>
                          {STATUS_META[s].label}
                        </button>
                      ))}
                      {busy === t.id && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                    </div>
                  </div>

                  {/* Admin notes */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Admin Notes (internal)</label>
                    <textarea
                      className="input text-sm min-h-[80px] resize-y"
                      placeholder="Internal notes — not visible to the user…"
                      value={notesDraft[t.id] !== undefined ? notesDraft[t.id] : (t.admin_notes || '')}
                      onChange={e => setNotesDraft(d => ({ ...d, [t.id]: e.target.value }))}
                    />
                    <div className="flex justify-between mt-2 gap-3">
                      <button
                        onClick={() => deleteTicket(t.id)}
                        disabled={busy === t.id + '-del'}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors">
                        🗑 Delete ticket
                      </button>
                      <button
                        disabled={busy === t.id || notesDraft[t.id] === undefined}
                        onClick={() => updateTicket(t.id, { admin_notes: notesDraft[t.id] })}
                        className="btn-primary text-xs rounded-lg px-4 py-1.5 disabled:opacity-40">
                        Save Notes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Agencies tab ─────────────────────────────────────────── */
const AGENCY_STATUS_META = {
  active:   { label: 'Active',   cls: 'bg-gray-100 text-gray-600' },
  pending:  { label: 'Pending',  cls: 'bg-amber-100 text-amber-700' },
  verified: { label: 'Verified', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-600' },
};

function AdminAgencies({ onAction }) {
  const toast = useToast();
  const [agencies, setAgencies]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [statusCounts, setStatusCounts] = useState({});
  const [busy, setBusy]           = useState(null);

  // Edit modal
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]   = useState({});

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', phone: '', company: '', agency_description: '', agency_status: 'active' });
  const [creating, setCreating]   = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/agencies', { params: { search, status: statusFilter, page, limit: 15 } })
      .then(r => {
        setAgencies(r.data.agencies);
        setTotal(r.data.total);
        setPages(r.data.pages);
        setStatusCounts(r.data.statusCounts || {});
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const updateAgency = async (id, payload) => {
    setBusy(id);
    try {
      await api.patch(`/admin/agencies/${id}`, payload);
      toast.success('Agency updated');
      load(); onAction();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Update failed');
    } finally { setBusy(null); }
  };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this agency? They will no longer appear in the directory.')) return;
    setBusy(id + '-del');
    try {
      await api.delete(`/admin/agencies/${id}`);
      toast.success('Agency deactivated');
      load(); onAction();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed');
    } finally { setBusy(null); }
  };

  const openEdit = (ag) => {
    setEditTarget(ag);
    setEditForm({
      name: ag.name || '', company: ag.company || '',
      phone: ag.phone || '', agency_description: ag.agency_description || '',
      agency_status: ag.agency_status || 'active', avatar: ag.avatar || '',
    });
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    await updateAgency(editTarget.id, editForm);
    setEditTarget(null);
  };

  const createAgency = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/agencies', createForm);
      toast.success('Agency created successfully');
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '', phone: '', company: '', agency_description: '', agency_status: 'active' });
      load(); onAction();
    } catch (err) {
      toast.error(err.friendlyMessage || err.response?.data?.message || 'Could not create agency');
    } finally { setCreating(false); }
  };

  const STATUS_OPTS = ['all', 'active', 'pending', 'verified', 'rejected'];

  return (
    <div>
      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-semibold text-gray-900">Edit Agency</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input text-sm" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Company</label>
                <input className="input text-sm" value={editForm.company} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input text-sm" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="label">Logo URL</label>
              <input className="input text-sm" placeholder="https://…" value={editForm.avatar} onChange={e => setEditForm(f => ({ ...f, avatar: e.target.value }))} />
            </div>
            <div>
              <label className="label">Agency Description</label>
              <textarea className="input text-sm min-h-[80px] resize-none" value={editForm.agency_description}
                onChange={e => setEditForm(f => ({ ...f, agency_description: e.target.value }))} />
            </div>
            <div>
              <label className="label">Verification Status</label>
              <select className="input text-sm" value={editForm.agency_status} onChange={e => setEditForm(f => ({ ...f, agency_status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditTarget(null)} className="flex-1 btn-outline rounded-xl text-sm">Cancel</button>
              <button onClick={saveEdit} disabled={busy === editTarget.id} className="flex-1 btn-primary rounded-xl text-sm disabled:opacity-50">
                {busy === editTarget.id ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <form onSubmit={createAgency} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-semibold text-gray-900">Add New Agency</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input text-sm" required value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input text-sm" type="email" required value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <input className="input text-sm" type="password" placeholder="password123" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
                <p className="text-xs text-gray-400 mt-1">Default: password123</p>
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input text-sm" placeholder="+254 7XX XXX XXX" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Company / Agency Name</label>
              <input className="input text-sm" value={createForm.company} onChange={e => setCreateForm(f => ({ ...f, company: e.target.value }))} />
            </div>
            <div>
              <label className="label">Agency Description</label>
              <textarea className="input text-sm min-h-[80px] resize-none" value={createForm.agency_description}
                onChange={e => setCreateForm(f => ({ ...f, agency_description: e.target.value }))} />
            </div>
            <div>
              <label className="label">Initial Status</label>
              <select className="input text-sm" value={createForm.agency_status} onChange={e => setCreateForm(f => ({ ...f, agency_status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="verified">Verified (direct approval)</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 btn-outline rounded-xl text-sm">Cancel</button>
              <button type="submit" disabled={creating} className="flex-1 btn-primary rounded-xl text-sm disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Agency'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-gray-900">Agencies & Realtors</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} agenc{total !== 1 ? 'ies' : 'y'}
            {statusCounts.pending > 0 && <span className="ml-1 text-amber-600 font-medium">· {statusCounts.pending} pending verification</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <input className="input text-sm w-48" placeholder="Search agencies…" value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm rounded-xl px-4 py-2 whitespace-nowrap flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add Agency
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit flex-wrap">
        {STATUS_OPTS.map(s => {
          const cnt = s === 'all' ? total : (statusCounts[s] || 0);
          return (
            <button key={s} onClick={() => setStatus(s)} aria-pressed={statusFilter === s}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'All' : AGENCY_STATUS_META[s]?.label}
              {cnt > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${s === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>{cnt}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : agencies.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No agencies found.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Agency','Contact','Status','Listings','Joined','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agencies.map(ag => {
                  const statusInfo = AGENCY_STATUS_META[ag.agency_status] || AGENCY_STATUS_META.active;
                  const logoSrc = ag.avatar
                    ? (ag.avatar.startsWith('/uploads/') ? `http://localhost:5000${ag.avatar}` : ag.avatar)
                    : null;
                  return (
                    <tr key={ag.id} className={`hover:bg-gray-50/50 ${!ag.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {logoSrc
                              ? <img src={logoSrc} alt={ag.name} className="w-full h-full object-contain p-1" onError={e => { e.target.style.display = 'none'; }} />
                              : <div className="w-full h-full bg-primary text-white flex items-center justify-center text-sm font-bold rounded-xl">{(ag.name || '?')[0].toUpperCase()}</div>
                            }
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[160px]">{ag.company || ag.name}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[160px]">{ag.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <div>{ag.email}</div>
                        <div className="text-gray-400">{ag.phone || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${statusInfo.cls}`}>{statusInfo.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-medium">{ag.listing_count}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{timeAgo(ag.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* View public profile */}
                          <Link to={`/agencies/${ag.id}`} title="View public profile"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </Link>
                          {/* Edit */}
                          <button onClick={() => openEdit(ag)} title="Edit agency"
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          {/* Quick approve if pending */}
                          {ag.agency_status === 'pending' && (
                            <button onClick={() => updateAgency(ag.id, { agency_status: 'verified' })} disabled={busy === ag.id}
                              title="Approve verification" className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 disabled:opacity-40">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            </button>
                          )}
                          {ag.agency_status === 'pending' && (
                            <button onClick={() => updateAgency(ag.id, { agency_status: 'rejected' })} disabled={busy === ag.id}
                              title="Reject verification" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-40">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                          )}
                          {/* Deactivate */}
                          {ag.is_active ? (
                            <button onClick={() => deactivate(ag.id)} disabled={busy === ag.id + '-del'}
                              title="Deactivate agency" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-40">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                            </button>
                          ) : (
                            <button onClick={() => updateAgency(ag.id, { agency_status: 'active' })} disabled={busy === ag.id}
                              title="Re-activate" className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 disabled:opacity-40">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── My Listings tab ─────────────────────────────────────── */
function AdminMyListings() {
  const toast = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/listings/mine')
      .then(r => setListings(r.data))
      .catch(() => toast.error('Could not load your listings'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this listing?')) return;
    setBusy(id + '-del');
    try {
      await api.delete(`/admin/listings/${id}`);
      toast.success('Listing deleted');
      load();
    } catch { toast.error('Delete failed'); }
    finally { setBusy(null); }
  };

  const handleToggle = async (id, isActive) => {
    setBusy(id + '-tog');
    try {
      await api.patch(`/admin/listings/${id}/status`);
      toast.success(isActive ? 'Listing hidden' : 'Listing activated');
      load();
    } catch { toast.error('Update failed'); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-gray-900">My Listings</h2>
          <p className="text-sm text-gray-500 mt-0.5">{listings.length} listing{listings.length !== 1 ? 's' : ''} posted by you</p>
        </div>
        <a href="/post-listing"
          className="btn-primary text-sm rounded-xl px-4 py-2 flex items-center gap-1.5 no-underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Post Listing
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="font-semibold text-gray-700 mb-1">No listings yet</h3>
          <p className="text-gray-400 text-sm mb-5">Post your first listing to get started</p>
          <a href="/post-listing" className="btn-primary rounded-xl px-6 py-2.5 text-sm no-underline">Post a Listing</a>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {listings.map(l => {
              const img = l.images?.[0] || PLACEHOLDER;
              const isActive = l.is_active === 1 || l.is_active === true;
              return (
                <div key={l.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <img src={img} alt={l.title} className="w-full h-full object-cover"
                      onError={e => { e.target.src = PLACEHOLDER; }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{l.title}</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">{l.area}, {l.county}</span>
                      <span className={`badge text-xs ${l.transaction === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {l.transaction === 'sale' ? 'For Sale' : 'For Rent'}
                      </span>
                      {l.is_featured === 1 && <span className="badge text-xs bg-yellow-100 text-yellow-700">⭐ Featured</span>}
                      <span className={`badge text-xs ${isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 hidden sm:block text-right">
                    <div className="font-semibold text-gray-900 text-sm">
                      KES {Number(l.price).toLocaleString()}
                    </div>
                    {l.price_period && <div className="text-xs text-gray-400">/{l.price_period}</div>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <a href={`/listings/${l.id}`} target="_blank" rel="noreferrer"
                      title="View listing" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </a>
                    <a href={`/post-listing?edit=${l.id}`}
                      title="Edit listing" className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </a>
                    <button onClick={() => handleToggle(l.id, isActive)} disabled={busy === l.id + '-tog'}
                      title={isActive ? 'Hide listing' : 'Activate listing'}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${isActive ? 'hover:bg-orange-50 text-gray-400 hover:text-orange-600' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`}>
                      {isActive
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                    <button onClick={() => handleDelete(l.id)} disabled={busy === l.id + '-del'}
                      title="Delete listing"
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4h4v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Homepage tab (county images) ────────────────────────── */
function AdminHomepage() {
  const toast = useToast();
  const [counties, setCounties] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);  // id of the card being edited
  const [form, setForm]         = useState({ image_url: '', description: '' });
  const [saving, setSaving]     = useState(false);
  const [preview, setPreview]   = useState('');

  useEffect(() => {
    api.get('/admin/county-images')
      .then(r => setCounties(r.data))
      .catch(() => toast.error('Could not load county images'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ image_url: c.image_url, description: c.description });
    setPreview(c.image_url);
  };

  const handleSave = async () => {
    if (!form.image_url.trim()) return toast.error('Image URL cannot be empty');
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/county-images/${editing}`, form);
      setCounties(prev => prev.map(c => c.id === editing ? data : c));
      setEditing(null);
      toast.success('County image updated');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-gray-900">Homepage — County Images</h2>
        <p className="text-sm text-gray-500 mt-0.5">Click any county card to update its image and description</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {counties.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Current image preview */}
              <div className="relative h-32 bg-gray-800 overflow-hidden">
                <img
                  src={editing === c.id ? (preview || c.image_url) : c.image_url}
                  alt={c.county}
                  className="w-full h-full object-cover"
                  onLoad={e => e.target.classList.add('opacity-100')}
                  style={{ opacity: 0, transition: 'opacity 0.3s' }}
                  onError={e => { e.target.style.opacity = '0'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <div className="font-bold text-white text-base">{c.county}</div>
                  <div className="text-white/70 text-xs">{editing === c.id ? form.description : c.description}</div>
                </div>
              </div>

              {/* Edit form */}
              {editing === c.id ? (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="label">Image URL</label>
                    <input
                      className="input text-sm"
                      placeholder="https://images.unsplash.com/photo-…"
                      value={form.image_url}
                      onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setPreview(e.target.value); }}
                    />
                    <p className="text-xs text-gray-400 mt-1">Paste any image URL — Unsplash, your own upload, etc.</p>
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <input
                      className="input text-sm"
                      placeholder="e.g. Capital city"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setEditing(null)}
                      className="flex-1 btn-outline text-sm rounded-xl py-2">Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 btn-primary text-sm rounded-xl py-2 disabled:opacity-50">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400 truncate mr-3">{c.image_url}</p>
                  <button onClick={() => openEdit(c)}
                    className="shrink-0 text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Stats tab ───────────────────────────────────────────── */
function AdminStats({ stats }) {
  if (!stats) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { label: 'Total Listings',   val: stats.totalListings,               desc: 'All time' },
        { label: 'Active Listings',  val: stats.activeListings,              desc: 'Currently visible' },
        { label: 'Featured Listings',val: stats.featuredCount,               desc: 'Highlighted on homepage' },
        { label: 'Total Users',      val: stats.totalUsers,                  desc: 'Clients + realtors' },
        { label: 'Realtors',         val: stats.realtors,                    desc: 'Can post listings' },
        { label: 'Clients',          val: stats.clients,                     desc: 'Can save properties' },
        { label: 'Total Views',      val: stats.totalViews.toLocaleString(), desc: 'Across all listings' },
        { label: 'Total Enquiries',  val: stats.totalEnquiries,              desc: 'All time' },
        { label: 'Unread Enquiries',        val: stats.unreadEnquiries,             desc: 'Waiting for response' },
        { label: 'Pending Verifications',   val: stats.pendingVerifications || 0,  desc: 'Agency verification requests' },
      ].map(({ label, val, desc }) => (
        <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="font-display text-3xl font-semibold text-primary mb-1">{val}</div>
          <div className="font-semibold text-gray-900 text-sm">{label}</div>
          <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
        </div>
      ))}
    </div>
  );
}
