const express  = require('express');
const multer   = require('multer');
const db       = require('../db/db');
const auth     = require('../middleware/auth');
const { notifyMatchingSavedSearches } = require('./searches');
const { uploadToStorage, deleteFromStorage } = require('../services/storage');

const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

/* ── parseListing helper ─────────────────────────────────── */
function parseListing(l) {
  const { deal_type, ...rest } = l;
  const featureExpired = l.featured_until && new Date(l.featured_until) < new Date();
  return {
    ...rest,
    transaction:  deal_type,
    is_featured:  featureExpired ? 0 : (l.is_featured || 0),
    badge:        featureExpired ? null : (l.badge || null),
    images:       JSON.parse(l.images      || '[]'),
    amenities:    JSON.parse(l.amenities   || '[]'),
    floor_plans:  JSON.parse(l.floor_plans || '[]'),
  };
}

const NOT_EXPIRED = "(l.expires_at IS NULL OR l.expires_at > NOW())";

/* ── GET popular areas ───────────────────────────────────── */
router.get('/popular-areas', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 5, 20);
  const rows  = await db.query(`
    SELECT county, area, COUNT(*) AS cnt
    FROM listings
    WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())
    GROUP BY county, area
    ORDER BY cnt DESC
    LIMIT ?
  `, [limit]);
  res.json(rows);
});

/* ── GET realtor's own listings ──────────────────────────── */
router.get('/mine', auth, async (req, res) => {
  const rows = await db.query('SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(rows.map(parseListing));
});

/* ── GET public realtor profile ──────────────────────────── */
router.get('/realtor/:userId', async (req, res) => {
  const user = await db.get(
    "SELECT id, name, email, phone, company, avatar, agency_description, agency_status, created_at FROM users WHERE id = ? AND role = 'realtor' AND is_active = 1",
    [req.params.userId]
  );
  if (!user) return res.status(404).json({ message: 'Realtor not found' });

  const listings = await db.query(
    `SELECT * FROM listings l WHERE l.user_id = ? AND l.is_active = 1 AND ${NOT_EXPIRED} ORDER BY l.is_featured DESC, l.created_at DESC`,
    [req.params.userId]
  );

  res.json({ ...user, listings: listings.map(parseListing) });
});

/* ── GET all listings with filters ──────────────────────────*/
router.get('/', async (req, res) => {
  const { type, transaction, county, area, minPrice, maxPrice, bedrooms,
          search, featured, limit = 12, page = 1, sort = 'newest' } = req.query;

  let q = `SELECT l.*, u.name as agent_name, u.phone as agent_phone, u.company as agent_company, u.id as agent_id
           FROM listings l JOIN users u ON l.user_id = u.id
           WHERE l.is_active = 1 AND ${NOT_EXPIRED}`;
  const p = [];

  if (type)        { q += ' AND LOWER(l.type) = LOWER(?)';        p.push(type); }
  if (transaction) { q += ' AND LOWER(l.deal_type) = LOWER(?)';   p.push(transaction); }
  if (county)      { q += ' AND l.county = ?';                     p.push(county); }
  if (area)        { q += ' AND l.area = ?';                       p.push(area); }
  if (minPrice)    { q += ' AND l.price >= ?';                     p.push(Number(minPrice)); }
  if (maxPrice)    { q += ' AND l.price <= ?';                     p.push(Number(maxPrice)); }
  if (bedrooms)    { q += ' AND l.bedrooms >= ?';                  p.push(Number(bedrooms)); }
  if (featured)    { q += ' AND l.is_featured = 1'; }
  if (search) {
    const s = `%${search}%`;
    q += ' AND (l.title ILIKE ? OR l.description ILIKE ? OR l.area ILIKE ? OR l.county ILIKE ?)';
    p.push(s, s, s, s);
  }

  const sortMap = {
    newest:     'l.is_featured DESC, l.featured_rank DESC, l.created_at DESC',
    oldest:     'l.created_at ASC',
    price_asc:  'l.price ASC',
    price_desc: 'l.price DESC',
    popular:    'l.views DESC, l.created_at DESC',
  };
  q += ` ORDER BY ${sortMap[sort] || sortMap.newest}`;

  const countQ   = q.replace(/SELECT l\.\*, u\.name as agent_name[\s\S]*?FROM/, 'SELECT COUNT(*) as cnt FROM');
  const countRow = await db.get(countQ, p);
  const total    = parseInt(countRow?.cnt) || 0;
  const offset   = (Number(page) - 1) * Number(limit);
  const rows     = await db.query(q + ' LIMIT ? OFFSET ?', [...p, Number(limit), offset]);

  res.json({ listings: rows.map(parseListing), total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

/* ── GET single listing ──────────────────────────────────── */
router.get('/:id', async (req, res) => {
  const row = await db.get(`
    SELECT l.*, u.name as agent_name, u.phone as agent_phone, u.email as agent_email,
           u.company as agent_company, u.id as agent_id
    FROM listings l JOIN users u ON l.user_id = u.id
    WHERE l.id = ? AND l.is_active = 1
  `, [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Listing not found' });
  res.json(parseListing(row));
});

/* ── POST record a view ──────────────────────────────────── */
router.post('/:id/view', async (req, res) => {
  const row = await db.get('SELECT id FROM listings WHERE id = ? AND is_active = 1', [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Listing not found' });
  await db.query('UPDATE listings SET views = views + 1 WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

/* ── PATCH listing status ────────────────────────────────── */
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const VALID = ['available', 'under_offer', 'sold', 'rented'];
  if (!VALID.includes(status)) return res.status(400).json({ message: `status must be one of: ${VALID.join(', ')}` });

  const listing = await db.get('SELECT * FROM listings WHERE id = ?', [req.params.id]);
  if (!listing) return res.status(404).json({ message: 'Not found' });
  if (listing.user_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });
  await db.query('UPDATE listings SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ ok: true, status });
});

/* ── POST create listing ─────────────────────────────────── */
router.post('/', auth, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'floor_plans', maxCount: 5 }]), async (req, res) => {
  try {
    if (req.user.role !== 'realtor' && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Only realtors can post listings' });

    const { title, description, type, transaction, price, price_period,
            county, area, address, bedrooms, bathrooms, size, size_unit,
            amenities, imageUrls, lat, lng, accept_enquiries, title_deed_number } = req.body;

    if (!title || !type || !transaction || !price || !county || !area)
      return res.status(400).json({ message: 'Missing required fields' });

    const imgFiles       = req.files?.images      || [];
    const floorPlanFiles = req.files?.floor_plans || [];

    const uploaded   = await Promise.all(imgFiles.map(f       => uploadToStorage('listings', f)));
    const uploadedFP = await Promise.all(floorPlanFiles.map(f => uploadToStorage('listings', f)));
    const urls       = imageUrls ? [].concat(imageUrls).filter(Boolean) : [];
    const images     = JSON.stringify([...uploaded, ...urls]);
    const floorPlansJson = JSON.stringify([...uploadedFP]);
    const amen       = JSON.stringify(amenities ? [].concat(amenities).filter(Boolean) : []);
    const expires    = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const acceptEnq  = accept_enquiries === '0' || accept_enquiries === 0 ? 0 : 1;

    const row = await db.get(`
      INSERT INTO listings
        (user_id, title, description, type, deal_type, price, price_period,
         county, area, address, bedrooms, bathrooms, size, size_unit, images, amenities,
         lat, lng, expires_at, accept_enquiries, floor_plans, title_deed_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
    `, [
      req.user.id, title, description, type, transaction, Number(price), price_period || null,
      county, area, address || null,
      bedrooms  !== '' && bedrooms  !== undefined ? Number(bedrooms)  : null,
      bathrooms !== '' && bathrooms !== undefined ? Number(bathrooms) : null,
      size      !== '' && size      !== undefined ? Number(size)      : null,
      size_unit || 'sqft', images, amen,
      lat ? Number(lat) : null, lng ? Number(lng) : null, expires, acceptEnq,
      floorPlansJson, title_deed_number || null,
    ]);

    const newRow = await db.get('SELECT * FROM listings WHERE id = ?', [row.id]);
    setImmediate(() => notifyMatchingSavedSearches(newRow));
    res.status(201).json(parseListing(newRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── PUT update listing ──────────────────────────────────── */
router.put('/:id', auth, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'floor_plans', maxCount: 5 }]), async (req, res) => {
  try {
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', [req.params.id]);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (listing.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const { title, description, type, transaction, price, price_period,
            county, area, address, bedrooms, bathrooms, size, size_unit,
            amenities, imageUrls, existingImages, existingFloorPlans,
            lat, lng, accept_enquiries, title_deed_number } = req.body;

    if (listing.price !== Number(price)) {
      await db.query(
        'INSERT INTO price_history (listing_id, old_price, new_price) VALUES (?, ?, ?)',
        [req.params.id, listing.price, Number(price)]
      );
    }

    const imgFiles       = req.files?.images      || [];
    const floorPlanFiles = req.files?.floor_plans || [];

    const uploaded   = await Promise.all(imgFiles.map(f       => uploadToStorage('listings', f)));
    const uploadedFP = await Promise.all(floorPlanFiles.map(f => uploadToStorage('listings', f)));
    const urls       = imageUrls         ? [].concat(imageUrls).filter(Boolean)         : [];
    const existing   = existingImages    ? [].concat(existingImages).filter(Boolean)    : [];
    const existingFP = existingFloorPlans? [].concat(existingFloorPlans).filter(Boolean): [];
    const images     = JSON.stringify([...existing, ...uploaded, ...urls]);
    const floorPlansJson = JSON.stringify([...existingFP, ...uploadedFP]);
    const amen       = JSON.stringify(amenities ? [].concat(amenities).filter(Boolean) : []);
    const acceptEnq  = accept_enquiries === '0' || accept_enquiries === 0 ? 0 : 1;

    await db.query(`
      UPDATE listings SET
        title=?, description=?, type=?, deal_type=?, price=?, price_period=?,
        county=?, area=?, address=?, bedrooms=?, bathrooms=?, size=?, size_unit=?,
        images=?, amenities=?, lat=?, lng=?, accept_enquiries=?,
        floor_plans=?, title_deed_number=?
      WHERE id=?
    `, [
      title, description, type, transaction, Number(price), price_period || null,
      county, area, address || null,
      bedrooms  !== '' && bedrooms  !== undefined ? Number(bedrooms)  : null,
      bathrooms !== '' && bathrooms !== undefined ? Number(bathrooms) : null,
      size      !== '' && size      !== undefined ? Number(size)      : null,
      size_unit || 'sqft', images, amen,
      lat ? Number(lat) : null, lng ? Number(lng) : null, acceptEnq,
      floorPlansJson, title_deed_number || null,
      req.params.id,
    ]);

    const updated = await db.get('SELECT * FROM listings WHERE id = ?', [req.params.id]);
    res.json(parseListing(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── DELETE listing (soft) ───────────────────────────────── */
router.delete('/:id', auth, async (req, res) => {
  const listing = await db.get('SELECT * FROM listings WHERE id = ?', [req.params.id]);
  if (!listing) return res.status(404).json({ message: 'Not found' });
  if (listing.user_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });
  await db.query('UPDATE listings SET is_active = 0 WHERE id = ?', [req.params.id]);
  res.json({ message: 'Listing removed' });
});

/* ── PATCH toggle enquiries ──────────────────────────────── */
router.patch('/:id/toggle-enquiries', auth, async (req, res) => {
  const listing = await db.get('SELECT * FROM listings WHERE id = ?', [req.params.id]);
  if (!listing) return res.status(404).json({ message: 'Not found' });
  if (listing.user_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });
  const newVal = listing.accept_enquiries === 0 ? 1 : 0;
  await db.query('UPDATE listings SET accept_enquiries = ? WHERE id = ?', [newVal, req.params.id]);
  res.json({ accept_enquiries: newVal });
});

/* ── PATCH request featured status ──────────────────────── */
router.patch('/:id/request-feature', auth, async (req, res) => {
  const listing = await db.get('SELECT * FROM listings WHERE id = ?', [req.params.id]);
  if (!listing) return res.status(404).json({ message: 'Not found' });
  if (listing.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (listing.is_featured) return res.status(400).json({ message: 'Listing is already featured' });
  await db.query('UPDATE listings SET featured_requested = 1 WHERE id = ?', [req.params.id]);
  res.json({ message: 'Feature request submitted. Admin will review shortly.' });
});

/* ── PATCH renew listing ─────────────────────────────────── */
router.patch('/:id/renew', auth, async (req, res) => {
  const listing = await db.get('SELECT * FROM listings WHERE id = ?', [req.params.id]);
  if (!listing) return res.status(404).json({ message: 'Not found' });
  if (listing.user_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });
  const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  await db.query('UPDATE listings SET expires_at = ?, is_active = 1 WHERE id = ?', [expires, req.params.id]);
  res.json({ message: 'Listing renewed for 90 days', expires_at: expires });
});

module.exports = router;
