const UsageRecord = require('../models/UsageRecord');
const { getStartAndEndOfDay, getNDaysAgoRange } = require('../utils/helpers');

class AnalyticsService {
  /**
   * Computes high-level dashboard metrics for a user
   */
  async getDashboardSummary(userId, userGoalMinutes = 240) {
    const { start: todayStart, end: todayEnd } = getStartAndEndOfDay();
    const { start: weekStart, end: weekEnd } = getNDaysAgoRange(7);

    // 1. Fetch Today's Logs
    const todayLogs = await UsageRecord.find({
      user: userId,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    const todayScreenTimeMins = todayLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const todayNightMins = todayLogs
      .filter((log) => log.isNightUsage || log.timePeriod === 'Night')
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    // 2. Fetch Last 7 Days Logs
    const weekLogs = await UsageRecord.find({
      user: userId,
      date: { $gte: weekStart, $lte: weekEnd }
    });

    const weekTotalMins = weekLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const uniqueDaysInWeek = new Set(
      weekLogs.map((log) => new Date(log.date).toISOString().split('T')[0])
    ).size || 1;
    const weeklyAverageDailyMins = Math.round(weekTotalMins / Math.max(uniqueDaysInWeek, 1));

    // 3. Category Breakdown (7 Days)
    const categoryTotals = {};
    weekLogs.forEach((log) => {
      categoryTotals[log.category] = (categoryTotals[log.category] || 0) + log.durationMinutes;
    });

    // 4. Most Used Apps
    const appTotals = {};
    weekLogs.forEach((log) => {
      appTotals[log.appName] = (appTotals[log.appName] || 0) + log.durationMinutes;
    });

    const topApps = Object.entries(appTotals)
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);

    // 5. Goal Achievement
    const goalPercentage = Math.min(Math.round((todayScreenTimeMins / userGoalMinutes) * 100), 100);
    const goalExceeded = todayScreenTimeMins > userGoalMinutes;

    return {
      todayScreenTimeMinutes: todayScreenTimeMins,
      todayScreenTimeHours: Number((todayScreenTimeMins / 60).toFixed(1)),
      weeklyAverageMinutes: weeklyAverageDailyMins,
      weeklyAverageHours: Number((weeklyAverageDailyMins / 60).toFixed(1)),
      weeklyTotalMinutes: weekTotalMins,
      todayNightMinutes: todayNightMins,
      todayNightHours: Number((todayNightMins / 60).toFixed(1)),
      dailyGoalMinutes: userGoalMinutes,
      goalPercentage,
      goalExceeded,
      categoryBreakdown: categoryTotals,
      topApps,
      totalLogsCount: weekLogs.length
    };
  }

  /**
   * Aggregates day-by-day and category metrics for Chart.js rendering
   */
  async getDetailedAnalytics(userId, days = 7) {
    const { start, end } = getNDaysAgoRange(days);

    const logs = await UsageRecord.find({
      user: userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // Initialize daily map
    const dailyMap = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dailyMap[key] = { date: key, label, totalMinutes: 0, nightMinutes: 0, categories: {} };
    }

    const categoryMap = {};
    const appMap = {};
    const timePeriodMap = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };

    logs.forEach((log) => {
      const dateKey = new Date(log.date).toISOString().split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].totalMinutes += log.durationMinutes;
        if (log.isNightUsage || log.timePeriod === 'Night') {
          dailyMap[dateKey].nightMinutes += log.durationMinutes;
        }
        dailyMap[dateKey].categories[log.category] =
          (dailyMap[dateKey].categories[log.category] || 0) + log.durationMinutes;
      }

      categoryMap[log.category] = (categoryMap[log.category] || 0) + log.durationMinutes;
      appMap[log.appName] = (appMap[log.appName] || 0) + log.durationMinutes;
      timePeriodMap[log.timePeriod] = (timePeriodMap[log.timePeriod] || 0) + log.durationMinutes;
    });

    const dailyTrends = Object.values(dailyMap);

    const topApps = Object.entries(appMap)
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 8);

    return {
      periodDays: days,
      dailyTrends,
      categoryDistribution: categoryMap,
      timePeriodDistribution: timePeriodMap,
      appComparison: topApps,
      totalPeriodMinutes: logs.reduce((acc, curr) => acc + curr.durationMinutes, 0)
    };
  }

  /**
   * Extracts feature vector from recent activity to supply to the ML Model
   */
  async extractMLFeatures(userId) {
    const { start, end } = getNDaysAgoRange(7);
    const logs = await UsageRecord.find({
      user: userId,
      date: { $gte: start, $lte: end }
    });

    if (logs.length === 0) {
      // Default baseline values if no records yet
      return {
        daily_screen_time_hours: 3.5,
        avg_session_mins: 25.0,
        sessions_per_day: 20,
        night_time_mins: 15.0,
        social_media_hours: 1.0,
        gaming_hours: 0.5,
        productive_hours: 1.5,
        entertainment_hours: 0.5,
        weekend_weekday_ratio: 1.1,
        break_frequency_per_day: 4
      };
    }

    const uniqueDays = new Set(
      logs.map((log) => new Date(log.date).toISOString().split('T')[0])
    ).size || 1;

    let totalDurationMins = 0;
    let totalSessionMins = 0;
    let nightTimeMins = 0;
    let socialMins = 0;
    let gamingMins = 0;
    let productiveMins = 0;
    let entertainmentMins = 0;

    logs.forEach((log) => {
      totalDurationMins += log.durationMinutes;
      totalSessionMins += log.sessionDurationMinutes || log.durationMinutes;
      if (log.isNightUsage || log.timePeriod === 'Night') {
        nightTimeMins += log.durationMinutes;
      }
      if (log.category === 'Social Media') socialMins += log.durationMinutes;
      if (log.category === 'Gaming') gamingMins += log.durationMinutes;
      if (log.category === 'Productivity' || log.category === 'Education') productiveMins += log.durationMinutes;
      if (log.category === 'Entertainment') entertainmentMins += log.durationMinutes;
    });

    const avgDailyScreenTimeHours = (totalDurationMins / uniqueDays) / 60.0;
    const avgSessionMins = totalSessionMins / logs.length;
    const avgSessionsPerDay = Math.round(logs.length / uniqueDays);
    const avgNightMins = nightTimeMins / uniqueDays;
    const avgSocialHours = (socialMins / uniqueDays) / 60.0;
    const avgGamingHours = (gamingMins / uniqueDays) / 60.0;
    const avgProductiveHours = (productiveMins / uniqueDays) / 60.0;
    const avgEntertainmentHours = (entertainmentMins / uniqueDays) / 60.0;

    return {
      daily_screen_time_hours: Number(avgDailyScreenTimeHours.toFixed(2)),
      avg_session_mins: Number(avgSessionMins.toFixed(1)),
      sessions_per_day: avgSessionsPerDay,
      night_time_mins: Number(avgNightMins.toFixed(1)),
      social_media_hours: Number(avgSocialHours.toFixed(2)),
      gaming_hours: Number(avgGamingHours.toFixed(2)),
      productive_hours: Number(avgProductiveHours.toFixed(2)),
      entertainment_hours: Number(avgEntertainmentHours.toFixed(2)),
      weekend_weekday_ratio: 1.2,
      break_frequency_per_day: 4
    };
  }
}

module.exports = new AnalyticsService();
