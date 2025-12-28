/**
 * ============================================================================
 * AUTH CONTROLLER
 * ============================================================================
 *
 * Purpose:
 * - Handle request/response for authentication endpoints
 * - Delegate login logic to the auth service
 * ============================================================================
 */

const { loginService } = require('../services/auth.service');
const { asyncHandler } = require('../utils/async-handler');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const result = await loginService({ username, password, ip });
  res.json(result);
});

module.exports = { login };
