/**
 * ============================================================================
 * RESPONSE HELPERS
 * ============================================================================
 *
 * Purpose:
 * - Format API error responses consistently
 * - Collapse validation errors into readable messages
 * ============================================================================
 */

const buildValidationMessage = (error) => {
  if (error?.name !== 'ValidationError' || !error.errors) {
    return error.message;
  }
  return Object.values(error.errors)
    .map((err) => err.message)
    .join(', ');
};

const sendError = (res, error) => {
  const status = error.status || error.statusCode || (error?.name === 'ValidationError' ? 400 : 500);
  const payload = {
    message: buildValidationMessage(error) || 'Internal Server Error'
  };

  if (error.code) {
    payload.code = error.code;
  }
  if (error.remainingTime !== undefined) {
    payload.remainingTime = error.remainingTime;
  }
  if (error.remainingAttempts !== undefined) {
    payload.remainingAttempts = error.remainingAttempts;
  }

  return res.status(status).json(payload);
};

module.exports = {
  buildValidationMessage,
  sendError
};
