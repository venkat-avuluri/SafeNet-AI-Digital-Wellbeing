const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'safenet_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

const getStartAndEndOfDay = (dateString) => {
  const target = dateString ? new Date(dateString) : new Date();
  const start = new Date(target);
  start.setHours(0, 0, 0, 0);

  const end = new Date(target);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getNDaysAgoRange = (days = 7) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

module.exports = {
  generateToken,
  getStartAndEndOfDay,
  getNDaysAgoRange
};
