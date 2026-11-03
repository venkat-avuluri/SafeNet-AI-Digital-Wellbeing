const Recommendation = require('../models/Recommendation');
const analyticsService = require('../services/analyticsService');
const RiskAssessment = require('../models/RiskAssessment');
const recommendationEngine = require('../services/recommendationEngine');

// @desc    Get user's personalized recommendations
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    let recommendations = await Recommendation.find({ user: req.user._id }).sort({
      isCompleted: 1,
      createdAt: -1
    });

    // If none exist yet, automatically generate initial recommendations
    if (recommendations.length === 0) {
      const summary = await analyticsService.getDashboardSummary(
        req.user._id,
        req.user.dailyScreenTimeGoalMinutes || 240
      );
      const latestAssessment = await RiskAssessment.findOne({ user: req.user._id }).sort({
        assessmentDate: -1
      });
      recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        req.user._id,
        summary,
        latestAssessment
      );
    }

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle recommendation completion status
// @route   PUT /api/recommendations/:id/toggle
// @access  Private
exports.toggleRecommendation = async (req, res, next) => {
  try {
    const rec = await Recommendation.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!rec) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found.'
      });
    }

    rec.isCompleted = !rec.isCompleted;
    rec.completedAt = rec.isCompleted ? new Date() : null;
    await rec.save();

    res.status(200).json({
      success: true,
      data: rec
    });
  } catch (error) {
    next(error);
  }
};
