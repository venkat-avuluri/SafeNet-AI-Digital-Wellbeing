const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  toggleRecommendation
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getRecommendations);
router.put('/:id/toggle', toggleRecommendation);

module.exports = router;
