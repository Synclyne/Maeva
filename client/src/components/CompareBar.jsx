import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { formatPrice } from '../data/locations';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=80&h=60&fit=crop';

export default function CompareBar() {
  const { items, remove, clear, max } = useCompare();
  if (!items.length) return null;

  const slots = Array.from({ length: max });

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700 shrink-0 hidden sm:block">
          Compare ({items.length}/{max}):
        </span>

        <div className="flex gap-2 flex-1 overflow-x-auto">
          {slots.map((_, i) => {
            const listing = items[i];
            if (listing) {
              return (
                <div key={listing.id}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 shrink-0">
                  <img
                    src={listing.images?.[0] || PLACEHOLDER}
                    alt={listing.title}
                    className="w-10 h-8 object-cover rounded"
                    onError={e => { e.target.src = PLACEHOLDER; }}
                  />
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-[100px]">{listing.title}</p>
                    <p className="text-xs text-primary font-bold">{formatPrice(listing.price, listing.price_period)}</p>
                  </div>
                  <button
                    onClick={() => remove(listing.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                    title="Remove"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            }
            return (
              <div key={`empty-${i}`}
                className="flex items-center justify-center w-24 h-12 border-2 border-dashed border-gray-200 rounded-lg shrink-0">
                <span className="text-xs text-gray-400">+ Add</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={clear}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear
          </button>
          <Link
            to="/compare"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              items.length >= 2
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-200 text-gray-400 pointer-events-none'
            }`}
          >
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
}
