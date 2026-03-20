const path = require('path');
const fs = require('fs');
const pool = require('../config/database');

// ─── List Knowledge Sources ───────────────────────────────────────────────────
const getSources = async (req, res) => {
  const bot = await pool.query(
    'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
    [req.params.botId, req.user.id]
  );
  if (!bot.rows[0]) return res.status(404).json({ error: 'Bot not found' });

  const sources = await pool.query(
    `SELECT id, type, name, status, file_size, url, chunks_count, error_message, created_at
     FROM knowledge_sources WHERE bot_id = $1 ORDER BY created_at DESC`,
    [req.params.botId]
  );
  res.json({ sources: sources.rows });
};

// ─── Upload File ──────────────────────────────────────────────────────────────
const uploadFile = async (req, res) => {
  const bot = await pool.query(
    'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
    [req.params.botId, req.user.id]
  );
  if (!bot.rows[0]) return res.status(404).json({ error: 'Bot not found' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const source = await pool.query(
    `INSERT INTO knowledge_sources (bot_id, type, name, status, file_path, file_size)
     VALUES ($1, 'pdf', $2, 'processing', $3, $4) RETURNING *`,
    [req.params.botId, req.file.originalname, req.file.path, req.file.size]
  );

  processFile(source.rows[0].id, req.file.path, path.extname(req.file.originalname));

  res.status(201).json({ source: source.rows[0], message: 'File uploaded and being processed...' });
};

// ─── Add URL Source ───────────────────────────────────────────────────────────
const addUrlSource = async (req, res) => {
  const { url, name } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const bot = await pool.query(
    'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
    [req.params.botId, req.user.id]
  );
  if (!bot.rows[0]) return res.status(404).json({ error: 'Bot not found' });

  const source = await pool.query(
    `INSERT INTO knowledge_sources (bot_id, type, name, status, url)
     VALUES ($1, 'url', $2, 'processing', $3) RETURNING *`,
    [req.params.botId, name || url, url]
  );

  scrapeUrl(source.rows[0].id, url);

  res.status(201).json({ source: source.rows[0], message: 'URL added and being scraped...' });
};

// ─── Add Database Source ──────────────────────────────────────────────────────
const addDatabaseSource = async (req, res) => {
  const { connectionString, dbQuery, name } = req.body;
  if (!connectionString) return res.status(400).json({ error: 'Connection string required' });

  const bot = await pool.query(
    'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
    [req.params.botId, req.user.id]
  );
  if (!bot.rows[0]) return res.status(404).json({ error: 'Bot not found' });

  const source = await pool.query(
    `INSERT INTO knowledge_sources (bot_id, type, name, status, db_connection_string, db_query)
     VALUES ($1, 'database', $2, 'processing', $3, $4) RETURNING *`,
    [req.params.botId, name || 'Database', connectionString, dbQuery || 'SELECT * FROM knowledge_base LIMIT 1000']
  );

  queryDatabase(source.rows[0].id, connectionString, dbQuery);

  res.status(201).json({ source: source.rows[0], message: 'Database source added and being processed...' });
};

// ─── Add Manual Text ──────────────────────────────────────────────────────────
const addTextSource = async (req, res) => {
  const { content, name } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  const bot = await pool.query(
    'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
    [req.params.botId, req.user.id]
  );
  if (!bot.rows[0]) return res.status(404).json({ error: 'Bot not found' });

  const chunks = chunkText(content);
  const source = await pool.query(
    `INSERT INTO knowledge_sources (bot_id, type, name, status, raw_content, processed_content, chunks_count)
     VALUES ($1, 'text', $2, 'ready', $3, $4, $5) RETURNING *`,
    [req.params.botId, name || 'Manual Text', content, content, chunks.length]
  );

  res.status(201).json({ source: source.rows[0], message: 'Text knowledge added!' });
};

// ─── Delete Source ────────────────────────────────────────────────────────────
const deleteSource = async (req, res) => {
  const result = await pool.query(
    `DELETE FROM knowledge_sources ks
     USING bots b
     WHERE ks.id = $1 AND ks.bot_id = b.id AND b.user_id = $2
     RETURNING ks.id, ks.file_path`,
    [req.params.sourceId, req.user.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Source not found' });

  if (result.rows[0].file_path) {
    try { fs.unlinkSync(result.rows[0].file_path); } catch (e) {}
  }

  res.json({ message: 'Knowledge source deleted' });
};

// ─── Async Processors ─────────────────────────────────────────────────────────
async function processFile(sourceId, filePath, ext) {
  try {
    let content = '';
    if (ext === '.pdf') {
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      content = data.text;
    } else {
      content = fs.readFileSync(filePath, 'utf8');
    }

    const cleaned = content.replace(/\s+/g, ' ').trim();
    const chunks = chunkText(cleaned);

    await pool.query(
      `UPDATE knowledge_sources SET status = 'ready', processed_content = $1, chunks_count = $2, raw_content = $3
       WHERE id = $4`,
      [cleaned.substring(0, 50000), chunks.length, cleaned.substring(0, 10000), sourceId]
    );
  } catch (err) {
    console.error('File processing error:', err);
    await pool.query(
      "UPDATE knowledge_sources SET status = 'error', error_message = $1 WHERE id = $2",
      [err.message, sourceId]
    );
  }
}

async function scrapeUrl(sourceId, url) {
  try {
    const axios = require('axios');
    const cheerio = require('cheerio');

    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IntraAI-Bot/1.0)' },
    });

    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, header, .cookie-banner, #cookie-consent').remove();

    const title = $('title').text().trim();
    const headings = $('h1, h2, h3').map((_, el) => $(el).text().trim()).get().join('\n');
    const paragraphs = $('p, li, td').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 20).join('\n');
    const content = `Title: ${title}\n\nHeadings:\n${headings}\n\nContent:\n${paragraphs}`;
    const cleaned = content.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

    await pool.query(
      `UPDATE knowledge_sources SET status = 'ready', processed_content = $1, chunks_count = $2, raw_content = $3
       WHERE id = $4`,
      [cleaned.substring(0, 50000), Math.ceil(cleaned.length / 2000), cleaned.substring(0, 10000), sourceId]
    );
  } catch (err) {
    console.error('URL scraping error:', err);
    await pool.query(
      "UPDATE knowledge_sources SET status = 'error', error_message = $1 WHERE id = $2",
      [err.message, sourceId]
    );
  }
}

async function queryDatabase(sourceId, connectionString, dbQuery) {
  const { Pool } = require('pg');
  let externalPool;
  try {
    externalPool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
    const result = await externalPool.query(dbQuery || 'SELECT * FROM knowledge_base LIMIT 500');
    const content = result.rows
      .map(row => Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(', '))
      .join('\n');

    await pool.query(
      `UPDATE knowledge_sources SET status = 'ready', processed_content = $1, chunks_count = $2
       WHERE id = $3`,
      [content.substring(0, 50000), result.rows.length, sourceId]
    );
  } catch (err) {
    await pool.query(
      "UPDATE knowledge_sources SET status = 'error', error_message = $1 WHERE id = $2",
      [err.message, sourceId]
    );
  } finally {
    if (externalPool) await externalPool.end();
  }
}

function chunkText(text, chunkSize = 2000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports = {
  getSources,
  uploadFile,
  addUrlSource,
  addDatabaseSource,
  addTextSource,
  deleteSource,
};