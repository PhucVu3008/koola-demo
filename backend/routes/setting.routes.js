/**
 * ============================================================================
 * SETTINGS ROUTES
 * ============================================================================
 * 
 * Mục đích: Định nghĩa API endpoints cho quản lý cài đặt hệ thống
 * - Chỉ admin (lv3) mới truy cập được
 * - Tùy chỉnh time block IP
 * - Tùy chỉnh JWT expiration time
 * - Quản lý các cấu hình bảo mật
 * 
 * Base URL: /api/settings
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSetting
} = require('../controllers/setting.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const logActivity = require('../middlewares/logger.middleware');

/**
 * @route   GET /api/settings
 * @desc    Lấy tất cả settings hiện tại
 * @access  Private - lv3 only (admin)
 */
router.get('/', protect, authorize('lv3'), getSettings);

/**
 * @route   PATCH /api/settings/:key
 * @desc    Cập nhật 1 setting theo key
 * @access  Private - lv3 only (admin)
 * 
 * Allowed keys:
 * - BLOCK_IP_DURATION: Thời gian block IP (giây)
 * - JWT_EXPIRES_IN: Thời gian hết hạn JWT token
 * - MAX_LOGIN_ATTEMPTS: Số lần đăng nhập sai tối đa
 */
router.patch('/:key', protect, authorize('lv3'), logActivity('UPDATE_SETTING'), updateSetting);

module.exports = router;
