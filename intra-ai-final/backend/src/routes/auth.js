const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const  {sendEmail}  = require('../services/emailService');
const emailTemplates = require('../services/emailService');

const { authenticate } = require('../middleware/auth');

const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  const { name, email, password } = req.body;
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows[0]) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const planResult = await pool.query("SELECT id FROM plans WHERE slug = 'free' LIMIT 1");
  const planId = planResult.rows[0]?.id || null;
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, plan_id, verification_token, verification_token_expires)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role`,
    [name, email, passwordHash, planId, verificationToken, verificationExpires]
  );
  const user = result.rows[0];
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
  try { 
    const tmpl = emailTemplates(name, verificationUrl);
     await sendEmail({ to: email, ...tmpl }); 
    } 
    catch (e) 
    { console.error('Email failed:', e.message); }
  const token = generateToken(user.id);
  res.status(201).json({ message: 'Registration successful. Please verify your email.', token, user: { id: user.id, name: user.name, email: user.email, role: user.role, is_verified: false } });
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query(
    'SELECT id, name, email, password_hash, role, is_active, is_verified, plan_id, subscription_status FROM users WHERE email = $1',
    [email]
  );
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  if (!user.is_active) return res.status(403).json({ error: 'Account has been disabled' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
  const token = generateToken(user.id);

  // Fetch full user + plan permissions so client has all feature flags immediately
  const fullUser = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.is_verified,
            u.subscription_status, u.messages_used_this_month,
            p.name as plan_name, p.slug as plan_slug, p.max_bots, p.max_messages_per_month,
            p.allow_url_scraping, p.allow_db_connect, p.allow_file_upload,
            p.allow_branding_removal, p.allow_analytics, p.allow_api_access
     FROM users u LEFT JOIN plans p ON u.plan_id = p.id WHERE u.id = $1`,
    [user.id]
  );

  res.json({ token, user: fullUser.rows[0] });
});

// Verify email
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Verification token required' });
  const result = await pool.query('SELECT id, name, email FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()', [token]);
  if (!result.rows[0]) return res.status(400).json({ error: 'Invalid or expired verification token' });
  const user = result.rows[0];
  await pool.query('UPDATE users SET is_verified = true, email_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = $1', [user.id]);
  try { 
    const tmpl = emailTemplates.welcomeEmail(user.name); 
    await sendEmail({ to: user.email, ...tmpl }); 
    await emailTemplates.welcomeEmail(user.email, user.name, )
  } 
  catch (e) {}
  res.json({ message: 'Email verified successfully!' });
});

// Resend verification
router.post('/resend-verification', authenticate, async (req, res) => {
  if (req.user.is_verified) return res.status(400).json({ error: 'Email already verified' });
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await pool.query('UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3', [token, expires, req.user.id]);
  await emailTemplates.verificationEmail( req.user.email,req.user.name, token );
  res.json({ message: 'Verification email sent!' });
});

// Forgot password
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], async (req, res) => {
  const { email } = req.body;
  const result = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);
  if (!result.rows[0]) return res.json({ message: 'If that email exists, a reset link has been sent.' });
  const user = result.rows[0];
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await pool.query('UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3', [resetToken, resetExpires, user.id]);
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  try { const tmpl = emailTemplates.resetPassword(user.name, resetUrl); await sendEmail({ to: email, ...tmpl }); } catch (e) {}
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  const { token, password } = req.body;
  const result = await pool.query('SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()', [token]);
  if (!result.rows[0]) return res.status(400).json({ error: 'Invalid or expired reset token' });
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query('UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2', [passwordHash, result.rows[0].id]);
  res.json({ message: 'Password reset successful!' });
});

// Get me
router.get('/me', authenticate, async (req, res) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.is_verified, u.is_active,
            u.subscription_status, u.subscription_ends_at, u.messages_used_this_month,
            u.last_login_at, u.created_at,
            p.name as plan_name, p.slug as plan_slug, p.max_bots, p.max_messages_per_month,
            p.allow_url_scraping, p.allow_db_connect, p.allow_file_upload,
            p.allow_branding_removal, p.allow_analytics, p.allow_api_access
     FROM users u LEFT JOIN plans p ON u.plan_id = p.id WHERE u.id = $1`,
    [req.user.id]
  );
  // Tell the client if this request triggered a downgrade
  res.json({ user: result.rows[0], wasDowngraded: req.wasDowngraded || false });
});

module.exports = router;
