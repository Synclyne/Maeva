const express = require('express');
const db      = require('../db/db');
const auth    = require('../middleware/auth');

const router = express.Router();

const VALID_CATEGORIES = ['General Inquiry', 'Listing Issue', 'Account Problem', 'Bug Report', 'Payment Issue', 'Feature Request', 'Other'];

/* ── Submit a support ticket (public) ─────────────────────── */
router.post('/', async (req, res) => {
  const { name, email, category = 'General Inquiry', subject, message } = req.body;

  if (!name || !email || !subject || !message)
    return res.status(400).json({ message: 'Name, email, subject and message are required.' });
  if (subject.length > 200)
    return res.status(400).json({ message: 'Subject must be 200 characters or less.' });
  if (message.length > 5000)
    return res.status(400).json({ message: 'Message must be 5000 characters or less.' });

  const cat = VALID_CATEGORIES.includes(category) ? category : 'General Inquiry';

  let user_id = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const jwt     = require('jsonwebtoken');
      const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET || 'maeva_ke_secret_2025');
      user_id = payload.id || null;
    } catch (_) {}
  }

  const row = await db.get(
    'INSERT INTO support_tickets (user_id, name, email, category, subject, message) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
    [user_id, name.trim(), email.trim().toLowerCase(), cat, subject.trim(), message.trim()]
  );

  res.status(201).json({
    id: row.id,
    message: "Your ticket has been submitted. We'll get back to you within 24–48 hours.",
  });
});

/* ── Get own tickets (authenticated users) ─────────────────── */
router.get('/mine', auth, async (req, res) => {
  const rows = await db.query(
    'SELECT id, category, subject, status, created_at, updated_at FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

module.exports = router;
