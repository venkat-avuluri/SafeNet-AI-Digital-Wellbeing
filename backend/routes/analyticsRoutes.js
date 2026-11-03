const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getDetailedAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/detailed', getDetailedAnalytics);

module.exports = router;
