/**
 * ============================================================================
 * USER MODEL
 * ============================================================================
 *
 * Purpose:
 * - Store account profile and role info
 * - Hash passwords before persistence
 * - Provide a password comparison helper
 * ============================================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX
} = require('../constants');

const userSchema = new mongoose.Schema({
  // Login identity
  username: {
    type: String,
    required: true,
    minlength: USERNAME_MIN_LENGTH,
    maxlength: USERNAME_MAX_LENGTH,
    lowercase: true,
    // Allowed: lowercase letters, numbers, dot, underscore (no spaces or accents).
    match: [USERNAME_REGEX, 'Username has invalid characters'],
    unique: true,
    trim: true,
    validate: [
      {
        validator: (value) => !/[._]{2,}/.test(value),
        message: 'Username must not contain consecutive dots or underscores'
      },
      {
        validator: (value) => !/[._]$/.test(value),
        message: 'Username must not end with a dot or underscore'
      }
    ]
  },
  // Stored as a bcrypt hash (see pre-save hook)
  password: {
    type: String,
    required: true
  },
  // Unique email for contact / login recovery
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  // Optional contact fields
  phone: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  // Authorization level used by route guards
  role: {
    type: String,
    enum: ['lv1', 'lv2', 'lv3'],
    default: 'lv1'
  }
}, {
  // Adds createdAt / updatedAt timestamps
  timestamps: true
});

// Hash password before saving so raw values never persist.
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a plain password with the stored hash.
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
