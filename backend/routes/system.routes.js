/**
 * ============================================================================
 * SYSTEM ROUTES
 * ============================================================================
 *
 * Purpose:
 * - Expose diagnostics endpoints for admins
 * - Keep system-related routes grouped together
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const { getSystemInfo } = require('../controllers/system.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// System information route - only accessible by admin (lv3)
router.get('/', protect, authorize('lv3'), getSystemInfo);

module.exports = router;
