/**
 * ============================================================================
 * USER CONTROLLER
 * ============================================================================
 *
 * Purpose:
 * - Expose REST handlers for user CRUD
 * - Keep controllers thin by delegating to services
 * ============================================================================
 */

const userService = require('../services/user.service');
const { asyncHandler } = require('../utils/async-handler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (lv1, lv2, lv3)
const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query);
  res.json(result);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (lv1, lv2, lv3)
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(user);
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private (lv2, lv3)
const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private (lv2, lv3)
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user?.role);
  res.json(user);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (lv3)
const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  res.json(result);
});

// @desc    Change current admin password
// @route   PATCH /api/users/me/password
// @access  Private (lv3)
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await userService.changePassword(
    req.user._id,
    currentPassword,
    newPassword
  );
  res.json(result);
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword
};
