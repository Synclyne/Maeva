const jwt    = require('jsonwebtoken');
const db     = require('../db/db');
const JWT_SECRET = process.env.JWT_SECRET || 'maeva_ke_secret_2025';

/**
 * Auth middleware — verifies JWT AND confirms the user is still active in the DB.
 * This ensures that a suspended user is blocked immediately, even if their token
 * hasn't expired yet (tokens are valid for 7 days).
 */
module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const payload = jwt.verify(header.split(' ')[1], JWT_SECRET);

    // Check the user is still in the DB and not suspended
    const user = await db.get(
      'SELECT id, role, is_active FROM users WHERE id = ?',
      [payload.id]
    );

    if (!user) {
      return res.status(401).json({ message: 'Account not found' });
    }
    if (!user.is_active) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    // Use DB role (source of truth) rather than what's encoded in the token
    req.user = { ...payload, role: user.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
