/**
 * ============================================================================
 * CONSTANTS
 * ============================================================================
 *
 * Purpose:
 * - Centralize enums and allowed values
 * - Avoid hard-coded strings across the app
 * ============================================================================
 */

const ROLES = ['lv1', 'lv2', 'lv3'];

const SETTING_KEYS = {
  BLOCK_IP_DURATION: 'BLOCK_IP_DURATION',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
  MAX_LOGIN_ATTEMPTS: 'MAX_LOGIN_ATTEMPTS'
};

const USER_SORT_FIELDS = ['username', 'email', 'dateOfBirth', 'createdAt'];

// Username rules: lowercase letters, numbers, dot, underscore; 3-30 chars.
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const USERNAME_REGEX = /^[a-z][a-z0-9._]{2,29}$/;

module.exports = {
  ROLES,
  SETTING_KEYS,
  USER_SORT_FIELDS,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX
};
