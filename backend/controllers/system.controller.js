/**
 * ============================================================================
 * SYSTEM CONTROLLER
 * ============================================================================
 *
 * Purpose:
 * - Serve system diagnostics and tech stack info
 * - Keep controller logic minimal and service-driven
 * ============================================================================
 */

const { getSystemInfo: getSystemInfoService } = require('../services/system.service');
const { asyncHandler } = require('../utils/async-handler');

// @desc    Get system information
// @route   GET /api/system
// @access  Private (lv3 only)
const getSystemInfo = asyncHandler(async (req, res) => {
  const systemInfo = await getSystemInfoService();
  res.json(systemInfo);
});

module.exports = {
  getSystemInfo
};
