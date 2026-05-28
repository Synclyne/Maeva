const express = require('express');
const db      = require('../db/db');
const auth    = require('../middleware/auth');
const { sendEnquiryNotification } = require('../services/email');

const router = express.Router();

/* ── Submit an enquiry (public) ──────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { listing_id, sender_name, sender_email, sender_phone, message } = req.body;
    if (!listing_id || !sender_name || !sender_email || !message)
      return res.status(400).json({ message: 'listing_id, name, email and message are required' });

    const listing = await db.get(`
      SELECT l.id, l.title, l.county, l.area, l.accept_enquiries, u.name as agent_name, u.email as agent_email
      FROM listings l JOIN users u ON l.user_id = u.id
      WHERE l.id = ? AND l.is_active = 1
    `, [listing_id]);

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.accept_enquiries === 0)
      return res.status(403).json({ message: 'This property is not currently accepting enquiries' });

    const row = await db.get(
      'INSERT INTO enquiries (listing_id, sender_name, sender_email, sender_phone, message) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [listing_id, sender_name.trim(), sender_email.trim(), sender_phone?.trim() || null, message.trim()]
    );

    sendEnquiryNotification(listing.agent_email, listing.agent_name, listing, { id: row.id, listing_id, sender_name, sender_email, sender_phone, message })
      .catch(e => console.error('Email error:', e.message));

    res.status(201).json({ message: 'Enquiry sent successfully', id: row.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Realtor: get enquiries for their listings ───────────── */
router.get('/mine', auth, async (req, res) => {
  const rows = await db.query(`
    SELECT e.*, l.title as listing_title, l.county, l.area, l.id as listing_id
    FROM enquiries e
    JOIN listings l ON e.listing_id = l.id
    WHERE l.user_id = ?
    ORDER BY e.created_at DESC
  `, [req.user.id]);
  res.json(rows);
});

/* ── Realtor: mark enquiry as read ───────────────────────── */
router.patch('/:id/read', auth, async (req, res) => {
  const enquiry = await db.get(`
    SELECT e.id FROM enquiries e
    JOIN listings l ON e.listing_id = l.id
    WHERE e.id = ? AND l.user_id = ?
  `, [req.params.id, req.user.id]);
  if (!enquiry) return res.status(404).json({ message: 'Not found' });
  await db.query('UPDATE enquiries SET is_read = 1 WHERE id = ?', [req.params.id]);
  res.json({ message: 'Marked as read' });
});

/* ── Realtor: unread count ───────────────────────────────── */
router.get('/unread-count', auth, async (req, res) => {
  const row = await db.get(`
    SELECT COUNT(*) as c FROM enquiries e
    JOIN listings l ON e.listing_id = l.id
    WHERE l.user_id = ? AND e.is_read = 0
  `, [req.user.id]);
  res.json({ count: parseInt(row?.c) || 0 });
});

/* ── Realtor: update lead status ─────────────────────────── */
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  if (!['new', 'contacted', 'closed'].includes(status))
    return res.status(400).json({ message: "status must be 'new', 'contacted', or 'closed'" });

  const enquiry = await db.get(`
    SELECT e.id FROM enquiries e
    JOIN listings l ON e.listing_id = l.id
    WHERE e.id = ? AND l.user_id = ?
  `, [req.params.id, req.user.id]);
  if (!enquiry) return res.status(404).json({ message: 'Not found' });
  await db.query('UPDATE enquiries SET lead_status = ?, is_read = 1 WHERE id = ?', [status, req.params.id]);
  res.json({ ok: true });
});

/* ── Realtor: save notes on an enquiry ───────────────────── */
router.patch('/:id/notes', auth, async (req, res) => {
  const { notes } = req.body;
  const enquiry = await db.get(`
    SELECT e.id FROM enquiries e
    JOIN listings l ON e.listing_id = l.id
    WHERE e.id = ? AND l.user_id = ?
  `, [req.params.id, req.user.id]);
  if (!enquiry) return res.status(404).json({ message: 'Not found' });
  await db.query('UPDATE enquiries SET notes = ? WHERE id = ?', [notes?.trim() || null, req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
