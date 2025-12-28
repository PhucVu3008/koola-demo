/**
 * ============================================================================
 * AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * ============================================================================
 * 
 * Mục đích: Bảo vệ routes với JWT và phân quyền theo role
 * - protect: Kiểm tra JWT token hợp lệ
 * - authorize: Kiểm tra user có đủ quyền truy cập route không
 * 
 * HTTP Status Codes:
 * - 401: Token không hợp lệ hoặc không có token
 * - 403: User không có quyền truy cập (role không đủ level)
 * ============================================================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { createHttpError } = require('../utils/http-error');

/**
 * Protect Middleware
 * Kiểm tra JWT token có hợp lệ không
 * 
 * @middleware
 * @param {Request} req - Express request (cần có Authorization header)
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next function
 * 
 * @returns {Response} 401 nếu token không hợp lệ
 * 
 * Usage:
 * router.get('/protected', protect, controller);
 * 
 * Authorization Header Format:
 * "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  // Kiểm tra Authorization header có tồn tại và bắt đầu với "Bearer"
  if (!authHeader.startsWith('Bearer ')) {
    return next(createHttpError(401, 'Not authorized, no token', 'TOKEN_MISSING'));
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token với JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy thông tin user từ database (không lấy password)
    req.user = await User.findById(decoded.id).select('-password');

    // Token hợp lệ, cho phép tiếp tục
    return next();
  } catch (error) {
    // Token không hợp lệ hoặc hết hạn
    return next(createHttpError(401, 'Not authorized, token failed', 'TOKEN_INVALID'));
  }
};

/**
 * Authorize Middleware
 * Kiểm tra user có role phù hợp để truy cập route không
 * 
 * @middleware
 * @param {...string} roles - Danh sách các role được phép (lv1, lv2, lv3)
 * 
 * @returns {Function} Middleware function
 * @returns {Response} 403 nếu user không có quyền
 * 
 * Usage:
 * router.post('/users', protect, authorize('lv2', 'lv3'), createUser);
 * 
 * Permission Matrix:
 * - lv1: Chỉ xem (GET)
 * - lv2: Xem, tạo, sửa (GET, POST, PUT)
 * - lv3: Toàn quyền (GET, POST, PUT, DELETE + Settings)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createHttpError(401, 'Not authorized, no token', 'TOKEN_MISSING'));
    }

    // Kiểm tra role của user có trong danh sách roles cho phép không
    if (!roles.includes(req.user.role)) {
      const error = createHttpError(
        403,
        `Role ${req.user.role} is not authorized to access this route`,
        'PERMISSION_DENIED',
        {
          requiredRoles: roles,
          userRole: req.user.role
        }
      );
      return next(error);
    }
    
    // User có quyền, cho phép tiếp tục
    return next();
  };
};

module.exports = { protect, authorize };
