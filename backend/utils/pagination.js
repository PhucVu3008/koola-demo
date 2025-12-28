/**
 * ============================================================================
 * PAGINATION HELPER
 * ============================================================================
 *
 * Purpose:
 * - Normalize page/limit query values
 * - Ensure safe integer defaults
 * ============================================================================
 */

const normalizePagination = (page, limit, defaultLimit = 10) => {
  // Force values into positive integers.
  const normalizedPage = Math.max(parseInt(page, 10) || 1, 1);
  const normalizedLimit = Math.max(parseInt(limit, 10) || defaultLimit, 1);
  return { page: normalizedPage, limit: normalizedLimit };
};

module.exports = { normalizePagination };
