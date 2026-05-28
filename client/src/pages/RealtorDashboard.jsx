import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { useToast } from '../context/ToastContext';
import { formatPrice, timeAgo } from '../data/locations';
import api from '../lib/api';
import { PAID_FEATURES_ENABLED, FEATURED_PACKAGES } from '../config';
import MpesaPayment from '../components/MpesaPayment';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&h=150&fit=crop';
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=1A56DB&color=fff&size=128&name=';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const STATUS_BADGE = {
  active:   { label: 'Active',   cls: 'bg-gray-100 text-gray-600' },
  pending:  { label: 'Pending Review', cls: 'bg-amber-100 text-amber-700' },
  verified: { label: 'Verified', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-600' },
};

const LEAD_STATUS = {
  new:       { label: 'New',       cls: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'  },
  contacted: { label: 'Contacted', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  closed:    { label: 'Closed',    cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

/* ──────────────────────────────────────────────────────────── */
/*  Agency Profile tab                                          */
/* ──────────────────────────────────────────────────────────── */
function AgencyProfileTab({ user: authUser }) {
  const toast     = useToast();
  const fileRef   = useRef(null);

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [applying,  setApplying]  = useState(false);

  const [form, setForm] = useState({
    name: '', company: '', phone: '', agency_description: '',
  });

  const fetchProfile = useCallback(() => {
    setLoading(true);
    api.get('/agencies/my-profile')
      .then(r => {
        setProfile(r.data);
        setForm({
          name:               r.data.name               || '',
          company:            r.data.company             || '',
          phone:              r.data.phone               || '',
          agency_description: r.data.agency_description || '',
        });
      })
      .catch(() => toast.error('Could not load agency profile'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await api.patch('/agencies/profile', form);
      setProfile(p => ({ ...p, ...r.data }));
      toast.success('Profile saved successfully.');
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not save profile');
    } finally { setSaving(false); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('logo', file);
    setUploading(true);
    try {
      const r = await api.post('/agencies/upload-logo', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(p => ({ ...p, avatar: r.data.url }));
      toast.success('Logo updated!');
    } catch (e) {
      toast.error(e.friendlyMessage || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleApplyVerification = async () => {
    setApplying(true);
    try {
      const r = await api.post('/agencies/apply-verification');
      setProfile(p => ({ ...p, agency_status: 'pending' }));
      toast.success(r.data.message || 'Verification request submitted!');
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not submit verification request');
    } finally { setApplying(false); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const status     = profile?.agency_status || 'active';
  const statusInfo = STATUS_BADGE[status] || STATUS_BADGE.active;
  const logoSrc    = profile?.avatar
    ? (profile.avatar.startsWith('/uploads/') ? `http://localhost:5000${profile.avatar}` : profile.avatar)
    : `${AVATAR_PLACEHOLDER}${encodeURIComponent(form.name || 'Agency')}`;

  const canApply = status === 'active' || status === 'rejected';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Logo + status */}
      <div className="lg:col-span-1 space-y-6">
        {/* Logo card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="relative inline-block mb-4">
            <img src={logoSrc} alt="Agency logo"
              className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-md ring-1 ring-gray-200 mx-auto" />
            {status === 'verified' && (
              <span className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </span>
            )}
          </div>
          <h3 className="font-display font-semibold text-lg text-gray-900 mb-1">{form.company || form.name || 'Your Agency'}</h3>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.cls}`}>
            {status === 'verified' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            )}
            {statusInfo.label}
          </span>

          <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-4 w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Uploading…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg> Upload Logo</>
            )}
          </button>
        </div>

        {/* Verification card */}
        {status !== 'verified' && (
          <div className={`rounded-2xl border p-5 ${status === 'pending' ? 'bg-amber-50 border-amber-200' : status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <h4 className="font-semibold text-sm text-gray-800 mb-1">
              {status === 'pending' ? 'Verification Pending' : status === 'rejected' ? 'Verification Rejected' : 'Get Verified'}
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              {status === 'pending'
                ? 'Our team is reviewing your application. You\'ll be notified once it\'s approved.'
                : status === 'rejected'
                ? 'Your application was not approved. Update your profile and reapply.'
                : 'Verified agencies get a badge on their profile and listings, building trust with clients.'}
            </p>
            {canApply && (
              <button
                onClick={handleApplyVerification}
                disabled={applying || !form.company.trim() || !form.agency_description.trim()}
                title={!form.company.trim() || !form.agency_description.trim() ? 'Add company name and description first' : ''}
                className="w-full px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
                {applying ? 'Submitting…' : 'Apply for Verification'}
              </button>
            )}
            {canApply && (!form.company.trim() || !form.agency_description.trim()) && (
              <p className="text-[11px] text-gray-500 mt-1 text-center">Fill in company name + description to apply</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Edit form */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-display font-semibold text-lg text-gray-900 mb-6">Agency Details</h3>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company / Agency Name</label>
              <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="e.g. Sunrise Properties Ltd" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="+254 7XX XXX XXX" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Agency Description
              <span className="text-gray-400 font-normal ml-1">— tells clients who you are</span>
            </label>
            <textarea value={form.agency_description}
              onChange={e => setForm(p => ({ ...p, agency_description: e.target.value }))}
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              placeholder="Describe your agency, areas you cover, specialties, years of experience…" />
            <p className="text-xs text-gray-400 mt-1">{form.agency_description.length} characters</p>
          </div>

          {/* Read-only email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-gray-400 font-normal">(read-only)</span></label>
            <input value={profile?.email || authUser?.email || ''} readOnly
              className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="btn-primary px-8 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-2">
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
            ) : 'Save Changes'}
          </button>
          <button onClick={fetchProfile} disabled={saving || loading}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Discard
          </button>
          <Link to={`/agencies/${profile?.id}`} target="_blank"
            className="ml-auto text-sm text-primary hover:underline flex items-center gap-1">
            View Public Profile
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Main dashboard                                              */
/* ──────────────────────────────────────────────────────────── */
export default function RealtorDashboard() {
  useSEO({ title: 'My Dashboard' });
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();
  const [tab, setTab]           = useState('listings');
  const [listings, setListings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [unread, setUnread]     = useState(0);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(null);
  const [noteEditing, setNoteEditing] = useState(new Set());
  const [noteDrafts,  setNoteDrafts]  = useState({});
  const [viewings, setViewings] = useState([]);
  const [mpesaListing, setMpesaListing] = useState(null); // listing to boost

  const fetchListings = useCallback(() => {
    setLoading(true);
    api.get('/listings/mine').then(r => setListings(r.data)).finally(() => setLoading(false));
  }, []);

  const fetchEnquiries = useCallback(() => {
    api.get('/enquiries/mine').then(r => setEnquiries(r.data));
    api.get('/enquiries/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
  }, []);

  const fetchViewings = useCallback(() => {
    api.get('/viewings/mine').then(r => setViewings(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchListings(); fetchEnquiries(); fetchViewings(); }, [fetchListings, fetchEnquiries, fetchViewings]);

  const handleViewingStatus = async (id, status) => {
    try {
      await api.patch(`/viewings/${id}/status`, { status });
      setViewings(p => p.map(v => v.id === id ? { ...v, status } : v));
      toast.success(`Viewing ${status}.`);
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not update viewing');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing?')) return;
    setBusy(id + '-del');
    try {
      await api.delete(`/listings/${id}`);
      setListings(p => p.filter(l => l.id !== id));
      toast.success('Listing removed successfully.');
    } catch (e) {
      toast.error(e.friendlyMessage || 'Error deleting listing');
    } finally { setBusy(null); }
  };

  const handleRenew = async (id) => {
    setBusy(id + '-renew');
    try {
      await api.patch(`/listings/${id}/renew`);
      fetchListings();
      toast.success('Listing renewed successfully!');
    } catch (e) {
      toast.error(e.friendlyMessage || 'Error renewing listing');
    } finally { setBusy(null); }
  };

  const handleToggleEnquiries = async (id) => {
    setBusy(id + '-enq');
    try {
      const r = await api.patch(`/listings/${id}/toggle-enquiries`);
      setListings(p => p.map(l => l.id === id ? { ...l, accept_enquiries: r.data.accept_enquiries } : l));
      toast.info(r.data.accept_enquiries ? 'Enquiries enabled for this listing.' : 'Enquiries disabled for this listing.');
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not update enquiry settings');
    } finally { setBusy(null); }
  };

  const handleRequestFeature = async (id) => {
    setBusy(id + '-feat');
    try {
      await api.patch(`/listings/${id}/request-feature`);
      setListings(p => p.map(l => l.id === id ? { ...l, featured_requested: 1 } : l));
      toast.success('Feature request sent! Admin will review and approve shortly.');
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not send feature request');
    } finally { setBusy(null); }
  };

  const markRead = async (id) => {
    await api.patch(`/enquiries/${id}/read`).catch(() => {});
    setEnquiries(p => p.map(e => e.id === id ? { ...e, is_read: 1 } : e));
    setUnread(p => Math.max(0, p - 1));
  };

  const handleLeadStatus = async (id, status) => {
    try {
      await api.patch(`/enquiries/${id}/status`, { status });
      setEnquiries(p => p.map(e => e.id === id ? { ...e, lead_status: status, is_read: 1 } : e));
      setUnread(prev => {
        const enq = enquiries.find(e => e.id === id);
        return enq && !enq.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not update lead status');
    }
  };

  const toggleNotePanel = (id, currentNotes) => {
    setNoteEditing(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setNoteDrafts(p => ({ ...p, [id]: p[id] !== undefined ? p[id] : (currentNotes || '') }));
      }
      return next;
    });
  };

  const handleSaveNotes = async (id) => {
    const notes = noteDrafts[id] ?? '';
    setBusy(id + '-notes');
    try {
      await api.patch(`/enquiries/${id}/notes`, { notes });
      setEnquiries(p => p.map(e => e.id === id ? { ...e, notes } : e));
      toast.success('Notes saved');
      setNoteEditing(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not save notes');
    } finally { setBusy(null); }
  };

  const active     = listings.filter(l => l.is_active);
  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0);

  return (
    <div className="pt-16 min-h-screen bg-gray-50 has-bottom-nav">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p>
          </div>
          <Link to="/post-listing" className="btn-primary px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Post New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Listings', val: listings.length, icon: (
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
            )},
            { label: 'Active', val: active.length, icon: (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            )},
            { label: 'Total Views', val: totalViews.toLocaleString(), icon: (
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            )},
            { label: 'Enquiries', val: enquiries.length, badge: unread, icon: (
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-3.038-.475 9.043 9.043 0 01-5.455 1.728l.812-2.437A7.502 7.502 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
            )},
          ].map(({ label, val, badge, icon }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative flex items-start gap-3">
              <div className="p-2 rounded-xl bg-gray-50">{icon}</div>
              <div>
                <div className="font-display text-2xl font-semibold text-gray-900">{val}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
              {badge > 0 && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{badge}</span>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {[
            { id: 'listings',  label: 'My Listings' },
            { id: 'enquiries', label: `Enquiries${unread > 0 ? ` (${unread})` : ''}` },
            { id: 'viewings',  label: `Viewings${viewings.filter(v => v.status === 'pending').length > 0 ? ` (${viewings.filter(v => v.status === 'pending').length})` : ''}` },
            { id: 'agency',    label: 'Agency Profile' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={tab === t.id}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Listings tab ───────────────────────────────────── */}
        {tab === 'listings' && (
          loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"/></svg>
              <h3 className="font-display text-xl font-semibold text-gray-800 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">Post your first property and start reaching buyers and renters across Kenya.</p>
              <Link to="/post-listing" className="btn-primary px-6 py-2.5 rounded-xl inline-block">Post First Listing</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {listings.map(l => {
                      const days = daysUntil(l.expires_at);
                      const expiringSoon = days !== null && days <= 10 && days >= 0;
                      const expired = days !== null && days < 0;

                      return (
                        <div key={l.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md ${!l.is_active ? 'opacity-60' : 'border-gray-100'}`}>
                          {/* Image */}
                          <div className="relative">
                            <Link to={`/listings/${l.id}`}>
                              <img src={l.images?.[0] || PLACEHOLDER} alt={l.title}
                                className="w-full h-44 object-cover"
                                onError={e => { e.target.src = PLACEHOLDER; }} />
                            </Link>
                            {/* Status badges overlay */}
                            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                              {l.is_featured === 1 && <span className="badge bg-yellow-400 text-yellow-900 text-[10px]">Featured</span>}
                              {l.featured_requested === 1 && l.is_featured !== 1 && <span className="badge bg-purple-100 text-purple-700 text-[10px]">Pending Feature</span>}
                              <span className={`badge text-[10px] ${l.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{l.is_active ? 'Active' : 'Removed'}</span>
                            </div>
                            {/* Deal type chip */}
                            <div className="absolute top-2 right-2">
                              <span className="badge bg-white/90 text-gray-700 text-[10px] shadow-sm">{l.transaction === 'sale' ? 'For Sale' : 'For Rent'}</span>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{l.title}</h3>
                              <span className="badge bg-primary-pale text-primary text-[10px] shrink-0">{l.type}</span>
                            </div>
                            <p className="text-primary font-bold text-base mb-1">{formatPrice(l.price, l.price_period)}</p>
                            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                              {l.area}, {l.county}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                              <span>{l.views} views</span>
                              <span>·</span>
                              <span>{timeAgo(l.created_at)}</span>
                              {expiringSoon && <span className="text-orange-500 font-medium">Expires {days}d</span>}
                              {expired && <span className="text-red-500 font-medium">Expired</span>}
                              {l.accept_enquiries === 0 && <span className="text-orange-500">No Enquiries</span>}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-gray-50 flex-wrap">
                              <Link to={`/listings/${l.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-pale transition-colors" title="View">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </Link>
                              <Link to={`/post-listing/${l.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Edit">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              </Link>
                              <button onClick={() => handleToggleEnquiries(l.id)} disabled={busy === l.id + '-enq'}
                                title={l.accept_enquiries === 0 ? 'Enable enquiries' : 'Disable enquiries'}
                                className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${l.accept_enquiries === 0 ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                </svg>
                              </button>
                              {!l.is_featured && !l.featured_requested && (
                                <button onClick={() => setMpesaListing(l)}
                                  title="Boost this listing with M-Pesa" className="px-2 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium whitespace-nowrap flex items-center gap-1">
                                  <span className="font-bold">M</span> Boost
                                </button>
                              )}
                              {(expiringSoon || expired) && (
                                <button onClick={() => handleRenew(l.id)} disabled={busy === l.id + '-renew'}
                                  className="px-2 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium disabled:opacity-40 whitespace-nowrap" title="Renew for 90 days">
                                  {busy === l.id + '-renew' ? '…' : 'Renew'}
                                </button>
                              )}
                              <button onClick={() => handleDelete(l.id)} disabled={busy === l.id + '-del'}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40" title="Delete">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
            </div>
          )
        )}

        {/* ── Enquiries tab ──────────────────────────────────── */}
        {tab === 'enquiries' && (
          enquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-3.038-.475 9.043 9.043 0 01-5.455 1.728l.812-2.437A7.502 7.502 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
              <h3 className="font-display text-xl font-semibold text-gray-800 mb-2">No enquiries yet</h3>
              <p className="text-gray-500">When buyers contact you, their messages will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enquiries.map(enq => {
                const leadInfo  = LEAD_STATUS[enq.lead_status || 'new'] || LEAD_STATUS.new;
                const isNoteOpen = noteEditing.has(enq.id);
                const draft = noteDrafts[enq.id] ?? (enq.notes || '');

                return (
                  <div key={enq.id}
                    className={`bg-white rounded-2xl border shadow-sm transition-colors ${!enq.is_read ? 'border-primary/30 bg-primary-pale/10' : 'border-gray-100'}`}>

                    {/* ── Card header ── */}
                    <div className="p-5 cursor-pointer" onClick={() => !enq.is_read && markRead(enq.id)}>
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="font-semibold text-gray-900">{enq.sender_name}</span>
                          {!enq.is_read && (
                            <span className="ml-2 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-medium">NEW</span>
                          )}
                          <div className="text-sm text-gray-500 mt-0.5">
                            <a href={`mailto:${enq.sender_email}`} className="hover:text-primary" onClick={e => e.stopPropagation()}>{enq.sender_email}</a>
                            {enq.sender_phone && (
                              <span> · <a href={`tel:${enq.sender_phone}`} className="hover:text-primary" onClick={e => e.stopPropagation()}>{enq.sender_phone}</a></span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Current lead status badge */}
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${leadInfo.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${leadInfo.dot}`} />
                            {leadInfo.label}
                          </span>
                          <div className="text-xs text-gray-400">{timeAgo(enq.created_at)}</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl mb-2">"{enq.message}"</p>

                      <div className="text-xs text-gray-400">
                        Re: <Link to={`/listings/${enq.listing_id}`} className="text-primary hover:underline" onClick={ev => ev.stopPropagation()}>
                          {enq.listing_title}
                        </Link>
                        {' '}&mdash; {enq.area}, {enq.county}
                      </div>
                    </div>

                    {/* ── Lead pipeline actions ── */}
                    <div className="px-5 pb-4 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-3">
                      <span className="text-xs font-medium text-gray-400 mr-1">Move to:</span>
                      {Object.entries(LEAD_STATUS).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => handleLeadStatus(enq.id, key)}
                          disabled={(enq.lead_status || 'new') === key}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all disabled:cursor-default ${
                            (enq.lead_status || 'new') === key
                              ? `${cfg.cls} border-transparent`
                              : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </button>
                      ))}

                      {/* Quick-reply links */}
                      <div className="ml-auto flex items-center gap-2 shrink-0">
                        <a href={`mailto:${enq.sender_email}`}
                          className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          Reply
                        </a>
                        {enq.sender_phone && (
                          <a href={`https://wa.me/${enq.sender_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:underline font-medium flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => toggleNotePanel(enq.id, enq.notes)}
                          className={`text-xs font-medium flex items-center gap-1 transition-colors ${isNoteOpen ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          Notes{enq.notes ? ' ✓' : ''}
                        </button>
                      </div>
                    </div>

                    {/* ── Notes panel ── */}
                    {isNoteOpen && (
                      <div className="px-5 pb-5 border-t border-gray-50 pt-3">
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Internal notes (only you can see this)</label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                          placeholder="e.g. Scheduled a call for Friday, interested in 3-bed…"
                          value={draft}
                          onChange={ev => setNoteDrafts(p => ({ ...p, [enq.id]: ev.target.value }))}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleSaveNotes(enq.id)}
                            disabled={busy === enq.id + '-notes'}
                            className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {busy === enq.id + '-notes' ? 'Saving…' : 'Save Notes'}
                          </button>
                          <button
                            onClick={() => toggleNotePanel(enq.id, enq.notes)}
                            className="px-4 py-1.5 border border-gray-200 text-xs font-medium rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── Agency Profile tab ─────────────────────────────── */}
        {tab === 'agency' && <AgencyProfileTab user={user} />}

        {/* ── Viewings tab ──────────────────────────────────── */}
        {tab === 'viewings' && (
          viewings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="font-display text-xl font-semibold text-gray-800 mb-2">No viewing requests yet</h3>
              <p className="text-gray-500">When buyers request viewings, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {viewings.map(v => (
                <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{v.viewer_name}</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        <a href={`mailto:${v.viewer_email}`} className="hover:text-primary">{v.viewer_email}</a>
                        {v.viewer_phone && <span> · {v.viewer_phone}</span>}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      v.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      v.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-700'
                    }`}>{v.status.charAt(0).toUpperCase() + v.status.slice(1)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-3">
                    <div>
                      <span className="text-gray-400 text-xs">Date</span>
                      <div className="font-medium">{new Date(v.preferred_date).toLocaleDateString('en-KE', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Time</span>
                      <div className="font-medium">{v.preferred_time}</div>
                    </div>
                    {v.listing_title && (
                      <div className="min-w-0">
                        <span className="text-gray-400 text-xs">Listing</span>
                        <div className="font-medium truncate">{v.listing_title}</div>
                      </div>
                    )}
                  </div>
                  {v.message && <p className="text-sm text-gray-500 mb-3 italic">"{v.message}"</p>}
                  {v.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleViewingStatus(v.id, 'confirmed')}
                        className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">
                        Confirm
                      </button>
                      <button onClick={() => handleViewingStatus(v.id, 'cancelled')}
                        className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

      </div>

      {/* M-Pesa payment modal */}
      {mpesaListing && (
        <MpesaPayment
          listingId={mpesaListing.id}
          onClose={() => setMpesaListing(null)}
          onSuccess={(pkg) => {
            setListings(p => p.map(l => l.id === mpesaListing.id
              ? { ...l, is_featured: 1, badge: pkg.badge || 'Featured' }
              : l
            ));
            setMpesaListing(null);
          }}
        />
      )}
    </div>
  );
}
