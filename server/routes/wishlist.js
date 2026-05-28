const express = require('express');
const db   = require('../db/db');
const auth = require('../middleware/auth');

const router = express.Router();

function parseListing(l) {
  return { ...l, images: JSON.parse(l.images || '[]'), amenities: JSON.parse(l.amenities || '[]') };
}

router.get('/', auth, async (req, res) => {
  const rows = await db.query(`
    SELECT l.*, u.name as agent_name, u.phone as agent_phone, u.company as agent_company
    FROM wishlists w
    JOIN listings l ON w.listing_id = l.id
    JOIN users u ON l.user_id = u.id
    WHERE w.user_id = ? AND l.is_active = 1
    ORDER BY w.created_at DESC
  `, [req.user.id]);
  res.json(rows.map(parseListing));
});

router.get('/ids', auth, async (req, res) => {
  const rows = await db.query('SELECT listing_id FROM wishlists WHERE user_id = ?', [req.user.id]);
  res.json(rows.map(r => r.listing_id));
});

router.post('/:listingId', auth, async (req, res) => {
  try {
    await db.query('INSERT INTO wishlists (user_id, listing_id) VALUES (?, ?)', [req.user.id, Number(req.params.listingId)]);
    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Already in wishlist' }); // unique violation
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:listingId', auth, async (req, res) => {
  await db.query('DELETE FROM wishlists WHERE user_id = ? AND listing_id = ?', [req.user.id, Number(req.params.listingId)]);
  res.json({ message: 'Removed from wishlist' });
});

module.exports = router;
