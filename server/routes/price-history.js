const express = require('express');
const db      = require('../db/db');
const router  = express.Router();

router.get('/:listingId', async (req, res) => {
  const rows = await db.query(
    'SELECT old_price, new_price, changed_at FROM price_history WHERE listing_id = ? ORDER BY changed_at ASC',
    [req.params.listingId]
  );
  res.json(rows);
});

module.exports = router;
