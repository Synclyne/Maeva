import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { formatPrice } from '../data/locations';

const STATUS_CONFIG = {
  under_offer: { label: 'Under Offer', cls: 'bg-orange-500' },
  sold:        { label: 'Sold',        cls: 'bg-red-600'    },
  rented:      { label: 'Rented',      cls: 'bg-gray-600'   },
};

const TYPE_COLORS = {
  house:      'bg-blue-100 text-blue-700',
  apartment:  'bg-purple-100 text-purple-700',
  land:       'bg-amber-100 text-amber-700',
  commercial: 'bg-gray-100 text-gray-700',
  bedsitter:  'bg-pink-100 text-pink-700',
  studio:     'bg-teal-100 text-teal-700',
  villa:      'bg-emerald-100 text-emerald-700',
  townhouse:  'bg-indigo-100 text-indigo-700',
  maisonette: 'bg-cyan-100 text-cyan-700',
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=400&fit=crop';

// Badge styles — each type has its own colour & optional icon prefix
const BADGE_STYLES = {
  'Featured':  { cls: 'bg-yellow-400 text-yellow-900',  icon: '⭐' },
  'Premium':   { cls: 'bg-purple-600 text-white',        icon: '💎' },
  'Hot':       { cls: 'bg-red-500 text-white',           icon: '🔥' },
  'Verified':  { cls: 'bg-green-500 text-white',         icon: '✓'  },
  'New':       { cls: 'bg-blue-500 text-white',          icon: '✨' },
  'Sponsored': { cls: 'bg-gray-600 text-white',          icon: ''   },
};

export default function PropertyCard({ listing, className = '' }) {
  const { user, wishlistIds, toggleWishlist, openAuth } = useAuth();
  const { toggle: compareToggle, has: compareHas, items: compareItems, max: compareMax } = useCompare();
  const [imgIdx, setImgIdx] = useState(0);
  const images = listing.images?.length ? listing.images : [PLACEHOLDER];
  const isSaved = wishlistIds.includes(listing.id);
  const inCompare = compareHas(listing.id);
  const compareFull = compareItems.length >= compareMax && !inCompare;

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (compareFull) return;
    compareToggle(listing);
  };
  const typeKey = listing.type?.toLowerCase();

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return openAuth('login');
    await toggleWishlist(listing.id);
  };

  const prevImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx(p => (p - 1 + images.length) % images.length);
  };
  const nextImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx(p => (p + 1) % images.length);
  };

  return (
    <article>
      <Link
        to={`/listings/${listing.id}`}
        className={`card group flex flex-col hover:shadow-lg transition-shadow duration-300 ${className}`}
        aria-label={`${listing.title} — ${formatPrice(listing.price, listing.price_period)}`}
      >
        {/* ── Image ─────────────────────────────────────────── */}
        <div className="relative h-52 overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={images[imgIdx]}
            alt={`${listing.title} in ${listing.area}, ${listing.county}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={e => { e.target.src = PLACEHOLDER; }}
            onLoad={e => e.target.classList.add('loaded')}
          />

          {/* Carousel arrows — visible on hover (desktop) and always on mobile */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImg}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 md:opacity-0 active:opacity-100 transition-opacity z-10"
              >‹</button>
              <button
                onClick={nextImg}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 md:opacity-0 active:opacity-100 transition-opacity z-10"
              >›</button>

              {/* Dot indicators */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 z-10 flex-wrap">
            <span className={`badge ${typeKey && TYPE_COLORS[typeKey] ? TYPE_COLORS[typeKey] : 'bg-gray-100 text-gray-700'}`}>
              {listing.type}
            </span>
            {listing.is_featured === 1 && (() => {
              const b = BADGE_STYLES[listing.badge] || BADGE_STYLES['Featured'];
              const label = listing.badge || 'Featured';
              return (
                <span className={`badge ${b.cls}`}>
                  {b.icon && <span className="mr-0.5">{b.icon}</span>}{label}
                </span>
              );
            })()}
          </div>
          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
            <span className={`badge ${listing.transaction === 'sale' ? 'bg-primary text-white' : 'bg-kenya-green text-white'}`}>
              {listing.transaction === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
          </div>

          {/* Availability status banner (Under Offer / Sold / Rented) */}
          {listing.status && STATUS_CONFIG[listing.status] && (
            <div className={`absolute bottom-0 inset-x-0 py-1.5 text-center text-xs font-bold text-white tracking-wide z-10 ${STATUS_CONFIG[listing.status].cls}`}>
              {STATUS_CONFIG[listing.status].label}
            </div>
          )}

          {/* Image count */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              {imgIdx + 1}/{images.length}
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label={isSaved ? 'Remove from saved' : 'Save property'}
            className={`absolute bottom-3 left-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm z-10 tap-highlight ${isSaved ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500'}`}
          >
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────── */}
        <div className="p-4 flex flex-col flex-1">
          {/* Price */}
          <div className="mb-0.5">
            <span className="font-display text-xl font-semibold text-gray-900">
              {formatPrice(listing.price, listing.price_period)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1.5 line-clamp-2">
            {listing.title}
          </h3>

          {/* Location */}
          <address className="not-italic flex items-center gap-1 text-gray-500 text-xs mb-3">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>{listing.area}, {listing.county}</span>
          </address>

          {/* Meta: beds/baths/size */}
          <div className="flex gap-4 text-xs text-gray-500 mb-3 flex-wrap" aria-label="Property details">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`}
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 6h7m-7 6h16"/>
                </svg>
                {listing.bathrooms} Bath
              </span>
            )}
            {listing.size != null && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                {listing.size} {listing.size_unit}
              </span>
            )}
          </div>

          {/* Agent */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-500 min-w-0">
              {listing.agent_id ? (
                <Link
                  to={`/realtors/${listing.agent_id}`}
                  onClick={e => e.stopPropagation()}
                  className="font-medium text-primary hover:underline truncate block"
                >
                  {listing.agent_company || listing.agent_name}
                </Link>
              ) : (
                <span className="font-medium text-gray-700 truncate block">
                  {listing.agent_company || listing.agent_name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                {listing.views}
              </div>
              <button
                onClick={handleCompare}
                aria-label={inCompare ? 'Remove from comparison' : compareFull ? 'Comparison full' : 'Add to comparison'}
                title={inCompare ? 'Remove from comparison' : compareFull ? `Max ${compareMax} properties` : 'Compare'}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all text-sm ${
                  inCompare
                    ? 'bg-primary text-white'
                    : compareFull
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                ⚖
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
