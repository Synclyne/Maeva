const express = require('express');
const db      = require('../db/db');
const auth    = require('../middleware/auth');

const router = express.Router();

/* ── GET reviews for an agent ────────────────────────────── */
router.get('/agent/:id', async (req, res) => {
  const rows = await db.query(`
    SELECT r.id, r.rating, r.comment, r.created_at,
           u.name as reviewer_name,
           l.title as listing_title, l.id as listing_id
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    LEFT JOIN listings l ON r.listing_id = l.id
    WHERE r.agent_id = ?
    ORDER BY r.created_at DESC
  `, [req.params.id]);

  const stats = await db.get(`
    SELECT COUNT(*) as count, ROUND(AVG(rating)::NUMERIC, 1) as average
    FROM reviews WHERE agent_id = ?
  `, [req.params.id]);

  res.json({ reviews: rows, count: parseInt(stats?.count) || 0, average: parseFloat(stats?.average) || 0 });
});

/* ── POST submit a review (logged-in users only) ─────────── */
router.post('/', auth, async (req, res) => {
  const { agent_id, listing_id, rating, comment } = req.body;

  if (!agent_id || !rating)
    return res.status(400).json({ message: 'agent_id and rating are required' });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  if (Number(agent_id) === req.user.id)
    return res.status(400).json({ message: 'You cannot review yourself' });

  try {
    const row = await db.get(`
      INSERT INTO reviews (reviewer_id, agent_id, listing_id, rating, comment)
      VALUES (?, ?, ?, ?, ?) RETURNING id
    `, [req.user.id, Number(agent_id), listing_id ? Number(listing_id) : null, rating, comment?.trim() || null]);

    res.status(201).json({ id: row.id });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'You have already reviewed this property' });
    throw err;
  }
});

/* ── DELETE own review ───────────────────────────────────── */
router.delete('/:id', auth, async (req, res) => {
  const review = await db.get('SELECT id FROM reviews WHERE id = ? AND reviewer_id = ?', [req.params.id, req.user.id]);
  if (!review) return res.status(404).json({ message: 'Not found' });
  await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
