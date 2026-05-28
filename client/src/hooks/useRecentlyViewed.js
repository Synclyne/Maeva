import { useState, useCallback } from 'react';

const KEY = 'maeva_recently_viewed';
const MAX = 10;

export function useRecentlyViewed() {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  });

  const addListing = useCallback((listing) => {
    if (!listing?.id) return;
    setIds(prev => {
      const next = [listing.id, ...prev.filter(id => id !== listing.id)].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch {}
    setIds([]);
  }, []);

  return { ids, addListing, clear };
}
