/**
 * ============================================================================
 * VALIDATION HELPERS
 * ============================================================================
 *
 * Purpose:
 * - Centralize common validation rules
 * - Throw typed HTTP errors for controllers/services
 * ============================================================================
 */

const mongoose = require('mongoose');
const {
  ROLES,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX
} = require('../constants');
const { createHttpError } = require('./http-error');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const assertObjectId = (value, message = 'Invalid ID format') => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createHttpError(400, message, 'INVALID_ID');
  }
};

const assertRequired = (payload, fields) => {
  const source = payload || {};
  const missing = fields.filter((field) => !source[field]);
  if (missing.length > 0) {
    throw createHttpError(
      400,
      `Missing required fields: ${missing.join(', ')}`,
      'MISSING_FIELDS'
    );
  }
};

const assertRole = (role) => {
  if (role && !ROLES.includes(role)) {
    throw createHttpError(400, 'Invalid role. Must be lv1, lv2, or lv3', 'INVALID_ROLE');
  }
};

const normalizeUsername = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().toLowerCase();
};

const assertUsername = (username) => {
  if (!username) {
    throw createHttpError(400, 'Username is required', 'INVALID_USERNAME');
  }

  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    throw createHttpError(
      400,
      `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters`,
      'INVALID_USERNAME'
    );
  }

  if (!USERNAME_REGEX.test(username)) {
    throw createHttpError(
      400,
      'Username must start with a letter and contain only letters, numbers, dot, underscore',
      'INVALID_USERNAME'
    );
  }

  if (/[._]{2,}/.test(username)) {
    throw createHttpError(
      400,
      'Username must not contain consecutive dots or underscores',
      'INVALID_USERNAME'
    );
  }

  if (/[._]$/.test(username)) {
    throw createHttpError(
      400,
      'Username must not end with a dot or underscore',
      'INVALID_USERNAME'
    );
  }
};

const assertEmail = (email) => {
  if (!email) {
    throw createHttpError(400, 'Email is required', 'INVALID_EMAIL');
  }

  if (!EMAIL_REGEX.test(email)) {
    throw createHttpError(400, 'Email format is invalid', 'INVALID_EMAIL');
  }
};

module.exports = {
  assertObjectId,
  assertRequired,
  assertRole,
  normalizeUsername,
  assertUsername,
  assertEmail
};
