const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  const { name, avatar_url } = req.body;
  const updates = [], values = [];
  let idx = 1;
  if (name) { updates.push(`name = $${idx++}`); values.push(name); }
  if (avatar_url !== undefined) { updates.push(`avatar_url = $${idx++}`); values.push(avatar_url); }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.user.id);
  const result = await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, avatar_url`, values);
  res.json({ user: result.rows[0], message: 'Profile updated' });
});

// Change password
router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
  res.json({ message: 'Password updated successfully' });
});

// Delete account
router.delete('/account', authenticate, async (req, res) => {
  const { password } = req.body;
  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  const valid = await bcrypt.compare(password, result.rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Password incorrect' });
  await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
  res.json({ message: 'Account deleted' });
});

module.exports = router;

// ─── Contact Us (public) ──────────────────────────────────────────────────────
router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message are required' });

  const { sendEmail } = require('../services/emailService');
  try {
    await sendEmail({
      to: process.env.SMTP_USER,
      subject: `[INTRA AI Contact] ${subject || 'New message from ' + name}`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#2563EB">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-weight:600;color:#374151">Name:</td><td style="padding:8px 0;color:#6b7280">${name}</td></tr>
            <tr><td style="padding:8px 0;font-weight:600;color:#374151">Email:</td><td style="padding:8px 0;color:#6b7280">${email}</td></tr>
            <tr><td style="padding:8px 0;font-weight:600;color:#374151">Subject:</td><td style="padding:8px 0;color:#6b7280">${subject || 'N/A'}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px">
            <p style="color:#374151;white-space:pre-wrap">${message}</p>
          </div>
        </div>`,
    });
    // Send confirmation to user
    await sendEmail({
      to: email,
      subject: "We received your message — INTRA AI",
      html: `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#2563EB">Thanks for reaching out, ${name}!</h2>
        <p style="color:#6b7280">We've received your message and will get back to you within 24 hours.</p>
        <p style="color:#6b7280">Your message: <em>${message.substring(0, 200)}...</em></p>
        <p style="color:#9ca3af;font-size:12px">— The INTRA AI Team</p>
      </div>`,
    });
  } catch (e) { console.error('Contact email error:', e.message); }

  res.json({ message: 'Message sent! We\'ll get back to you within 24 hours.' });
});
