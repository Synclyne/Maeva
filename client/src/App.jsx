import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { CompareProvider } from './context/CompareContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CompareBar from './components/CompareBar';

/* ── Page chunks — loaded on demand, one chunk per route ─────────── */
const Home             = lazy(() => import('./pages/Home'));
const Listings         = lazy(() => import('./pages/Listings'));
const ListingDetail    = lazy(() => import('./pages/ListingDetail'));
const RealtorDashboard = lazy(() => import('./pages/RealtorDashboard'));
const PostListing      = lazy(() => import('./pages/PostListing'));
const Wishlist         = lazy(() => import('./pages/Wishlist'));
const AdminDashboard   = lazy(() => import('./pages/AdminDashboard'));
const RealtorProfile   = lazy(() => import('./pages/RealtorProfile'));
const AgenciesDirectory= lazy(() => import('./pages/AgenciesDirectory'));
const ResetPassword    = lazy(() => import('./pages/ResetPassword'));
const PrivacyPolicy    = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService   = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy     = lazy(() => import('./pages/CookiePolicy'));
const Support          = lazy(() => import('./pages/Support'));
const Compare          = lazy(() => import('./pages/Compare'));
const Blog             = lazy(() => import('./pages/Blog'));
const BlogPost         = lazy(() => import('./pages/BlogPost'));
const AreaGuide        = lazy(() => import('./pages/AreaGuide'));

/* ── Shared page-transition fallback ────────────────────────────── */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-label="Loading page" />
    </div>
  );
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-label="Loading" />
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  // Admin can access any protected route regardless of required role
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/* ── Scroll to top on route change ──────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

/* ── Global API error toasts ─────────────────────────────── */
function ErrorToastListener() {
  const toast = useToast();
  useEffect(() => {
    const handler = (e) => toast.error(e.detail.message, { title: 'Error' });
    window.addEventListener('maeva:api-error', handler);
    return () => window.removeEventListener('maeva:api-error', handler);
  }, [toast]);
  return null;
}

/* ── Bottom mobile navigation ────────────────────────────── */
function BottomNav() {
  const { user, wishlistIds, openAuth } = useAuth();
  const { pathname } = useLocation();

  const isActive = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-100 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      {/* Home */}
      <NavTab to="/" label="Home" active={isActive('/')}>
        <svg className="w-5 h-5" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </NavTab>

      {/* Browse */}
      <NavTab to="/listings" label="Browse" active={isActive('/listings')}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </NavTab>

      {/* Saved */}
      <NavTab to="/wishlist" label="Saved" active={isActive('/wishlist')} badge={user ? wishlistIds.length : 0}>
        <svg className="w-5 h-5" fill={isActive('/wishlist') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </NavTab>

      {/* 4th tab — context-aware */}
      {user?.role === 'realtor' ? (
        <NavTab to="/post-listing" label="Post" active={isActive('/post-listing')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v8M8 12h8"/>
          </svg>
        </NavTab>
      ) : user ? (
        <NavTab to="/wishlist" label="Account" active={false}>
          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold" aria-hidden="true">
            {user.name[0].toUpperCase()}
          </div>
        </NavTab>
      ) : (
        <button
          onClick={() => openAuth('login')}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 tap-highlight text-gray-400 min-h-[56px] py-2"
          aria-label="Sign in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span className="text-[10px] font-medium leading-none">Sign In</span>
        </button>
      )}
    </nav>
  );
}

function NavTab({ to, label, active, badge, children }) {
  return (
    <Link
      to={to}
      className={`flex-1 flex flex-col items-center justify-center gap-0.5 tap-highlight min-h-[56px] py-2 relative transition-colors ${active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <span className="relative">
        {children}
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </Link>
  );
}

/* ── App shell ───────────────────────────────────────────── */
function AppInner() {
  const { authModal, closeAuth } = useAuth();
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip to content — visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>
      <ScrollToTop />
      <ErrorToastListener />
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1} style={{ outline: 'none' }}>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                 element={<Home />} />
          <Route path="/listings"         element={<Listings />} />
          <Route path="/listings/:id"     element={<ListingDetail />} />
          <Route path="/agencies"         element={<AgenciesDirectory />} />
          <Route path="/realtors/:id"     element={<RealtorProfile />} />
          <Route path="/compare"          element={<Compare />} />
          <Route path="/blog"             element={<Blog />} />
          <Route path="/blog/:slug"       element={<BlogPost />} />
          <Route path="/area/:county"     element={<AreaGuide />} />
          <Route path="/reset-password"   element={<ResetPassword />} />
          <Route path="/privacy"          element={<PrivacyPolicy />} />
          <Route path="/terms"            element={<TermsOfService />} />
          <Route path="/cookies"          element={<CookiePolicy />} />
          <Route path="/support"          element={<Support />} />
          <Route path="*"                 element={<NotFound />} />
          <Route path="/wishlist"         element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/dashboard"        element={<ProtectedRoute role="realtor"><RealtorDashboard /></ProtectedRoute>} />
          <Route path="/post-listing"     element={<ProtectedRoute role="realtor"><PostListing /></ProtectedRoute>} />
          <Route path="/post-listing/:id" element={<ProtectedRoute role="realtor"><PostListing /></ProtectedRoute>} />
          <Route path="/admin"            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
      <CompareBar />
      {authModal.open && <AuthModal onClose={closeAuth} defaultTab={authModal.tab} />}
    </div>
  );
}

/* ── 404 page ────────────────────────────────────────────── */
function NotFound() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display font-semibold text-gray-200 mb-4 select-none">404</div>
        <h1 className="font-display text-2xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary rounded-xl px-6">Go Home</Link>
          <Link to="/listings" className="btn-outline rounded-xl px-6">Browse Listings</Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <LanguageProvider>
          <CompareProvider>
            <BrowserRouter>
              <AppInner />
            </BrowserRouter>
          </CompareProvider>
        </LanguageProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
