/**
 * ============================================================================
 * HTTP ERROR HELPER
 * ============================================================================
 *
 * Purpose:
 * - Create errors with HTTP status + optional metadata
 * - Keep controller/service error handling consistent
 * ============================================================================
 */

const createHttpError = (status, message, code, extras = {}) => {
  // extras can hold context like remainingAttempts or remainingTime.
  const error = new Error(message);
  error.status = status;
  if (code) {
    error.code = code;
  }
  Object.assign(error, extras);
  return error;
};

module.exports = { createHttpError };
