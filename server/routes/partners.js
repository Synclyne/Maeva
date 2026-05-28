const express = require('express');
const db      = require('../db/db');

const router = express.Router();

router.get('/', async (req, res) => {
  const partners = await db.query(
    'SELECT id, name, category, color, row_num, sort_order FROM partners WHERE is_active = 1 ORDER BY row_num, sort_order'
  );
  res.json(partners);
});

module.exports = router;
