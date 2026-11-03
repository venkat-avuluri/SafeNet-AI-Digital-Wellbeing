const express = require('express');
const router = express.Router();
const {
  getReportSummary,
  exportReportData
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getReportSummary);
router.get('/export', exportReportData);

module.exports = router;
