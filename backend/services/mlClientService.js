const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

class MLClientService {
  constructor() {
    this.client = axios.create({
      baseURL: ML_SERVICE_URL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async checkHealth() {
    try {
      const response = await this.client.get('/health');
      return { online: true, data: response.data };
    } catch (error) {
      return { online: false, message: error.message };
    }
  }

  async predict(features) {
    try {
      const payload = {
        daily_screen_time_hours: Number(features.daily_screen_time_hours || 0),
        avg_session_mins: Number(features.avg_session_mins || 20),
        sessions_per_day: Number(features.sessions_per_day || 20),
        night_time_mins: Number(features.night_time_mins || 0),
        social_media_hours: Number(features.social_media_hours || 0),
        gaming_hours: Number(features.gaming_hours || 0),
        productive_hours: Number(features.productive_hours || 0),
        entertainment_hours: Number(features.entertainment_hours || 0),
        weekend_weekday_ratio: Number(features.weekend_weekday_ratio || 1.0),
        break_frequency_per_day: Number(features.break_frequency_per_day || 3)
      };

      const response = await this.client.post('/predict', payload);
      return {
        ...response.data,
        source: 'fastapi_ml'
      };
    } catch (error) {
      console.warn(`[MLClient] FastAPI call failed (${error.message}). Falling back to heuristic engine.`);
      return this.heuristicFallback(features);
    }
  }

  heuristicFallback(features) {
    const screenTime = Number(features.daily_screen_time_hours || 0);
    const nightMins = Number(features.night_time_mins || 0);
    const socialHrs = Number(features.social_media_hours || 0);
    const sessionMins = Number(features.avg_session_mins || 30);
    const productiveHrs = Number(features.productive_hours || 0);

    let riskLevel = 'Low Risk';
    let riskScore = 24.0;
    let probs = { 'Low Risk': 0.78, 'Moderate Risk': 0.18, 'High Risk': 0.04 };

    if (screenTime >= 7.5 || nightMins >= 90 || socialHrs >= 4.5) {
      riskLevel = 'High Risk';
      riskScore = 78.5;
      probs = { 'Low Risk': 0.04, 'Moderate Risk': 0.22, 'High Risk': 0.74 };
    } else if (screenTime >= 4.5 || nightMins >= 45 || socialHrs >= 2.5) {
      riskLevel = 'Moderate Risk';
      riskScore = 52.0;
      probs = { 'Low Risk': 0.18, 'Moderate Risk': 0.64, 'High Risk': 0.18 };
    }

    const keyFactors = [];
    if (screenTime >= 6.0) {
      keyFactors.push({
        factor: 'Elevated Daily Screen Time',
        impact: screenTime > 8 ? 'HIGH' : 'MODERATE',
        description: `Daily screen duration of ${screenTime.toFixed(1)} hrs exceeds target threshold.`
      });
    }
    if (nightMins >= 45) {
      keyFactors.push({
        factor: 'Late-Night Device Engagement',
        impact: nightMins > 75 ? 'HIGH' : 'MODERATE',
        description: `${nightMins.toFixed(0)} minutes logged past 10:00 PM.`
      });
    }
    if (socialHrs >= 3.0) {
      keyFactors.push({
        factor: 'High Social Media Intake',
        impact: 'MODERATE',
        description: `${socialHrs.toFixed(1)} hrs dedicated to social platforms.`
      });
    }
    if (keyFactors.length === 0) {
      keyFactors.push({
        factor: 'Balanced Habit Ratios',
        impact: 'LOW',
        description: 'Usage is within safe, balanced digital boundaries.'
      });
    }

    const recommendations = [
      {
        category: 'Sleep Hygiene',
        title: '30-Minute Bedtime Digital Wind-Down',
        action: 'Put devices in sleep mode or do not disturb 30 minutes before bed.',
        priority: nightMins > 45 ? 'HIGH' : 'LOW'
      },
      {
        category: 'Focus Strategy',
        title: '25-Minute Pomodoro Work Intervals',
        action: 'Use 25-minute work blocks separated by 5-minute screen-free breaks.',
        priority: 'MODERATE'
      }
    ];

    return {
      risk_level: riskLevel,
      risk_score: riskScore,
      confidence: 0.85,
      probabilities: probs,
      key_factors: keyFactors,
      recommendations,
      model_version: '1.0.0-fallback-heuristic',
      is_synthetic_model: true,
      source: 'rule_engine_fallback',
      disclaimer: 'This is an AI-assisted digital habit awareness assessment, NOT a clinical diagnosis or medical evaluation.'
    };
  }
}

module.exports = new MLClientService();
