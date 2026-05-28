import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { formatPrice } from '../data/locations';
import { useSEO } from '../hooks/useSEO';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop';

const ROW_DEFS = [
  { label: 'Price',      render: l => formatPrice(l.price, l.price_period) },
  { label: 'Type',       render: l => l.listing_type },
  { label: 'Category',   render: l => l.property_type },
  { label: 'Bedrooms',   render: l => l.bedrooms ?? '—' },
  { label: 'Bathrooms',  render: l => l.bathrooms ?? '—' },
  { label: 'Size',       render: l => l.size_sqft ? `${l.size_sqft.toLocaleString()} sq ft` : '—' },
  { label: 'County',     render: l => l.county },
  { label: 'Area',       render: l => l.area },
  { label: 'Furnished',  render: l => l.is_furnished ? 'Yes' : 'No' },
  { label: 'Status',     render: l => l.status || 'Available' },
  { label: 'Title Deed', render: l => l.title_deed_number || '—' },
];

export default function Compare() {
  useSEO({ title: 'Compare Properties | Maeva Kenya' });
  const { items, remove, clear } = useCompare();

  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">⚖️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">No properties to compare</h1>
        <p className="text-gray-500 mb-6">Add up to 3 properties from listings to compare them side by side.</p>
        <Link to="/listings" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Property Comparison</h1>
            <p className="text-gray-500 text-sm mt-1">Comparing {items.length} propert{items.length === 1 ? 'y' : 'ies'}</p>
          </div>
          <button onClick={clear} className="text-sm text-red-500 hover:text-red-700 font-medium">
            Clear All
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl shadow-sm">
          <table className="w-full bg-white border-collapse">
            {/* Property headers */}
            <thead>
              <tr>
                <th className="w-36 p-4 bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Feature
                </th>
                {items.map(listing => (
                  <th key={listing.id} className="p-4 border-b border-gray-100 bg-white min-w-[220px]">
                    <div className="relative">
                      <button
                        onClick={() => remove(listing.id)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors text-xs"
                        title="Remove"
                      >
                        ✕
                      </button>
                      <Link to={`/listings/${listing.id}`}>
                        <img
                          src={listing.images?.[0] || PLACEHOLDER}
                          alt={listing.title}
                          className="w-full h-36 object-cover rounded-xl mb-3"
                          onError={e => { e.target.src = PLACEHOLDER; }}
                        />
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-primary transition-colors">
                          {listing.title}
                        </p>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Comparison rows */}
            <tbody>
              {ROW_DEFS.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100">
                    {row.label}
                  </td>
                  {items.map(listing => (
                    <td key={listing.id} className="p-4 text-sm text-gray-800 border-r border-gray-100 last:border-r-0">
                      {String(row.render(listing))}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Features row */}
              <tr className="bg-gray-50">
                <td className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100">
                  Features
                </td>
                {items.map(listing => (
                  <td key={listing.id} className="p-4 border-r border-gray-100 last:border-r-0">
                    {listing.amenities?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {listing.amenities.slice(0, 6).map(a => (
                          <span key={a} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {a}
                          </span>
                        ))}
                        {listing.amenities.length > 6 && (
                          <span className="text-[10px] text-gray-400">+{listing.amenities.length - 6} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Action row */}
              <tr className="bg-white">
                <td className="p-4 border-r border-gray-100" />
                {items.map(listing => (
                  <td key={listing.id} className="p-4 border-r border-gray-100 last:border-r-0">
                    <Link
                      to={`/listings/${listing.id}`}
                      className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      View Listing
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
