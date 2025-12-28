/**
 * ============================================================================
 * AUTH SERVICE
 * ============================================================================
 *
 * Purpose:
 * - Encapsulate login logic and security checks
 * - Issue JWT tokens and record login activity
 * ============================================================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const LoginAttempt = require('../models/LoginAttempt.model');
const Setting = require('../models/Setting.model');
const ActivityLog = require('../models/ActivityLog.model');
const { SETTING_KEYS } = require('../constants');
const { createHttpError } = require('../utils/http-error');
const { assertUsername, normalizeUsername } = require('../utils/validation');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '2m'
  });
};

/**
 * Xử lý toàn bộ logic login, trả về user info + token nếu thành công, throw error nếu thất bại
 */
async function loginService({ username, password, ip }) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername || !password) {
    throw createHttpError(
      400,
      'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu',
      'MISSING_CREDENTIALS'
    );
  }

  // Check if IP is blocked
  const loginAttempt = await LoginAttempt.findOne({ ip });
  if (loginAttempt && loginAttempt.blockedUntil && loginAttempt.blockedUntil > new Date()) {
    const remainingTime = Math.ceil((loginAttempt.blockedUntil - new Date()) / 1000);
    const err = new Error(`Tài khoản tạm thời bị khóa. Vui lòng thử lại sau ${remainingTime} giây`);
    err.status = 429;
    err.code = 'IP_BLOCKED';
    err.remainingTime = remainingTime;
    throw err;
  }

  assertUsername(normalizedUsername);

  // Find user
  const user = await User.findOne({ username: normalizedUsername });
  if (!user) {
    // Track failed login attempt
    const blockDurationSetting = await Setting.findOne({ key: SETTING_KEYS.BLOCK_IP_DURATION });
    const blockDuration = blockDurationSetting ? parseInt(blockDurationSetting.value) : 30;
    if (loginAttempt) {
      loginAttempt.attempts += 1;
      loginAttempt.lastAttempt = new Date();
      if (loginAttempt.attempts >= 3) {
        loginAttempt.blockedUntil = new Date(Date.now() + blockDuration * 1000);
      }
      await loginAttempt.save();
    } else {
      await LoginAttempt.create({
        ip,
        attempts: 1,
        lastAttempt: new Date()
      });
    }
    const err = new Error('Tài khoản hoặc mật khẩu không đúng');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  // Check password
  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    // Track failed login attempt
    const blockDurationSetting = await Setting.findOne({ key: SETTING_KEYS.BLOCK_IP_DURATION });
    const blockDuration = blockDurationSetting ? parseInt(blockDurationSetting.value) : 30;
    if (loginAttempt) {
      loginAttempt.attempts += 1;
      loginAttempt.lastAttempt = new Date();
      if (loginAttempt.attempts >= 3) {
        loginAttempt.blockedUntil = new Date(Date.now() + blockDuration * 1000);
      }
      await loginAttempt.save();
    } else {
      await LoginAttempt.create({
        ip,
        attempts: 1,
        lastAttempt: new Date()
      });
    }
    const remainingAttempts = loginAttempt ? Math.max(0, 3 - loginAttempt.attempts) : 2;
    const err = new Error('Tài khoản hoặc mật khẩu không đúng');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    err.remainingAttempts = remainingAttempts;
    throw err;
  }

  // Login successful
  await LoginAttempt.deleteOne({ ip });
  await ActivityLog.create({
    userId: user._id,
    action: 'LOGIN',
    details: 'Successful login',
    ip: ip
  });

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    token: generateToken(user._id)
  };
}

module.exports = { loginService };
