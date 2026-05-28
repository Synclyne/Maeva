const express = require('express');
const db      = require('../db/db');
const auth    = require('../middleware/auth');
const router  = express.Router();

/* POST book a viewing (public) */
router.post('/', async (req, res) => {
  try {
    const { listing_id, viewer_name, viewer_email, viewer_phone,
            preferred_date, preferred_time, message } = req.body;

    if (!listing_id || !viewer_name || !viewer_email || !preferred_date || !preferred_time)
      return res.status(400).json({ message: 'listing_id, name, email, date and time are required' });

    const listing = await db.get('SELECT id, user_id FROM listings WHERE id = ? AND is_active = 1', [listing_id]);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const row = await db.get(`
      INSERT INTO viewings (listing_id, agent_id, viewer_name, viewer_email, viewer_phone, preferred_date, preferred_time, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
    `, [
      Number(listing_id), listing.user_id,
      viewer_name.trim(), viewer_email.trim(), viewer_phone?.trim() || null,
      preferred_date, preferred_time, message?.trim() || null,
    ]);

    res.status(201).json({ id: row.id, message: 'Viewing request sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* GET agent's viewings (auth) */
router.get('/mine', auth, async (req, res) => {
  const rows = await db.query(`
    SELECT v.*, l.title as listing_title, l.area, l.county
    FROM viewings v
    JOIN listings l ON v.listing_id = l.id
    WHERE v.agent_id = ?
    ORDER BY v.preferred_date ASC, v.preferred_time ASC
  `, [req.user.id]);
  res.json(rows);
});

/* PATCH update viewing status (agent) */
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'cancelled'].includes(status))
    return res.status(400).json({ message: 'status must be pending, confirmed, or cancelled' });

  const v = await db.get('SELECT id FROM viewings WHERE id = ? AND agent_id = ?', [req.params.id, req.user.id]);
  if (!v) return res.status(404).json({ message: 'Not found' });
  await db.query('UPDATE viewings SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
