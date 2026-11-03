const mongoose = require('mongoose');

const CATEGORIES = [
  'Social Media',
  'Entertainment',
  'Education',
  'Productivity',
  'Gaming',
  'Communication',
  'Others'
];

const TIME_PERIODS = ['Morning', 'Afternoon', 'Evening', 'Night'];

const usageRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    appName: {
      type: String,
      required: [true, 'Application name is required'],
      trim: true,
      maxlength: [100, 'App name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a supported category'
      }
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 1440 minutes (24 hours)']
    },
    sessionDurationMinutes: {
      type: Number,
      min: [1, 'Session duration must be at least 1 minute'],
      max: [1440, 'Session duration cannot exceed 1440 minutes']
    },
    date: {
      type: Date,
      required: [true, 'Date of usage is required'],
      index: true
    },
    timePeriod: {
      type: String,
      enum: TIME_PERIODS,
      default: 'Afternoon'
    },
    isNightUsage: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [250, 'Notes cannot exceed 250 characters']
    }
  },
  {
    timestamps: true
  }
);

// Pre-save to auto-fill session duration if omitted and tag night usage
usageRecordSchema.pre('save', function () {
  if (!this.sessionDurationMinutes) {
    this.sessionDurationMinutes = this.durationMinutes;
  }
  if (this.timePeriod === 'Night') {
    this.isNightUsage = true;
  }
});

usageRecordSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('UsageRecord', usageRecordSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.TIME_PERIODS = TIME_PERIODS;
