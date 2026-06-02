import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { useToast } from '../context/ToastContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { formatPrice, timeAgo } from '../data/locations';
import PropertyCard from '../components/PropertyCard';
import RecentlyViewed from '../components/RecentlyViewed';
import api from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_CONFIG = {
  under_offer: { label: 'Under Offer', cls: 'bg-orange-500 text-white' },
  sold:        { label: 'Sold',        cls: 'bg-red-600 text-white'    },
  rented:      { label: 'Rented',      cls: 'bg-gray-600 text-white'   },
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&fit=crop';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, wishlistIds, toggleWishlist, openAuth } = useAuth();
  const toast = useToast();
  const { addListing: addRecentlyViewed } = useRecentlyViewed();
  const [listing, setListing]     = useState(null);
  const [similar, setSimilar]     = useState([]);
  const [imgIdx, setImgIdx]       = useState(0);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState(false);
  const [lightbox, setLightbox]   = useState(false);
  const [reviews, setReviews]     = useState({ reviews: [], count: 0, average: 0 });
  const [priceHistory, setPriceHistory] = useState([]);
  const [pois, setPois]           = useState([]);
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'floorplans'

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    api.get(`/listings/${id}`)
      .then(r => {
        setListing(r.data);
        addRecentlyViewed(r.data);
        // Record view once per browser (localStorage prevents repeat counts)
        const key = `viewed_${id}`;
        if (!localStorage.getItem(key)) {
          api.post(`/listings/${id}/view`).catch(() => {});
          localStorage.setItem(key, '1');
        }
        api.get(`/reviews/agent/${r.data.agent_id}`).then(rev => setReviews(rev.data)).catch(() => {});
        // Fetch price history
        fetch(`${API_BASE}/price-history/${id}`).then(res => res.json()).then(setPriceHistory).catch(() => {});
        // Fetch nearby amenities via Overpass API if coords available
        const lat = r.data.lat ?? null;
        const lng = r.data.lng ?? null;
        if (lat && lng) {
          const query = `[out:json][timeout:15];(node["amenity"~"school|hospital|supermarket|bank|restaurant|bus_stop"](around:1500,${lat},${lng}););out body 20;`;
          fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
              const results = (data.elements || []).map(el => ({
                lat: el.lat, lng: el.lon,
                name: el.tags?.name || '',
                type: el.tags?.amenity || 'default',
              }));
              setPois(results);
            })
            .catch(() => {});
        }
        return api.get('/listings', { params: { county: r.data.county, type: r.data.type, limit: 4 } });
      })
      .then(r => setSimilar(r.data.listings.filter(l => l.id !== parseInt(id)).slice(0, 3)))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  /* ── Lightbox keyboard nav ──────────────────────────────── */
  useEffect(() => {
    if (!lightbox) return;
    const imgCount = listing?.images?.length || 1;
    const handler = (e) => {
      if (e.key === 'Escape')     setLightbox(false);
      if (e.key === 'ArrowLeft')  setImgIdx(p => (p - 1 + imgCount) % imgCount);
      if (e.key === 'ArrowRight') setImgIdx(p => (p + 1) % imgCount);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, listing?.images?.length]);

  /* ── SEO — injected after listing loads ─────────────────── */
  const seoTitle = listing
    ? `${listing.title} — ${listing.area}, ${listing.county}`
    : 'Property Listing';

  const seoDesc = listing
    ? `${formatPrice(listing.price, listing.price_period)} · ${listing.type}${listing.bedrooms ? ` · ${listing.bedrooms} bed` : ''} ${listing.transaction === 'sale' ? 'for sale' : 'for rent'} in ${listing.area}, ${listing.county}. ${listing.description?.slice(0, 120) || ''}`
    : '';

  const seoImage = listing?.images?.[0] || PLACEHOLDER;

  /* JSON-LD Accommodation / RealEstateListing structured data */
  const jsonLd = listing ? {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description || seoDesc,
    url: typeof window !== 'undefined' ? window.location.href : '',
    image: listing.images?.length ? listing.images : [PLACEHOLDER],
    datePosted: listing.created_at,
    price: listing.price,
    priceCurrency: 'KES',
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.area,
      addressRegion: listing.county,
      addressCountry: 'KE',
    },
    numberOfRooms: listing.bedrooms || undefined,
    floorSize: listing.size ? { '@type': 'QuantitativeValue', value: listing.size, unitText: listing.size_unit || 'sqft' } : undefined,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'KES',
      availability: 'https://schema.org/InStock',
    },
  } : null;

  useSEO({
    title:       seoTitle,
    description: seoDesc,
    image:       seoImage,
    type:        'article',
    url:         typeof window !== 'undefined' ? window.location.href : '',
    jsonLd,
  });

  /* ── Loading & error states ─────────────────────────────── */
  if (loading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-label="Loading property" />
    </div>
  );
  if (!listing) return null;

  const images  = listing.images?.length ? listing.images : [PLACEHOLDER];
  const isSaved = wishlistIds.includes(listing.id);

  const handleWishlist = () => {
    if (!user) { openAuth('login'); return; }
    toggleWishlist(listing.id);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waLink = `https://wa.me/${listing.agent_phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in ${listing.title} — ${window.location.href}`)}`;

  return (
    <div className={`pt-16 bg-gray-50 min-h-screen has-bottom-nav${listing.agent_phone ? ' has-contact-bar' : ''}`}>

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/"        className="hover:text-primary shrink-0">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/listings" className="hover:text-primary shrink-0">Listings</Link>
          <span aria-hidden="true">/</span>
          {listing.county && (
            <>
              <Link to={`/listings?county=${listing.county}`} className="hover:text-primary shrink-0">{listing.county}</Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span className="text-gray-800 font-medium truncate">{listing.title}</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Left column ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Image gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {/* Tab bar: Photos / Floor Plans */}
              {listing.floor_plans?.length > 0 && (
                <div className="flex border-b border-gray-100">
                  {[['photos','📷 Photos'],['floorplans','🗺️ Floor Plans']].map(([tab, label]) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'floorplans' && listing.floor_plans?.length > 0 ? (
                <div className="p-4 grid grid-cols-1 gap-4">
                  {listing.floor_plans.map((fp, i) => (
                    <img key={i} src={fp} alt={`Floor plan ${i+1}`}
                      className="w-full rounded-xl border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(fp, '_blank')}
                    />
                  ))}
                </div>
              ) : (
              <>
              <div className="relative h-64 sm:h-80 md:h-96 bg-gray-100 cursor-zoom-in" role="img" aria-label={`Photo ${imgIdx + 1} of ${images.length} — ${listing.title}`}
                onClick={() => setLightbox(true)}>
                <img src={images[imgIdx]} alt={`${listing.title} in ${listing.area}`}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = PLACEHOLDER; }} />
                {/* Fullscreen hint */}
                <button onClick={e => { e.stopPropagation(); setLightbox(true); }}
                  className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-lg transition-colors"
                  aria-label="View fullscreen">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                  </svg>
                </button>

                {/* Carousel arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(p => (p - 1 + images.length) % images.length)}
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 tap-highlight text-lg">
                      ‹
                    </button>
                    <button onClick={() => setImgIdx(p => (p + 1) % images.length)}
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 tap-highlight text-lg">
                      ›
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                      {imgIdx + 1} / {images.length}
                    </div>
                  </>
                )}

                {/* Availability banner */}
                {listing.status && STATUS_CONFIG[listing.status] && (
                  <div className={`absolute bottom-0 inset-x-0 py-2 text-center text-sm font-bold tracking-wide ${STATUS_CONFIG[listing.status].cls}`}>
                    {STATUS_CONFIG[listing.status].label}
                  </div>
                )}

                {/* Top badges */}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap" aria-label="Property labels">
                  <span className="badge bg-primary text-white">{listing.type}</span>
                  <span className={`badge ${listing.transaction === 'sale' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                    For {listing.transaction === 'sale' ? 'Sale' : 'Rent'}
                  </span>
                  {listing.is_featured === 1 && (() => {
                    const BADGE_STYLES = {
                      'Featured':  'bg-yellow-400 text-yellow-900',
                      'Premium':   'bg-purple-600 text-white',
                      'Hot':       'bg-red-500 text-white',
                      'Verified':  'bg-green-500 text-white',
                      'New':       'bg-blue-500 text-white',
                      'Sponsored': 'bg-gray-600 text-white',
                    };
                    const ICONS = { 'Featured':'⭐','Premium':'💎','Hot':'🔥','Verified':'✓','New':'✨' };
                    const label = listing.badge || 'Featured';
                    return (
                      <span className={`badge ${BADGE_STYLES[label] || BADGE_STYLES['Featured']}`}>
                        {ICONS[label] && <span className="mr-0.5">{ICONS[label]}</span>}{label}
                      </span>
                    );
                  })()}
                </div>

                {/* Wishlist */}
                <button onClick={handleWishlist} aria-label={isSaved ? 'Remove from saved' : 'Save property'}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md tap-highlight transition-all ${
                    isSaved ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'
                  }`}>
                  <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scroll-smooth" role="list" aria-label="Photo thumbnails">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} role="listitem"
                      aria-label={`Photo ${i + 1}`} aria-current={i === imgIdx ? 'true' : undefined}
                      className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all tap-highlight ${i === imgIdx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = PLACEHOLDER; }} />
                    </button>
                  ))}
                </div>
              )}
              </>
              )}
            </div>

            {/* Title & price */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 mb-2">{listing.title}</h1>
                  <address className="not-italic flex items-center gap-1.5 text-gray-500 text-sm">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {listing.address ? `${listing.address}, ` : ''}{listing.area}, {listing.county} County
                  </address>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-2xl sm:text-3xl font-semibold text-primary">{formatPrice(listing.price, listing.price_period)}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    <span>{listing.views} views</span>
                    <span className="mx-1.5">·</span>
                    <time dateTime={listing.created_at}>{timeAgo(listing.created_at)}</time>
                  </div>
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100" aria-label="Property details">
                {listing.bedrooms  != null && <StatBox icon="🛏" label="Bedrooms"  val={listing.bedrooms === 0 ? 'Studio' : listing.bedrooms} />}
                {listing.bathrooms != null && <StatBox icon="🚿" label="Bathrooms" val={listing.bathrooms} />}
                {listing.size      != null && <StatBox icon="📐" label="Size"      val={`${listing.size} ${listing.size_unit}`} />}
                <StatBox icon="🏷" label="Type" val={listing.type} />
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-3">About This Property</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
              </section>
            )}

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-4">Amenities &amp; Features</h2>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.amenities.map(a => (
                    <li key={a} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0" aria-hidden="true">✓</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Title deed */}
            {listing.title_deed_number && (
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📄</span> Legal Information
                </h2>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">Title Deed / LR Number:</span>
                  <span className="font-mono font-semibold text-gray-800">{listing.title_deed_number}</span>
                </div>
              </section>
            )}

            {/* Price history */}
            {priceHistory.length > 0 && (
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📈</span> Price History
                </h2>
                <div className="space-y-2">
                  {priceHistory.map((ph, i) => {
                    const diff = ph.new_price - ph.old_price;
                    const pct  = ((diff / ph.old_price) * 100).toFixed(1);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {diff > 0 ? '▲' : '▼'} {Math.abs(pct)}%
                          </span>
                          <span className="text-gray-500 text-xs">{new Date(ph.changed_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400 line-through">{formatPrice(ph.old_price)}</span>
                          <span className="font-semibold text-gray-800">{formatPrice(ph.new_price)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Mortgage calculator — sale listings only */}
            {listing.transaction === 'sale' && <MortgageCalculator price={listing.price} />}

            {/* Legal / financial disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800" role="note" aria-label="Important disclaimer">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              <p className="leading-relaxed">
                <strong>Disclaimer:</strong> Property listings are provided for informational purposes only. Maeva does not provide financial, investment, legal, or tax advice. Prices and details are subject to change without notice. Always conduct independent due diligence — including a title deed search and independent valuation — and seek professional advice before entering any property transaction. See our <a href="/terms" className="underline hover:text-amber-900">Terms of Service</a> for full details.
              </p>
            </div>

            {/* Enquiry form — hidden when agent has disabled enquiries */}
            {listing.accept_enquiries !== 0
              ? <EnquiryForm listing={listing} />
              : (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3 text-sm text-blue-800">
                  <svg className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p>This property is not currently accepting enquiries. Please contact the agent directly using the phone or WhatsApp buttons.</p>
                </div>
              )
            }
          </div>

          {/* ── Right column (agent + share) ─────────────────── */}
          <div className="space-y-4 lg:self-start lg:sticky lg:top-24">
            {/* Agent card */}
            <aside className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100" aria-label="Agent contact">
              <h3 className="font-semibold text-gray-900 mb-4">Listed By</h3>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold flex-shrink-0" aria-hidden="true">
                  {listing.agent_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{listing.agent_name}</div>
                  {listing.agent_company && <div className="text-sm text-gray-500">{listing.agent_company}</div>}
                </div>
              </div>

              <div className="space-y-2.5">
                {listing.agent_phone && (
                  <a href={`tel:${listing.agent_phone}`}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm tap-highlight min-h-[48px]"
                    aria-label={`Call ${listing.agent_name}`}>
                    <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span className="text-gray-700">{listing.agent_phone}</span>
                  </a>
                )}

                {listing.agent_phone && (
                  <a href={waLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-sm text-green-700 tap-highlight min-h-[48px]"
                    aria-label="Chat on WhatsApp">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp Agent
                  </a>
                )}

                {listing.agent_email && (
                  <a href={`mailto:${listing.agent_email}?subject=Enquiry: ${listing.title}`}
                    className="flex items-center justify-center gap-2 w-full btn-outline py-2.5 rounded-xl text-sm tap-highlight min-h-[48px]"
                    aria-label="Send email to agent">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    Send Email
                  </a>
                )}
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 leading-relaxed" role="note">
                ⚠️ Always verify property details in person before making any payment.
              </div>

              {listing.agent_id && (
                <Link to={`/realtors/${listing.agent_id}`}
                  className="mt-3 flex items-center justify-center gap-1.5 w-full text-xs text-gray-400 hover:text-primary transition-colors py-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  View all listings by this agent
                </Link>
              )}
            </aside>

            {/* Viewing scheduler */}
            <ViewingScheduler listingId={listing.id} agentId={listing.agent_id} />

            {/* Share */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Share this listing</h4>
              <div className="flex gap-2 flex-wrap">
                <a href={`https://wa.me/?text=${encodeURIComponent(listing.title + ' — ' + window.location.href)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 bg-green-500 text-white text-xs px-3 py-2 rounded-lg font-medium tap-highlight min-h-[36px]"
                  aria-label="Share on WhatsApp">
                  WhatsApp
                </a>
                <button onClick={copyLink}
                  className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-lg font-medium tap-highlight min-h-[36px]"
                  aria-label={copied ? 'Link copied!' : 'Copy link'}>
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
                <button onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-lg font-medium tap-highlight min-h-[36px]"
                  aria-label="Print listing">
                  🖨 Print
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Agent reviews */}
        {(reviews.count > 0 || user) && listing.agent_id && (
          <AgentReviews
            agentId={listing.agent_id}
            agentName={listing.agent_name}
            listingId={listing.id}
            reviewData={reviews}
            currentUser={user}
            onNewReview={(r) => setReviews(prev => ({
              reviews: [r, ...prev.reviews],
              count: prev.count + 1,
              average: Math.round(((prev.average * prev.count + r.rating) / (prev.count + 1)) * 10) / 10,
            }))}
          />
        )}

        {/* Nearby amenities legend */}
        {pois.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-2">Nearby Amenities</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {[['🏫','school','Schools'],['🏥','hospital','Hospitals'],['🛒','supermarket','Shops'],['🏦','bank','Banks'],['🍽','restaurant','Restaurants'],['🚌','bus_stop','Bus Stops']].map(([icon, type, label]) => {
                const count = pois.filter(p => p.type === type).length;
                if (!count) return null;
                return (
                  <span key={type} className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-full px-3 py-1">
                    <span>{icon}</span> {label} ({count})
                  </span>
                );
              })}
            </div>
            <p className="text-xs text-gray-400">Amenities within ~1.5km. Tap markers on the map for details.</p>
          </section>
        )}

        {/* Similar listings */}
        {similar.length > 0 && (
          <section className="mt-10 sm:mt-12" aria-labelledby="similar-heading">
            <div className="flex items-center justify-between mb-5">
              <h2 id="similar-heading" className="font-display text-2xl font-semibold text-gray-900">Similar Properties</h2>
              <Link to={`/listings?county=${listing.county}&type=${listing.type}`} className="text-sm text-primary hover:underline shrink-0 ml-4">
                View more →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {similar.map(l => <PropertyCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}

        <RecentlyViewed currentId={parseInt(id)} />
      </div>

      {/* ── Full-screen image lightbox ───────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen image viewer"
        >
          {/* Close */}
          <button onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white text-xl flex items-center justify-center transition-colors"
            aria-label="Close lightbox">✕</button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full select-none">
              {imgIdx + 1} / {images.length}
            </div>
          )}

          {/* Main image — click doesn't close */}
          <img
            src={images[imgIdx]}
            alt={`${listing.title} — photo ${imgIdx + 1}`}
            className="max-h-[88vh] max-w-[92vw] object-contain rounded-lg select-none shadow-2xl"
            onClick={e => e.stopPropagation()}
            onError={e => { e.target.src = PLACEHOLDER; }}
          />

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setImgIdx(p => (p - 1 + images.length) % images.length); }}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white text-3xl flex items-center justify-center transition-colors"
                aria-label="Previous photo">‹</button>
              <button
                onClick={e => { e.stopPropagation(); setImgIdx(p => (p + 1) % images.length); }}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white text-3xl flex items-center justify-center transition-colors"
                aria-label="Next photo">›</button>
            </>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2 scrollbar-hide"
              onClick={e => e.stopPropagation()}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === imgIdx ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = PLACEHOLDER; }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Mobile sticky contact bar ─────────────────────────── */}
      {listing.agent_phone && (
        <div className="fixed bottom-[56px] inset-x-0 md:hidden z-30 px-4 pb-2 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <a href={`tel:${listing.agent_phone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 font-semibold py-3 rounded-xl shadow-lg text-sm tap-highlight min-h-[48px]"
              aria-label={`Call agent`}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              Call
            </a>
            <a href={waLink} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl shadow-lg text-sm tap-highlight min-h-[48px]"
              aria-label="WhatsApp agent">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, val }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-xl">
      <div className="text-2xl mb-1" role="img" aria-hidden="true">{icon}</div>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="font-semibold text-gray-900 text-sm">{val}</div>
    </div>
  );
}

/* ── Agent reviews ───────────────────────────────────────── */
function Stars({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`${sz} ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function AgentReviews({ agentId, agentName, listingId, reviewData, currentUser, onNewReview }) {
  const toast  = useToast();
  const [open, setOpen]       = useState(false);
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const alreadyReviewed = reviewData.reviews.some(r => r.reviewer_id === currentUser?.id);

  const submit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.warn('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/reviews', { agent_id: agentId, listing_id: listingId, rating, comment });
      const newReview = {
        id: res.data.id, rating, comment,
        reviewer_name: currentUser.name,
        created_at: new Date().toISOString(),
        listing_title: null,
        reviewer_id: currentUser.id,
      };
      onNewReview(newReview);
      setSubmitted(true);
      toast.success('Review submitted — thank you!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-gray-900 flex items-center gap-2">
          Agent Reviews
          {reviewData.count > 0 && (
            <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 text-sm font-semibold px-2.5 py-1 rounded-full">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              {reviewData.average} · {reviewData.count} review{reviewData.count !== 1 ? 's' : ''}
            </span>
          )}
        </h2>
        {currentUser && !alreadyReviewed && !submitted && (
          <button onClick={() => setOpen(p => !p)} className="text-sm text-primary font-medium hover:underline">
            {open ? 'Cancel' : '+ Leave a review'}
          </button>
        )}
      </div>

      {/* Write review form */}
      {open && !submitted && (
        <form onSubmit={submit} className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100 space-y-3">
          <p className="text-sm font-medium text-gray-700">Rate {agentName}</p>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
                className="p-0.5 transition-transform hover:scale-110">
                <svg className={`w-7 h-7 ${i <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            ))}
          </div>
          <textarea className="input text-sm resize-none min-h-[80px]" placeholder="Share your experience with this agent (optional)"
            value={comment} onChange={e => setComment(e.target.value)} />
          <button type="submit" disabled={submitting} className="btn-primary rounded-xl text-sm disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Review list */}
      {reviewData.reviews.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No reviews yet. Be the first to review {agentName}.</p>
      ) : (
        <div className="space-y-3">
          {reviewData.reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {r.reviewer_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{r.reviewer_name}</div>
                    <Stars rating={r.rating} />
                  </div>
                </div>
                <time className="text-xs text-gray-400 shrink-0">{timeAgo(r.created_at)}</time>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-2 ml-10">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Enquiry form ────────────────────────────────────────── */
function EnquiryForm({ listing }) {
  const { user } = useAuth();
  const toast    = useToast();
  const [form, setForm]     = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', message: `Hi, I'm interested in "${listing.title}". Please get in touch.` });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');
  const [open, setOpen]     = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/enquiries', { listing_id: listing.id, ...form });
      setSent(true);
      toast.success('Enquiry sent! The agent will contact you shortly.');
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.message || 'Failed to send enquiry';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-gray-50 transition-colors">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-lg">💬</span> Send Enquiry
        </h2>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </button>

      {open && (
        <div className="px-5 sm:px-6 pb-6 border-t border-gray-50">
          {sent ? (
            <div className="py-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-gray-900 mb-1">Enquiry sent!</p>
              <p className="text-sm text-gray-500">The agent will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Your Name *</label>
                  <input className="input text-sm" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="John Mwangi" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input className="input text-sm" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="label">Phone (Optional)</label>
                <input className="input text-sm" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 7XX XXX XXX" />
              </div>
              <div>
                <label className="label">Message *</label>
                <textarea className="input text-sm min-h-[90px] resize-none" value={form.message} onChange={e => set('message', e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 rounded-xl font-semibold disabled:opacity-60">
                {loading ? 'Sending…' : 'Send Enquiry'}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

/* ── Viewing scheduler ───────────────────────────────────── */
function ViewingScheduler({ listingId, agentId }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ viewer_name: '', viewer_email: '', viewer_phone: '', preferred_date: '', preferred_time: '10:00', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/viewings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, agent_id: agentId, ...form }),
      });
      if (!res.ok) throw new Error('Request failed');
      setSent(true);
      toast.success('Viewing request sent! The agent will confirm shortly.');
    } catch {
      toast.error('Could not send viewing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
          <span className="text-base">📅</span> Schedule a Viewing
        </h3>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-50">
          {sent ? (
            <div className="py-5 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-gray-900 text-sm">Request sent!</p>
              <p className="text-xs text-gray-500 mt-1">The agent will confirm your viewing time.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-4">
              <div>
                <label className="label text-xs">Your Name *</label>
                <input className="input text-sm" required value={form.viewer_name} onChange={e => set('viewer_name', e.target.value)} placeholder="John Mwangi" />
              </div>
              <div>
                <label className="label text-xs">Email *</label>
                <input className="input text-sm" type="email" required value={form.viewer_email} onChange={e => set('viewer_email', e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="label text-xs">Phone</label>
                <input className="input text-sm" value={form.viewer_phone} onChange={e => set('viewer_phone', e.target.value)} placeholder="+254 7XX XXX XXX" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs">Date *</label>
                  <input className="input text-sm" type="date" required value={form.preferred_date} min={new Date().toISOString().split('T')[0]} onChange={e => set('preferred_date', e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">Time</label>
                  <select className="input text-sm" value={form.preferred_time} onChange={e => set('preferred_time', e.target.value)}>
                    {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label text-xs">Message (Optional)</label>
                <textarea className="input text-sm resize-none min-h-[60px]" value={form.message} onChange={e => set('message', e.target.value)} placeholder="Any special requirements…" />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                {loading ? 'Sending…' : 'Request Viewing'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Mortgage calculator ──────────────────────────────────── */
function MortgageCalculator({ price }) {
  const [deposit, setDeposit]   = useState(20);   // %
  const [rate, setRate]         = useState(13);    // % per annum (typical Kenya)
  const [years, setYears]       = useState(20);
  const [open, setOpen]         = useState(false);

  const loanAmount  = price * (1 - deposit / 100);
  const monthlyRate = rate / 100 / 12;
  const n           = years * 12;
  const monthly     = monthlyRate === 0 ? loanAmount / n
    : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const totalPaid   = monthly * n;
  const totalInterest = totalPaid - loanAmount;

  const fmt = (v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-gray-50 transition-colors">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-lg">🧮</span> Mortgage Calculator
        </h2>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </button>

      {open && (
        <div className="px-5 sm:px-6 pb-6 border-t border-gray-50 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="label">Deposit ({deposit}%)</label>
              <input type="range" min="10" max="50" step="5" value={deposit} onChange={e => setDeposit(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="text-xs text-gray-500 mt-1">{fmt(price * deposit / 100)}</div>
            </div>
            <div>
              <label className="label">Interest Rate ({rate}% p.a.)</label>
              <input type="range" min="8" max="22" step="0.5" value={rate} onChange={e => setRate(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="text-xs text-gray-500 mt-1">{rate}%</div>
            </div>
            <div>
              <label className="label">Loan Term ({years} yrs)</label>
              <input type="range" min="5" max="30" step="5" value={years} onChange={e => setYears(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="text-xs text-gray-500 mt-1">{years} years</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-primary-pale rounded-xl">
              <div className="text-xs text-gray-500 mb-0.5">Monthly Payment</div>
              <div className="font-display text-lg font-semibold text-primary">{fmt(monthly)}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-500 mb-0.5">Loan Amount</div>
              <div className="font-semibold text-gray-900 text-sm">{fmt(loanAmount)}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-500 mb-0.5">Total Amount</div>
              <div className="font-semibold text-gray-900 text-sm">{fmt(totalPaid)}</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">Estimate only. Contact your bank for exact figures.</p>
        </div>
      )}
    </section>
  );
}
