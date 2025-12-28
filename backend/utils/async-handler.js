/**
 * ============================================================================
 * ASYNC HANDLER
 * ============================================================================
 *
 * Purpose:
 * - Wrap async route handlers so errors flow to Express error middleware
 * - Avoid repetitive try/catch blocks in controllers
 * ============================================================================
 */

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
