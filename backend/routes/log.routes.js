/**
 * ============================================================================
 * ACTIVITY LOG ROUTES
 * ============================================================================
 * 
 * Mục đích: API để xem activity logs
 * - Chỉ admin (lv3) xem được
 * - Hiển thị logs với pagination
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { getActivityLogs } = require('../controllers/log.controller');

/**
 * @route   GET /api/logs
 * @desc    Get all activity logs
 * @access  Private - lv3 only
 */
router.get('/', protect, authorize('lv3'), getActivityLogs);

module.exports = router;
