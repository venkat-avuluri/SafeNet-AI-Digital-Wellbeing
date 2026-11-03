const RiskAssessment = require('../models/RiskAssessment');
const analyticsService = require('../services/analyticsService');
const mlClientService = require('../services/mlClientService');
const recommendationEngine = require('../services/recommendationEngine');

// @desc    Trigger a fresh AI Risk Assessment based on user's actual usage logs
// @route   POST /api/ml/assess
// @access  Private
exports.triggerAssessment = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Extract aggregated ML features from user's recent records
    const features = await analyticsService.extractMLFeatures(userId);

    // 2. Query Python FastAPI ML Service (or fallback heuristic if offline)
    const prediction = await mlClientService.predict(features);

    // 3. Save assessment record in MongoDB
    const assessment = await RiskAssessment.create({
      user: userId,
      assessmentDate: new Date(),
      riskLevel: prediction.risk_level,
      riskScore: prediction.risk_score,
      confidence: prediction.confidence,
      probabilities: prediction.probabilities,
      inputFeatures: {
        dailyScreenTimeHours: features.daily_screen_time_hours,
        avgSessionMins: features.avg_session_mins,
        sessionsPerDay: features.sessions_per_day,
        nightTimeMins: features.night_time_mins,
        socialMediaHours: features.social_media_hours,
        gamingHours: features.gaming_hours,
        productiveHours: features.productive_hours,
        entertainmentHours: features.entertainment_hours,
        weekendWeekdayRatio: features.weekend_weekday_ratio
      },
      keyFactors: prediction.key_factors || [],
      recommendations: prediction.recommendations || [],
      source: prediction.source || 'fastapi_ml',
      disclaimer: prediction.disclaimer
    });

    // 4. Update personalized recommendations collection
    const dashboardSummary = await analyticsService.getDashboardSummary(
      userId,
      req.user.dailyScreenTimeGoalMinutes || 240
    );
    await recommendationEngine.generatePersonalizedRecommendations(
      userId,
      dashboardSummary,
      assessment
    );

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run custom hypothetical (What-If) risk simulation
// @route   POST /api/ml/simulate
// @access  Private
exports.customAssessment = async (req, res, next) => {
  try {
    const customFeatures = req.body;
    const prediction = await mlClientService.predict(customFeatures);

    res.status(200).json({
      success: true,
      simulatedFeatures: customFeatures,
      data: prediction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's past risk assessments
// @route   GET /api/ml/history
// @access  Private
exports.getAssessmentHistory = async (req, res, next) => {
  try {
    const assessments = await RiskAssessment.find({ user: req.user._id })
      .sort({ assessmentDate: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest risk assessment for user
// @route   GET /api/ml/latest
// @access  Private
exports.getLatestAssessment = async (req, res, next) => {
  try {
    const latest = await RiskAssessment.findOne({ user: req.user._id })
      .sort({ assessmentDate: -1 });

    res.status(200).json({
      success: true,
      data: latest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ML service connection status & health
// @route   GET /api/ml/status
// @access  Private
exports.getMLStatus = async (req, res, next) => {
  try {
    const health = await mlClientService.checkHealth();
    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
};
