/**
 * ============================================================================
 * NOT FOUND MIDDLEWARE
 * ============================================================================
 *
 * Purpose:
 * - Catch unmatched routes and forward a 404 error
 * - Keep 404 responses consistent with global error handling
 * ============================================================================
 */

const { createHttpError } = require('../utils/http-error');

const notFound = (req, res, next) => {
  next(createHttpError(404, `Route ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
};

module.exports = notFound;
