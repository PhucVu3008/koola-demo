/**
 * ============================================================================
 * USERNAME NORMALIZATION SCRIPT
 * ============================================================================
 *
 * Purpose:
 * - Normalize existing usernames to match current validation rules
 * - Ensure lowercase, allowed characters, and uniqueness
 *
 * Usage:
 * - DRY_RUN=true node scripts/normalize-usernames.js
 * - node scripts/normalize-usernames.js
 * ============================================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX
} = require('../constants');

const isUsernameValid = (value) => {
  if (!value) {
    return false;
  }
  if (!USERNAME_REGEX.test(value)) {
    return false;
  }
  if (/[._]{2,}/.test(value)) {
    return false;
  }
  if (/[._]$/.test(value)) {
    return false;
  }
  return true;
};

const normalizeBase = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().toLowerCase();
};

const buildFallback = (seed) => {
  const safeSeed = seed ? seed.toString().slice(-6) : '000000';
  return `user${safeSeed}`.slice(0, USERNAME_MAX_LENGTH);
};

const sanitizeUsername = (value, seed) => {
  let candidate = normalizeBase(value);
  candidate = candidate.replace(/\s+/g, '_');
  candidate = candidate.replace(/[^a-z0-9._]/g, '');
  candidate = candidate.replace(/[._]{2,}/g, '_');
  candidate = candidate.replace(/[._]+$/, '');

  if (!candidate || !/^[a-z]/.test(candidate)) {
    candidate = buildFallback(seed);
  }

  if (candidate.length < USERNAME_MIN_LENGTH) {
    candidate = candidate.padEnd(USERNAME_MIN_LENGTH, '0');
  }

  if (candidate.length > USERNAME_MAX_LENGTH) {
    candidate = candidate.slice(0, USERNAME_MAX_LENGTH);
    candidate = candidate.replace(/[._]+$/, '');
  }

  if (!isUsernameValid(candidate)) {
    candidate = buildFallback(seed);
  }

  if (candidate.length < USERNAME_MIN_LENGTH) {
    candidate = candidate.padEnd(USERNAME_MIN_LENGTH, '0');
  }

  return candidate;
};

const ensureUnique = (base, used) => {
  let candidate = base;
  let counter = 1;

  while (used.has(candidate)) {
    const suffix = `_${counter}`;
    const maxBaseLength = USERNAME_MAX_LENGTH - suffix.length;
    const trimmedBase = base.slice(0, Math.max(1, maxBaseLength));
    candidate = `${trimmedBase.replace(/[._]+$/, '')}${suffix}`;
    counter += 1;
  }

  return candidate;
};

const run = async () => {
  const dryRun = process.env.DRY_RUN === 'true';
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected${dryRun ? ' (dry-run)' : ''}`);

    const users = await User.find().sort({ createdAt: 1 });
    const used = new Set();
    let updated = 0;
    let unchanged = 0;

    for (const user of users) {
      const original = user.username || '';
      const candidateBase = sanitizeUsername(original, user._id);
      const candidate = ensureUnique(candidateBase, used);

      if (original !== candidate) {
        if (!dryRun) {
          user.username = candidate;
          await user.save();
        }
        updated += 1;
        console.log(`Updated: ${original} -> ${candidate}`);
      } else {
        unchanged += 1;
      }

      used.add(candidate);
    }

    console.log(`Done. Updated: ${updated}, Unchanged: ${unchanged}`);
    process.exit(0);
  } catch (error) {
    console.error('Username normalization failed:', error);
    process.exit(1);
  }
};

run();
