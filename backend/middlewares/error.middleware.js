/**
 * ============================================================================
 * ERROR HANDLER MIDDLEWARE
 * ============================================================================
 * 
 * Mục đích: Xử lý lỗi tập trung cho toàn bộ ứng dụng
 * - Bắt tất cả lỗi từ routes và controllers
 * - Trả về response với HTTP status code phù hợp
 * - Ẩn stack trace trong production để bảo mật
 * 
 * Yêu cầu: Đăng ký CUỐI CÙNG trong server.js (sau tất cả routes)
 * ============================================================================
 */

/**
 * Error Handler Middleware
 * @param {Error} err - Error object được throw từ bất kỳ đâu trong app
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * 
 * @returns {Response} JSON response với error message và HTTP status code
 * 
 * HTTP Status Codes được sử dụng:
 * - 400: Bad Request (validation errors, invalid input)
 * - 401: Unauthorized (missing or invalid token)
 * - 403: Forbidden (no permission)
 * - 404: Not Found (resource không tồn tại)
 * - 429: Too Many Requests (IP blocked)
 * - 500: Internal Server Error (unexpected errors)
 */
const { buildValidationMessage } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.status ||
    err.statusCode ||
    (err?.name === 'ValidationError' ? 400 : 500);

  let message = buildValidationMessage(err) || err.message || 'Internal Server Error';
  let errorCode = err.code;

  if (err?.code === 11000) {
    statusCode = 409;
    const fields = err.keyValue ? Object.keys(err.keyValue) : [];
    message = fields.length
      ? `Duplicate value for ${fields.join(', ')}`
      : 'Duplicate key';
    errorCode = 'DUPLICATE_KEY';
  }

  const isAuthError = statusCode === 401 || statusCode === 403;

  // Log error để debug (chỉ trong development).
  if (process.env.NODE_ENV !== 'production') {
    if (isAuthError) {
      console.warn(`⚠️ Auth error (${statusCode}) ${req.method} ${req.originalUrl}: ${message}`);
    } else {
      console.error('❌ Error:', message);
      if (err.stack) {
        console.error('Stack:', err.stack);
      }
    }
  }

  const payload = {
    success: false,
    message
  };

  if (errorCode) {
    payload.code = errorCode;
  }
  if (err.remainingTime !== undefined) {
    payload.remainingTime = err.remainingTime;
  }
  if (err.remainingAttempts !== undefined) {
    payload.remainingAttempts = err.remainingAttempts;
  }
  if (err.requiredRoles) {
    payload.requiredRoles = err.requiredRoles;
  }
  if (err.userRole) {
    payload.userRole = err.userRole;
  }

  // Chỉ hiển thị stack trace trong development để debug.
  if (process.env.NODE_ENV !== 'production' && !isAuthError) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
