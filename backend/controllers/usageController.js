const UsageRecord = require('../models/UsageRecord');

// @desc    Log a new digital usage entry
// @route   POST /api/usage
// @access  Private
exports.logUsage = async (req, res, next) => {
  try {
    const {
      appName,
      category,
      durationMinutes,
      sessionDurationMinutes,
      date,
      timePeriod,
      isNightUsage,
      notes
    } = req.body;

    if (!appName || !category || !durationMinutes || !date) {
      return res.status(400).json({
        success: false,
        message: 'Application name, category, duration, and date are required.'
      });
    }

    const durationNum = Number(durationMinutes);
    if (isNaN(durationNum) || durationNum <= 0 || durationNum > 1440) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be a positive number of minutes not exceeding 1440 (24 hours).'
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date provided.'
      });
    }

    const record = await UsageRecord.create({
      user: req.user._id,
      appName: appName.trim(),
      category,
      durationMinutes: durationNum,
      sessionDurationMinutes: sessionDurationMinutes ? Number(sessionDurationMinutes) : durationNum,
      date: parsedDate,
      timePeriod: timePeriod || 'Afternoon',
      isNightUsage: isNightUsage || timePeriod === 'Night',
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user usage records with filtering and pagination
// @route   GET /api/usage
// @access  Private
exports.getUsageRecords = async (req, res, next) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await UsageRecord.countDocuments(query);
    const records = await UsageRecord.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a usage record
// @route   DELETE /api/usage/:id
// @access  Private
exports.deleteUsageRecord = async (req, res, next) => {
  try {
    const record = await UsageRecord.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or not authorized.'
      });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Usage record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed sample 7-day usage records for demo/testing
// @route   POST /api/usage/seed-demo
// @access  Private
exports.seedDemoData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Create realistic entries across past 7 days
    const demoApps = [
      { appName: 'Instagram', category: 'Social Media', baseMins: 45, period: 'Evening' },
      { appName: 'VS Code', category: 'Productivity', baseMins: 110, period: 'Morning' },
      { appName: 'YouTube', category: 'Entertainment', baseMins: 60, period: 'Night' },
      { appName: 'WhatsApp', category: 'Communication', baseMins: 35, period: 'Afternoon' },
      { appName: 'Duolingo', category: 'Education', baseMins: 25, period: 'Morning' },
      { appName: 'Reddit', category: 'Social Media', baseMins: 40, period: 'Night' },
      { appName: 'Chess.com', category: 'Gaming', baseMins: 30, period: 'Evening' },
      { appName: 'Notion', category: 'Productivity', baseMins: 45, period: 'Afternoon' }
    ];

    const recordsToInsert = [];
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);

      // Pick 4-6 apps for each day
      const dailyApps = demoApps.filter(() => Math.random() > 0.3);
      dailyApps.forEach((item) => {
        const variance = Math.floor(Math.random() * 20) - 10;
        const duration = Math.max(15, item.baseMins + variance);
        const sessionMins = Math.min(duration, Math.max(15, duration - 10));

        recordsToInsert.push({
          user: userId,
          appName: item.appName,
          category: item.category,
          durationMinutes: duration,
          sessionDurationMinutes: sessionMins,
          date: d,
          timePeriod: item.period,
          isNightUsage: item.period === 'Night',
          notes: 'Demo sample activity'
        });
      });
    }

    await UsageRecord.insertMany(recordsToInsert);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${recordsToInsert.length} demo usage records across 7 days.`,
      count: recordsToInsert.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all usage records for current user
// @route   DELETE /api/usage/clear-all
// @access  Private
exports.clearUserData = async (req, res, next) => {
  try {
    const result = await UsageRecord.deleteMany({ user: req.user._id });
    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} records.`
    });
  } catch (error) {
    next(error);
  }
};
