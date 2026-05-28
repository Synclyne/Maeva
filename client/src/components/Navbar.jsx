import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout, wishlistIds, openAuth } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled || !isHome ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <svg width="32" height="32" viewBox="0 0 34 34" fill="none"><rect width="34" height="34" rx="8" fill="#1D3F88"/><path d="M17 7L27 15V27H21V21H13V27H7V15L17 7Z" fill="white"/></svg>
              <span className={`font-display text-xl font-semibold ${scrolled || !isHome ? 'text-gray-900' : 'text-white'}`}>Maeva</span>
            </Link>

            {/* Nav links desktop */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {[
                { label: 'Buy', to: '/listings?transaction=sale' },
                { label: 'Rent', to: '/listings?transaction=rent' },
                { label: 'Commercial', to: '/listings?type=commercial' },
                { label: 'Land', to: '/listings?type=land' },
                { label: 'Agencies', to: '/agencies' },
                { label: 'Blog', to: '/blog' },
              ].map(({ label, to }) => (
                <Link key={label} to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${scrolled || !isHome ? 'text-gray-600 hover:text-primary hover:bg-primary-pale' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                title={lang === 'en' ? 'Switch to Swahili' : 'Switch to English'}
                className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${scrolled || !isHome ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                🌐 {lang === 'en' ? 'SW' : 'EN'}
              </button>
              {user ? (
                <>
                  {/* Wishlist */}
                  <Link to="/wishlist" className={`relative p-2 rounded-lg transition-colors ${scrolled || !isHome ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    {wishlistIds.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-kenya-red text-white text-[10px] rounded-full flex items-center justify-center font-bold">{wishlistIds.length}</span>
                    )}
                  </Link>

                  {/* User menu */}
                  <div className="relative" ref={menuRef}>
                    <button onClick={() => setUserMenu(p => !p)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${scrolled || !isHome ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {user.name[0].toUpperCase()}
                      </div>
                      <span className="hidden sm:block max-w-[120px] truncate">{user.name}</span>
                      <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    </button>

                    {userMenu && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 text-sm">
                        <div className="px-4 py-2.5 border-b border-gray-100">
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                        </div>
                        {user.role === 'admin' && (
                          <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-red-600 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
                            Admin Panel
                          </Link>
                        )}
                        {user.role === 'realtor' && (
                          <>
                            <Link to="/dashboard" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                              My Listings
                            </Link>
                            <Link to="/post-listing" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                              Post a Listing
                            </Link>
                          </>
                        )}
                        <Link to="/wishlist" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                          Saved Properties
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={() => { logout(); setUserMenu(false); navigate('/'); }}
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-red-600 w-full text-left">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => openAuth('login')}
                    className={`hidden sm:block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${scrolled || !isHome ? 'text-gray-600 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'}`}>
                    Sign In
                  </button>
                  <button onClick={() => openAuth('register')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${scrolled || !isHome ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-white text-primary hover:bg-white/90'}`}>
                    Register
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button className={`md:hidden p-2 rounded-lg ${scrolled || !isHome ? 'text-gray-600' : 'text-white'}`} onClick={() => setMobileOpen(p => !p)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            {[
              { label: 'Buy', to: '/listings?transaction=sale' },
              { label: 'Rent', to: '/listings?transaction=rent' },
              { label: 'Commercial', to: '/listings?type=commercial' },
              { label: 'Land', to: '/listings?type=land' },
              { label: 'Agencies', to: '/agencies' },
              { label: 'Blog', to: '/blog' },
            ].map(({ label, to }) => (
              <Link key={label} to={to} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{label}</Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <button onClick={toggleLang}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 w-full">
                🌐 {lang === 'en' ? 'Switch to Swahili (SW)' : 'Switch to English (EN)'}
              </button>
            </div>
            {!user && (
              <div className="flex gap-2 pt-2">
                <button onClick={() => openAuth('login')} className="flex-1 btn-outline py-2 rounded-lg text-sm">Sign In</button>
                <button onClick={() => openAuth('register')} className="flex-1 btn-primary py-2 rounded-lg text-sm">Register</button>
              </div>
            )}
          </div>
        )}
      </nav>

    </>
  );
}
