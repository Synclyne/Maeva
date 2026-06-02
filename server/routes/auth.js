const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const db       = require('../db/db');
const auth     = require('../middleware/auth');
const { sendPasswordReset, sendWelcomeEmail } = require('../services/email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'maeva_ke_secret_2025';

/* ── Register ────────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { name, password, phone, company, dob } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();
    const rawRole = req.body.role || 'client';
    const role = ['client', 'realtor'].includes(rawRole) ? rawRole : 'client';

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });

    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    // Age verification — required for agents, validated but NOT stored
    if (role === 'realtor') {
      if (!dob) return res.status(400).json({ message: 'Date of birth is required to register as an agent.' });

      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return res.status(400).json({ message: 'Invalid date of birth.' });

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

      if (age < 18) return res.status(400).json({ message: 'You must be 18 or older to register as an agent on Maeva.' });
      if (age > 120) return res.status(400).json({ message: 'Invalid date of birth.' });
      // dob is deliberately NOT stored — verification only
    }

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const row = await db.get(
      'INSERT INTO users (name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      [name, email, hashed, role, phone || null, company || null]
    );

    const user  = { id: row.id, name, email, role, phone: phone || null, company: company || null };
    const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });

    // Fire-and-forget welcome email — never delay the response
    sendWelcomeEmail(email, name, role).catch(err => console.error('[email] welcome:', err.message));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Login ───────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    if (user.is_active === 0)
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, company: user.company },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Me ──────────────────────────────────────────────────── */
router.get('/me', auth, async (req, res) => {
  const user = await db.get(
    'SELECT id, name, email, role, phone, company, created_at FROM users WHERE id = ? AND is_active = 1',
    [req.user.id]
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

/* ── Forgot password ─────────────────────────────────────── */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await db.get('SELECT id, name, email FROM users WHERE email = ?', [email]);
    if (!user) return res.json({ message: 'If that email is registered, a reset link has been sent.' });

    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await db.query('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', [token, expires, user.id]);
    await sendPasswordReset(user.email, token);
    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Reset password ──────────────────────────────────────── */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // reset_expires is stored as ISO string text — cast to TIMESTAMPTZ for comparison
    const user = await db.get(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expires::TIMESTAMPTZ > NOW()',
      [token]
    );
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [hashed, user.id]
    );
    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
