const express = require('express');
const jwt     = require('jsonwebtoken');
const db      = require('../db/db');
const auth    = require('../middleware/auth');
const { sendSupportConfirmation, sendSupportAdminAlert } = require('../services/email');

const router = express.Router();

const VALID_CATEGORIES = ['General Inquiry', 'Listing Issue', 'Account Problem', 'Bug Report', 'Payment Issue', 'Feature Request', 'Other'];
const JWT_SECRET = process.env.JWT_SECRET || 'maeva_ke_secret_2025';

/* ── Submit a support ticket (public) ─────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { category = 'General Inquiry' } = req.body;
    const name    = (req.body.name    || '').trim();
    const email   = (req.body.email   || '').trim().toLowerCase();
    const subject = (req.body.subject || '').trim();
    const message = (req.body.message || '').trim();

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
        const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
        user_id = payload.id || null;
      } catch (_) {}
    }

    const row = await db.get(
      'INSERT INTO support_tickets (user_id, name, email, category, subject, message) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      [user_id, name, email, cat, subject, message]
    );

    if (!row) return res.status(500).json({ message: 'Failed to create ticket. Please try again.' });

    res.status(201).json({
      id: row.id,
      message: "Your ticket has been submitted. We'll get back to you within 24–48 hours.",
    });

    // Fire-and-forget — emails never block or fail the response
    const ticket = { id: row.id, name, email, category: cat, subject, message };
    sendSupportConfirmation(ticket.email, ticket.name, ticket.id, ticket.subject)
      .catch(err => console.error('[email] support-confirm:', err.message));
    sendSupportAdminAlert(ticket)
      .catch(err => console.error('[email] support-admin:', err.message));
  } catch (err) {
    console.error('[support] POST /', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
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
