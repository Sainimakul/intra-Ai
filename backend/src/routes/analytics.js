const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

// ─── Bot analytics summary ────────────────────────────────────────────────────
router.get('/bot/:botId', authenticate, async (req, res) => {
  const bot = await pool.query('SELECT id FROM bots WHERE id = $1 AND user_id = $2', [req.params.botId, req.user.id]);
  if (!bot.rows[0]) return res.status(404).json({ error: 'Bot not found' });

  const [totalConv, totalMsg, dailyConv, ratings, topHours] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM conversations WHERE bot_id = $1', [req.params.botId]),
    pool.query(`SELECT COUNT(*) FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE c.bot_id = $1 AND m.role = 'user'`, [req.params.botId]),
    pool.query(
      `SELECT DATE_TRUNC('day', started_at) as day, COUNT(*) as conversations
       FROM conversations WHERE bot_id = $1 AND started_at > NOW() - INTERVAL '30 days'
       GROUP BY day ORDER BY day`,
      [req.params.botId]
    ),
    pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(rating) as rated_count
       FROM conversations WHERE bot_id = $1 AND rating IS NOT NULL`,
      [req.params.botId]
    ),
    pool.query(
      `SELECT EXTRACT(hour FROM started_at) as hour, COUNT(*) as count
       FROM conversations WHERE bot_id = $1
       GROUP BY hour ORDER BY hour`,
      [req.params.botId]
    ),
  ]);

  res.json({
    totalConversations: parseInt(totalConv.rows[0].count),
    totalMessages: parseInt(totalMsg.rows[0].count),
    dailyConversations: dailyConv.rows,
    avgRating: parseFloat(ratings.rows[0].avg_rating) || 0,
    ratedCount: parseInt(ratings.rows[0].rated_count),
    topHours: topHours.rows,
  });
});

// ─── Get conversations list for a bot (with last message preview) ─────────────
router.get('/bot/:botId/conversations', authenticate, async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const bot = await pool.query('SELECT id FROM bots WHERE id = $1 AND user_id = $2', [req.params.botId, req.user.id]);
  if (!bot.rows[0]) return res.status(404).json({ error: 'Bot not found' });

  let where = 'WHERE c.bot_id = $1';
  const values = [req.params.botId];
  let idx = 2;
  if (search) {
    where += ` AND (c.visitor_email ILIKE $${idx} OR c.visitor_name ILIKE $${idx})`;
    values.push(`%${search}%`);
    idx++;
  }

  const countResult = await pool.query(`SELECT COUNT(*) FROM conversations c ${where}`, values);

  values.push(parseInt(limit), offset);
  const result = await pool.query(
    `SELECT c.id, c.session_id, c.visitor_name, c.visitor_email, c.visitor_ip,
            c.is_resolved, c.rating, c.started_at, c.last_message_at,
            COUNT(m.id) as message_count,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
     FROM conversations c
     LEFT JOIN messages m ON m.conversation_id = c.id AND m.role = 'user'
     ${where}
     GROUP BY c.id
     ORDER BY c.last_message_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    values
  );

  res.json({
    conversations: result.rows,
    total: parseInt(countResult.rows[0].count),
    page: parseInt(page),
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
  });
});

// ─── Get full messages for a conversation ────────────────────────────────────
router.get('/conversation/:conversationId/messages', authenticate, async (req, res) => {
  // Verify the conversation belongs to a bot owned by the user
  const check = await pool.query(
    `SELECT c.id FROM conversations c
     JOIN bots b ON c.bot_id = b.id
     WHERE c.id = $1 AND b.user_id = $2`,
    [req.params.conversationId, req.user.id]
  );
  if (!check.rows[0]) return res.status(404).json({ error: 'Conversation not found' });

  const messages = await pool.query(
    `SELECT id, role, content, tokens_used, created_at
     FROM messages WHERE conversation_id = $1 AND role != 'system'
     ORDER BY created_at ASC`,
    [req.params.conversationId]
  );

  const meta = await pool.query(
    `SELECT c.*, b.name as bot_name
     FROM conversations c JOIN bots b ON c.bot_id = b.id
     WHERE c.id = $1`,
    [req.params.conversationId]
  );

  res.json({ messages: messages.rows, conversation: meta.rows[0] });
});

// ─── Mark conversation resolved ───────────────────────────────────────────────
router.patch('/conversation/:conversationId/resolve', authenticate, async (req, res) => {
  const check = await pool.query(
    `SELECT c.id FROM conversations c JOIN bots b ON c.bot_id = b.id WHERE c.id = $1 AND b.user_id = $2`,
    [req.params.conversationId, req.user.id]
  );
  if (!check.rows[0]) return res.status(404).json({ error: 'Not found' });
  await pool.query('UPDATE conversations SET is_resolved = NOT is_resolved WHERE id = $1', [req.params.conversationId]);
  res.json({ message: 'Updated' });
});

module.exports = router;

// ─── All conversations across all user's bots (for Messages tab) ──────────────
router.get('/conversations', authenticate, async (req, res) => {
  const {
    page = 1, limit = 25,
    search = '',
    botId = '',
    dateFrom = '',
    dateTo = '',
    resolved = '',
    minMessages = '',
    maxMessages = '',
    hasEmail = '',
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = `WHERE b.user_id = $1`;
  const values = [req.user.id];
  let idx = 2;

  if (search) {
    where += ` AND (c.visitor_email ILIKE $${idx} OR c.visitor_name ILIKE $${idx} OR c.session_id ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }
  if (botId) {
    where += ` AND c.bot_id = $${idx}`;
    values.push(botId); idx++;
  }
  if (dateFrom) {
    where += ` AND c.started_at >= $${idx}`;
    values.push(dateFrom); idx++;
  }
  if (dateTo) {
    where += ` AND c.started_at <= $${idx}::date + INTERVAL '1 day'`;
    values.push(dateTo); idx++;
  }
  if (resolved === 'true') { where += ` AND c.is_resolved = true`; }
  if (resolved === 'false') { where += ` AND c.is_resolved = false`; }
  if (hasEmail === 'true') { where += ` AND c.visitor_email IS NOT NULL AND c.visitor_email != ''`; }

  const baseQuery = `
    FROM conversations c
    JOIN bots b ON c.bot_id = b.id
    LEFT JOIN messages m ON m.conversation_id = c.id AND m.role = 'user'
    ${where}
    GROUP BY c.id, b.name, b.primary_color
  `;

  let havingClause = '';
  if (minMessages) { havingClause += ` HAVING COUNT(m.id) >= ${parseInt(minMessages)}`; }
  if (maxMessages) { havingClause += (havingClause ? ' AND' : ' HAVING') + ` COUNT(m.id) <= ${parseInt(maxMessages)}`; }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM (SELECT c.id ${baseQuery} ${havingClause}) sub`,
    values
  );

  values.push(parseInt(limit), offset);
  const result = await pool.query(
    `SELECT c.id, c.session_id, c.visitor_name, c.visitor_email, c.visitor_ip,
            c.is_resolved, c.rating, c.started_at, c.last_message_at,
            b.name as bot_name, b.primary_color as bot_color, c.bot_id,
            COUNT(m.id) as message_count,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
     ${baseQuery}
     ${havingClause}
     ORDER BY c.last_message_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    values
  );

  res.json({
    conversations: result.rows,
    total: parseInt(countResult.rows[0].count),
    page: parseInt(page),
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
  });
});
