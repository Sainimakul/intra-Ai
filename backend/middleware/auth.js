const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// ─── Helper: run downgrade logic for a user ───────────────────────────────────
async function handleExpiredSubscription(userId) {
  const freePlan = await pool.query("SELECT id, max_bots FROM plans WHERE slug = 'free' LIMIT 1");
  const freePlanId = freePlan.rows[0]?.id || null;
  const freeBotLimit = parseInt(freePlan.rows[0]?.max_bots) || 1;

  // 1. Downgrade user to free plan
  await pool.query(
    `UPDATE users
     SET plan_id = $1, subscription_status = 'expired', subscription_ends_at = NULL
     WHERE id = $2`,
    [freePlanId, userId]
  );

  // 2. Pause all bots beyond the free limit — keep the most recently created ones
  await pool.query(
    `UPDATE bots SET is_active = false
     WHERE user_id = $1
       AND id NOT IN (
         SELECT id FROM bots
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2
       )`,
    [userId, freeBotLimit]
  );

  // 3. Return updated user row
  const updated = await pool.query(
    'SELECT id, name, email, role, is_active, is_verified, plan_id, subscription_status, subscription_ends_at FROM users WHERE id = $1',
    [userId]
  );
  return updated.rows[0];
}

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      'SELECT id, name, email, role, is_active, is_verified, plan_id, subscription_status, subscription_ends_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!result.rows[0]) return res.status(401).json({ error: 'User not found' });
    if (!result.rows[0].is_active) return res.status(403).json({ error: 'Account is disabled' });

    const u = result.rows[0];

    // Auto-expire: downgrade + pause excess bots on every request after expiry
    if (
      u.subscription_ends_at &&
      new Date(u.subscription_ends_at) < new Date() &&
      u.subscription_status === 'active'
    ) {
      req.user = await handleExpiredSubscription(u.id);
      req.wasDowngraded = true; // flag so routes can tell the client
    } else {
      req.user = u;
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    next(err);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireVerified = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({ error: 'Email verification required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireVerified };
