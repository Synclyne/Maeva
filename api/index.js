/**
 * Vercel serverless entry point.
 * All /api/* requests are routed here by vercel.json.
 * v2 — cache bust for listings query rewrite
 */
module.exports = require('../server/index');
