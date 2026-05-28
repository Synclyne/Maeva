const express  = require('express');
const multer   = require('multer');
const db       = require('../db/db');
const auth     = require('../middleware/auth');
const { uploadToStorage } = require('../services/storage');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|jpg|png|webp|gif|svg\+xml)$/i.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  },
});

/* ── GET /api/agencies ────────────────────────────────────── */
router.get('/', async (req, res) => {
  const { search = '' } = req.query;

  let q = `
    SELECT u.id, u.name, u.company, u.phone, u.email, u.avatar,
           u.agency_description, u.agency_status, u.created_at,
           COUNT(CASE WHEN l.is_active = 1 THEN 1 END)     AS listing_count,
           MIN(CASE WHEN l.is_active = 1 THEN l.price END) AS min_price,
           MAX(CASE WHEN l.is_active = 1 THEN l.price END) AS max_price,
           (SELECT lc.county FROM listings lc
            WHERE lc.user_id = u.id AND lc.is_active = 1
            GROUP BY lc.county ORDER BY COUNT(*) DESC LIMIT 1) AS main_county
    FROM users u
    LEFT JOIN listings l ON l.user_id = u.id
    WHERE u.role = 'realtor' AND u.is_active = 1
  `;
  const params = [];

  if (search.trim()) {
    q += ' AND (u.name ILIKE ? OR u.company ILIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  q += ' GROUP BY u.id ORDER BY listing_count DESC, u.name ASC';
  const result = await db.query(q, params);
  res.json(result);
});

/* ── GET /api/agencies/my-profile ────────────────────────── */
router.get('/my-profile', auth, async (req, res) => {
  if (!['realtor', 'admin'].includes(req.user.role))
    return res.status(403).json({ error: 'Realtors only' });

  const user = await db.get(`
    SELECT id, name, email, phone, company, avatar,
           agency_description, agency_status, created_at
    FROM users WHERE id = ?
  `, [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

/* ── PATCH /api/agencies/profile ────────────────────────── */
router.patch('/profile', auth, async (req, res) => {
  if (!['realtor', 'admin'].includes(req.user.role))
    return res.status(403).json({ error: 'Realtors only' });

  const { name, company, phone, agency_description } = req.body;
  await db.query(`
    UPDATE users SET
      name               = COALESCE(?, name),
      company            = COALESCE(?, company),
      phone              = COALESCE(?, phone),
      agency_description = COALESCE(?, agency_description)
    WHERE id = ?
  `, [name || null, company || null, phone || null, agency_description ?? null, req.user.id]);

  const updated = await db.get(`
    SELECT id, name, email, phone, company, avatar, agency_description, agency_status
    FROM users WHERE id = ?
  `, [req.user.id]);
  res.json(updated);
});

/* ── POST /api/agencies/upload-logo ─────────────────────── */
router.post('/upload-logo', auth, upload.single('logo'), async (req, res) => {
  if (!['realtor', 'admin'].includes(req.user.role))
    return res.status(403).json({ error: 'Realtors only' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const url = await uploadToStorage('logos', req.file);
  await db.query('UPDATE users SET avatar = ? WHERE id = ?', [url, req.user.id]);
  res.json({ url });
});

/* ── POST /api/agencies/apply-verification ───────────────── */
router.post('/apply-verification', auth, async (req, res) => {
  if (req.user.role !== 'realtor') return res.status(403).json({ error: 'Realtors only' });

  const user = await db.get(
    'SELECT company, agency_description, agency_status FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.agency_status === 'verified')
    return res.status(400).json({ error: 'Your agency is already verified.' });
  if (user.agency_status === 'pending')
    return res.status(400).json({ error: 'Your verification is already under review.' });
  if (!user.company?.trim())
    return res.status(400).json({ error: 'Please add your company / agency name before applying.' });
  if (!user.agency_description?.trim())
    return res.status(400).json({ error: 'Please add an agency description before applying.' });

  await db.query("UPDATE users SET agency_status = 'pending' WHERE id = ?", [req.user.id]);
  res.json({ message: 'Verification request submitted. We will review your profile shortly.' });
});

module.exports = router;
