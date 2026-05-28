import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import api from '../lib/api';

export default function ResetPassword() {
  useSEO({ title: 'Reset Password' });
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="font-display text-xl font-semibold text-gray-900 mb-2">Invalid Link</h1>
        <p className="text-gray-500 text-sm mb-6">This password reset link is missing or malformed. Please request a new one.</p>
        <Link to="/" className="btn-primary px-6 py-2.5 rounded-xl text-sm">Back to Home</Link>
      </div>
    </div>
  );

  if (done) return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="font-display text-xl font-semibold text-gray-900 mb-2">Password Updated</h1>
        <p className="text-gray-500 text-sm mb-6">Your password has been changed. You can now sign in with your new password.</p>
        <Link to="/" className="btn-primary px-6 py-2.5 rounded-xl text-sm">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-2 mb-6">
          <svg width="32" height="32" viewBox="0 0 34 34" fill="none"><rect width="34" height="34" rx="8" fill="#1D3F88"/><path d="M17 7L27 15V27H21V21H13V27H7V15L17 7Z" fill="white"/></svg>
          <span className="font-display text-xl font-semibold text-gray-900">Maeva</span>
        </div>

        <h1 className="font-display text-2xl font-semibold text-gray-900 mb-1">Set New Password</h1>
        <p className="text-gray-500 text-sm mb-6">Choose a strong password — at least 6 characters.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input" type="password" placeholder="••••••••" value={confirm}
              onChange={e => setConfirm(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-xl font-semibold disabled:opacity-60">
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Remember it? <Link to="/" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
