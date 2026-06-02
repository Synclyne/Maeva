/**
 * Email service — Brevo (formerly Sendinblue) transactional API.
 *
 * Required env var:
 *   BREVO_API_KEY   — API key from Brevo → Settings → SMTP & API → API Keys
 *
 * Optional env vars:
 *   BREVO_SENDER_EMAIL  (defaults to brandonarocho4@icloud.com)
 *   BREVO_SENDER_NAME   (defaults to Maeva Kenya)
 *   ADMIN_EMAIL         — receives support alerts and error notifications
 *   APP_URL             (defaults to https://maeva.co.ke)
 */

const APP_URL      = process.env.APP_URL      || 'https://maeva.co.ke';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'brandonarocho4@icloud.com';
const SENDER_NAME  = process.env.BREVO_SENDER_NAME  || 'Maeva Kenya';
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL        || 'brandonarocho4@gmail.com';

/* ── Core send function ─────────────────────────────────────── */
async function sendMail({ to, subject, html, text }) {
  if (!process.env.BREVO_API_KEY) {
    console.log('\n📧  EMAIL (BREVO_API_KEY not set — showing in console)');
    console.log('   To     :', to);
    console.log('   Subject:', subject);
    console.log('   Body   :', (text || html.replace(/<[^>]+>/g, ' ')).trim().slice(0, 400));
    console.log('');
    return;
  }

  const body = {
    sender:      { name: SENDER_NAME, email: SENDER_EMAIL },
    to:          [{ email: to }],
    subject,
    htmlContent: html,
    ...(text ? { textContent: text } : {}),
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method:  'POST',
    headers: {
      'api-key':      process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      'accept':       'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    console.error('[Brevo] send failed:', res.status, err);
    // Non-fatal — log and continue so a broken email never crashes a user request
  }
}

/* ── Shared HTML wrapper ─────────────────────────────────────── */
function wrap(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
        <!-- Header -->
        <tr>
          <td style="background:#1D3F88;padding:24px 32px">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:10px;vertical-align:middle">
                  <svg width="28" height="28" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="34" height="34" rx="8" fill="#1D3F88"/>
                    <path d="M17 7L27 15V27H21V21H13V27H7V15L17 7Z" fill="white"/>
                  </svg>
                </td>
                <td style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.3px;vertical-align:middle">Maeva Kenya</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f3f4f6;background:#f9fafb">
            <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6">
              You received this email from <a href="${APP_URL}" style="color:#1D3F88;text-decoration:none">Maeva Kenya</a> — Kenya's trusted real estate platform.<br/>
              Nairobi, Kenya &nbsp;·&nbsp; <a href="mailto:support@maeva.co.ke" style="color:#1D3F88;text-decoration:none">support@maeva.co.ke</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href, label) {
  return `<a href="${href}" style="display:inline-block;background:#1D3F88;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;margin-top:20px">${label}</a>`;
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATES
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. Password reset ──────────────────────────────────────── */
async function sendPasswordReset(to, token) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await sendMail({
    to,
    subject: 'Reset your Maeva password',
    text: `Reset your password: ${link}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827">Reset your password</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 4px">Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
      ${btn(link, 'Reset Password')}
      <p style="color:#9ca3af;font-size:12px;margin-top:20px">If you didn't request a password reset, you can safely ignore this email.</p>
    `),
  });
}

/* ── 2. Welcome / account created ───────────────────────────── */
async function sendWelcomeEmail(to, name, role) {
  const isAgent = role === 'realtor';
  await sendMail({
    to,
    subject: `Welcome to Maeva, ${name.split(' ')[0]}! 🏡`,
    text: `Hi ${name},\n\nWelcome to Maeva Kenya! Your account is ready.\n\nBrowse properties: ${APP_URL}/listings\n\nThe Maeva Team`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827">Welcome to Maeva, ${name.split(' ')[0]}!</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px">
        Your account has been created. ${isAgent
          ? 'You can now post listings, manage enquiries, and build your agent profile.'
          : 'Start searching for your next home across all 47 Kenyan counties.'}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;border-radius:10px;padding:16px;margin-bottom:8px">
        <tr>
          <td style="font-size:13px;color:#374151">
            ${isAgent ? `
              <div style="margin-bottom:8px">✅ &nbsp;<strong>Post your first listing</strong> — it goes live after a quick review</div>
              <div style="margin-bottom:8px">📋 &nbsp;<strong>Manage enquiries</strong> from your realtor dashboard</div>
              <div>🏢 &nbsp;<strong>Build your agency profile</strong> to attract more clients</div>
            ` : `
              <div style="margin-bottom:8px">🔍 &nbsp;<strong>Search properties</strong> across all 47 counties</div>
              <div style="margin-bottom:8px">❤️ &nbsp;<strong>Save favourites</strong> to your wishlist</div>
              <div>📊 &nbsp;<strong>Compare listings</strong> side-by-side to make better decisions</div>
            `}
          </td>
        </tr>
      </table>
      ${btn(isAgent ? `${APP_URL}/dashboard` : `${APP_URL}/listings`, isAgent ? 'Go to Dashboard' : 'Browse Properties')}
    `),
  });
}

/* ── 3. Enquiry notification → agent ────────────────────────── */
async function sendEnquiryNotification(agentEmail, agentName, listing, enquiry) {
  await sendMail({
    to: agentEmail,
    subject: `New enquiry on "${listing.title}"`,
    text: `Hi ${agentName},\n\n${enquiry.sender_name} (${enquiry.sender_email}) sent an enquiry:\n\n"${enquiry.message}"\n\nPhone: ${enquiry.sender_phone || 'not provided'}`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827">New enquiry on your listing</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px">Hi ${agentName}, <strong>${enquiry.sender_name}</strong> is interested in <strong>${listing.title}</strong>.</p>
      <table width="100%" style="border-collapse:collapse;font-size:13px;color:#374151">
        <tr><td style="padding:8px 0;color:#9ca3af;width:80px;border-bottom:1px solid #f3f4f6">From</td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6"><strong>${enquiry.sender_name}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Email</td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6"><a href="mailto:${enquiry.sender_email}" style="color:#1D3F88">${enquiry.sender_email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Phone</td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6">${enquiry.sender_phone || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af;vertical-align:top">Message</td>
            <td style="padding:8px 0">${enquiry.message}</td></tr>
      </table>
      ${btn(`${APP_URL}/dashboard`, 'View in Dashboard')}
    `),
  });
}

/* ── 4. Wishlist sold / rented alert → saved buyer ──────────── */
async function sendWishlistStatusAlert(to, userName, listing, newStatus) {
  const isSold   = newStatus === 'sold';
  const isRented = newStatus === 'rented';
  const statusLabel = isSold ? 'sold' : isRented ? 'rented out' : newStatus.replace('_', ' ');
  const statusColour = isSold ? '#dc2626' : '#d97706';
  const emoji = isSold ? '🏷️' : '🔑';

  await sendMail({
    to,
    subject: `${emoji} A property you saved has been ${statusLabel} — ${listing.title}`,
    text: `Hi ${userName},\n\nA property you saved to your wishlist on Maeva has been marked as ${statusLabel}:\n\n${listing.title}\n${listing.area}, ${listing.county}\n\nBrowse similar properties: ${APP_URL}/listings?county=${encodeURIComponent(listing.county)}`,
    html: wrap(`
      <div style="display:inline-block;background:${statusColour}15;color:${statusColour};font-size:12px;font-weight:600;padding:4px 10px;border-radius:6px;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px">
        ${statusLabel}
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;color:#111827">A saved property has been ${statusLabel}</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px">
        Hi ${userName.split(' ')[0]}, a property on your Maeva wishlist — <strong>${listing.title}</strong> in ${listing.area}, ${listing.county} — has been marked as <strong>${statusLabel}</strong> by the agent.
      </p>
      <table width="100%" style="background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;border-collapse:collapse;font-size:13px;margin-bottom:8px">
        <tr>
          <td style="padding:14px 16px">
            <div style="font-weight:600;color:#111827;margin-bottom:4px">${listing.title}</div>
            <div style="color:#6b7280">${listing.area}, ${listing.county}</div>
            <div style="color:#1D3F88;font-weight:600;margin-top:4px">KES ${Number(listing.price).toLocaleString()}</div>
          </td>
        </tr>
      </table>
      <p style="color:#6b7280;font-size:13px;line-height:1.5">Don't worry — there are plenty more options. Browse similar properties in ${listing.county} now.</p>
      ${btn(`${APP_URL}/listings?county=${encodeURIComponent(listing.county)}&transaction=${listing.transaction_type || 'sale'}`, `Browse ${listing.county} listings`)}
      <p style="color:#9ca3af;font-size:11px;margin-top:20px">You saved this property to your Maeva wishlist. <a href="${APP_URL}/wishlist" style="color:#1D3F88">View or manage your wishlist</a>.</p>
    `),
  });
}

/* ── 5. Support ticket confirmation → client ─────────────────── */
async function sendSupportConfirmation(to, name, ticketId, subject) {
  await sendMail({
    to,
    subject: `[Ticket #${ticketId}] We received your message`,
    text: `Hi ${name},\n\nThank you for contacting Maeva support. We received your message about "${subject}".\n\nTicket ID: #${ticketId}\nWe aim to respond within 24–48 hours.\n\nThe Maeva Support Team`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827">We've got your message</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px">
        Hi ${name.split(' ')[0]}, thank you for contacting Maeva support. We'll get back to you within <strong>24–48 hours</strong>.
      </p>
      <table width="100%" style="background:#f0f4ff;border-radius:10px;padding:16px;border-collapse:collapse;margin-bottom:8px">
        <tr>
          <td style="font-size:13px;color:#374151">
            <div style="margin-bottom:6px"><strong>Ticket ID:</strong> #${ticketId}</div>
            <div><strong>Subject:</strong> ${subject}</div>
          </td>
        </tr>
      </table>
      <p style="color:#6b7280;font-size:13px;line-height:1.5">
        Keep this email for your records. If you need to follow up, reply to this email and include your ticket number.
      </p>
      ${btn(`${APP_URL}/support`, 'View Support Centre')}
    `),
  });
}

/* ── 6. Support ticket alert → admin ────────────────────────── */
async function sendSupportAdminAlert(ticket) {
  if (!ADMIN_EMAIL) return;
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `[Support #${ticket.id}] ${ticket.category} — ${ticket.subject.slice(0, 60)}`,
    text: `New support ticket #${ticket.id}\n\nFrom: ${ticket.name} <${ticket.email}>\nCategory: ${ticket.category}\nSubject: ${ticket.subject}\n\nMessage:\n${ticket.message}`,
    html: wrap(`
      <div style="display:inline-block;background:#fef3c7;color:#92400e;font-size:12px;font-weight:600;padding:4px 10px;border-radius:6px;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px">
        New Support Ticket
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;color:#111827">Ticket #${ticket.id} — ${ticket.category}</h2>
      <table width="100%" style="border-collapse:collapse;font-size:13px;color:#374151;margin-bottom:16px">
        <tr><td style="padding:7px 0;color:#9ca3af;width:90px;border-bottom:1px solid #f3f4f6">From</td>
            <td style="padding:7px 0;border-bottom:1px solid #f3f4f6"><strong>${ticket.name}</strong> &lt;${ticket.email}&gt;</td></tr>
        <tr><td style="padding:7px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Category</td>
            <td style="padding:7px 0;border-bottom:1px solid #f3f4f6">${ticket.category}</td></tr>
        <tr><td style="padding:7px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Subject</td>
            <td style="padding:7px 0;border-bottom:1px solid #f3f4f6">${ticket.subject}</td></tr>
        <tr><td style="padding:7px 0;color:#9ca3af;vertical-align:top">Message</td>
            <td style="padding:7px 0;white-space:pre-wrap">${ticket.message}</td></tr>
      </table>
      ${btn(`${APP_URL}/admin`, 'Open Admin Dashboard')}
    `),
  });
}

/* ── 7. Server error alert → admin ──────────────────────────── */
async function sendErrorAlert(err, req) {
  if (!ADMIN_EMAIL) return;
  const time   = new Date().toISOString();
  const method = req?.method || '—';
  const url    = req?.originalUrl || '—';
  const userId = req?.user ? `#${req.user.id} (${req.user.role})` : 'anonymous';
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `[Maeva Error] ${(err.message || 'Server Error').slice(0, 80)}`,
    html: wrap(`
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin-bottom:16px">
        <h2 style="color:#dc2626;margin:0 0 12px;font-size:18px">⚠️ Server Error</h2>
        <table style="font-size:13px;border-collapse:collapse;width:100%;color:#374151">
          <tr><td style="color:#9ca3af;padding:4px 8px 4px 0;width:80px">Time</td><td>${time}</td></tr>
          <tr><td style="color:#9ca3af;padding:4px 8px 4px 0">Method</td><td>${method}</td></tr>
          <tr><td style="color:#9ca3af;padding:4px 8px 4px 0">URL</td><td>${url}</td></tr>
          <tr><td style="color:#9ca3af;padding:4px 8px 4px 0">User</td><td>${userId}</td></tr>
          <tr><td style="color:#9ca3af;padding:4px 8px 4px 0;vertical-align:top">Error</td>
              <td style="color:#dc2626;font-weight:600">${err.message}</td></tr>
        </table>
      </div>
      <pre style="background:#f9fafb;border:1px solid #e5e7eb;padding:12px;border-radius:8px;font-size:11px;overflow:auto;white-space:pre-wrap;margin:0">${err.stack || err.message}</pre>
    `),
  });
}

/* ── 8. Saved-search match alert → subscriber ───────────────── */
async function sendSearchAlert(to, userName, searchName, newListings) {
  const items = newListings.slice(0, 6).map(l => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;font-size:13px">
        <a href="${APP_URL}/listings/${l.id}" style="color:#1D3F88;font-weight:600;text-decoration:none">${l.title}</a><br/>
        <span style="color:#9ca3af">${l.area}, ${l.county}</span>
        <span style="color:#1D3F88;font-weight:600;margin-left:8px">KES ${Number(l.price).toLocaleString()}</span>
      </td>
    </tr>`).join('');

  await sendMail({
    to,
    subject: `${newListings.length} new match${newListings.length > 1 ? 'es' : ''} for "${searchName}"`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827">New listings for "${searchName}"</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 16px">Hi ${userName}, we found <strong>${newListings.length}</strong> new propert${newListings.length === 1 ? 'y' : 'ies'} matching your saved search.</p>
      <table width="100%" style="border-collapse:collapse">${items}</table>
      ${btn(`${APP_URL}/listings`, 'Browse all matches')}
      <p style="font-size:11px;color:#9ca3af;margin-top:20px">You saved this search on Maeva. You can delete it from your account to stop receiving alerts.</p>
    `),
  });
}

/* ── 9. Listing expiry reminder → agent ─────────────────────── */
async function sendExpiryReminder(to, agentName, listing) {
  const expiresDate = new Date(listing.expires_at).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  await sendMail({
    to,
    subject: `⏰ Your listing expires in 7 days — ${listing.title}`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827">Your listing expires soon</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px">
        Hi ${agentName}, your listing <strong>"${listing.title}"</strong> in <strong>${listing.area}, ${listing.county}</strong> will expire on <strong>${expiresDate}</strong>.
      </p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 8px">Renew it now to keep it visible to buyers and renters on Maeva.</p>
      ${btn(`${APP_URL}/dashboard`, 'Renew Listing →')}
      <p style="color:#9ca3af;font-size:11px;margin-top:20px">You're receiving this because you have an active listing on Maeva Kenya.</p>
    `),
  });
}

module.exports = {
  sendMail,
  sendPasswordReset,
  sendWelcomeEmail,
  sendEnquiryNotification,
  sendWishlistStatusAlert,
  sendSupportConfirmation,
  sendSupportAdminAlert,
  sendErrorAlert,
  sendSearchAlert,
  sendExpiryReminder,
};
