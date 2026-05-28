import { createContext, useContext, useState, useCallback } from 'react';

const CompareCtx = createContext(null);
const MAX = 3;

export function CompareProvider({ children }) {
  const [items, setItems] = useState([]);

  const toggle = useCallback((listing) => {
    setItems(prev => {
      if (prev.find(l => l.id === listing.id)) {
        return prev.filter(l => l.id !== listing.id);
      }
      if (prev.length >= MAX) return prev; // silently ignore when full
      return [...prev, listing];
    });
  }, []);

  const remove = useCallback((id) => setItems(p => p.filter(l => l.id !== id)), []);
  const clear  = useCallback(() => setItems([]), []);
  const has    = useCallback((id) => items.some(l => l.id === id), [items]);

  return (
    <CompareCtx.Provider value={{ items, toggle, remove, clear, has, max: MAX }}>
      {children}
    </CompareCtx.Provider>
  );
}

export const useCompare = () => useContext(CompareCtx);
