/**
 * PostgreSQL pool for Supabase.
 * Wraps `pg` with a thin helper so routes can use familiar .get() / .query() patterns
 * and keep ? placeholders (auto-converted to $1, $2, …).
 */
const { Pool, types } = require('pg');

// pg returns NUMERIC columns as strings by default — parse them as floats
types.setTypeParser(1700, val => (val == null ? null : parseFloat(val)));

const isSupabase = (process.env.DATABASE_URL || '').includes('supabase');

// Vercel serverless: each invocation is its own process — a large pool wastes
// Supabase connections. Use 2 so burst requests in one invocation don't stall,
// but we don't blow through the Supabase connection limit.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', err => console.error('[db] idle client error', err.message));

/** Convert ? placeholders → $1, $2, … */
function toNamed(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

const db = {
  /** Returns an array of rows (may be empty). */
  async query(sql, params = []) {
    const res = await pool.query(toNamed(sql), params);
    return res.rows;
  },

  /** Returns the first row, or null if no rows returned. */
  async get(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows[0] ?? null;
  },

  /** pool reference for transactions if needed */
  pool,
};

module.exports = db;
