const pool = require('../config/database');

// ─── Get All User Bots ────────────────────────────────────────────────────────
const getBots = async (req, res) => {
  const result = await pool.query(
    `SELECT b.*, COUNT(DISTINCT c.id) as conversation_count
     FROM bots b
     LEFT JOIN conversations c ON c.bot_id = b.id
     WHERE b.user_id = $1
     GROUP BY b.id
     ORDER BY b.created_at DESC`,
    [req.user.id]
  );
  res.json({ bots: result.rows });
};

// ─── Get Single Bot ───────────────────────────────────────────────────────────
const getBotById = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM bots WHERE id = $1 AND user_id = $2',
    [req.params.botId, req.user.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Bot not found' });

  const bot = result.rows[0];

  const planResult = await pool.query(
    `SELECT p.max_bots FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.id = $1`,
    [req.user.id]
  );
  const maxBots = parseInt(planResult.rows[0]?.max_bots) || 1;

  const rankResult = await pool.query(
    `SELECT id FROM bots WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [req.user.id, maxBots]
  );
  const allowedBotIds = rankResult.rows.map(r => r.id);
  bot.is_over_limit = !allowedBotIds.includes(bot.id);

  res.json({ bot });
};

// ─── Get Bot Public (for embed) ───────────────────────────────────────────────
const getPublicBot = async (req, res) => {
  const result = await pool.query(
    `SELECT b.id, b.name, b.bot_name, b.description, b.avatar_url,
            b.primary_color, b.secondary_color, b.text_color, b.font_family,
            b.bubble_style, b.welcome_message, b.placeholder_text,
            b.show_branding, b.collect_email, b.allow_file_uploads, b.is_active
     FROM bots b WHERE b.id = $1 AND b.is_active = true`,
    [req.params.botId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Bot not found' });
  res.json({ bot: result.rows[0] });
};

// ─── Create Bot ───────────────────────────────────────────────────────────────
const createBot = async (req, res) => {
  const planResult = await pool.query(
    `SELECT p.max_bots FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.id = $1`,
    [req.user.id]
  );
  const maxBots = planResult.rows[0]?.max_bots || 1;
  const countResult = await pool.query('SELECT COUNT(*) FROM bots WHERE user_id = $1', [req.user.id]);

  if (parseInt(countResult.rows[0].count) >= maxBots) {
    return res.status(403).json({
      error: `Your plan allows a maximum of ${maxBots} bot(s). Please upgrade.`,
    });
  }

  const {
    name, description, bot_name, welcome_message, system_prompt,
    primary_color, secondary_color, text_color, font_family, bubble_style,
    position, placeholder_text, language, response_length, temperature, max_tokens,
  } = req.body;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

  const result = await pool.query(
    `INSERT INTO bots (user_id, name, slug, description, bot_name, welcome_message, system_prompt,
      primary_color, secondary_color, text_color, font_family, bubble_style, position,
      placeholder_text, language, response_length, temperature, max_tokens)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING *`,
    [
      req.user.id, name, slug, description || '', bot_name || 'AI Assistant',
      welcome_message || 'Hello! How can I help you today?',
      system_prompt || 'You are a helpful AI assistant.',
      primary_color || '#2563EB', secondary_color || '#DBEAFE',
      text_color || '#1F2937', font_family || 'Inter',
      bubble_style || 'rounded', position || 'bottom-right',
      placeholder_text || 'Type your message...', language || 'en',
      response_length || 'medium', parseFloat(temperature) || 0.7, parseInt(max_tokens) || 1000,
    ]
  );

  res.status(201).json({ bot: result.rows[0], message: 'Bot created successfully!' });
};

// ─── Update Bot ───────────────────────────────────────────────────────────────
const updateBot = async (req, res) => {
  const existing = await pool.query(
    'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
    [req.params.botId, req.user.id]
  );
  if (!existing.rows[0]) return res.status(404).json({ error: 'Bot not found' });

  const planCheck = await pool.query(
    `SELECT p.max_bots, p.allow_branding_removal, p.allow_url_scraping, p.allow_db_connect,
            p.allow_analytics, p.allow_api_access, p.slug as plan_slug
     FROM users u LEFT JOIN plans p ON u.plan_id = p.id WHERE u.id = $1`,
    [req.user.id]
  );
  const plan = planCheck.rows[0] || {};
  const maxBots = parseInt(plan.max_bots) || 1;

  const rankResult = await pool.query(
    `SELECT id FROM bots WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [req.user.id, maxBots]
  );
  const allowedBotIds = rankResult.rows.map(r => r.id);
  const isOverLimit = !allowedBotIds.includes(req.params.botId);

  if (isOverLimit) {
    return res.status(403).json({
      error: 'This bot is paused because it exceeds your current plan limit. Upgrade to edit it.',
      code: 'BOT_OVER_LIMIT',
    });
  }

  // Enforce plan permissions server-side
  if (req.body.show_branding === false && !plan.allow_branding_removal) req.body.show_branding = true;
  if (req.body.collect_email === true && !plan.allow_analytics) req.body.collect_email = false;
  if (plan.plan_slug !== 'business') {
    delete req.body.font_family;
    delete req.body.avatar_url;
  }

  const fields = [
    'name', 'description', 'bot_name', 'welcome_message', 'system_prompt',
    'primary_color', 'secondary_color', 'text_color', 'font_family', 'bubble_style',
    'position', 'placeholder_text', 'language', 'response_length', 'temperature',
    'max_tokens', 'is_active', 'is_public', 'allow_file_uploads', 'collect_email',
    'show_branding', 'embed_domain', 'avatar_url',
  ];

  const updates = [], values = [];
  let idx = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${idx++}`);
      values.push(req.body[f]);
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.botId);

  const result = await pool.query(
    `UPDATE bots SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  res.json({ bot: result.rows[0], message: 'Bot updated successfully!' });
};

// ─── Delete Bot ───────────────────────────────────────────────────────────────
const deleteBot = async (req, res) => {
  const result = await pool.query(
    'DELETE FROM bots WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.botId, req.user.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Bot not found' });
  res.json({ message: 'Bot deleted successfully' });
};

// ─── Get Embed Code ───────────────────────────────────────────────────────────
const getEmbedCode = async (req, res) => {
  const result = await pool.query(
    'SELECT id, name FROM bots WHERE id = $1 AND user_id = $2',
    [req.params.botId, req.user.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Bot not found' });

  const botId = result.rows[0].id;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const embedCode = `<!-- INTRA AI Chatbot Widget -->
<script>
  window.IntraAIConfig = { botId: "${botId}" };
</script>
<script src="${frontendUrl}/chatbot-widget.js" async></script>`;

  const iframeCode = `<iframe
  src="${frontendUrl}/chatbot/${botId}"
  width="400" height="600"
  frameborder="0"
  style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.15);"
></iframe>`;

  res.json({ embedCode, iframeCode, botId });
};

module.exports = {
  getBots,
  getBotById,
  getPublicBot,
  createBot,
  updateBot,
  deleteBot,
  getEmbedCode,
};