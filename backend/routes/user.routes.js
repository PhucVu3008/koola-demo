/**
 * ============================================================================
 * USER ROUTES
 * ============================================================================
 * 
 * Mục đích: Định nghĩa các API endpoints cho quản lý User
 * - Tuân thủ chuẩn REST API
 * - Phân quyền theo level (lv1, lv2, lv3)
 * - Ghi log hoạt động CRUD
 * 
 * Base URL: /api/users
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const logActivity = require('../middlewares/logger.middleware');

// ============================================================================
// ROUTES DEFINITION (theo chuẩn REST)
// ============================================================================

/**
 * @route   GET /api/users
 * @desc    Lấy danh sách users (có search, filter, pagination, sort)
 * @access  Private - lv1, lv2, lv3
 * 
 * @route   POST /api/users
 * @desc    Tạo user mới
 * @access  Private - lv2, lv3 only (lv1 không được tạo)
 */
router.route('/')
  .get(protect, authorize('lv1', 'lv2', 'lv3'), getUsers)
  .post(protect, authorize('lv2', 'lv3'), logActivity('CREATE_USER'), createUser);

/**
 * @route   PATCH /api/users/me/password
 * @desc    Đổi mật khẩu tài khoản admin hiện tại
 * @access  Private - lv3 only
 */
router.patch(
  '/me/password',
  protect,
  authorize('lv3'),
  logActivity('CHANGE_PASSWORD'),
  changePassword
);

/**
 * @route   GET /api/users/:id
 * @desc    Lấy thông tin 1 user theo ID
 * @access  Private - lv2, lv3 (lv1 chỉ xem danh sách)
 * 
 * @route   PATCH /api/users/:id
 * @desc    Cập nhật thông tin user
 * @access  Private - lv2, lv3 only (lv1 không được sửa)
 * 
 * @route   DELETE /api/users/:id
 * @desc    Xóa user
 * @access  Private - lv3 only (chỉ admin mới được xóa)
 */
router.route('/:id')
  .get(protect, authorize('lv2', 'lv3'), getUserById)
  .patch(protect, authorize('lv2', 'lv3'), logActivity('UPDATE_USER'), updateUser)
  .delete(protect, authorize('lv3'), logActivity('DELETE_USER'), deleteUser);

module.exports = router;
