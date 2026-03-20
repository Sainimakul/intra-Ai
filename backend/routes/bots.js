const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, requireVerified } = require('../middleware/auth');
const {
  getBots,
  getBotById,
  getPublicBot,
  createBot,
  updateBot,
  deleteBot,
  getEmbedCode,
} = require('../controllers/bots');

router.get('/public/:botId',         getPublicBot);

router.get('/',                      authenticate, getBots);
router.get('/:botId',                authenticate, getBotById);
router.get('/:botId/embed',          authenticate, getEmbedCode);

router.post('/', authenticate, requireVerified, [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('bot_name').optional().trim().isLength({ max: 100 }),
], createBot);

router.put('/:botId',                authenticate, updateBot);
router.delete('/:botId',             authenticate, deleteBot);

module.exports = router;