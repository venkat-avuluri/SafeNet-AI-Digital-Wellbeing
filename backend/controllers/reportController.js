const UsageRecord = require('../models/UsageRecord');
const RiskAssessment = require('../models/RiskAssessment');
const Recommendation = require('../models/Recommendation');
const analyticsService = require('../services/analyticsService');

// @desc    Get comprehensive wellbeing report summary
// @route   GET /api/reports/summary
// @access  Private
exports.getReportSummary = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const userId = req.user._id;

    const summary = await analyticsService.getDashboardSummary(
      userId,
      req.user.dailyScreenTimeGoalMinutes || 240
    );
    const detailed = await analyticsService.getDetailedAnalytics(userId, days);
    const recentAssessments = await RiskAssessment.find({ user: userId })
      .sort({ assessmentDate: -1 })
      .limit(5);
    const completedHabits = await Recommendation.countDocuments({
      user: userId,
      isCompleted: true
    });

    res.status(200).json({
      success: true,
      data: {
        reportingPeriodDays: days,
        generatedAt: new Date(),
        user: {
          name: req.user.name,
          email: req.user.email,
          dailyGoalMinutes: req.user.dailyScreenTimeGoalMinutes
        },
        overview: summary,
        trends: detailed,
        assessments: recentAssessments,
        completedHabitsCount: completedHabits
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export usage data as CSV or JSON
// @route   GET /api/reports/export
// @access  Private
exports.exportReportData = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;
    const userId = req.user._id;

    const records = await UsageRecord.find({ user: userId }).sort({ date: -1 });

    if (format === 'csv') {
      const headers = 'Date,Application,Category,Duration_Minutes,Session_Minutes,Time_Period,Night_Usage,Notes\n';
      const rows = records.map((r) => {
        const d = new Date(r.date).toISOString().split('T')[0];
        const notes = (r.notes || '').replace(/,/g, ';');
        return `${d},"${r.appName}","${r.category}",${r.durationMinutes},${r.sessionDurationMinutes},"${r.timePeriod}",${r.isNightUsage},"${notes}"`;
      });

      const csvContent = headers + rows.join('\n');
      res.header('Content-Type', 'text/csv');
      res.attachment(`safenet_usage_report_${Date.now()}.csv`);
      return res.send(csvContent);
    }

    // Default JSON export
    res.status(200).json({
      success: true,
      exportedAt: new Date(),
      user: {
        name: req.user.name,
        email: req.user.email
      },
      count: records.length,
      records
    });
  } catch (error) {
    next(error);
  }
};
