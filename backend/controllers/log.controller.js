/**
 * ============================================================================
 * LOG CONTROLLER
 * ============================================================================
 *
 * Purpose:
 * - Serve activity log endpoints
 * - Delegate pagination logic to the service layer
 * ============================================================================
 */

const logService = require('../services/log.service');
const { asyncHandler } = require('../utils/async-handler');

// @desc    Get all activity logs
// @route   GET /api/logs
// @access  Private (lv3)
const getActivityLogs = asyncHandler(async (req, res) => {
  const result = await logService.getActivityLogs(req.query);
  res.json(result);
});

module.exports = { getActivityLogs };
