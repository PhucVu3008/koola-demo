/**
 * ============================================================================
 * SETTING SERVICE
 * ============================================================================
 *
 * Purpose:
 * - Manage system settings with validation
 * - Handle account password changes safely
 * ============================================================================
 */

// Setting service keeps system settings and account actions in one place.
const Setting = require('../models/Setting.model');
const { SETTING_KEYS } = require('../constants');
const { createHttpError } = require('../utils/http-error');

const getSettings = async () => {
  return Setting.find();
};

const updateSetting = async (key, value) => {
  const allowedKeys = Object.values(SETTING_KEYS);
  const isValueMissing = !value && value !== 0 && value !== '';

  if (isValueMissing) {
    throw createHttpError(400, 'Thiếu giá trị cài đặt', 'MISSING_SETTING_VALUE');
  }

  if (!allowedKeys.includes(key)) {
    throw createHttpError(404, 'Khóa cài đặt không hợp lệ', 'INVALID_SETTING_KEY');
  }

  const setting = await Setting.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true }
  );

  if (key === SETTING_KEYS.JWT_EXPIRES_IN) {
    process.env.JWT_EXPIRES_IN = value;
  }

  return setting;
};

module.exports = {
  getSettings,
  updateSetting
};
