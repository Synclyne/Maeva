import { useState, useEffect, lazy, Suspense, Component } from 'react';
import { useSearchParams } from 'react-router-dom';
import { counties, kenyanLocations, propertyTypes } from '../data/locations';
import { useSEO } from '../hooks/useSEO';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

// Lazy-load Leaflet map
const MapView = lazy(() => import('../components/MapView'));

// Error boundary so a map crash doesn't blank the whole page
class MapErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(err) { return { error: err }; }
  render() {
    if (this.state.error) {
      return (
        <div className="h-[520px] bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-3">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20.25l-5.197-2.598A1 1 0 013 16.72V5.28a1 1 0 011.447-.894L9 6.75m0 13.5l6-3m-6 3V6.75m6 10.5l4.553 2.276A1 1 0 0021 18.72V7.28a1 1 0 00-.553-.894L15 4.25m0 13V4.25m0 0L9 6.75"/>
          </svg>
          <p className="text-sm font-medium">Map could not load</p>
          <button onClick={() => this.setState({ error: null })} className="text-xs text-primary hover:underline">Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'popular',    label: 'Most Popular' },
];

/* ── Filter panel — hoisted outside Listings so React doesn't
   remount it on every parent re-render (which would drop focus) ── */
function FilterPanel({ transaction, type, county, area, minPrice, maxPrice,
                       bedrooms, areas, hasFilters, setF, setFMulti, clearFilters }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasFilters && <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>}
      </div>

      {/* Transaction */}
      <div>
        <p className="label">Listing Type</p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Listing type">
          {[['','Any'],['sale','Buy'],['rent','Rent']].map(([val, label]) => (
            <button key={val} onClick={() => setF('transaction', val)} aria-pressed={transaction === val}
              className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all min-h-[40px] tap-highlight ${
                transaction === val ? 'border-primary bg-primary-pale text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* County */}
      <div>
        <label htmlFor="f-county" className="label">County</label>
        <select id="f-county" className="input appearance-none" value={county}
          onChange={e => setFMulti({ county: e.target.value, area: '' })}>
          <option value="">All Counties</option>
          {counties.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Area */}
      <div>
        <label htmlFor="f-area" className="label">Area / Town</label>
        <select id="f-area" className="input appearance-none" value={area} disabled={!county}
          onChange={e => setF('area', e.target.value)}>
          <option value="">All Areas</option>
          {areas.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      {/* Property Type */}
      <div>
        <label htmlFor="f-type" className="label">Property Type</label>
        <select id="f-type" className="input appearance-none" value={type} onChange={e => setF('type', e.target.value)}>
          <option value="">Any Type</option>
          {propertyTypes.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <p className="label">Price Range (KES)</p>
        <div className="grid grid-cols-2 gap-2">
          <input className="input text-sm" type="number" placeholder="Min" value={minPrice}
            aria-label="Minimum price" onChange={e => setF('minPrice', e.target.value)} />
          <input className="input text-sm" type="number" placeholder="Max" value={maxPrice}
            aria-label="Maximum price" onChange={e => setF('maxPrice', e.target.value)} />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <p className="label">Min Bedrooms</p>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Minimum bedrooms">
          {['','1','2','3','4','5'].map(n => (
            <button key={n} onClick={() => setF('bedrooms', n)} aria-pressed={bedrooms === n}
              className={`w-10 h-10 rounded-lg border text-sm font-medium tap-highlight transition-all ${
                bedrooms === n ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-600 hover:border-primary'
              }`}>
              {n || 'Any'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [loading, setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode]   = useState('grid');
  const [searchSaved,   setSearchSaved]   = useState(false);
  const [savingSearch,  setSavingSearch]  = useState(false);

  const { user, openAuth } = useAuth();
  const toast = useToast();

  // ── Single source of truth: everything derived from the URL ──
  const transaction = searchParams.get('transaction') || '';
  const type        = searchParams.get('type')        || '';
  const county      = searchParams.get('county')      || '';
  const area        = searchParams.get('area')        || '';
  const minPrice    = searchParams.get('minPrice')    || '';
  const maxPrice    = searchParams.get('maxPrice')    || '';
  const bedrooms    = searchParams.get('bedrooms')    || '';
  const search      = searchParams.get('search')      || '';
  const sort        = searchParams.get('sort')        || 'newest';
  const page        = parseInt(searchParams.get('page') || '1');

  const areas = county ? (kenyanLocations[county] || []) : [];

  // Update one param, reset page to 1
  const setF = (key, val) => setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    return next;
  }, { replace: true });

  // Update several params at once (e.g. clear county + area together)
  const setFMulti = (updates) => setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v); else next.delete(k);
    });
    next.delete('page');
    return next;
  }, { replace: true });

  const setPage = (p) => setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    if (p > 1) next.set('page', String(p)); else next.delete('page');
    return next;
  }, { replace: true });

  const clearFilters = () => setSearchParams(new URLSearchParams(), { replace: true });

  // Reset "saved" state whenever filters change
  useEffect(() => { setSearchSaved(false); }, [searchParams.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveSearch = async () => {
    if (!user) return openAuth('login');
    const filters = {};
    if (transaction) filters.transaction = transaction;
    if (type)        filters.type        = type;
    if (county)      filters.county      = county;
    if (area)        filters.area        = area;
    if (minPrice)    filters.minPrice    = minPrice;
    if (maxPrice)    filters.maxPrice    = maxPrice;
    if (bedrooms)    filters.bedrooms    = bedrooms;
    if (search)      filters.search      = search;

    setSavingSearch(true);
    try {
      await api.post('/searches', { filters });
      setSearchSaved(true);
      toast.success("Search saved! We'll email you when new matches are listed.");
    } catch (e) {
      if (e.response?.status === 409 || e.response?.status === 400) {
        toast.info(e.response?.data?.message || 'Search already saved');
        setSearchSaved(true);
      } else {
        toast.error(e.friendlyMessage || 'Could not save search');
      }
    } finally { setSavingSearch(false); }
  };

  /* ── Dynamic SEO ─────────────────────────────────────────── */
  const seoTitle = (() => {
    const parts = [];
    if (bedrooms) parts.push(`${bedrooms}+ Bed`);
    if (type) parts.push(`${type.charAt(0).toUpperCase() + type.slice(1)}s`);
    else parts.push('Properties');
    if (transaction === 'sale')      parts[parts.length - 1] += ' for Sale';
    else if (transaction === 'rent') parts[parts.length - 1] += ' for Rent';
    if (area)        parts.push(`in ${area}`);
    else if (county) parts.push(`in ${county}`);
    return parts.join(' ');
  })();

  const seoDesc = `Browse ${total ? total.toLocaleString() + '+' : 'thousands of'} verified ${
    type || 'properties'} ${
    transaction === 'sale' ? 'for sale' : transaction === 'rent' ? 'for rent' : 'for sale and rent'} ${
    county ? `in ${county}` : 'across Kenya'}. Find your perfect home on Maeva.`;

  useSEO({ title: seoTitle, description: seoDesc });

  /* ── Fetch whenever URL changes — nav links just work ────── */
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (transaction) params.transaction = transaction;
    if (type)        params.type        = type;
    if (county)      params.county      = county;
    if (area)        params.area        = area;
    if (minPrice)    params.minPrice    = minPrice;
    if (maxPrice)    params.maxPrice    = maxPrice;
    if (bedrooms)    params.bedrooms    = bedrooms;
    if (search)      params.search      = search;
    params.sort  = sort;
    params.page  = page;
    params.limit = 12;
    api.get('/listings', { params, _silent: true })
      .then(r => { setListings(r.data.listings); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [searchParams.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilters = Boolean(transaction || type || county || area || minPrice || maxPrice || bedrooms || search);
  const activeCount = [transaction, type, county, bedrooms, (minPrice || maxPrice) ? 'price' : ''].filter(Boolean).length;

  const filterPanelProps = {
    transaction, type, county, area, minPrice, maxPrice, bedrooms,
    areas, hasFilters, setF, setFMulti, clearFilters,
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 has-bottom-nav">

      {/* ── Page header ─────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-gray-900">
              {county ? `${area || county} Properties` : 'All Properties'}
            </h1>
            <p className="text-sm text-gray-500" aria-live="polite" aria-atomic="true">
              {loading ? 'Loading…' : `${total.toLocaleString()} listing${total !== 1 ? 's' : ''} found`}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <label htmlFor="l-search" className="sr-only">Search properties</label>
              <input id="l-search" className="input pl-8 text-sm w-full sm:w-52" placeholder="Search…"
                value={search} onChange={e => setF('search', e.target.value)} />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>

            {/* Sort — desktop */}
            <div className="relative hidden sm:block shrink-0">
              <label htmlFor="l-sort" className="sr-only">Sort listings</label>
              <select id="l-sort" className="input text-sm pr-8 cursor-pointer appearance-none" value={sort}
                onChange={e => setF('sort', e.target.value)} style={{ minWidth: '10.5rem' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>

            {/* Grid / Map toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} aria-pressed={viewMode === 'grid'} title="Grid view"
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </button>
              <button onClick={() => setViewMode('map')} aria-pressed={viewMode === 'map'} title="Map view"
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              </button>
            </div>

            {/* Filter toggle — mobile */}
            <button onClick={() => setSidebarOpen(p => !p)} aria-expanded={sidebarOpen} aria-controls="mobile-filters"
              className="lg:hidden relative flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 tap-highlight min-h-[44px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              Filters
              {activeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sort — mobile (with appearance-none + custom chevron) */}
        <div className="sm:hidden max-w-7xl mx-auto px-4 pb-3">
          <label htmlFor="l-sort-m" className="sr-only">Sort listings</label>
          <div className="relative">
            <select id="l-sort-m" className="input text-sm appearance-none pr-8" value={sort}
              onChange={e => setF('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap items-center gap-2" role="list" aria-label="Active filters">
            {transaction && <Chip label={transaction === 'sale' ? 'For Sale' : 'For Rent'} onRemove={() => setF('transaction', '')} />}
            {county && <Chip label={`County: ${county}`} onRemove={() => setFMulti({ county: '', area: '' })} />}
            {area   && <Chip label={`Area: ${area}`}     onRemove={() => setF('area', '')} />}
            {type   && <Chip label={`Type: ${type}`}     onRemove={() => setF('type', '')} />}
            {bedrooms && <Chip label={`${bedrooms}+ beds`} onRemove={() => setF('bedrooms', '')} />}
            {(minPrice || maxPrice) && (
              <Chip label={`KES ${minPrice || '0'} – ${maxPrice || '∞'}`}
                onRemove={() => setFMulti({ minPrice: '', maxPrice: '' })} />
            )}
            {/* Save this search */}
            <button
              onClick={handleSaveSearch}
              disabled={savingSearch || searchSaved}
              aria-label="Save this search and get email alerts"
              className={`ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                searchSaved
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'border-primary/30 text-primary hover:bg-primary-pale hover:border-primary/50'
              } disabled:opacity-60`}
            >
              {searchSaved ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Saved
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                  {savingSearch ? 'Saving…' : 'Save Search'}
                </>
              )}
            </button>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* ── Sidebar desktop ──────────────────────────────── */}
        <aside className="hidden lg:block w-72 shrink-0" aria-label="Property filters">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <FilterPanel {...filterPanelProps} />
          </div>
        </aside>

        {/* ── Mobile filter drawer ─────────────────────────── */}
        {sidebarOpen && (
          <div id="mobile-filters" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Property filters">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-2xl p-5 overflow-y-auto flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <span className="font-semibold text-gray-900 text-lg">Filters</span>
                <button onClick={() => setSidebarOpen(false)} aria-label="Close filters"
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 tap-highlight">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <FilterPanel {...filterPanelProps} />
              </div>
              <button onClick={() => setSidebarOpen(false)} className="w-full btn-primary mt-5 py-3 rounded-xl text-base">
                {loading ? 'Loading…' : `View ${total.toLocaleString()} result${total !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* ── Main content ─────────────────────────────────── */}
        <main className="flex-1 min-w-0" aria-label="Property listings">

          {/* Map view */}
          {!loading && viewMode === 'map' && (
            <MapErrorBoundary>
              <Suspense fallback={<div className="h-[520px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">Loading map…</div>}>
                <MapView listings={listings} />
              </Suspense>
            </MapErrorBoundary>
          )}

          {/* Grid view */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" aria-busy="true">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : viewMode === 'grid' && listings.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4" role="img" aria-label="No results">🔍</div>
              <h2 className="font-display text-xl font-semibold text-gray-800 mb-2">No properties found</h2>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="btn-primary px-6 py-2.5 rounded-xl">Clear Filters</button>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map(l => <PropertyCard key={l.id} listing={l} />)}
              </div>
              {pages > 1 && (
                <nav className="flex justify-center gap-2 mt-8 flex-wrap" aria-label="Pagination">
                  <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 min-h-[44px]"
                    aria-label="Previous page">← Prev</button>
                  {[...Array(Math.min(pages, 7))].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                      aria-label={`Page ${i + 1}`} aria-current={page === i + 1 ? 'page' : undefined}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={page >= pages} onClick={() => setPage(page + 1)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 min-h-[44px]"
                    aria-label="Next page">Next →</button>
                </nav>
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-pale text-primary text-xs font-medium rounded-full" role="listitem">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`} className="hover:text-primary-dark font-bold leading-none ml-0.5">×</button>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}
