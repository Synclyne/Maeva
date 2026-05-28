import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { counties, kenyanLocations, propertyTypes } from '../data/locations';
import { useSEO } from '../hooks/useSEO';
import PropertyCard from '../components/PropertyCard';
import api from '../lib/api';

const HERO_VIDEOS = [
  '/videos/hero1.mp4',
  '/videos/hero2.mp4',
  '/videos/hero3.mp4',
];

const QUICK_TYPES = [
  {
    label: 'Houses', type: 'house', bg: 'from-blue-500 to-blue-600',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <path d="M8 20L24 8L40 20V40H30V28H18V40H8V20Z" fill="white" fillOpacity=".9"/>
        <path d="M18 28H30V40H18V28Z" fill="white" fillOpacity=".5"/>
        <rect x="20" y="14" width="8" height="7" rx="1" fill="white" fillOpacity=".4"/>
      </svg>
    ),
  },
  {
    label: 'Apartments', type: 'apartment', bg: 'from-violet-500 to-violet-600',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="9" y="10" width="30" height="32" rx="2" fill="white" fillOpacity=".85"/>
        <rect x="14" y="15" width="6" height="6" rx="1" fill="white" fillOpacity=".4"/>
        <rect x="28" y="15" width="6" height="6" rx="1" fill="white" fillOpacity=".4"/>
        <rect x="14" y="25" width="6" height="6" rx="1" fill="white" fillOpacity=".4"/>
        <rect x="28" y="25" width="6" height="6" rx="1" fill="white" fillOpacity=".4"/>
        <rect x="19" y="34" width="10" height="8" rx="1" fill="white" fillOpacity=".5"/>
      </svg>
    ),
  },
  {
    label: 'Land', type: 'land', bg: 'from-emerald-500 to-emerald-600',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <ellipse cx="24" cy="38" rx="18" ry="4" fill="white" fillOpacity=".3"/>
        <path d="M6 36 Q14 24 24 28 Q30 20 40 22 L40 36Z" fill="white" fillOpacity=".5"/>
        <path d="M22 28 L24 12 L26 28" fill="white" fillOpacity=".85"/>
        <path d="M16 14 Q24 8 32 14" stroke="white" strokeWidth="2" fill="none" strokeOpacity=".8"/>
        <circle cx="30" cy="16" r="5" fill="white" fillOpacity=".7"/>
      </svg>
    ),
  },
  {
    label: 'Commercial', type: 'commercial', bg: 'from-orange-500 to-orange-600',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="10" y="14" width="28" height="28" rx="2" fill="white" fillOpacity=".85"/>
        <rect x="4" y="22" width="10" height="20" rx="1" fill="white" fillOpacity=".6"/>
        <rect x="15" y="18" width="5" height="5" rx="1" fill="white" fillOpacity=".4"/>
        <rect x="24" y="18" width="5" height="5" rx="1" fill="white" fillOpacity=".4"/>
        <rect x="15" y="27" width="5" height="5" rx="1" fill="white" fillOpacity=".4"/>
        <rect x="24" y="27" width="5" height="5" rx="1" fill="white" fillOpacity=".4"/>
        <rect x="18" y="36" width="12" height="6" rx="1" fill="white" fillOpacity=".5"/>
      </svg>
    ),
  },
  {
    label: 'Bedsitters', type: 'bedsitter', bg: 'from-rose-500 to-rose-600',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="6" y="28" width="36" height="12" rx="3" fill="white" fillOpacity=".85"/>
        <rect x="6" y="20" width="14" height="10" rx="2" fill="white" fillOpacity=".6"/>
        <rect x="28" y="20" width="14" height="10" rx="2" fill="white" fillOpacity=".6"/>
        <rect x="6" y="38" width="4" height="5" rx="1" fill="white" fillOpacity=".5"/>
        <rect x="38" y="38" width="4" height="5" rx="1" fill="white" fillOpacity=".5"/>
        <path d="M6 28 L6 18" stroke="white" strokeWidth="2.5" strokeOpacity=".7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Villas', type: 'villa', bg: 'from-amber-500 to-amber-600',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <path d="M4 22L14 12L24 6L34 12L44 22" stroke="white" strokeWidth="2" strokeOpacity=".6" fill="none"/>
        <path d="M8 22V40H20V28H28V40H40V22L24 10Z" fill="white" fillOpacity=".85"/>
        <rect x="20" y="16" width="8" height="7" rx="1" fill="white" fillOpacity=".4"/>
        <path d="M4 22H44" stroke="white" strokeWidth="1.5" strokeOpacity=".4"/>
        <rect x="12" y="28" width="6" height="12" rx="1" fill="white" fillOpacity=".5"/>
        <rect x="30" y="28" width="6" height="12" rx="1" fill="white" fillOpacity=".5"/>
      </svg>
    ),
  },
];

const POPULAR_COUNTIES = [
  { name: 'Nairobi',  desc: 'Capital city',   img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99' },
  { name: 'Mombasa',  desc: 'Coastal city',   img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750' },
  { name: 'Kisumu',   desc: 'Lakeside city',  img: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8' },
  { name: 'Nakuru',   desc: 'Rift Valley',    img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e' },
  { name: 'Kiambu',   desc: 'Near Nairobi',   img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b' },
  { name: 'Kajiado',  desc: 'Rongai · Ngong', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5' },
  { name: 'Machakos', desc: 'Eastern Kenya',  img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c' },
  { name: 'Kilifi',   desc: 'North Coast',    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
];


export default function Home() {
  useSEO({
    title: 'Find Property in Kenya — Buy, Rent & Sell',
    description: 'Kenya\'s trusted real estate platform. Browse 1,200+ verified houses, apartments, land and commercial properties for sale and rent across all 47 counties.',
  });

  const navigate = useNavigate();
  const [tab, setTab] = useState('sale');
  const [county, setCounty] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState(null);   // null = loading, [] = loaded (empty/error)
  const [stats, setStats] = useState({ total: 0 });
  const [partners, setPartners] = useState([]);

  // ── Hero video slideshow ───────────────────────────────────
  const [vidIdx, setVidIdx] = useState(0);
  const videoRefs = [useRef(null), useRef(null), useRef(null)];

  // Play the active video; pause + reset others after crossfade
  useEffect(() => {
    const active = videoRefs[vidIdx].current;
    if (!active) return;
    active.currentTime = 0;
    active.play().catch(() => {});
    const t = setTimeout(() => {
      videoRefs.forEach((r, i) => {
        if (i !== vidIdx) r.current?.pause();
      });
    }, 800);
    return () => clearTimeout(t);
  }, [vidIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVideoEnd = useCallback(() => {
    setVidIdx(i => (i + 1) % HERO_VIDEOS.length);
  }, []);

  const areas = county ? (kenyanLocations[county] || []) : [];

  useEffect(() => {
    api.get('/listings?featured=true&limit=6')
      .then(r => setFeatured(r.data.listings || []))
      .catch(() => setFeatured([]));
    api.get('/listings?limit=1')
      .then(r => setStats({ total: r.data.total }))
      .catch(() => {});
    api.get('/partners').then(r => setPartners(r.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams({ transaction: tab });
    if (county) p.set('county', county);
    if (area)   p.set('area', area);
    if (type)   p.set('type', type);
    if (search) p.set('search', search);
    navigate(`/listings?${p}`);
  };

  return (
    <div className="has-bottom-nav">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-black" aria-label="Search for property in Kenya">

        {/* Video slideshow — three videos crossfade on end */}
        {HERO_VIDEOS.map((src, i) => (
          <video
            key={i}
            ref={videoRefs[i]}
            src={src}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === vidIdx ? 'opacity-100' : 'opacity-0'}`}
            muted
            playsInline
            autoPlay={i === 0}
            preload={i === 0 ? 'auto' : 'none'}
            onEnded={i === vidIdx ? handleVideoEnd : undefined}
            aria-hidden="true"
          />
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70 z-10" />

        {/* Content */}
        <div className="relative z-20 w-full max-w-4xl mx-auto px-4 text-center pt-20 pb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white text-sm font-medium mb-5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            Kenya's #1 Real Estate Platform
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-semibold text-white leading-tight mb-5">
            Find Your <em className="text-blue-300 not-italic">Dream Home</em><br className="hidden sm:block" /> in Kenya
          </h1>
          <p className="text-white/70 text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            {stats.total ? `${stats.total.toLocaleString()}+ verified` : 'Thousands of'} properties across all 47 counties.
          </p>

          {/* Search widget */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 text-left max-w-3xl mx-auto">
            <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
              {[['sale','Buy'],['rent','Rent']].map(([val, label]) => (
                <button key={val} onClick={() => setTab(val)} aria-pressed={tab === val}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab===val ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} role="search" aria-label="Property search">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="hero-county" className="label">County</label>
                  <select id="hero-county" className="input" value={county} onChange={e => { setCounty(e.target.value); setArea(''); }}>
                    <option value="">All Counties</option>
                    {counties.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="hero-area" className="label">Area / Town</label>
                  <select id="hero-area" className="input" value={area} onChange={e => setArea(e.target.value)} disabled={!county}>
                    <option value="">All Areas</option>
                    {areas.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="hero-type" className="label">Property Type</label>
                  <select id="hero-type" className="input" value={type} onChange={e => setType(e.target.value)}>
                    <option value="">Any Type</option>
                    {propertyTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full btn-primary rounded-xl font-semibold gap-2 text-base">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-8" aria-label="Platform statistics">
            {[['1,200+','Verified Listings'],['47','Counties Covered'],['500+','Happy Clients']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-semibold text-white">{num}</div>
                <div className="text-white/50 text-xs sm:text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20" role="tablist" aria-label="Video slides">
          {HERO_VIDEOS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === vidIdx}
              aria-label={`Video ${i + 1}`}
              onClick={() => setVidIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === vidIdx ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── BROWSE BY TYPE ────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white" aria-labelledby="browse-type-heading">
        <div className="max-w-7xl mx-auto">
          <h2 id="browse-type-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-1">Browse by Property Type</h2>
          <p className="text-gray-500 text-sm mb-6">Find exactly what you're looking for</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {QUICK_TYPES.map(({ icon, label, type, bg }) => (
              <Link key={type} to={`/listings?type=${type}`} aria-label={`Browse ${label}`}
                className="flex flex-col items-center gap-3 p-3 sm:p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group tap-highlight bg-white">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${bg} p-2.5 group-hover:scale-105 transition-transform shadow-sm`}>
                  {icon}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ─────────────────────────────────── */}
      <section className="py-12 px-4 bg-gray-50" aria-labelledby="featured-heading">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Featured</p>
              <h2 id="featured-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">Popular Listings</h2>
            </div>
            <Link to="/listings" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 ml-4">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>

          {featured === null ? (
            /* Loading skeletons — shown only while request is in-flight */
            <>
              <div className="sm:hidden flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="shrink-0 w-[78vw]"><SkeletonCard /></div>
                ))}
              </div>
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </>
          ) : featured.length === 0 ? (
            /* Error / empty state */
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">Could not load listings. <button onClick={() => { setFeatured(null); api.get('/listings?featured=true&limit=6').then(r => setFeatured(r.data.listings || [])).catch(() => setFeatured([])); }} className="text-primary hover:underline">Try again</button></p>
            </div>
          ) : (
            <>
              {/* Mobile horizontal carousel */}
              <div className="sm:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scrollbar-hide">
                {featured.map(l => (
                  <div key={l.id} className="snap-start shrink-0 w-[78vw]">
                    <PropertyCard listing={l} />
                  </div>
                ))}
              </div>
              {/* Desktop grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map(l => <PropertyCard key={l.id} listing={l} />)}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── COUNTIES ──────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white" aria-labelledby="counties-heading">
        <div className="max-w-7xl mx-auto">
          <h2 id="counties-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-1">Search by County</h2>
          <p className="text-gray-500 text-sm mb-6">Properties across Kenya's most popular counties</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {POPULAR_COUNTIES.map(({ name, desc, img }) => (
              <Link key={name} to={`/listings?county=${name}`} aria-label={`Properties in ${name} County`}
                className="relative rounded-2xl h-28 sm:h-36 overflow-hidden group tap-highlight bg-gray-800">
                <img
                  src={`${img}?w=600&h=300&fit=crop&auto=format&q=75`}
                  alt={`${name}, Kenya`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10 group-hover:from-black/60 transition-all duration-300" />
                <div className="absolute bottom-3 left-4 z-10">
                  <div className="font-semibold text-white text-sm sm:text-base leading-snug">{name}</div>
                  <div className="text-white/65 text-xs">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ────────────────────────────────────────────── */}
      {partners.length > 0 && (() => {
        const row1 = partners.filter(p => p.row_num === 1);
        const row2 = partners.filter(p => p.row_num === 2);
        const maskStyle = {
          maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        };
        return (
          <section className="py-14 bg-white overflow-hidden" aria-label="Trusted partners and institutions">
            <div className="max-w-7xl mx-auto px-4 text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5">Our Network</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900">
                Trusted by Kenya's Leading Institutions
              </h2>
              <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                We work closely with top banks, agencies and industry bodies to bring you verified, quality listings.
              </p>
            </div>

            {row1.length > 0 && (
              <div className="relative mb-3" style={maskStyle}>
                <div className="flex animate-marquee w-max gap-3 px-3">
                  {[...row1, ...row1].map((p, i) => <PartnerCard key={i} partner={p} />)}
                </div>
              </div>
            )}

            {row2.length > 0 && (
              <div className="relative" style={maskStyle}>
                <div className="flex animate-marquee-reverse w-max gap-3 px-3">
                  {[...row2, ...row2].map((p, i) => <PartnerCard key={i} partner={p} />)}
                </div>
              </div>
            )}
          </section>
        );
      })()}

      {/* ── WHY MAEVA ─────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-primary-dark text-white" aria-labelledby="why-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 id="why-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold mb-3">Why Choose Maeva?</h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">We connect buyers, renters and sellers with transparency and ease across Kenya</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon:'🔍', title:'Verified Listings',    desc:'Every property vetted before appearing on our platform' },
              { icon:'📍', title:'All 47 Counties',      desc:'Search properties anywhere across Kenya' },
              { icon:'💬', title:'Direct Agent Contact', desc:'Connect directly with realtors — no middlemen' },
              { icon:'💙', title:'Save Favourites',      desc:'Create a free account and save properties you love' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-3xl mb-3" role="img" aria-hidden="true">{icon}</div>
                <h3 className="font-semibold text-sm sm:text-base mb-1">{title}</h3>
                <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REALTOR CTA ───────────────────────────────────────── */}
      <section className="py-12 px-4 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-3">Are You a Realtor?</h2>
          <p className="text-white/70 mb-6 text-sm sm:text-base">List your properties on Maeva and reach thousands of buyers and renters across Kenya. Create a free agent account today.</p>
          <Link to="/post-listing" className="inline-flex items-center justify-center bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors min-h-[44px]">
            Start Listing Free
          </Link>
        </div>
      </section>

    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

function PartnerCard({ partner }) {
  return (
    <div className="flex-none bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center hover:shadow-md hover:border-gray-200 transition-all duration-300 group overflow-hidden"
      style={{ minWidth: partner.logo_url ? '140px' : '160px', height: '72px', padding: partner.logo_url ? '10px 16px' : '10px 20px' }}>
      {partner.logo_url ? (
        <img
          src={partner.logo_url}
          alt={partner.name}
          title={partner.name}
          className="max-h-11 max-w-[120px] w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0 group-hover:scale-110 transition-transform duration-200"
            style={{ backgroundColor: partner.color }}
            aria-hidden="true"
          >
            {partner.name[0]}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-800 leading-tight whitespace-nowrap">{partner.name}</div>
            <div className="text-xs text-gray-400 whitespace-nowrap">{partner.category}</div>
          </div>
        </div>
      )}
    </div>
  );
}
