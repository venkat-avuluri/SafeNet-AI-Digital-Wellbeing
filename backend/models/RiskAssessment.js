const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assessmentDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['Low Risk', 'Moderate Risk', 'High Risk']
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    confidence: {
      type: Number,
      default: 0.90
    },
    probabilities: {
      type: Map,
      of: Number,
      default: {}
    },
    inputFeatures: {
      dailyScreenTimeHours: Number,
      avgSessionMins: Number,
      sessionsPerDay: Number,
      nightTimeMins: Number,
      socialMediaHours: Number,
      gamingHours: Number,
      productiveHours: Number,
      entertainmentHours: Number,
      weekendWeekdayRatio: Number
    },
    keyFactors: [
      {
        factor: String,
        impact: {
          type: String,
          enum: ['HIGH', 'MODERATE', 'LOW']
        },
        description: String
      }
    ],
    recommendations: [
      {
        category: String,
        title: String,
        action: String,
        priority: {
          type: String,
          enum: ['HIGH', 'MODERATE', 'LOW']
        }
      }
    ],
    source: {
      type: String,
      enum: ['fastapi_ml', 'rule_engine_fallback'],
      default: 'fastapi_ml'
    },
    disclaimer: {
      type: String,
      default: 'AI habit awareness assessment only, not a clinical diagnosis.'
    }
  },
  {
    timestamps: true
  }
);

riskAssessmentSchema.index({ user: 1, assessmentDate: -1 });

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
