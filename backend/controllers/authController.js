const User = require('../models/User');
const { generateToken } = require('../utils/helpers');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, dailyScreenTimeGoalMinutes, ageGroup } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      dailyScreenTimeGoalMinutes: dailyScreenTimeGoalMinutes || 240,
      ageGroup: ageGroup || '18-24'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyScreenTimeGoalMinutes: user.dailyScreenTimeGoalMinutes,
        nightTimeCutoff: user.nightTimeCutoff,
        ageGroup: user.ageGroup,
        notificationsEnabled: user.notificationsEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login existing user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyScreenTimeGoalMinutes: user.dailyScreenTimeGoalMinutes,
        nightTimeCutoff: user.nightTimeCutoff,
        ageGroup: user.ageGroup,
        notificationsEnabled: user.notificationsEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyScreenTimeGoalMinutes: user.dailyScreenTimeGoalMinutes,
        nightTimeCutoff: user.nightTimeCutoff,
        ageGroup: user.ageGroup,
        notificationsEnabled: user.notificationsEnabled,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & goals
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, dailyScreenTimeGoalMinutes, nightTimeCutoff, ageGroup, notificationsEnabled } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (dailyScreenTimeGoalMinutes !== undefined) fieldsToUpdate.dailyScreenTimeGoalMinutes = dailyScreenTimeGoalMinutes;
    if (nightTimeCutoff) fieldsToUpdate.nightTimeCutoff = nightTimeCutoff;
    if (ageGroup) fieldsToUpdate.ageGroup = ageGroup;
    if (notificationsEnabled !== undefined) fieldsToUpdate.notificationsEnabled = notificationsEnabled;

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyScreenTimeGoalMinutes: user.dailyScreenTimeGoalMinutes,
        nightTimeCutoff: user.nightTimeCutoff,
        ageGroup: user.ageGroup,
        notificationsEnabled: user.notificationsEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully updated.'
    });
  } catch (error) {
    next(error);
  }
};
