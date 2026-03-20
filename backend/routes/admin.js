const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllBots,
  getRevenue,
} = require('../controllers/admin');

router.use(authenticate, requireAdmin);

router.get('/stats',              getStats);
router.get('/users',              getUsers);
router.get('/users/:userId',      getUserById);
router.patch('/users/:userId',    updateUser);
router.delete('/users/:userId',   deleteUser);
router.get('/bots',               getAllBots);
router.get('/revenue',            getRevenue);

module.exports = router;