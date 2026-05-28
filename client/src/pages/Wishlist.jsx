import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import api from '../lib/api';

export default function Wishlist() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(r => setListings(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-gray-900">Saved Properties</h1>
          <p className="text-gray-500 mt-1">{listings.length} propert{listings.length !== 1 ? 'ies' : 'y'} saved</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="font-display text-xl font-semibold text-gray-800 mb-2">No saved properties yet</h3>
            <p className="text-gray-500 mb-6">Browse listings and tap the heart icon to save properties you love.</p>
            <Link to="/listings" className="btn-primary px-6 py-2.5 rounded-xl inline-block">Browse Properties</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map(l => <PropertyCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
