const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const rateLimit = require('express-rate-limit');
const db        = require('./db/db');

const { sendErrorAlert } = require('./services/email');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

/* ── Rate limiting ───────────────────────────────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests from this IP. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api',      apiLimiter);

/* ── Routes ──────────────────────────────────────────────── */
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/listings',  require('./routes/listings'));
app.use('/api/wishlist',  require('./routes/wishlist'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/partners',  require('./routes/partners'));
app.use('/api/agencies',  require('./routes/agencies'));
app.use('/api/support',   require('./routes/support'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/searches',      require('./routes/searches'));
app.use('/api/viewings',      require('./routes/viewings'));
app.use('/api/price-history', require('./routes/price-history'));
app.use('/api/payments',      require('./routes/payments'));

/* ── Dynamic sitemap.xml ─────────────────────────────────── */
app.get('/sitemap.xml', async (req, res) => {
  try {
    const APP_URL  = process.env.APP_URL || 'https://maeva.co.ke';
    const listings = await db.query(
      "SELECT id, updated_at, created_at FROM listings WHERE is_active = 1 ORDER BY created_at DESC LIMIT 5000"
    );

    const staticPages = ['', '/listings', '/listings?transaction=sale', '/listings?transaction=rent'];
    const urls = [
      ...staticPages.map(p => `
  <url>
    <loc>${APP_URL}${p}</loc>
    <changefreq>daily</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`),
      ...listings.map(l => `
  <url>
    <loc>${APP_URL}/listings/${l.id}</loc>
    <lastmod>${(l.updated_at || l.created_at || '').toString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`),
    ];

    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`);
  } catch (err) {
    res.status(500).send('');
  }
});

/* ── Global error handler ────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  sendErrorAlert(err, req).catch(e => console.error('Error alert failed:', e.message));
  res.status(err.status || 500).json({ message: err.message || 'A server error occurred.' });
});

/* ── Start (local dev only — not called in serverless) ───── */
if (require.main === module) {
  const { startExpiryReminder } = require('./services/expiryReminder');
  app.listen(PORT, () => {
    console.log(`Maeva server running on http://localhost:${PORT}`);
    startExpiryReminder();
  });
}

module.exports = app;
