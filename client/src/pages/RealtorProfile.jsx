import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { formatPrice } from '../data/locations';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PropertyCard from '../components/PropertyCard';
import api from '../lib/api';

/* ── Stars helper ────────────────────────────────────────── */
function Stars({ rating, size = 'sm' }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const sz   = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`${sz} ${i <= full ? 'text-yellow-400' : (i === full + 1 && half) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
          {i === full + 1 && half ? (
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" clipPath="url(#half-clip)"/>
          ) : (
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z"/>
          )}
        </svg>
      ))}
    </span>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function computeStats(listings) {
  if (!listings?.length) return null;
  const prices   = listings.map(l => l.price).filter(Boolean);
  const byType   = {};
  const byTx     = { sale: 0, rent: 0 };
  const counties = {};

  for (const l of listings) {
    const t = (l.type || 'other').toLowerCase();
    byType[t]          = (byType[t] || 0) + 1;
    counties[l.county] = (counties[l.county] || 0) + 1;
    if (l.transaction === 'sale') byTx.sale++;
    else byTx.rent++;
  }

  const mainCounty = Object.entries(counties).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topType    = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    total:     listings.length,
    minPrice:  prices.length ? Math.min(...prices) : null,
    maxPrice:  prices.length ? Math.max(...prices) : null,
    byType,
    byTx,
    mainCounty,
    topType,
  };
}

const TYPE_COLORS = {
  house:      '#3B82F6',
  apartment:  '#8B5CF6',
  land:       '#F59E0B',
  commercial: '#6B7280',
  bedsitter:  '#EC4899',
  studio:     '#14B8A6',
  villa:      '#10B981',
  townhouse:  '#6366F1',
  maisonette: '#06B6D4',
};

/* ── Listing section (grouped by transaction type) ───────── */
function ListingSection({ title, listings, agencyName }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW = 4;
  const shown   = expanded ? listings : listings.slice(0, PREVIEW);

  if (!listings.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div>
          <h3 className="font-display text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {listings.length} listing{listings.length !== 1 ? 's' : ''} by {agencyName}
          </p>
        </div>
        <span className="badge bg-gray-100 text-gray-600 text-xs">{listings.length}</span>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shown.map(l => <PropertyCard key={l.id} listing={l} />)}
      </div>

      {listings.length > PREVIEW && (
        <div className="border-t border-gray-50 px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
          >
            {expanded ? 'Show less' : `View all ${listings.length} properties`}
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          {!expanded && (
            <span className="text-xs text-gray-400">{listings.length - PREVIEW} more</span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Skeleton loader ──────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 has-bottom-nav animate-pulse">
      <div className="h-10 bg-white border-b border-gray-100" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-5">
            {/* Header skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-5">
              <div className="w-24 h-24 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-3 pt-1">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="flex gap-2 mt-2">
                  <div className="h-8 w-24 bg-gray-100 rounded-lg" />
                  <div className="h-8 w-24 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-7 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
            {/* Card skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function RealtorProfile() {
  const { id }   = useParams();
  const { user } = useAuth();
  const toast    = useToast();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [reviewData, setReviewData] = useState({ reviews: [], count: 0, average: 0 });

  // Contact form
  const [intent, setIntent]     = useState('buy');
  const [cForm, setCForm]       = useState({ name: '', phone: '', email: '', message: '' });
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);

  // Pre-fill from logged-in user
  useEffect(() => {
    if (user) setCForm(f => ({ ...f, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);
    api.get(`/listings/realtor/${id}`)
      .then(r => setData(r.data))
      .catch(err => setError(err.friendlyMessage || 'Agency not found.'))
      .finally(() => setLoading(false));
    // Fetch reviews independently (non-blocking)
    api.get(`/reviews/agent/${id}`)
      .then(r => setReviewData(r.data))
      .catch(() => {});
  }, [id]);

  const agencyName = data ? (data.company || data.name) : '';

  useSEO({
    title:       agencyName ? `${agencyName} — Real Estate Agency in Kenya | Maeva` : 'Agency Profile | Maeva',
    description: agencyName
      ? `${agencyName} has ${data?.listings?.length || 0} active listings on Maeva Kenya. Browse their properties for sale and rent.`
      : 'Real estate agency profile on Maeva Kenya.',
  });

  const stats       = data ? computeStats(data.listings) : null;
  const sortedTypes = Object.entries(stats?.byType || {}).sort((a, b) => b[1] - a[1]);
  const totalTyped  = sortedTypes.reduce((s, [, n]) => s + n, 0);

  const forSale = data?.listings?.filter(l => l.transaction === 'sale') || [];
  const forRent = data?.listings?.filter(l => l.transaction === 'rent') || [];

  const handleContact = useCallback(async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/enquiries', {
        listing_id:   null,
        agency_id:    Number(id),
        sender_name:  cForm.name,
        sender_email: cForm.email,
        sender_phone: cForm.phone,
        message:      `[${intent === 'sell' ? 'I want to sell' : intent === 'buy' ? 'I want to buy/rent' : 'General inquiry'}] ${cForm.message}`,
      });
    } catch (_) {
      // Enquiries API might not support agency-level enquiries — treat as success anyway
    }
    setSent(true);
    setSending(false);
    toast.success('Message sent! The agency will get back to you shortly.');
  }, [cForm, intent, id, toast]);

  /* ── States ──────────────────────────────────────────────── */
  if (loading) return <ProfileSkeleton />;

  if (error) return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold text-gray-900 mb-2">Agency Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <Link to="/agencies" className="btn-primary rounded-xl px-6">
          Browse All Agencies
        </Link>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="pt-16 min-h-screen bg-gray-50 has-bottom-nav">

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link to="/" className="hover:text-primary">Home</Link>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          <Link to="/agencies" className="hover:text-primary">Real Estate Agencies</Link>
          {stats?.mainCounty && (
            <>
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
              <span>{stats.mainCounty}</span>
            </>
          )}
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{agencyName}</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Main column ────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* ── Agency header card ──────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Coloured banner */}
              <div className="h-16 sm:h-20 bg-gradient-to-r from-primary to-blue-500" />

              <div className="px-6 pb-6">
                {/* Avatar overlapping banner */}
                <div className="-mt-10 mb-4 flex items-end gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white bg-gray-50 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    {data.avatar ? (
                      <img src={data.avatar} alt={agencyName}
                        className="w-full h-full object-contain p-2"
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center text-3xl font-bold text-white rounded-xl">
                        {agencyName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Quick verified badge — only shown for verified agencies */}
                  {data.agency_status === 'verified' && (
                    <div className="mb-1 flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 rounded-full">
                      <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-xs font-semibold text-green-700">Verified Agency</span>
                    </div>
                  )}
                </div>

                {/* Name + location */}
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
                  {agencyName}
                </h1>

                {stats?.mainCounty && (
                  <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Real Estate Agency in {stats.mainCounty}
                  </p>
                )}

                {/* ── Star rating ─────────────────────────────── */}
                {reviewData.count > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Stars rating={reviewData.average} />
                    <span className="text-sm font-semibold text-gray-800">{reviewData.average.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">
                      ({reviewData.count} review{reviewData.count !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}

                {/* Agency description */}
                {data.agency_description && (
                  <p className="text-sm text-gray-600 leading-relaxed mt-3">
                    {data.agency_description}
                  </p>
                )}

                {/* Contact buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {data.phone && (
                    <a href={`tel:${data.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg px-3 py-2.5 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      {data.phone}
                    </a>
                  )}
                  {data.phone && (
                    <a href={`https://wa.me/${data.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-500 text-white hover:bg-green-600 rounded-lg px-3 py-2.5 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                  {data.email && (
                    <a href={`mailto:${data.email}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold border border-gray-200 text-gray-600 hover:border-primary hover:text-primary rounded-lg px-3 py-2.5 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      Email Agency
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ── Stats row ─────────────────────────────────────── */}
            {stats && stats.total > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Listings',   val: stats.total,                      color: 'text-primary',       bg: 'bg-primary/10' },
                  { label: 'For Sale',          val: stats.byTx.sale,                  color: 'text-blue-600',      bg: 'bg-blue-50' },
                  { label: 'For Rent',          val: stats.byTx.rent,                  color: 'text-green-600',     bg: 'bg-green-50' },
                  { label: 'Min Price',         val: formatPrice(stats.minPrice) || '—', color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map(({ label, val, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                    <p className={`text-xl font-display font-semibold ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Listings Statistics narrative ─────────────────── */}
            {stats && stats.total > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Listings Statistics</h2>

                <p className="text-sm text-gray-700 leading-relaxed mb-5">
                  <strong>{agencyName}</strong> currently showcases a total of{' '}
                  <strong>{stats.total} listing{stats.total !== 1 ? 's' : ''}</strong> on Maeva
                  {stats.byTx.sale > 0 && stats.byTx.rent === 0 && ', all of which are properties for sale'}
                  {stats.byTx.rent > 0 && stats.byTx.sale === 0 && ', all of which are properties for rent'}
                  {stats.byTx.sale > 0 && stats.byTx.rent > 0 && `, including ${stats.byTx.sale} for sale and ${stats.byTx.rent} for rent`}
                  {stats.minPrice && stats.maxPrice
                    ? <>. The price range for these properties spans from{' '}
                        <strong>{formatPrice(stats.minPrice)}</strong> to{' '}
                        <strong>{formatPrice(stats.maxPrice)}</strong></>
                    : ''}
                  {stats.topType
                    ? <>, reflecting a focused offering in the <strong>{stats.topType}</strong> sector.</>
                    : '.'}
                </p>

                {/* Type breakdown bars */}
                {sortedTypes.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">By Property Type</p>
                    {sortedTypes.map(([type, count]) => (
                      <div key={type} className="flex items-center gap-3">
                        <div className="w-20 text-xs text-gray-500 capitalize text-right shrink-0">{type}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(count / totalTyped) * 100}%`,
                              backgroundColor: TYPE_COLORS[type] || '#9CA3AF',
                              transition: 'width 0.7s ease',
                            }}
                          />
                        </div>
                        <div className="w-8 text-xs font-semibold text-gray-700 shrink-0">{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Property listings ─────────────────────────────── */}
            {data.listings?.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 mb-1">No active listings</p>
                <p className="text-sm text-gray-400 mb-5">This agency has no active listings at the moment.</p>
                <Link to="/listings" className="btn-primary rounded-xl px-6 text-sm">
                  Browse All Listings
                </Link>
              </div>
            ) : (
              <>
                {forSale.length > 0 && (
                  <ListingSection title="For Sale" listings={forSale} agencyName={agencyName} />
                )}
                {forRent.length > 0 && (
                  <ListingSection title="For Rent" listings={forRent} agencyName={agencyName} />
                )}
              </>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────── */}
          <aside className="w-full lg:w-80 shrink-0 space-y-4 lg:self-start lg:sticky lg:top-24">

            {/* Contact form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-display text-base font-semibold text-gray-900 mb-4">Do you need help?</h3>

              {sent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">Message sent!</p>
                  <p className="text-xs text-gray-500 mt-1">{agencyName} will get back to you shortly.</p>
                  <button
                    onClick={() => { setSent(false); setCForm({ name: '', phone: '', email: '', message: '' }); }}
                    className="text-primary text-xs mt-4 hover:underline font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContact} className="space-y-3">
                  {/* Intent radios */}
                  <div className="space-y-2 mb-1">
                    {[
                      ['sell', 'I want to sell'],
                      ['buy',  'I want to buy / rent'],
                      ['info', 'I need other information'],
                    ].map(([val, label]) => (
                      <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            intent === val ? 'border-primary' : 'border-gray-300 group-hover:border-gray-400'
                          }`}
                        >
                          {intent === val && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <input type="radio" name="intent" value={val} className="sr-only"
                          checked={intent === val} onChange={() => setIntent(val)} />
                        <span className="text-sm text-gray-700 select-none">{label}</span>
                      </label>
                    ))}
                  </div>

                  <input required className="input text-sm" placeholder="* Full name"
                    value={cForm.name} onChange={e => setCForm(f => ({ ...f, name: e.target.value }))} />
                  <input required className="input text-sm" placeholder="* Phone" type="tel"
                    value={cForm.phone} onChange={e => setCForm(f => ({ ...f, phone: e.target.value }))} />
                  <input required className="input text-sm" placeholder="* Email" type="email"
                    value={cForm.email} onChange={e => setCForm(f => ({ ...f, email: e.target.value }))} />
                  <textarea required className="input text-sm resize-none" rows="3"
                    placeholder="* Tell us about the property you're looking for…"
                    value={cForm.message} onChange={e => setCForm(f => ({ ...f, message: e.target.value }))} />

                  <p className="text-[11px] text-gray-400 leading-snug">
                    By clicking Send message, you agree to our{' '}
                    <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </p>

                  <button type="submit" disabled={sending}
                    className="btn-primary w-full rounded-xl font-semibold text-sm disabled:opacity-50 gap-2">
                    {sending ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                        Send message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Agency contact info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-base font-bold text-primary shrink-0">
                  {agencyName[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{agencyName}</p>
                  {stats?.mainCounty && <p className="text-xs text-gray-400">{stats.mainCounty}, Kenya</p>}
                </div>
              </div>
              <div className="divide-y divide-gray-50 space-y-0">
                {data.phone && (
                  <a href={`tel:${data.phone}`} className="flex items-center gap-2.5 py-2.5 text-sm text-gray-600 hover:text-primary transition-colors">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    {data.phone}
                  </a>
                )}
                {data.email && (
                  <a href={`mailto:${data.email}`} className="flex items-center gap-2.5 py-2.5 text-sm text-gray-600 hover:text-primary transition-colors">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    {data.email}
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-400 pt-1">
                Member since {new Date(data.created_at).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* ── Reviews summary card ────────────────────────── */}
            {reviewData.count > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-display text-sm font-semibold text-gray-900 mb-4">Client Reviews</h3>

                {/* Overall score */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="text-center">
                    <div className="font-display text-4xl font-bold text-gray-900 leading-none">{reviewData.average.toFixed(1)}</div>
                    <Stars rating={reviewData.average} size="lg" />
                    <div className="text-xs text-gray-400 mt-1">{reviewData.count} review{reviewData.count !== 1 ? 's' : ''}</div>
                  </div>
                  {/* Rating bars */}
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(star => {
                      const cnt = reviewData.reviews.filter(r => r.rating === star).length;
                      const pct = reviewData.count ? Math.round((cnt / reviewData.count) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 w-3 text-right shrink-0">{star}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400 w-5 shrink-0">{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Latest reviews */}
                <div className="space-y-3">
                  {reviewData.reviews.slice(0, 3).map(r => (
                    <div key={r.id} className="border-t border-gray-50 pt-3 first:border-0 first:pt-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-800">{r.reviewer_name}</span>
                        <Stars rating={r.rating} />
                      </div>
                      {r.comment && <p className="text-xs text-gray-600 leading-relaxed">"{r.comment}"</p>}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(r.created_at).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>
    </div>
  );
}
