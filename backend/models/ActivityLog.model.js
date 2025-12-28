/**
 * ============================================================================
 * ACTIVITY LOG MODEL
 * ============================================================================
 *
 * Purpose:
 * - Store audit trails for user actions
 * - Capture who did what, when, and from where
 * ============================================================================
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  // User who performed the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Action keyword like CREATE_USER, LOGIN, etc.
  action: {
    type: String,
    required: true
  },
  // JSON-encoded metadata captured by logger middleware
  details: {
    type: String
  },
  // Client IP address (best effort)
  ip: {
    type: String
  },
  // Event time for sorting and queries
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  // Adds createdAt / updatedAt timestamps
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
