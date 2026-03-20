const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  grantPlan,
  createOrder,
  verifyPayment,
  getPaymentHistory,
} = require('../controllers/payments');

router.post('/grant',         authenticate, grantPlan);
router.post('/create-order',  authenticate, createOrder);
router.post('/verify',        authenticate, verifyPayment);
router.get('/history',        authenticate, getPaymentHistory);

module.exports = router;