import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

export default function AuthModal({ onClose, defaultTab = 'login' }) {
  const { login, register } = useAuth();
  const toast = useToast();
  const [tab, setTab]         = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm]       = useState({ name:'', email:'', password:'', role:'client', phone:'', company:'' });
  const modalRef = useRef(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const switchTab = (t) => { setTab(t); setError(''); setSuccess(''); };

  /* ── Focus trap + Escape to close ─────────────────────── */
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Move focus into modal on open
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (tab === 'login') {
        const u = await login(form.email, form.password);
        toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
        onClose();
      } else if (tab === 'register') {
        const u = await register(form);
        toast.success(`Welcome to Maeva, ${u.name.split(' ')[0]}!`);
        onClose();
      } else if (tab === 'forgot') {
        await api.post('/auth/forgot-password', { email: form.email });
        setSuccess('If that email is registered, a reset link has been sent. Check your inbox (or the server console in dev mode).');
      }
    } catch (err) {
      setError(err.friendlyMessage || err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const errorId  = 'auth-form-error';
  const titleId  = 'auth-modal-title';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 overflow-y-auto max-h-[90vh]">

        {/* Close */}
        <button onClick={onClose} aria-label="Close sign-in dialog" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500" aria-keyshortcuts="Escape">✕</button>

        {/* Logo / heading */}
        <div className="flex items-center gap-2 mb-6">
          <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden="true"><rect width="34" height="34" rx="8" fill="#1D3F88"/><path d="M17 7L27 15V27H21V21H13V27H7V15L17 7Z" fill="white"/></svg>
          <span id={titleId} className="font-display text-xl font-semibold text-gray-900">
            {tab === 'login' ? 'Sign in to Maeva' : tab === 'register' ? 'Create your account' : 'Reset your password'}
          </span>
        </div>

        {/* Tab bar */}
        {tab !== 'forgot' && (
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1" role="tablist" aria-label="Sign in or register">
            {['login','register'].map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab===t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
        )}

        {/* Error / success */}
        {error   && <div id={errorId} role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
        {success && <div role="status" aria-live="polite" className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4" aria-label={tab === 'login' ? 'Sign in form' : tab === 'register' ? 'Registration form' : 'Password reset form'} noValidate>
            {tab === 'register' && (
              <>
                <div>
                  <label htmlFor="auth-name" className="label">Full Name</label>
                  <input
                    id="auth-name"
                    className="input"
                    placeholder="John Mwangi"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    required
                    autoComplete="name"
                    aria-describedby={error ? errorId : undefined}
                  />
                </div>
                <div>
                  <label className="label" id="role-label">I am a</label>
                  <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="role-label">
                    {['client','realtor'].map(r => (
                      <button
                        type="button"
                        key={r}
                        role="radio"
                        aria-checked={form.role === r}
                        onClick={() => set('role', r)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${form.role===r ? 'border-primary bg-primary-pale' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="text-xl mb-1" aria-hidden="true">{r === 'client' ? '🏡' : '🏢'}</div>
                        <div className="text-sm font-semibold capitalize">{r === 'client' ? 'Client' : 'Realtor'}</div>
                        <div className="text-xs text-gray-500">{r === 'client' ? 'Looking for property' : 'Listing property'}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {form.role === 'realtor' && (
                  <div>
                    <label htmlFor="auth-company" className="label">Company / Agency Name</label>
                    <input
                      id="auth-company"
                      className="input"
                      placeholder="e.g. Amani Properties Ltd"
                      value={form.company}
                      onChange={e => set('company', e.target.value)}
                      autoComplete="organization"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="auth-phone" className="label">Phone Number</label>
                  <input
                    id="auth-phone"
                    className="input"
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" className="label">Email Address</label>
              <input
                id="auth-email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
                autoComplete={tab === 'register' ? 'email' : 'username'}
                aria-describedby={error ? errorId : undefined}
              />
            </div>

            {tab !== 'forgot' && (
              <div>
                <label htmlFor="auth-password" className="label">
                  Password
                  {tab === 'register' && <span className="text-xs text-gray-400 font-normal ml-1">(min. 8 characters)</span>}
                </label>
                <input
                  id="auth-password"
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                  minLength={8}
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  aria-describedby={error ? errorId : undefined}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-semibold text-base disabled:opacity-60"
              aria-busy={loading}
            >
              {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : tab === 'register' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="mt-4 text-center text-sm text-gray-500 space-y-2">
          {tab === 'login' && (
            <>
              <p>
                {"Don't have an account? "}
                <button className="text-primary font-semibold hover:underline" onClick={() => switchTab('register')}>Register</button>
              </p>
              <p>
                <button className="text-gray-400 hover:text-primary text-xs" onClick={() => switchTab('forgot')}>Forgot password?</button>
              </p>
            </>
          )}
          {tab === 'register' && (
            <p>
              {'Already have an account? '}
              <button className="text-primary font-semibold hover:underline" onClick={() => switchTab('login')}>Sign In</button>
            </p>
          )}
          {(tab === 'forgot' || success) && (
            <button className="text-primary font-semibold hover:underline text-sm" onClick={() => switchTab('login')}>← Back to Sign In</button>
          )}
        </div>

        {tab === 'login' && !success && (
          <p className="mt-3 text-center text-xs text-gray-400">
            Demo: <span className="font-mono">agent@maeva.co.ke</span> · <span className="font-mono">admin@maeva.co.ke</span> / <span className="font-mono">password123</span>
          </p>
        )}
      </div>
    </div>
  );
}
