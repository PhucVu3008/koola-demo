/**
 * ============================================================================
 * LOG SERVICE
 * ============================================================================
 *
 * Purpose:
 * - Fetch activity logs with pagination
 * - Keep query logic centralized for log routes
 * ============================================================================
 */

// Log service handles activity log retrieval with pagination.
const ActivityLog = require('../models/ActivityLog.model');
const { normalizePagination } = require('../utils/pagination');

const getActivityLogs = async (queryParams) => {
  const { page, limit } = normalizePagination(queryParams.page, queryParams.limit, 50);

  const logs = await ActivityLog.find()
    .populate('userId', 'username email role')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const count = await ActivityLog.countDocuments();

  return {
    logs,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalLogs: count
  };
};

module.exports = { getActivityLogs };
