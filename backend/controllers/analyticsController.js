const analyticsService = require('../services/analyticsService');

// @desc    Get top-level dashboard analytics summary
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getDashboardSummary(
      req.user._id,
      req.user.dailyScreenTimeGoalMinutes || 240
    );

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed charts analytics (7-day or 30-day)
// @route   GET /api/analytics/detailed
// @access  Private
exports.getDetailedAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days || '7', 10);
    const detailed = await analyticsService.getDetailedAnalytics(req.user._id, days);

    res.status(200).json({
      success: true,
      data: detailed
    });
  } catch (error) {
    next(error);
  }
};
