const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { updateProfile, changePassword, deleteAccount, contactUs } = require('../controllers/users');

router.put('/profile',   authenticate, updateProfile);
router.put('/password',  authenticate, changePassword);
router.delete('/account', authenticate, deleteAccount);
router.post('/contact',  contactUs);

module.exports = router;