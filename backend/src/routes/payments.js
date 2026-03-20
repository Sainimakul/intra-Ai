const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const getRazorpay = () => {
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ─── Helper: activate plan for user (reusable) ────────────────────────────────
async function activatePlan(userId, planId, billingPeriod, paymentId = 'admin_grant') {
  const endsAt = new Date();
  if (billingPeriod === 'yearly') endsAt.setFullYear(endsAt.getFullYear() + 1);
  else endsAt.setMonth(endsAt.getMonth() + 1);

  await pool.query(
    `UPDATE users SET plan_id = $1, subscription_status = 'active',
     subscription_id = $2, subscription_ends_at = $3 WHERE id = $4`,
    [planId, paymentId, endsAt, userId]
  );

  // Re-activate bots that were paused due to downgrade (up to new plan limit)
  const planResult = await pool.query('SELECT max_bots FROM plans WHERE id = $1', [planId]);
  const maxBots = parseInt(planResult.rows[0]?.max_bots) || 1;

  // Reactivate the most recent N bots
  await pool.query(
    `UPDATE bots SET is_active = true
     WHERE user_id = $1
       AND id IN (
         SELECT id FROM bots WHERE user_id = $1
         ORDER BY created_at DESC LIMIT $2
       )`,
    [userId, maxBots]
  );
}

// ─── Admin email bypass — instant plan grant without payment ─────────────────
// Set ADMIN_EMAILS=admin@example.com,owner@example.com in .env
router.post('/grant', authenticate, async (req, res) => {
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.SMTP_USER || '')
    .split(',').map(e => e.trim().toLowerCase());

  if (!adminEmails.includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ error: 'Not authorized for free plan grant' });
  }

  const { planId, billingPeriod = 'monthly' } = req.body;
  const planResult = await pool.query('SELECT * FROM plans WHERE id = $1', [planId]);
  if (!planResult.rows[0]) return res.status(404).json({ error: 'Plan not found' });

  await activatePlan(req.user.id, planId, billingPeriod, 'admin_grant_free');

  // Log it as a ₹0 payment
  await pool.query(
    `INSERT INTO payments (user_id, plan_id, razorpay_order_id, amount, currency, billing_period, status, metadata)
     VALUES ($1, $2, 'admin_grant', 0, 'INR', $3, 'completed', '{"granted_free":true}')`,
    [req.user.id, planId, billingPeriod]
  );

  res.json({ message: `${planResult.rows[0].name} plan activated for free!`, plan: planResult.rows[0].name });
});

// ─── Create Order ─────────────────────────────────────────────────────────────
router.post('/create-order', authenticate, async (req, res) => {
  const { planId, billingPeriod = 'monthly' } = req.body;

  const planResult = await pool.query('SELECT * FROM plans WHERE id = $1 AND is_active = true', [planId]);
  const plan = planResult.rows[0];
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const amount = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
  if (amount === 0) return res.status(400).json({ error: 'Cannot purchase free plan' });

  // Admin email bypass — skip payment entirely
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.SMTP_USER || '')
    .split(',').map(e => e.trim().toLowerCase());

  if (adminEmails.includes(req.user.email.toLowerCase())) {
    await activatePlan(req.user.id, planId, billingPeriod, 'admin_bypass');
    await pool.query(
      `INSERT INTO payments (user_id, plan_id, razorpay_order_id, amount, currency, billing_period, status, metadata)
       VALUES ($1, $2, 'admin_bypass_${Date.now()}', 0, 'INR', $3, 'completed', '{"admin_bypass":true}')`,
      [req.user.id, planId, billingPeriod]
    );
    return res.json({ adminBypass: true, message: `${plan.name} plan activated instantly!` });
  }

  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: { userId: req.user.id, planId, billingPeriod },
  });

  await pool.query(
    `INSERT INTO payments (user_id, plan_id, razorpay_order_id, amount, currency, billing_period)
     VALUES ($1, $2, $3, $4, 'INR', $5)`,
    [req.user.id, planId, order.id, amount, billingPeriod]
  );

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    planName: plan.name,
  });
});

// ─── Verify Payment ───────────────────────────────────────────────────────────
router.post('/verify', authenticate, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, billingPeriod } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body).digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  const plan = (await pool.query('SELECT * FROM plans WHERE id = $1', [planId])).rows[0];
  await activatePlan(req.user.id, planId, billingPeriod, razorpay_payment_id);

  await pool.query(
    `UPDATE payments SET status = 'completed', razorpay_payment_id = $1, razorpay_signature = $2
     WHERE razorpay_order_id = $3`,
    [razorpay_payment_id, razorpay_signature, razorpay_order_id]
  );

  res.json({ message: `${plan.name} plan activated!`, plan: plan.name });
});

// ─── Payment History ──────────────────────────────────────────────────────────
router.get('/history', authenticate, async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, pl.name as plan_name FROM payments p
     LEFT JOIN plans pl ON p.plan_id = pl.id
     WHERE p.user_id = $1 ORDER BY p.created_at DESC LIMIT 20`,
    [req.user.id]
  );
  res.json({ payments: result.rows });
});

module.exports = router;
