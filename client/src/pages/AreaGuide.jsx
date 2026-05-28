import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { kenyanLocations, countyCoordinates, formatPrice } from '../data/locations';
import api from '../lib/api';

const AREA_INFO = {
  Nairobi: {
    description: 'Kenya\'s vibrant capital city — a hub of commerce, culture, and some of the country\'s most sought-after real estate. From the leafy suburbs of Karen and Muthaiga to the bustling urban centres of Westlands and Kilimani, Nairobi offers something for every lifestyle and budget.',
    highlights: ['World-class infrastructure', 'Thriving tech & business hub', 'Diverse neighbourhoods', 'Nairobi National Park on the doorstep'],
    avgSale: '12,000,000',
    avgRent: '55,000',
    schools: ['Braeburn Schools', 'Aga Khan Academy', 'Brookhouse School'],
    hospitals: ['Aga Khan University Hospital', 'Nairobi Hospital', 'MP Shah Hospital'],
    image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&h=400&fit=crop',
  },
  Mombasa: {
    description: 'Kenya\'s coastal gem — a city where history, culture, and ocean breezes converge. Mombasa blends centuries of Swahili heritage with modern amenities, offering beachfront living, strong rental yields, and a relaxed pace of life.',
    highlights: ['Beautiful Indian Ocean beaches', 'Strong tourism-driven rental market', 'Rich cultural heritage', 'Port-driven economy'],
    avgSale: '8,500,000',
    avgRent: '35,000',
    schools: ['Aga Khan Academy Mombasa', 'Light Academy', 'Coast Academy'],
    hospitals: ['Coast General Hospital', 'Pandya Memorial Hospital', 'Mombasa Hospital'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
  },
  Kisumu: {
    description: 'Kenya\'s lakeside city on the shores of Lake Victoria — a fast-growing commercial centre and increasingly popular real estate market. Kisumu offers affordable prices, a university population, and improving infrastructure.',
    highlights: ['Lake Victoria lifestyle', 'Affordable prices vs Nairobi', 'Growing university population', 'Kisumu International Airport'],
    avgSale: '5,500,000',
    avgRent: '22,000',
    schools: ['Maseno University area schools', 'St. Albert\'s', 'Kisumu Day School'],
    hospitals: ['Jaramogi Oginga Odinga Teaching Hospital', 'Aga Khan Hospital Kisumu'],
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=400&fit=crop',
  },
  Nakuru: {
    description: 'The Rift Valley\'s largest city — a property investment hotspot with high rental yields and affordable prices. Nakuru is Kenya\'s fourth-largest city with a diverse economy spanning agriculture, industry, and tourism.',
    highlights: ['Lake Nakuru National Park', 'High rental yields (9%+)', 'Affordable land prices', 'Strong agricultural economy'],
    avgSale: '4,200,000',
    avgRent: '18,000',
    schools: ['Upper Hill School Nakuru', 'Nakuru High School', 'Greensteds International School'],
    hospitals: ['Nakuru Level 5 Hospital', 'Nakuru War Memorial Hospital'],
    image: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&h=400&fit=crop',
  },
  Kiambu: {
    description: 'Nairobi\'s most popular satellite county — home to Thika, Ruiru, Kiambu Town, and the lush Limuru highlands. Kiambu offers Nairobi proximity with more space and affordability.',
    highlights: ['Quick Nairobi access', 'Thika Superhighway corridor', 'Tea and coffee country', 'Growing suburbs'],
    avgSale: '7,000,000',
    avgRent: '28,000',
    schools: ['Limuru Girls', 'Thika High School', 'Juja preparatory'],
    hospitals: ['Thika Level 5 Hospital', 'Kiambu County Referral Hospital'],
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=400&fit=crop',
  },
};

const DEFAULT_INFO = {
  description: 'A growing real estate market offering a range of residential and commercial properties. Discover listings across this county and find your ideal property.',
  highlights: ['Growing infrastructure', 'Affordable prices', 'Strong community', 'Future development potential'],
  avgSale: '3,500,000',
  avgRent: '15,000',
  schools: [],
  hospitals: [],
  image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=400&fit=crop',
};

export default function AreaGuide() {
  const { county } = useParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const decodedCounty = decodeURIComponent(county || '');
  const areas = kenyanLocations[decodedCounty] || [];
  const info  = AREA_INFO[decodedCounty] || DEFAULT_INFO;
  const coords = countyCoordinates[decodedCounty];

  useSEO({
    title: `${decodedCounty} Real Estate Guide | Maeva Kenya`,
    description: `Explore properties for sale and rent in ${decodedCounty}, Kenya. ${info.description.slice(0, 130)}`,
    image: info.image,
  });

  useEffect(() => {
    setLoading(true);
    api.get('/listings', { params: { county: decodedCounty, limit: 6 } })
      .then(r => setListings(r.data.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [decodedCounty]);

  if (!areas.length) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-5xl mb-4">🗺️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">County not found</h1>
          <Link to="/listings" className="text-primary hover:underline">Browse all listings →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <img src={info.image} alt={decodedCounty} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <p className="text-white/70 text-sm mb-1">Area Guide</p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white">{decodedCounty} County</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-3">About {decodedCounty}</h2>
              <p className="text-gray-600 leading-relaxed">{info.description}</p>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {info.highlights.map(h => (
                  <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Areas in {decodedCounty}</h2>
              <div className="flex flex-wrap gap-2">
                {areas.map(area => (
                  <Link
                    key={area}
                    to={`/listings?county=${encodeURIComponent(decodedCounty)}&area=${encodeURIComponent(area)}`}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-all"
                  >
                    {area}
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent listings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-gray-900">Latest Listings in {decodedCounty}</h2>
                <Link to={`/listings?county=${encodeURIComponent(decodedCounty)}`} className="text-sm text-primary hover:underline">
                  View all →
                </Link>
              </div>
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : listings.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                  <p className="text-gray-500">No listings found in {decodedCounty} yet.</p>
                  <Link to="/listings" className="text-primary hover:underline text-sm mt-2 inline-block">Browse all listings</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listings.map(l => (
                    <Link key={l.id} to={`/listings/${l.id}`}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex">
                      <img
                        src={l.images?.[0] || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&h=150&fit=crop'}
                        alt={l.title}
                        className="w-24 h-full object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                        style={{ minHeight: '80px' }}
                      />
                      <div className="p-3 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">{l.area}</p>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">{l.title}</p>
                        <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(l.price, l.price_period)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — stats sidebar */}
          <div className="space-y-5 lg:self-start lg:sticky lg:top-24">
            {/* Price stats */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Typical Prices</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="text-xs text-gray-600">Avg. Sale Price</span>
                  <span className="font-bold text-blue-700 text-sm">KES {parseInt(info.avgSale).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <span className="text-xs text-gray-600">Avg. Monthly Rent</span>
                  <span className="font-bold text-green-700 text-sm">KES {parseInt(info.avgRent).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Schools */}
            {info.schools?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">🏫 Notable Schools</h3>
                <ul className="space-y-1.5">
                  {info.schools.map(s => (
                    <li key={s} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hospitals */}
            {info.hospitals?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">🏥 Healthcare</h3>
                <ul className="space-y-1.5">
                  {info.hospitals.map(h => (
                    <li key={h} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Browse by area CTA */}
            <Link to={`/listings?county=${encodeURIComponent(decodedCounty)}`}
              className="block w-full text-center px-4 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm">
              Browse All {decodedCounty} Listings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
