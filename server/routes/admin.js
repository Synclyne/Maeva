const express   = require('express');
const bcrypt    = require('bcryptjs');
const db        = require('../db/db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();
router.use(adminAuth);

function parseListing(l) {
  const { deal_type, ...rest } = l;
  return { ...rest, transaction: deal_type, images: JSON.parse(l.images || '[]'), amenities: JSON.parse(l.amenities || '[]') };
}

/* ── Stats ───────────────────────────────────────────────── */
router.get('/stats', async (req, res) => {
  const [
    totalRow, activeRow, usersRow, realtorsRow, clientsRow, viewsRow,
    enquiriesRow, unreadRow, featuredRow, ticketsRow, pendingRow,
  ] = await Promise.all([
    db.get('SELECT COUNT(*) as c FROM listings'),
    db.get('SELECT COUNT(*) as c FROM listings WHERE is_active = 1'),
    db.get("SELECT COUNT(*) as c FROM users WHERE role != 'admin'"),
    db.get("SELECT COUNT(*) as c FROM users WHERE role = 'realtor'"),
    db.get("SELECT COUNT(*) as c FROM users WHERE role = 'client'"),
    db.get('SELECT SUM(views) as s FROM listings'),
    db.get('SELECT COUNT(*) as c FROM enquiries'),
    db.get('SELECT COUNT(*) as c FROM enquiries WHERE is_read = 0'),
    db.get('SELECT COUNT(*) as c FROM listings WHERE is_featured = 1 AND is_active = 1'),
    db.get("SELECT COUNT(*) as c FROM support_tickets WHERE status = 'open'"),
    db.get("SELECT COUNT(*) as c FROM users WHERE role = 'realtor' AND agency_status = 'pending'"),
  ]);

  res.json({
    totalListings:        parseInt(totalRow?.c)    || 0,
    activeListings:       parseInt(activeRow?.c)   || 0,
    totalUsers:           parseInt(usersRow?.c)    || 0,
    realtors:             parseInt(realtorsRow?.c) || 0,
    clients:              parseInt(clientsRow?.c)  || 0,
    totalViews:           parseInt(viewsRow?.s)    || 0,
    totalEnquiries:       parseInt(enquiriesRow?.c)|| 0,
    unreadEnquiries:      parseInt(unreadRow?.c)   || 0,
    featuredCount:        parseInt(featuredRow?.c) || 0,
    openTickets:          parseInt(ticketsRow?.c)  || 0,
    pendingVerifications: parseInt(pendingRow?.c)  || 0,
  });
});

/* ── Listings — get all ──────────────────────────────────── */
router.get('/listings', async (req, res) => {
  const { search = '', page = 1, limit = 20, status = 'all' } = req.query;
  let q = `SELECT l.*, u.name as agent_name, u.email as agent_email, u.company as agent_company
           FROM listings l JOIN users u ON l.user_id = u.id WHERE 1=1`;
  const p = [];

  if (status === 'active')   { q += ' AND l.is_active = 1'; }
  if (status === 'inactive') { q += ' AND l.is_active = 0'; }
  if (search) {
    q += ' AND (l.title ILIKE ? OR l.county ILIKE ? OR l.area ILIKE ? OR u.name ILIKE ?)';
    const s = `%${search}%`;
    p.push(s, s, s, s);
  }

  const countQ   = q.replace(/SELECT l\.\*[\s\S]*?FROM/, 'SELECT COUNT(*) as cnt FROM');
  const countRow = await db.get(countQ, p);
  const total    = parseInt(countRow?.cnt) || 0;
  const offset   = (Number(page) - 1) * Number(limit);
  const rows     = await db.query(q + ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?', [...p, Number(limit), offset]);

  res.json({ listings: rows.map(parseListing), total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

/* ── Listings — feature ──────────────────────────────────── */
router.patch('/listings/:id/feature', async (req, res) => {
  const row = await db.get('SELECT id, is_featured FROM listings WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Listing not found' });

  if (row.is_featured) {
    await db.query('UPDATE listings SET is_featured = 0, badge = NULL, featured_until = NULL, featured_rank = 0, featured_requested = 0 WHERE id = ?', [row.id]);
    return res.json({ is_featured: false });
  }

  const validBadges    = ['Featured', 'Premium', 'Hot', 'Verified', 'New', 'Sponsored'];
  const badge          = validBadges.includes(req.body.badge) ? req.body.badge : 'Featured';
  const featured_until = req.body.featured_until || null;
  const featured_rank  = Number(req.body.featured_rank) || 0;

  await db.query('UPDATE listings SET is_featured = 1, badge = ?, featured_until = ?, featured_rank = ?, featured_requested = 0 WHERE id = ?',
    [badge, featured_until, featured_rank, row.id]);
  res.json({ is_featured: true, badge, featured_until, featured_rank });
});

/* ── Listings — toggle active/suspended ──────────────────── */
router.patch('/listings/:id/status', async (req, res) => {
  const row = await db.get('SELECT id, is_active FROM listings WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Listing not found' });
  await db.query('UPDATE listings SET is_active = ? WHERE id = ?', [row.is_active ? 0 : 1, row.id]);
  res.json({ is_active: !row.is_active });
});

/* ── County Images ───────────────────────────────────────── */
router.get('/county-images', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM county_images ORDER BY sort_order');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/county-images/:id', async (req, res) => {
  try {
    const { image_url, description } = req.body;
    if (!image_url) return res.status(400).json({ message: 'image_url is required' });
    await db.query(
      'UPDATE county_images SET image_url = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [image_url.trim(), (description || '').trim(), req.params.id]
    );
    const updated = await db.get('SELECT * FROM county_images WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Listings — hard delete ──────────────────────────────── */
router.delete('/listings/:id', async (req, res) => {
  const row = await db.get('SELECT id FROM listings WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Listing not found' });
  await db.query('DELETE FROM wishlists  WHERE listing_id = ?', [req.params.id]);
  await db.query('DELETE FROM enquiries  WHERE listing_id = ?', [req.params.id]);
  await db.query('DELETE FROM listings   WHERE id = ?',         [req.params.id]);
  res.json({ message: 'Listing permanently deleted' });
});

/* ── Users — get all ─────────────────────────────────────── */
router.get('/users', async (req, res) => {
  const { search = '', role = 'all', page = 1, limit = 20 } = req.query;
  let q = "SELECT id, name, email, role, phone, company, avatar, is_active, created_at FROM users WHERE role != 'admin'";
  const p = [];

  if (role !== 'all') { q += ' AND role = ?'; p.push(role); }
  if (search) {
    q += ' AND (name ILIKE ? OR email ILIKE ? OR company ILIKE ?)';
    const s = `%${search}%`;
    p.push(s, s, s);
  }

  const countQ   = q.replace('SELECT id, name, email, role, phone, company, avatar, is_active, created_at FROM', 'SELECT COUNT(*) as cnt FROM');
  const countRow = await db.get(countQ, p);
  const total    = parseInt(countRow?.cnt) || 0;
  const offset   = (Number(page) - 1) * Number(limit);
  const rows     = await db.query(q + ' ORDER BY created_at DESC LIMIT ? OFFSET ?', [...p, Number(limit), offset]);
  res.json({ users: rows, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

/* ── Users — update avatar ───────────────────────────────── */
router.patch('/users/:id/avatar', async (req, res) => {
  const row = await db.get("SELECT id FROM users WHERE id = ? AND role != 'admin'", [req.params.id]);
  if (!row) return res.status(404).json({ message: 'User not found' });
  const { avatar = null } = req.body;
  await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar || null, row.id]);
  res.json({ avatar: avatar || null });
});

/* ── Users — toggle suspended ────────────────────────────── */
router.patch('/users/:id/status', async (req, res) => {
  const row = await db.get("SELECT id, is_active, role FROM users WHERE id = ? AND role != 'admin'", [req.params.id]);
  if (!row) return res.status(404).json({ message: 'User not found' });
  await db.query('UPDATE users SET is_active = ? WHERE id = ?', [row.is_active ? 0 : 1, row.id]);
  res.json({ is_active: !row.is_active });
});

/* ── Enquiries — get all ─────────────────────────────────── */
router.get('/enquiries', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const countRow = await db.get('SELECT COUNT(*) as c FROM enquiries');
  const total    = parseInt(countRow?.c) || 0;
  const offset   = (Number(page) - 1) * Number(limit);
  const rows     = await db.query(`
    SELECT e.*, l.title as listing_title, l.county, l.area
    FROM enquiries e JOIN listings l ON e.listing_id = l.id
    ORDER BY e.created_at DESC LIMIT ? OFFSET ?
  `, [Number(limit), offset]);
  res.json({ enquiries: rows, total, pages: Math.ceil(total / Number(limit)) });
});

/* ── Partners — list all ─────────────────────────────────── */
router.get('/partners', async (req, res) => {
  const partners = await db.query('SELECT * FROM partners ORDER BY row_num, sort_order');
  res.json(partners);
});

/* ── Partners — add ──────────────────────────────────────── */
router.post('/partners', async (req, res) => {
  const { name, category, color = '#1A56DB', row_num = 1, logo_url = null } = req.body;
  if (!name || !category) return res.status(400).json({ message: 'Name and category are required' });
  const rowInt  = Number(row_num) === 2 ? 2 : 1;
  const maxRow  = await db.get('SELECT MAX(sort_order) as m FROM partners WHERE row_num = ?', [rowInt]);
  const maxSort = parseInt(maxRow?.m) || 0;
  const row     = await db.get(
    'INSERT INTO partners (name, category, color, row_num, sort_order, logo_url) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
    [name.trim(), category.trim(), color, rowInt, maxSort + 1, logo_url || null]
  );
  res.json({ id: row.id, name: name.trim(), category: category.trim(), color, row_num: rowInt, sort_order: maxSort + 1, is_active: 1, logo_url: logo_url || null });
});

/* ── Partners — toggle visible/hidden ────────────────────── */
router.patch('/partners/:id/toggle', async (req, res) => {
  const row = await db.get('SELECT id, is_active FROM partners WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Partner not found' });
  await db.query('UPDATE partners SET is_active = ? WHERE id = ?', [row.is_active ? 0 : 1, row.id]);
  res.json({ is_active: !row.is_active });
});

/* ── Partners — delete ───────────────────────────────────── */
router.delete('/partners/:id', async (req, res) => {
  const row = await db.get('SELECT id FROM partners WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Partner not found' });
  await db.query('DELETE FROM partners WHERE id = ?', [row.id]);
  res.json({ message: 'Partner deleted' });
});

/* ── Support tickets — list all ──────────────────────────── */
router.get('/support', async (req, res) => {
  const { status = 'all', page = 1, limit = 20, search = '' } = req.query;
  let q = `SELECT t.*, u.name as user_name, u.role as user_role
           FROM support_tickets t
           LEFT JOIN users u ON t.user_id = u.id
           WHERE 1=1`;
  const p = [];

  if (status !== 'all') { q += ' AND t.status = ?'; p.push(status); }
  if (search) {
    q += ' AND (t.name ILIKE ? OR t.email ILIKE ? OR t.subject ILIKE ? OR t.category ILIKE ?)';
    const s = `%${search}%`;
    p.push(s, s, s, s);
  }

  const countQ   = q.replace(/SELECT t\.\*[\s\S]*?FROM/, 'SELECT COUNT(*) as cnt FROM');
  const countRow = await db.get(countQ, p);
  const total    = parseInt(countRow?.cnt) || 0;
  const offset   = (Number(page) - 1) * Number(limit);
  const rows     = await db.query(q + ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?', [...p, Number(limit), offset]);

  const counts      = await db.query('SELECT status, COUNT(*) as cnt FROM support_tickets GROUP BY status');
  const statusCounts = Object.fromEntries(counts.map(r => [r.status, parseInt(r.cnt)]));

  res.json({ tickets: rows, total, page: Number(page), pages: Math.ceil(total / Number(limit)), statusCounts });
});

/* ── Support tickets — update ────────────────────────────── */
router.patch('/support/:id', async (req, res) => {
  const row = await db.get('SELECT id FROM support_tickets WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Ticket not found' });

  const VALID = ['open', 'in_progress', 'resolved', 'closed'];
  const { status, admin_notes } = req.body;

  const fields = [];
  const values = [];
  if (status !== undefined) {
    if (!VALID.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    fields.push('status = ?');
    values.push(status);
  }
  if (admin_notes !== undefined) {
    fields.push('admin_notes = ?');
    values.push(admin_notes);
  }
  if (fields.length === 0) return res.status(400).json({ message: 'Nothing to update' });

  fields.push('updated_at = NOW()');
  values.push(row.id);
  await db.query(`UPDATE support_tickets SET ${fields.join(', ')} WHERE id = ?`, values);
  res.json({ message: 'Ticket updated' });
});

/* ── Support tickets — delete ────────────────────────────── */
router.delete('/support/:id', async (req, res) => {
  const row = await db.get('SELECT id FROM support_tickets WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Ticket not found' });
  await db.query('DELETE FROM support_tickets WHERE id = ?', [row.id]);
  res.json({ message: 'Ticket deleted' });
});

/* ── Agencies — list all realtors ────────────────────────── */
router.get('/agencies', async (req, res) => {
  const { search = '', status = 'all', page = 1, limit = 20 } = req.query;
  let q = `
    SELECT u.id, u.name, u.email, u.phone, u.company, u.avatar,
           u.agency_description, u.agency_status, u.is_active, u.created_at,
           COUNT(CASE WHEN l.is_active = 1 THEN 1 END) AS listing_count
    FROM users u
    LEFT JOIN listings l ON l.user_id = u.id
    WHERE u.role = 'realtor'
  `;
  const p = [];

  if (status !== 'all') { q += ' AND u.agency_status = ?'; p.push(status); }
  if (search.trim()) {
    q += ' AND (u.name ILIKE ? OR u.company ILIKE ? OR u.email ILIKE ?)';
    const s = `%${search}%`;
    p.push(s, s, s);
  }
  q += ' GROUP BY u.id';

  const countQ   = q.replace(/SELECT u\.id[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT u.id) as cnt FROM');
  const countRow = await db.get(countQ, p);
  const total    = parseInt(countRow?.cnt) || 0;
  const offset   = (Number(page) - 1) * Number(limit);
  const rows     = await db.query(q + ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?', [...p, Number(limit), offset]);

  const statusRows   = await db.query("SELECT agency_status, COUNT(*) as c FROM users WHERE role='realtor' GROUP BY agency_status");
  const statusCounts = Object.fromEntries(statusRows.map(r => [r.agency_status, parseInt(r.c)]));

  res.json({ agencies: rows, total, page: Number(page), pages: Math.ceil(total / Number(limit)), statusCounts });
});

/* ── Agencies — create ───────────────────────────────────── */
router.post('/agencies', async (req, res) => {
  const { name, email, password = 'password123', phone, company, agency_description, agency_status = 'active' } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

  const exists = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const validStatuses = ['active', 'pending', 'verified'];
  const safeStatus    = validStatuses.includes(agency_status) ? agency_status : 'active';
  const hash = bcrypt.hashSync(password, 10);

  const row = await db.get(`
    INSERT INTO users (name, email, password, role, phone, company, agency_description, agency_status)
    VALUES (?, ?, ?, 'realtor', ?, ?, ?, ?) RETURNING id
  `, [name.trim(), email.toLowerCase().trim(), hash, phone || null, company?.trim() || null, agency_description?.trim() || null, safeStatus]);

  res.json({
    id: row.id,
    name: name.trim(), email: email.toLowerCase().trim(),
    phone: phone || null, company: company?.trim() || null,
    agency_description: agency_description?.trim() || null,
    agency_status: safeStatus, is_active: 1, listing_count: 0,
  });
});

/* ── Agencies — update ───────────────────────────────────── */
router.patch('/agencies/:id', async (req, res) => {
  const row = await db.get("SELECT id FROM users WHERE id = ? AND role = 'realtor'", [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Agency not found' });

  const VALID_STATUSES = ['active', 'pending', 'verified', 'rejected'];
  const { agency_status, name, company, phone, agency_description, avatar } = req.body;

  const fields = [];
  const values = [];
  if (agency_status !== undefined) {
    if (!VALID_STATUSES.includes(agency_status)) return res.status(400).json({ message: 'Invalid status' });
    fields.push('agency_status = ?'); values.push(agency_status);
  }
  if (name !== undefined)               { fields.push('name = ?');               values.push(name.trim()); }
  if (company !== undefined)            { fields.push('company = ?');             values.push(company.trim() || null); }
  if (phone !== undefined)              { fields.push('phone = ?');               values.push(phone || null); }
  if (agency_description !== undefined) { fields.push('agency_description = ?'); values.push(agency_description?.trim() || null); }
  if (avatar !== undefined)             { fields.push('avatar = ?');              values.push(avatar || null); }

  if (fields.length === 0) return res.status(400).json({ message: 'Nothing to update' });
  values.push(row.id);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

  const updated = await db.get(`
    SELECT id, name, email, phone, company, avatar, agency_description, agency_status, is_active
    FROM users WHERE id = ?
  `, [row.id]);
  res.json(updated);
});

/* ── Agencies — deactivate ───────────────────────────────── */
router.delete('/agencies/:id', async (req, res) => {
  const row = await db.get("SELECT id, is_active FROM users WHERE id = ? AND role = 'realtor'", [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Agency not found' });
  await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [row.id]);
  res.json({ message: 'Agency deactivated' });
});

module.exports = router;
