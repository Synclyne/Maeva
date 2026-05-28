import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });

  const openAuth  = (tab = 'login') => setAuthModal({ open: true,  tab });
  const closeAuth = ()               => setAuthModal(p => ({ ...p, open: false }));

  const fetchWishlist = useCallback(async () => {
    try {
      const { data } = await api.get('/wishlist/ids');
      setWishlistIds(data);
    } catch { /* not logged in */ }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(({ data }) => { setUser(data); fetchWishlist(); })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, [fetchWishlist]);

  // Handle session expiry fired by api.js interceptor
  useEffect(() => {
    const handle = () => { setUser(null); setWishlistIds([]); openAuth('login'); };
    window.addEventListener('maeva:session-expired', handle);
    return () => window.removeEventListener('maeva:session-expired', handle);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    fetchWishlist();
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setWishlistIds([]);
  };

  const toggleWishlist = async (listingId) => {
    if (!user) return false;
    const isIn = wishlistIds.includes(listingId);
    try {
      if (isIn) {
        await api.delete(`/wishlist/${listingId}`);
        setWishlistIds(p => p.filter(id => id !== listingId));
      } else {
        await api.post(`/wishlist/${listingId}`);
        setWishlistIds(p => [...p, listingId]);
      }
      return true;
    } catch { return false; }
  };

  return (
    <AuthContext.Provider value={{ user, loading, wishlistIds, login, register, logout, toggleWishlist, fetchWishlist, authModal, openAuth, closeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
