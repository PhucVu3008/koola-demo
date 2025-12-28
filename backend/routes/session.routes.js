/**
 * ============================================================================
 * SESSION ROUTES
 * ============================================================================
 * 
 * Mục đích: Định nghĩa API endpoints cho xác thực người dùng
 * - Create login session (không có register theo yêu cầu)
 * - JWT token generation
 * - IP blocking sau nhiều lần đăng nhập sai
 *
 * Base URL: /api/sessions
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller');

/**
 * @route   POST /api/sessions
 * @desc    Tạo phiên đăng nhập với username và password
 * @access  Public
 * 
 * Request Body:
 * {
 *   "username": "admin",
 *   "password": "admin123"
 * }
 * 
 * Response (Success - 200):
 * {
 *   "_id": "...",
 *   "username": "admin",
 *   "email": "admin@koola.com",
 *   "role": "lv3",
 *   "token": "eyJhbGc..."
 * }
 * 
 * Response (Error - 401): Invalid credentials
 * Response (Error - 429): IP blocked (sau 3 lần sai)
 */
router.post('/', login);

module.exports = router;
