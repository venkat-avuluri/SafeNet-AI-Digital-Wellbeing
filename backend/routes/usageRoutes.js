const express = require('express');
const router = express.Router();
const {
  logUsage,
  getUsageRecords,
  deleteUsageRecord,
  seedDemoData,
  clearUserData
} = require('../controllers/usageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(logUsage)
  .get(getUsageRecords);

router.post('/seed-demo', seedDemoData);
router.delete('/clear-all', clearUserData);
router.delete('/:id', deleteUsageRecord);

module.exports = router;
