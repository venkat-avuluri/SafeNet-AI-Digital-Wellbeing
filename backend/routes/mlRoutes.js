const express = require('express');
const router = express.Router();
const {
  triggerAssessment,
  customAssessment,
  getAssessmentHistory,
  getLatestAssessment,
  getMLStatus
} = require('../controllers/mlController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/assess', triggerAssessment);
router.post('/simulate', customAssessment);
router.get('/history', getAssessmentHistory);
router.get('/latest', getLatestAssessment);
router.get('/status', getMLStatus);

module.exports = router;
