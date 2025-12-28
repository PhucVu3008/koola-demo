/**
 * ============================================================================
 * USER SERVICE
 * ============================================================================
 *
 * Purpose:
 * - Centralize user data access and business rules
 * - Provide reusable helpers for controllers
 * ============================================================================
 */

// User service centralizes data access and rules for user operations.
const User = require('../models/User.model');
const { ROLES, USER_SORT_FIELDS } = require('../constants');
const { createHttpError } = require('../utils/http-error');
const { normalizePagination } = require('../utils/pagination');
const {
  assertObjectId,
  assertRequired,
  assertRole,
  assertUsername,
  normalizeUsername,
  assertEmail
} = require('../utils/validation');

const buildSearchQuery = (search) => {
  if (!search) {
    return {};
  }

  return {
    $or: [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ]
  };
};

const buildRoleQuery = (role) => {
  if (role && ROLES.includes(role)) {
    return { role };
  }
  return {};
};

const buildSortConfig = (sortBy, sortOrder) => {
  const sortField = USER_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
  const direction = sortOrder === 'asc' ? 1 : -1;
  return { [sortField]: direction };
};

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  address: user.address,
  dateOfBirth: user.dateOfBirth,
  role: user.role
});

const getUsers = async (queryParams) => {
  const {
    search,
    page,
    limit,
    role,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams;

  const { page: normalizedPage, limit: normalizedLimit } = normalizePagination(page, limit, 10);
  const query = {
    ...buildSearchQuery(search),
    ...buildRoleQuery(role)
  };
  const sortConfig = buildSortConfig(sortBy, sortOrder);

  const users = await User.find(query)
    .select('-password')
    .limit(normalizedLimit)
    .skip((normalizedPage - 1) * normalizedLimit)
    .sort(sortConfig);

  const count = await User.countDocuments(query);

  return {
    users,
    totalPages: Math.ceil(count / normalizedLimit),
    currentPage: normalizedPage,
    totalUsers: count
  };
};

const getUserById = async (id) => {
  assertObjectId(id, 'Invalid user ID format');

  const user = await User.findById(id).select('-password');
  if (!user) {
    throw createHttpError(404, 'User not found', 'USER_NOT_FOUND');
  }

  return user;
};

const createUser = async (payload) => {
  assertRequired(payload, ['username', 'password', 'email', 'role']);
  assertRole(payload.role);

  const normalizedUsername = normalizeUsername(payload.username);
  assertUsername(normalizedUsername);
  assertEmail(payload.email);

  const userExists = await User.findOne({
    $or: [{ username: normalizedUsername }, { email: payload.email }]
  });

  if (userExists) {
    throw createHttpError(409, 'User already exists', 'USER_ALREADY_EXISTS');
  }

  const user = await User.create({
    username: normalizedUsername,
    password: payload.password,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    dateOfBirth: payload.dateOfBirth,
    role: payload.role
  });

  return sanitizeUser(user);
};

const updateUser = async (id, payload, actorRole) => {
  assertObjectId(id, 'Invalid user ID format');
  if (payload.role) {
    assertRole(payload.role);
  }

  if (payload.role && actorRole !== 'lv3') {
    throw createHttpError(
      403,
      'Only admins can change user roles',
      'PERMISSION_DENIED'
    );
  }

  if (payload.password && actorRole !== 'lv3') {
    throw createHttpError(
      403,
      'Only admins can change passwords',
      'PERMISSION_DENIED'
    );
  }

  const user = await User.findById(id);
  if (!user) {
    throw createHttpError(404, 'User not found', 'USER_NOT_FOUND');
  }

  if (actorRole === 'lv2' && user.role === 'lv3') {
    throw createHttpError(
      403,
      'Managers cannot edit admin accounts',
      'PERMISSION_DENIED'
    );
  }

  if (payload.username !== undefined) {
    const normalizedUsername = normalizeUsername(payload.username);
    assertUsername(normalizedUsername);

    const existingUsername = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: id }
    });
    if (existingUsername) {
      throw createHttpError(409, 'Username already exists', 'USERNAME_TAKEN');
    }

    user.username = normalizedUsername;
  }

  if (payload.email !== undefined) {
    assertEmail(payload.email);
  }

  const fieldsToUpdate = {
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    dateOfBirth: payload.dateOfBirth,
    role: payload.role
  };

  Object.entries(fieldsToUpdate).forEach(([key, value]) => {
    if (value) {
      user[key] = value;
    }
  });

  if (payload.password && actorRole === 'lv3') {
    user.password = payload.password;
  }

  const updatedUser = await user.save();
  return sanitizeUser(updatedUser);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw createHttpError(400, 'Vui lòng nhập đầy đủ thông tin', 'MISSING_PASSWORD');
  }

  if (newPassword.length < 6) {
    throw createHttpError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự', 'WEAK_PASSWORD');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, 'Không tìm thấy người dùng', 'USER_NOT_FOUND');
  }

  const isPasswordCorrect = await user.matchPassword(currentPassword);
  if (!isPasswordCorrect) {
    throw createHttpError(401, 'Mật khẩu hiện tại không đúng', 'INVALID_PASSWORD');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Đổi mật khẩu thành công' };
};

const deleteUser = async (id) => {
  assertObjectId(id, 'Invalid user ID format');

  const user = await User.findById(id);
  if (!user) {
    throw createHttpError(404, 'User not found', 'USER_NOT_FOUND');
  }

  await user.deleteOne();
  return { message: 'User removed' };
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword
};
