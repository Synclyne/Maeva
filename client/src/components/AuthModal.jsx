import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  const [form, setForm]       = useState({ name:'', email:'', password:'', role:'client', phone:'', company:'', dob:'' });
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedAge,   setAgreedAge]   = useState(false);
  const modalRef = useRef(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const switchTab = (t) => { setTab(t); setError(''); setSuccess(''); setAgreedTerms(false); setAgreedAge(false); };

  /* ── Age helpers ─────────────────────────────────────────── */
  const calcAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };
  const dobAge         = calcAge(form.dob);
  const dobTooYoung    = form.role === 'realtor' && form.dob && dobAge !== null && dobAge < 18;
  const dobMaxDate     = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];
  const dobMinDate     = '1900-01-01';

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
                  <>
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

                    {/* Date of birth — required for agents, not stored after verification */}
                    <div>
                      <label htmlFor="auth-dob" className="label">
                        Date of Birth
                        <span className="text-xs text-gray-400 font-normal ml-1">(required for agents — not stored)</span>
                      </label>
                      <input
                        id="auth-dob"
                        className={`input ${dobTooYoung ? 'border-red-400 focus:ring-red-400' : ''}`}
                        type="date"
                        value={form.dob}
                        onChange={e => set('dob', e.target.value)}
                        max={dobMaxDate}
                        min={dobMinDate}
                        required
                        aria-describedby={dobTooYoung ? 'dob-error' : undefined}
                      />
                      {dobTooYoung && (
                        <p id="dob-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                          You must be 18 or older to register as an agent on Maeva.
                        </p>
                      )}
                      {form.dob && !dobTooYoung && dobAge !== null && (
                        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                          Age verified — you meet the 18+ requirement.
                        </p>
                      )}
                    </div>
                  </>
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

            {/* Legal consent — registration only */}
            {tab === 'register' && (
              <div className="space-y-3 py-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary accent-primary flex-shrink-0"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I have read and agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-primary hover:underline font-medium">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" target="_blank" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                    . I understand that Maeva does not provide financial or legal advice.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="agree-age"
                    checked={agreedAge}
                    onChange={e => setAgreedAge(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary accent-primary flex-shrink-0"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I confirm that I am <strong>18 years of age or older</strong>. Maeva is not available to persons under 18.
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (tab === 'register' && (!agreedTerms || !agreedAge || dobTooYoung || (form.role === 'realtor' && !form.dob)))}
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
