const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MODERATE', 'LOW'],
      default: 'MODERATE'
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    triggerReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

recommendationSchema.index({ user: 1, isCompleted: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
