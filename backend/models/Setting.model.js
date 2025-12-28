/**
 * ============================================================================
 * SETTING MODEL
 * ============================================================================
 *
 * Purpose:
 * - Persist system configuration values
 * - Keep settings centralized for runtime updates
 * ============================================================================
 */

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // Machine-readable key, e.g. JWT_EXPIRES_IN
  key: {
    type: String,
    required: true,
    unique: true
  },
  // Stored as a string so settings can be simple key/value pairs
  value: {
    type: String,
    required: true
  },
  // Optional explanation shown in admin screens
  description: {
    type: String
  }
}, {
  // Adds createdAt / updatedAt timestamps
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
