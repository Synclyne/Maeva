import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../data/translations';

const LanguageCtx = createContext(null);
const STORAGE_KEY = 'maeva_language';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'en'; }
    catch { return 'en'; }
  });

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'sw' : 'en';
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  const t = useCallback((key) => {
    return translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
  }, [lang]);

  return (
    <LanguageCtx.Provider value={{ lang, toggleLang, t, isSw: lang === 'sw' }}>
      {children}
    </LanguageCtx.Provider>
  );
}

export const useLanguage = () => useContext(LanguageCtx);
