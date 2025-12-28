/**
 * ============================================================================
 * LOGIN ATTEMPT MODEL
 * ============================================================================
 *
 * Purpose:
 * - Track failed login attempts by IP
 * - Support temporary IP blocking logic
 * ============================================================================
 */

const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  // IP address used for login attempts
  ip: {
    type: String,
    required: true
  },
  // Consecutive failures
  attempts: {
    type: Number,
    default: 0
  },
  // When the IP should be unblocked
  blockedUntil: {
    type: Date,
    default: null
  },
  // Last failed attempt time
  lastAttempt: {
    type: Date,
    default: Date.now
  }
}, {
  // Adds createdAt / updatedAt timestamps
  timestamps: true
});

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
