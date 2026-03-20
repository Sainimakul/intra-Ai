const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getBotAnalytics,
  getBotConversations,
  getConversationMessages,
  toggleResolveConversation,
  getAllConversations,
} = require('../controllers/analytics');

router.get('/bot/:botId',                                    authenticate, getBotAnalytics);
router.get('/bot/:botId/conversations',                      authenticate, getBotConversations);
router.get('/conversation/:conversationId/messages',         authenticate, getConversationMessages);
router.patch('/conversation/:conversationId/resolve',        authenticate, toggleResolveConversation);
router.get('/conversations',                                 authenticate, getAllConversations);

module.exports = router;