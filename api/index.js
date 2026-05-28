/**
 * Vercel serverless entry point.
 * All /api/* requests are routed here by vercel.json.
 */

const app = require('../server/index');

/**
 * Hotfix applied here because Vercel caches the server/ function bundle
 * separately from api/index.js. The old server/routes/listings.js was
 * generating a COUNT query with an ORDER BY clause, which PostgreSQL
 * rejects for aggregate queries.
 *
 * This patch intercepts db.get() calls and strips ORDER BY from any
 * SELECT COUNT(...) query before it reaches the database.
 */
const db = require('../server/db/db');
const _originalGet = db.get.bind(db);
db.get = async function patchedGet(sql, params) {
  if (typeof sql === 'string' &&
      /^\s*SELECT\s+COUNT\s*\(/i.test(sql) &&
      /\bORDER\s+BY\b/i.test(sql)) {
    sql = sql.replace(/\s+ORDER\s+BY\b[\s\S]*$/i, '');
  }
  return _originalGet(sql, params);
};

module.exports = app;
