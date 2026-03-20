const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { sendMessage, getHistory } = require('../controllers/chat');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many messages. Please slow down.' },
  keyGenerator: (req) => req.body?.sessionId || req.ip,
});

router.post('/message',                        chatLimiter, sendMessage);
router.get('/history/:sessionId/:botId',       getHistory);

module.exports = router;