const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM plans WHERE is_active = true ORDER BY sort_order ASC'
  );
  res.json({ plans: result.rows });
});

router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM plans WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Plan not found' });
  res.json({ plan: result.rows[0] });
});

// Admin: Create plan
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const {
    name, slug, description, price_monthly, price_yearly,
    max_bots, max_messages_per_month, max_training_files, max_file_size_mb,
    allow_custom_domain, allow_url_scraping, allow_db_connect,
    allow_file_upload, allow_branding_removal, allow_analytics, allow_api_access,
    features, is_featured, sort_order,
  } = req.body;

  const result = await pool.query(
    `INSERT INTO plans (name, slug, description, price_monthly, price_yearly,
      max_bots, max_messages_per_month, max_training_files, max_file_size_mb,
      allow_custom_domain, allow_url_scraping, allow_db_connect, allow_file_upload,
      allow_branding_removal, allow_analytics, allow_api_access, features, is_featured, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     RETURNING *`,
    [name, slug, description, price_monthly, price_yearly,
     max_bots, max_messages_per_month, max_training_files || 5, max_file_size_mb || 10,
     allow_custom_domain || false, allow_url_scraping || false, allow_db_connect || false,
     allow_file_upload !== false, allow_branding_removal || false,
     allow_analytics || false, allow_api_access || false,
     JSON.stringify(features || []), is_featured || false, sort_order || 99]
  );
  res.status(201).json({ plan: result.rows[0] });
});

// Admin: Update plan
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const fields = [
    'name', 'description', 'price_monthly', 'price_yearly', 'max_bots',
    'max_messages_per_month', 'max_training_files', 'max_file_size_mb',
    'allow_custom_domain', 'allow_url_scraping', 'allow_db_connect',
    'allow_file_upload', 'allow_branding_removal', 'allow_analytics',
    'allow_api_access', 'features', 'is_active', 'is_featured', 'sort_order',
  ];
  const updates = [], values = [];
  let idx = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${idx++}`);
      values.push(f === 'features' ? JSON.stringify(req.body[f]) : req.body[f]);
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  const result = await pool.query(`UPDATE plans SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values);
  if (!result.rows[0]) return res.status(404).json({ error: 'Plan not found' });
  res.json({ plan: result.rows[0] });
});

// Admin: Delete plan
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const result = await pool.query('DELETE FROM plans WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Plan not found' });
  res.json({ message: 'Plan deleted' });
});

module.exports = router;
