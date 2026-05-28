import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

const CATEGORIES = [
  { id: 'General Inquiry',  icon: '💬', desc: 'General questions about Maeva' },
  { id: 'Listing Issue',    icon: '🏠', desc: 'Problems with a property listing' },
  { id: 'Account Problem',  icon: '👤', desc: 'Login, password, or account issues' },
  { id: 'Bug Report',       icon: '🐛', desc: 'Something isn\'t working correctly' },
  { id: 'Payment Issue',    icon: '💳', desc: 'Billing or subscription questions' },
  { id: 'Feature Request',  icon: '💡', desc: 'Suggest improvements or new features' },
];

const FAQ = [
  {
    q: 'How do I post a property listing?',
    a: 'Create a realtor account, then navigate to Post a Listing from the navigation menu. Fill in the property details and submit for review.',
  },
  {
    q: 'How do I reset my password?',
    a: 'Click "Sign In", then "Forgot password?" and enter your email address. You\'ll receive a reset link within a few minutes.',
  },
  {
    q: 'How do I contact an agent about a property?',
    a: 'Open any listing and use the enquiry form on the right side. Your message will be sent directly to the listing agent.',
  },
  {
    q: 'Can I save listings to view later?',
    a: 'Yes — sign in and click the heart icon on any listing to save it to your Wishlist. Access saved listings from the nav bar.',
  },
  {
    q: 'How do I get my listing featured on the homepage?',
    a: 'After posting your listing, contact support or the admin team to request a featured placement. Featured listings get significantly more visibility.',
  },
  {
    q: 'Is Maeva free to use?',
    a: 'Browsing and enquiring about properties is free for all users. Realtors can contact us about listing and featured placement plans.',
  },
];

export default function Support() {
  useSEO({ title: 'Support | Maeva Kenya', description: 'Get help with Maeva Kenya — contact support, browse FAQs, or submit a ticket.' });
  useEffect(() => window.scrollTo(0, 0), []);

  const { user } = useAuth();
  const toast    = useToast();

  const [category, setCategory] = useState('General Inquiry');
  const [form, setForm]         = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [ticketId, setTicketId]     = useState(null);
  const [openFaq, setOpenFaq]       = useState(null);

  // Pre-fill from logged-in user
  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, name: f.name || user.name || '', email: f.email || user.email || '' }));
    }
  }, [user]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/support', { ...form, category });
      setTicketId(data.id);
      setSubmitted(true);
      toast.success('Ticket submitted! We\'ll get back to you shortly.');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 has-bottom-nav">
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Back to Home
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">How can we help?</h1>
          <p className="text-gray-500">Browse FAQs or submit a support ticket. We respond within 24–48 hours.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left — FAQ + form */}
          <div className="lg:col-span-3 space-y-8">

            {/* FAQ */}
            <section>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {FAQ.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between text-left px-5 py-4 gap-3 hover:bg-gray-50/60 transition-colors"
                      aria-expanded={openFaq === i}
                    >
                      <span className="font-medium text-gray-900 text-sm leading-snug">{item.q}</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                        <p className="pt-3">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Submit ticket */}
            <section>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">Submit a Support Ticket</h2>
              <p className="text-sm text-gray-500 mb-5">Can't find your answer above? Send us a message and our team will respond shortly.</p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">Ticket #{ticketId} Submitted</h3>
                  <p className="text-sm text-gray-600 mb-5">
                    Thanks for reaching out! We'll respond to <strong>{form.email}</strong> within 24–48 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm(f => ({ ...f, subject: '', message: '' })); }}
                    className="btn-outline text-sm rounded-xl px-5 py-2.5"
                  >
                    Submit another ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

                  {/* Category picker */}
                  <div>
                    <label className="label mb-2">Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex flex-col items-start text-left p-3 rounded-xl border-2 transition-all text-sm ${
                            category === cat.id
                              ? 'border-primary bg-primary/5 text-gray-900'
                              : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                          }`}
                        >
                          <span className="text-lg mb-1">{cat.icon}</span>
                          <span className="font-medium leading-snug">{cat.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label" htmlFor="support-name">Your Name *</label>
                      <input
                        id="support-name"
                        name="name"
                        className="input"
                        placeholder="John Kamau"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="support-email">Email Address *</label>
                      <input
                        id="support-email"
                        name="email"
                        type="email"
                        className="input"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="label" htmlFor="support-subject">Subject *</label>
                    <input
                      id="support-subject"
                      name="subject"
                      className="input"
                      placeholder="Brief description of your issue"
                      value={form.subject}
                      onChange={handleChange}
                      maxLength={200}
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{form.subject.length}/200</p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="label" htmlFor="support-message">Message *</label>
                    <textarea
                      id="support-message"
                      name="message"
                      className="input min-h-[140px] resize-y"
                      placeholder="Please describe your issue in detail. Include any relevant listing IDs, error messages, or steps to reproduce the problem."
                      value={form.message}
                      onChange={handleChange}
                      maxLength={5000}
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/5000</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full rounded-xl py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting…
                      </span>
                    ) : (
                      'Send Message →'
                    )}
                  </button>
                </form>
              )}
            </section>
          </div>

          {/* Right — contact info + quick links */}
          <div className="lg:col-span-2 space-y-5">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-display font-semibold text-gray-900 mb-4">Contact Information</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Email Support</p>
                    <a href="mailto:support@maeva.co.ke" className="text-primary hover:underline">support@maeva.co.ke</a>
                    <p className="text-gray-400 text-xs mt-0.5">Response within 24–48 hours</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6m0-10v2"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Business Hours</p>
                    <p className="text-gray-600">Mon–Fri: 8am – 6pm EAT</p>
                    <p className="text-gray-400 text-xs mt-0.5">Saturday: 9am – 2pm EAT</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Office</p>
                    <p className="text-gray-600">Nairobi, Kenya</p>
                    <p className="text-gray-400 text-xs mt-0.5">maeva.co.ke</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-display font-semibold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                {[
                  ['Browse Properties',      '/listings'],
                  ['Post a Listing',          '/post-listing'],
                  ['Agency Directory',        '/agencies'],
                  ['Privacy Policy',          '/privacy'],
                ].map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-1">
                      <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For agents specifically */}
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Are you a real estate agent?</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                For listing management, featured placements, or agency profile help, include "Agent Query" in your subject line for priority handling.
              </p>
              <a href="mailto:agents@maeva.co.ke" className="text-primary text-sm font-medium hover:underline">
                agents@maeva.co.ke →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
