const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/plans');

router.get('/',        getPlans);
router.get('/:id',     getPlanById);
router.post('/',       authenticate, requireAdmin, createPlan);
router.put('/:id',     authenticate, requireAdmin, updatePlan);
router.delete('/:id',  authenticate, requireAdmin, deletePlan);

module.exports = router;