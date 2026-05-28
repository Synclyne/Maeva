const db = require('../db/db');
const { sendExpiryReminder } = require('./email');

async function checkExpiringListings() {
  try {
    const rows = await db.query(`
      SELECT l.id, l.title, l.expires_at, l.county, l.area,
             u.name as agent_name, u.email as agent_email
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.is_active = 1
        AND l.expires_at::DATE = (NOW() + INTERVAL '7 days')::DATE
    `);

    for (const listing of rows) {
      await sendExpiryReminder(listing.agent_email, listing.agent_name, listing)
        .catch(e => console.error('[ExpiryReminder] Email failed:', e.message));
    }

    if (rows.length > 0) {
      console.log(`[ExpiryReminder] Sent ${rows.length} expiry reminder(s)`);
    }
  } catch (e) {
    console.error('[ExpiryReminder] Error:', e.message);
  }
}

function startExpiryReminder() {
  checkExpiringListings();
  setInterval(checkExpiringListings, 24 * 60 * 60 * 1000);
  console.log('✅ Expiry reminder service started');
}

module.exports = { startExpiryReminder };
