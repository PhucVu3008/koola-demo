/**
 * ============================================================================
 * SETTING CONTROLLER
 * ============================================================================
 *
 * Purpose:
 * - Serve system settings endpoints
 * - Keep settings updates consistent
 * ============================================================================
 */

const settingService = require('../services/setting.service');
const { asyncHandler } = require('../utils/async-handler');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private (lv3)
const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingService.getSettings();
  res.json(settings);
});

// @desc    Update setting
// @route   PATCH /api/settings/:key
// @access  Private (lv3)
const updateSetting = asyncHandler(async (req, res) => {
  const setting = await settingService.updateSetting(req.params.key, req.body.value);
  res.json(setting);
});

module.exports = {
  getSettings,
  updateSetting
};
