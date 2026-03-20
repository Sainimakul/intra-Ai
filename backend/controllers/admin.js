const pool = require('../config/database');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  const [users, bots, conversations, payments, newUsers, activeToday] = await Promise.all([
    pool.query('SELECT COUNT(*) as total FROM users WHERE role = $1', ['user']),
    pool.query('SELECT COUNT(*) as total FROM bots'),
    pool.query('SELECT COUNT(*) as total FROM conversations'),
    pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"),
    pool.query("SELECT COUNT(*) as total FROM users WHERE created_at > NOW() - INTERVAL '30 days' AND role = 'user'"),
    pool.query("SELECT COUNT(*) as total FROM conversations WHERE started_at > NOW() - INTERVAL '24 hours'"),
  ]);

  const planDist = await pool.query(
    `SELECT p.name, COUNT(u.id) as count FROM plans p
     LEFT JOIN users u ON u.plan_id = p.id AND u.role = 'user'
     GROUP BY p.id, p.name ORDER BY p.sort_order`
  );

  res.json({
    stats: {
      totalUsers: parseInt(users.rows[0].total),
      totalBots: parseInt(bots.rows[0].total),
      totalConversations: parseInt(conversations.rows[0].total),
      totalRevenue: parseFloat(payments.rows[0].total),
      newUsersThisMonth: parseInt(newUsers.rows[0].total),
      activeConversationsToday: parseInt(activeToday.rows[0].total),
    },
    planDistribution: planDist.rows,
  });
};

// ─── Users Management ─────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  const { page = 1, limit = 20, search = '', status = '' } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE u.role != 'admin'";
  const values = [];
  let idx = 1;

  if (search) {
    whereClause += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx})`;
    values.push(`%${search}%`);
    idx++;
  }
  if (status === 'active')     whereClause += ` AND u.is_active = true`;
  if (status === 'inactive')   whereClause += ` AND u.is_active = false`;
  if (status === 'unverified') whereClause += ` AND u.is_verified = false`;

  const countResult = await pool.query(`SELECT COUNT(*) FROM users u ${whereClause}`, values);
  values.push(limit, offset);

  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.is_active, u.is_verified,
            u.subscription_status, u.messages_used_this_month,
            u.last_login_at, u.created_at,
            p.name as plan_name, p.slug as plan_slug,
            COUNT(DISTINCT b.id) as bot_count
     FROM users u
     LEFT JOIN plans p ON u.plan_id = p.id
     LEFT JOIN bots b ON b.user_id = u.id
     ${whereClause}
     GROUP BY u.id, p.name, p.slug
     ORDER BY u.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    values
  );

  res.json({
    users: result.rows,
    total: parseInt(countResult.rows[0].count),
    page: parseInt(page),
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  });
};

const getUserById = async (req, res) => {
  const result = await pool.query(
    `SELECT u.*, p.name as plan_name, p.slug as plan_slug
     FROM users u LEFT JOIN plans p ON u.plan_id = p.id WHERE u.id = $1`,
    [req.params.userId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json({ user: result.rows[0] });
};

const updateUser = async (req, res) => {
  const { is_active, role, plan_id } = req.body;
  const updates = [], values = [];
  let idx = 1;

  if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(is_active); }
  if (role)    { updates.push(`role = $${idx++}`);    values.push(role); }
  if (plan_id) { updates.push(`plan_id = $${idx++}`); values.push(plan_id); }

  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

  values.push(req.params.userId);
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, is_active`,
    values
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json({ user: result.rows[0], message: 'User updated' });
};

const deleteUser = async (req, res) => {
  if (req.params.userId === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.userId]);
  res.json({ message: 'User deleted' });
};

// ─── All Bots ─────────────────────────────────────────────────────────────────
const getAllBots = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT b.*, u.name as owner_name, u.email as owner_email
     FROM bots b JOIN users u ON b.user_id = u.id
     ORDER BY b.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const count = await pool.query('SELECT COUNT(*) FROM bots');
  res.json({ bots: result.rows, total: parseInt(count.rows[0].count) });
};

// ─── Revenue Stats ────────────────────────────────────────────────────────────
const getRevenue = async (req, res) => {
  const monthly = await pool.query(
    `SELECT DATE_TRUNC('month', created_at) as month,
            SUM(amount) as revenue, COUNT(*) as transactions
     FROM payments WHERE status = 'completed'
     GROUP BY month ORDER BY month DESC LIMIT 12`
  );
  res.json({ monthly: monthly.rows });
};

module.exports = {
  getStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllBots,
  getRevenue,
};