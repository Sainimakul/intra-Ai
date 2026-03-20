const pool = require('../config/database');
const { generateResponse, buildSystemPrompt } = require('../services/geminiService');

// ─── Send Message ─────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  const { botId, message, sessionId, visitorName, visitorEmail } = req.body;

  if (!botId || !message || !sessionId) {
    return res.status(400).json({ error: 'botId, message, and sessionId are required' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
  }

  const botResult = await pool.query(
    `SELECT b.*, u.messages_used_this_month, u.messages_reset_at,
            p.max_messages_per_month
     FROM bots b
     JOIN users u ON b.user_id = u.id
     JOIN plans p ON u.plan_id = p.id
     WHERE b.id = $1 AND b.is_active = true`,
    [botId]
  );

  const bot = botResult.rows[0];
  if (!bot) return res.status(404).json({ error: 'Bot not found or inactive' });

  // Reset monthly counter if needed
  const resetDate = new Date(bot.messages_reset_at);
  const now = new Date();
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    await pool.query(
      'UPDATE users SET messages_used_this_month = 0, messages_reset_at = NOW() WHERE id = $1',
      [bot.user_id]
    );
    bot.messages_used_this_month = 0;
  }

  if (bot.messages_used_this_month >= bot.max_messages_per_month) {
    return res.status(429).json({ error: 'Monthly message limit reached. Please contact the bot owner.' });
  }

  // Get or create conversation
  let convResult = await pool.query(
    'SELECT id FROM conversations WHERE session_id = $1 AND bot_id = $2',
    [sessionId, botId]
  );

  let conversationId;
  if (!convResult.rows[0]) {
    const newConv = await pool.query(
      `INSERT INTO conversations (bot_id, session_id, visitor_name, visitor_email, visitor_ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [botId, sessionId, visitorName || null, visitorEmail || null, req.ip, req.headers['user-agent']]
    );
    conversationId = newConv.rows[0].id;
    await pool.query('UPDATE bots SET total_conversations = total_conversations + 1 WHERE id = $1', [botId]);
  } else {
    conversationId = convResult.rows[0].id;
  }

  // Fetch last 20 messages for context
  const historyResult = await pool.query(
    `SELECT role, content FROM messages
     WHERE conversation_id = $1 AND role != 'system'
     ORDER BY created_at DESC LIMIT 20`,
    [conversationId]
  );
  const conversationHistory = historyResult.rows.reverse();

  await pool.query(
    'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
    [conversationId, 'user', message]
  );

  const knowledgeResult = await pool.query(
    `SELECT name, processed_content as content FROM knowledge_sources
     WHERE bot_id = $1 AND status = 'ready' AND processed_content IS NOT NULL`,
    [botId]
  );

  const systemPrompt = buildSystemPrompt(bot, knowledgeResult.rows);

  const { text: aiResponse, tokensUsed } = await generateResponse({
    systemPrompt,
    conversationHistory,
    userMessage: message,
    botConfig: bot,
  });

  await pool.query(
    'INSERT INTO messages (conversation_id, role, content, tokens_used) VALUES ($1, $2, $3, $4)',
    [conversationId, 'assistant', aiResponse, tokensUsed]
  );

  // Update counters
  await Promise.all([
    pool.query('UPDATE users SET messages_used_this_month = messages_used_this_month + 1 WHERE id = $1', [bot.user_id]),
    pool.query('UPDATE bots SET total_messages = total_messages + 2 WHERE id = $1', [botId]),
    pool.query('UPDATE conversations SET last_message_at = NOW() WHERE id = $1', [conversationId]),
  ]);

  res.json({ message: aiResponse, conversationId, sessionId });
};

// ─── Get Conversation History ─────────────────────────────────────────────────
const getHistory = async (req, res) => {
  const convResult = await pool.query(
    'SELECT id FROM conversations WHERE session_id = $1 AND bot_id = $2',
    [req.params.sessionId, req.params.botId]
  );
  if (!convResult.rows[0]) return res.json({ messages: [] });

  const messages = await pool.query(
    `SELECT role, content, created_at FROM messages
     WHERE conversation_id = $1 AND role != 'system'
     ORDER BY created_at ASC LIMIT 100`,
    [convResult.rows[0].id]
  );
  res.json({ messages: messages.rows });
};

module.exports = { sendMessage, getHistory };