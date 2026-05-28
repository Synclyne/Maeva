const express = require('express');
const db      = require('../db/db');
const auth    = require('../middleware/auth');
const { sendSearchAlert } = require('../services/email');

const router = express.Router();

/* ── GET my saved searches ───────────────────────────────── */
router.get('/', auth, async (req, res) => {
  const rows = await db.query(
    'SELECT * FROM saved_searches WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(rows.map(r => ({ ...r, filters: JSON.parse(r.filters) })));
});

/* ── POST save a search ──────────────────────────────────── */
router.post('/', auth, async (req, res) => {
  const { name, filters } = req.body;
  if (!filters || typeof filters !== 'object')
    return res.status(400).json({ message: 'filters object is required' });

  const hasFilter = Object.values(filters).some(v => v);
  if (!hasFilter)
    return res.status(400).json({ message: 'At least one filter must be set to save a search' });

  const row = await db.get(
    'INSERT INTO saved_searches (user_id, name, filters) VALUES (?, ?, ?) RETURNING id',
    [req.user.id, (name || 'My Search').trim(), JSON.stringify(filters)]
  );

  res.status(201).json({ id: row.id, message: "Search saved. We'll email you when new matches are listed." });
});

/* ── DELETE a saved search ───────────────────────────────── */
router.delete('/:id', auth, async (req, res) => {
  const s = await db.get('SELECT id FROM saved_searches WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!s) return res.status(404).json({ message: 'Not found' });
  await db.query('DELETE FROM saved_searches WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

/* ── Internal helper: notify matching saved searches ─────── */
async function notifyMatchingSavedSearches(listing) {
  try {
    const searches = await db.query(`
      SELECT ss.*, u.email, u.name
      FROM saved_searches ss
      JOIN users u ON ss.user_id = u.id
      WHERE ss.notify_email = 1
    `);

    for (const s of searches) {
      const filters = JSON.parse(s.filters || '{}');
      if (!listingMatchesFilters(listing, filters)) continue;

      sendSearchAlert(s.email, s.name, s.name, [listing])
        .then(() => db.query('UPDATE saved_searches SET last_notified_at = NOW() WHERE id = ?', [s.id]))
        .catch(e => console.error('Search alert email failed:', e.message));
    }
  } catch (e) {
    console.error('notifyMatchingSavedSearches error:', e.message);
  }
}

function listingMatchesFilters(listing, filters) {
  if (filters.transaction && filters.transaction.toLowerCase() !== (listing.deal_type || '').toLowerCase()) return false;
  if (filters.type        && filters.type.toLowerCase()        !== (listing.type || '').toLowerCase())        return false;
  if (filters.county      && filters.county                    !== listing.county)                             return false;
  if (filters.area        && filters.area                      !== listing.area)                               return false;
  if (filters.minPrice    && listing.price < Number(filters.minPrice)) return false;
  if (filters.maxPrice    && listing.price > Number(filters.maxPrice)) return false;
  if (filters.bedrooms    && (listing.bedrooms == null || listing.bedrooms < Number(filters.bedrooms))) return false;
  return true;
}

module.exports = router;
module.exports.notifyMatchingSavedSearches = notifyMatchingSavedSearches;
