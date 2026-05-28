/**
 * Email service — uses nodemailer when SMTP env vars are set,
 * otherwise logs the message to console (development fallback).
 *
 * Required env vars for real emails:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional:
 *   SMTP_FROM  (defaults to "Maeva Kenya <noreply@maeva.co.ke>")
 *   APP_URL    (defaults to http://localhost:3000)
 */
const nodemailer = require('nodemailer');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const FROM    = process.env.SMTP_FROM || 'Maeva Kenya <noreply@maeva.co.ke>';

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendMail({ to, subject, html, text }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('\n📧  EMAIL (SMTP not configured — showing in console)');
    console.log('   To     :', to);
    console.log('   Subject:', subject);
    console.log('   Body   :', (text || html.replace(/<[^>]+>/g, ' ')).trim().slice(0, 400));
    console.log('');
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html, text });
}

/* ── Pre-built email templates ──────────────────────────── */

async function sendPasswordReset(to, token) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await sendMail({
    to,
    subject: 'Reset your Maeva password',
    text: `Reset your password using this link (valid 1 hour):\n\n${link}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1D3F88">Reset your Maeva password</h2>
        <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${link}" style="display:inline-block;background:#1D3F88;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  });
}

async function sendEnquiryNotification(agentEmail, agentName, listing, enquiry) {
  await sendMail({
    to: agentEmail,
    subject: `New enquiry on "${listing.title}"`,
    text: `Hi ${agentName},\n\n${enquiry.sender_name} (${enquiry.sender_email}) sent an enquiry:\n\n"${enquiry.message}"\n\nPhone: ${enquiry.sender_phone || 'not provided'}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1D3F88">New Enquiry on "${listing.title}"</h2>
        <p><strong>${enquiry.sender_name}</strong> is interested in your listing.</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:6px 0;color:#888;width:80px">Email</td><td><a href="mailto:${enquiry.sender_email}">${enquiry.sender_email}</a></td></tr>
          <tr><td style="padding:6px 0;color:#888">Phone</td><td>${enquiry.sender_phone || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#888;vertical-align:top">Message</td><td style="padding:6px 0">${enquiry.message}</td></tr>
        </table>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#1D3F88;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
          View in Dashboard
        </a>
      </div>`,
  });
}

/* ── Server error alert → admin inbox ───────────────────── */
async function sendErrorAlert(err, req) {
  if (!process.env.ADMIN_EMAIL) return;
  const time   = new Date().toISOString();
  const method = req?.method || '—';
  const url    = req?.originalUrl || '—';
  const userId = req?.user ? `#${req.user.id} (${req.user.role})` : 'anonymous';
  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `[Maeva Error] ${(err.message || 'Server Error').slice(0, 80)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#FFF1F0;border:1px solid #FFCCC7;border-radius:8px;padding:16px 20px">
          <h2 style="color:#CF1322;margin:0 0 12px">⚠️ Maeva Server Error</h2>
          <table style="font-size:13px;border-collapse:collapse;width:100%">
            <tr><td style="color:#888;padding:3px 8px 3px 0;width:80px">Time</td><td>${time}</td></tr>
            <tr><td style="color:#888;padding:3px 8px 3px 0">Method</td><td>${method}</td></tr>
            <tr><td style="color:#888;padding:3px 8px 3px 0">URL</td><td>${url}</td></tr>
            <tr><td style="color:#888;padding:3px 8px 3px 0">User</td><td>${userId}</td></tr>
            <tr><td style="color:#888;padding:3px 8px 3px 0;vertical-align:top">Error</td>
                <td style="color:#CF1322;font-weight:600">${err.message}</td></tr>
          </table>
          <pre style="background:#fff;border:1px solid #ddd;padding:12px;border-radius:4px;font-size:11px;overflow:auto;margin-top:12px;white-space:pre-wrap">${err.stack || err.message}</pre>
        </div>
        <p style="font-size:11px;color:#aaa;margin-top:8px">Sent by Maeva error monitor. Configure ADMIN_EMAIL to stop these alerts.</p>
      </div>`,
  });
}

/* ── Saved-search match alert → subscriber ──────────────── */
async function sendSearchAlert(to, userName, searchName, newListings) {
  const items = newListings.slice(0, 6).map(l => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f5f5f5">
        <a href="${APP_URL}/listings/${l.id}" style="color:#1D3F88;font-weight:600;text-decoration:none">${l.title}</a><br/>
        <span style="color:#888;font-size:12px">${l.area}, ${l.county}</span>
        <span style="color:#1D3F88;font-size:12px;font-weight:600;margin-left:8px">KES ${Number(l.price).toLocaleString()}</span>
      </td>
    </tr>`).join('');

  await sendMail({
    to,
    subject: `${newListings.length} new match${newListings.length > 1 ? 'es' : ''} for "${searchName}"`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1D3F88">New listings for "${searchName}"</h2>
        <p>Hi ${userName}, we found <strong>${newListings.length}</strong> new propert${newListings.length === 1 ? 'y' : 'ies'} matching your saved search.</p>
        <table style="width:100%;border-collapse:collapse">${items}</table>
        <a href="${APP_URL}/listings" style="display:inline-block;background:#1D3F88;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
          Browse all matches
        </a>
        <p style="font-size:11px;color:#aaa;margin-top:24px">You saved this search on Maeva. You can delete it from your account to stop receiving alerts.</p>
      </div>`,
  });
}

/* ── Listing expiry reminder → agent ────────────────────── */
async function sendExpiryReminder(to, agentName, listing) {
  const expiresDate = new Date(listing.expires_at).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  await sendMail({
    to,
    subject: `⏰ Your listing expires in 7 days — ${listing.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#1A56DB;padding:24px 32px">
          <h1 style="color:#fff;margin:0;font-size:20px">Maeva Kenya</h1>
        </div>
        <div style="padding:32px">
          <h2 style="font-size:18px;color:#111827;margin-top:0">Hi ${agentName}, your listing expires soon</h2>
          <p style="color:#6B7280">Your listing <strong>"${listing.title}"</strong> in <strong>${listing.area}, ${listing.county}</strong> will expire on <strong>${expiresDate}</strong>.</p>
          <p style="color:#6B7280">Renew it now to keep it visible to buyers and renters on Maeva.</p>
          <a href="${APP_URL}/dashboard" style="display:inline-block;background:#1A56DB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            Renew Listing →
          </a>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">You're receiving this because you have an active listing on Maeva Kenya.</p>
        </div>
      </div>`,
  });
}

module.exports = { sendMail, sendPasswordReset, sendEnquiryNotification, sendErrorAlert, sendSearchAlert, sendExpiryReminder };
