import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../data/locations';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&h=150&fit=crop';
const API_BASE    = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function RecentlyViewed({ currentId }) {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('maeva_recently_viewed') || '[]')
        .filter(id => id !== currentId)
        .slice(0, 6);
      if (!ids.length) return;

      Promise.all(
        ids.map(id =>
          fetch(`${API_BASE}/listings/${id}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      ).then(results => setListings(results.filter(Boolean)));
    } catch {}
  }, [currentId]);

  if (!listings.length) return null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Recently Viewed</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {listings.map(l => (
          <Link key={l.id} to={`/listings/${l.id}`}
            className="snap-start shrink-0 w-48 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <img src={l.images?.[0] || PLACEHOLDER} alt={l.title}
              className="w-full h-32 object-cover"
              loading="lazy"
              onError={e => { e.target.src = PLACEHOLDER; }} />
            <div className="p-2.5">
              <p className="text-xs font-semibold text-gray-900 line-clamp-1">{l.title}</p>
              <p className="text-xs text-primary font-bold mt-0.5">{formatPrice(l.price, l.price_period)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{l.area}, {l.county}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
