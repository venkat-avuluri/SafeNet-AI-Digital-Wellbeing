const Recommendation = require('../models/Recommendation');

class RecommendationEngine {
  /**
   * Generates or refreshes user recommendations based on analytics and ML assessment
   */
  async generatePersonalizedRecommendations(userId, analyticsSummary, riskAssessment) {
    const recommendationsToInsert = [];

    const {
      todayScreenTimeHours,
      weeklyAverageHours,
      todayNightMinutes,
      categoryBreakdown = {},
      goalExceeded
    } = analyticsSummary;

    const riskLevel = riskAssessment ? riskAssessment.riskLevel : 'Low Risk';

    // 1. Goal Exceeded
    if (goalExceeded) {
      recommendationsToInsert.push({
        user: userId,
        category: 'Daily Boundaries',
        title: 'Screen Time Goal Reached Today',
        action: `You have accumulated ${todayScreenTimeHours}h of screen time, exceeding your daily target. Consider switching to offline hobbies or relaxation for the remainder of the evening.`,
        priority: 'HIGH',
        triggerReason: 'Daily screen time exceeded user-defined target.'
      });
    }

    // 2. High Night-Time Usage
    if (todayNightMinutes > 45) {
      recommendationsToInsert.push({
        user: userId,
        category: 'Sleep Hygiene',
        title: 'Mitigate Night-Time Blue Light Exposure',
        action: `You logged ${todayNightMinutes} minutes past bedtime hours. Activate Night Shift/Blue Light Filter or keep smartphones away from your bedside to preserve restorative sleep cycles.`,
        priority: 'HIGH',
        triggerReason: 'High late-night screen duration detected.'
      });
    }

    // 3. Excessive Social Media
    const socialMins = categoryBreakdown['Social Media'] || 0;
    const socialHours = Number((socialMins / 60).toFixed(1));
    if (socialHours > 2.5) {
      recommendationsToInsert.push({
        user: userId,
        category: 'Mindful Scrolling',
        title: 'Establish 45-Minute Social Media App Caps',
        action: `Social media accounts for ${socialHours}h of your weekly activity. Use native app timers or designated review windows (e.g. 12:30 PM and 7:00 PM) rather than continuous scrolling.`,
        priority: 'HIGH',
        triggerReason: 'Social media constitutes an elevated fraction of digital engagement.'
      });
    }

    // 4. Excessive Gaming / Binging
    const gamingMins = categoryBreakdown['Gaming'] || 0;
    const entertainmentMins = categoryBreakdown['Entertainment'] || 0;
    if ((gamingMins + entertainmentMins) / 60 > 3.0) {
      recommendationsToInsert.push({
        user: userId,
        category: 'Recreation Balance',
        title: 'Incorporate Active Offline Rest',
        action: 'Balance extended streaming and gaming sessions with physical movement, walking outdoors, or light stretching.',
        priority: 'MODERATE',
        triggerReason: 'High combined recreational screen exposure.'
      });
    }

    // 5. General Habit Hygiene based on Risk Level
    if (riskLevel === 'High Risk') {
      recommendationsToInsert.push({
        user: userId,
        category: 'Digital Detox',
        title: 'Schedule a Weekend Half-Day Digital Reset',
        action: 'Plan a 4-hour unplugged block this weekend to disconnect notifications and reconnect with outdoor activities or books.',
        priority: 'HIGH',
        triggerReason: 'AI model classified overall risk index as High.'
      });
    } else if (riskLevel === 'Moderate Risk') {
      recommendationsToInsert.push({
        user: userId,
        category: 'Focus Management',
        title: 'Implement the 50-10 Work Rhythm',
        action: 'Work focused for 50 minutes, then step away from all screens for a 10-minute mental refresh.',
        priority: 'MODERATE',
        triggerReason: 'Moderate habit risk pattern detected.'
      });
    } else {
      recommendationsToInsert.push({
        user: userId,
        category: 'Maintenance',
        title: 'Maintain Healthy Digital Balance',
        action: 'Great job maintaining balanced habits! Continue observing your daily limits and bedtime wind-down.',
        priority: 'LOW',
        triggerReason: 'Usage patterns reflect healthy balance.'
      });
    }

    // Upsert recommendations: clean existing uncompleted ones and insert fresh batch
    await Recommendation.deleteMany({ user: userId, isCompleted: false });
    const saved = await Recommendation.insertMany(recommendationsToInsert);
    return saved;
  }
}

module.exports = new RecommendationEngine();
